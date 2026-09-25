/**
 * Stage B search against public.search_documents.
 * Returns client-safe hits only (never searchable_text).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  foldSearchText,
  groupSearchResults,
  identityContentHref,
} from "@/lib/search/search-result-mappers";
import {
  MAX_QUERY_LENGTH,
  sanitizeIdentityQuery,
} from "@/lib/search/identity-search";
import type {
  SearchDocumentContentType,
  SearchDocumentEntityType,
  SearchDocumentHit,
} from "@/types/search-documents";
import type { SearchFilter, SearchResult } from "@/types/search";
import {
  ANONYMOUS_VIEWER,
  canReadContent,
  type ContentIdentity,
  type ViewerAccess,
} from "@/lib/authz/content-gate";
import {
  CALCULATOR_IDENTITY_SEARCH_SELECT,
  CAT_IDENTITY_SEARCH_SELECT,
  DRUG_IDENTITY_SEARCH_SELECT,
  PROTOCOL_IDENTITY_SEARCH_SELECT,
} from "@/lib/authz/selects";

export const SEARCH_DOCUMENTS_STAGE = "B" as const;
export const DEFAULT_SEARCH_DOC_LIMIT = 36;
export const MAX_SEARCH_DOC_LIMIT = 48;

/** Untyped client — search_documents may be queried via admin or anon. */
type SearchClient = SupabaseClient;

const PUBLIC_SELECT =
  "id, entity_type, entity_slug, content_type, title, subtitle, snippet, route_href, section_anchor, category_slug, tags, priority, review_status, activation_state, visibility";

function resolveLimit(limit?: number): number {
  if (!limit || limit < 1) return DEFAULT_SEARCH_DOC_LIMIT;
  return Math.min(limit, MAX_SEARCH_DOC_LIMIT);
}

function identityKey(type: SearchDocumentEntityType, slug: string): string {
  return `${type}:${slug}`;
}

const PARENT_SELECT: Record<SearchDocumentEntityType, { table: string; columns: string }> = {
  protocol: { table: "protocols", columns: PROTOCOL_IDENTITY_SEARCH_SELECT },
  cat: { table: "cat_maps", columns: CAT_IDENTITY_SEARCH_SELECT },
  drug: { table: "drugs", columns: DRUG_IDENTITY_SEARCH_SELECT },
  calculator: { table: "calculators", columns: CALCULATOR_IDENTITY_SEARCH_SELECT },
};

async function loadParentIdentities(
  client: SearchClient,
  hits: SearchDocumentHit[],
): Promise<Map<string, ContentIdentity>> {
  const byType = new Map<SearchDocumentEntityType, Set<string>>();
  for (const hit of hits) {
    const set = byType.get(hit.entityType) ?? new Set<string>();
    set.add(hit.entitySlug);
    byType.set(hit.entityType, set);
  }

  const identities = new Map<string, ContentIdentity>();
  await Promise.all(
    [...byType.entries()].map(async ([entityType, slugs]) => {
      const spec = PARENT_SELECT[entityType];
      if (!spec || slugs.size === 0) {
        return;
      }
      const { data, error } = await client
        .from(spec.table)
        .select(spec.columns)
        .eq("status", "published")
        .in("slug", [...slugs]);
      if (error) {
        console.warn(`search parent ${spec.table}`, error.message);
        return;
      }
      for (const row of ((data ?? []) as unknown as Array<Record<string, unknown>>)) {
        const slug = typeof row.slug === "string" ? row.slug : "";
        if (!slug) continue;
        identities.set(identityKey(entityType, slug), {
          slug,
          status: typeof row.status === "string" ? row.status : null,
          visibility: typeof row.visibility === "string" ? row.visibility : null,
          reviewStatus: typeof row.review_status === "string" ? row.review_status : null,
        });
      }
    }),
  );
  return identities;
}

function entityTypesForFilter(
  type: SearchFilter | undefined,
): SearchDocumentEntityType[] | null {
  if (!type || type === "all") return null;
  if (type === "interactions") return [];
  if (type === "cat") return ["cat"];
  if (type === "protocols") return ["protocol"];
  if (type === "drugs") return ["drug"];
  if (type === "calculators") return ["calculator"];
  return null;
}

function rowToHit(row: Record<string, unknown>): SearchDocumentHit | null {
  const entityType = row.entity_type as SearchDocumentEntityType;
  const entitySlug = typeof row.entity_slug === "string" ? row.entity_slug : "";
  const routeHref = typeof row.route_href === "string" ? row.route_href : "";
  if (!entitySlug || !routeHref || routeHref.startsWith("/internal")) {
    return null;
  }
  return {
    id: String(row.id ?? `${entityType}-${entitySlug}`),
    entityType,
    entitySlug,
    contentType: row.content_type as SearchDocumentContentType,
    title: String(row.title ?? entitySlug),
    subtitle: typeof row.subtitle === "string" ? row.subtitle : null,
    snippet: typeof row.snippet === "string" ? row.snippet : null,
    routeHref,
    sectionAnchor: typeof row.section_anchor === "string" ? row.section_anchor : null,
    categorySlug: typeof row.category_slug === "string" ? row.category_slug : null,
    tags: Array.isArray(row.tags)
      ? row.tags.filter((t): t is string => typeof t === "string")
      : [],
    priority: typeof row.priority === "number" ? row.priority : 0,
    reviewStatus: typeof row.review_status === "string" ? row.review_status : "unreviewed",
    visibility: typeof row.visibility === "string" ? row.visibility : "public_free",
    activationState:
      typeof row.activation_state === "string"
        ? row.activation_state
        : "source_preserved_active",
  };
}

function contentTypeBoost(contentType: SearchDocumentContentType): number {
  switch (contentType) {
    case "identity":
      return 40;
    case "calculator_profile":
      return 20;
    case "step":
    case "section":
    case "drug_section":
      return 10;
    case "drug_table":
      return 5;
    default:
      return 0;
  }
}

export function rankSearchDocumentHit(hit: SearchDocumentHit, query: string): number {
  const folded = foldSearchText(query);
  const title = foldSearchText(hit.title);
  const slug = foldSearchText(hit.entitySlug);
  let score = hit.priority + contentTypeBoost(hit.contentType);

  if (title === folded || slug === folded) score += 100;
  else if (title.startsWith(folded) || slug.startsWith(folded)) score += 80;
  else if (title.includes(folded)) score += 60;
  else if (foldSearchText(hit.snippet ?? "").includes(folded)) score += 30;
  else if (foldSearchText(hit.subtitle ?? "").includes(folded)) score += 20;

  return score;
}

export function searchDocumentHitToSearchResult(hit: SearchDocumentHit): SearchResult {
  const href =
    hit.sectionAnchor && !hit.routeHref.includes("#")
      ? `${hit.routeHref}#${hit.sectionAnchor}`
      : hit.routeHref;

  const statusLabel =
    hit.activationState === "source_preserved_locked" ||
    hit.snippet?.toLowerCase().includes("non activ")
      ? "Catalogue"
      : hit.contentType === "identity"
        ? "Fiche"
        : "Extrait source";

  return {
    id: hit.id,
    type: hit.entityType === "protocol" ? "protocol" : hit.entityType,
    slug: hit.entitySlug,
    title: hit.title,
    description: hit.snippet ?? undefined,
    category: hit.categorySlug ?? undefined,
    meta: hit.contentType,
    extraLabel: hit.subtitle ?? undefined,
    footer: hit.snippet ?? undefined,
    statusLabel,
    href,
    sourceId: undefined,
  };
}

/**
 * Deduplicate hits preferring identity docs, then highest rank, one primary card per route.
 */
export function dedupeSearchDocumentHits(
  hits: SearchDocumentHit[],
  query: string,
  limit: number,
): SearchDocumentHit[] {
  const ranked = [...hits].sort(
    (a, b) => rankSearchDocumentHit(b, query) - rankSearchDocumentHit(a, query),
  );
  const byRoute = new Map<string, SearchDocumentHit>();
  for (const hit of ranked) {
    const route = hit.routeHref.split("#")[0] ?? hit.routeHref;
    const existing = byRoute.get(route);
    if (!existing) {
      byRoute.set(route, hit);
      continue;
    }
    // Prefer identity over section excerpts for the card list
    if (existing.contentType !== "identity" && hit.contentType === "identity") {
      byRoute.set(route, hit);
    }
  }
  return [...byRoute.values()]
    .sort((a, b) => rankSearchDocumentHit(b, query) - rankSearchDocumentHit(a, query))
    .slice(0, limit);
}

export async function fetchSearchDocumentHits(
  client: SearchClient,
  query: string,
  filters?: { type?: SearchFilter; limit?: number },
  viewer: ViewerAccess = ANONYMOUS_VIEWER,
): Promise<SearchDocumentHit[]> {
  const term = sanitizeIdentityQuery(query).slice(0, MAX_QUERY_LENGTH);
  if (!term) return [];

  const types = entityTypesForFilter(filters?.type);
  if (types && types.length === 0) return [];

  const limit = resolveLimit(filters?.limit);
  const fetchLimit = Math.min(limit * 4, 120);
  const like = `%${term}%`;
  const visibilities =
    viewer.authenticated && viewer.hasActivePro
      ? ["public_free", "premium"]
      : ["public_free"];

  let request = client
    .from("search_documents")
    .select(PUBLIC_SELECT)
    .or(`title.ilike.${like},searchable_text.ilike.${like},entity_slug.ilike.${like}`)
    .in("visibility", visibilities)
    .order("priority", { ascending: false })
    .limit(fetchLimit);

  if (types) {
    request = request.in("entity_type", types);
  }

  const { data, error } = await request;
  if (error) {
    // Table may not exist yet — caller can fall back to identity Stage A
    console.warn("search_documents query", error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const mapped = rows
    .map((row: Record<string, unknown>) => rowToHit(row))
    .filter((hit: SearchDocumentHit | null): hit is SearchDocumentHit => Boolean(hit));

  const parents = await loadParentIdentities(client, mapped);
  const hits = mapped.filter((hit) => {
    const parent = parents.get(identityKey(hit.entityType, hit.entitySlug));
    if (!parent) {
      return false;
    }
    return canReadContent(parent, viewer);
  });

  return dedupeSearchDocumentHits(hits, term, limit);
}

export function searchDocumentHitsToSearchResults(
  hits: SearchDocumentHit[],
): SearchResult[] {
  return hits.map(searchDocumentHitToSearchResult);
}

export function assertNoSearchableTextLeak(payload: unknown): string[] {
  const leaks: string[] = [];
  const walk = (value: unknown, path: string) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach((item, i) => walk(item, `${path}[${i}]`));
      return;
    }
    for (const [key, child] of Object.entries(value)) {
      if (key === "searchable_text" || key === "searchableText") {
        leaks.push(`${path}.${key}`);
      } else {
        walk(child, `${path}.${key}`);
      }
    }
  };
  walk(payload, "$");
  return leaks;
}

export function ensurePublicRouteHref(href: string): string {
  if (!href.startsWith("/") || href.startsWith("/internal")) {
    return "/search";
  }
  return href;
}

/** Fallback helper when building href without a document row. */
export function publicEntityHref(
  entityType: SearchDocumentEntityType,
  slug: string,
): string {
  return identityContentHref(entityType, slug);
}

export function groupDocumentSearchResults(
  results: SearchResult[],
  filter: SearchFilter,
) {
  return groupSearchResults(results, filter);
}
