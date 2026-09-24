/**
 * Stage A identity search against protocols, cat_maps, drugs, calculators.
 * Queries title/DCI/brands/tags only. Does not create search_documents.
 * Uses the caller’s Supabase client so RLS is never bypassed.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  identityAbbreviationsFromTrace,
  identityBrandsFromTrace,
  identityHitMatchesQuery,
  identityHitToSearchResult,
  identityTagsFromTrace,
  isRecord,
  rankIdentityHit,
  stringArray,
} from "@/lib/search/search-result-mappers";
import type { Database } from "@/types/database";
import type {
  IdentityContentType,
  IdentitySearchFilters,
  IdentitySearchHit,
  SearchFilter,
  SearchResult,
} from "@/types/search";

export const IDENTITY_SEARCH_STAGE = "A" as const;
export const DEFAULT_IDENTITY_LIMIT = 8;
export const MAX_IDENTITY_LIMIT = 24;
export const MAX_QUERY_LENGTH = 80;

/** @deprecated Stage B lives in lib/search/search-documents.ts */
export const SEARCH_DOCUMENTS_STAGE_B_TODO =
  "Stage B implemented via search_documents (safe snippets only).";

const PROTOCOL_COLUMNS =
  "slug, title, short_title, category_slug, status, review_status, visibility, clinical_payload_status, source_id, source_prefix, imported_from, source_trace";
const CAT_COLUMNS =
  "slug, title, status, review_status, visibility, clinical_payload_status, source_id, source_prefix, imported_from, source_trace";
const CALCULATOR_COLUMNS =
  "slug, title, short_title, category_slug, status, review_status, visibility, clinical_payload_status, source_id, source_prefix, imported_from, source_trace";
const DRUG_COLUMNS =
  "slug, dci, display_name, therapeutic_class, status, review_status, visibility, clinical_payload_status, source_id, source_prefix, imported_from, source_trace";

type IdentitySearchClient = SupabaseClient<Database>;

export function sanitizeIdentityQuery(raw: string): string {
  return raw
    .trim()
    .slice(0, MAX_QUERY_LENGTH)
    .replace(/[%_,.()"'\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveIdentityLimit(limit?: number): number {
  if (!limit || limit < 1) {
    return DEFAULT_IDENTITY_LIMIT;
  }
  return Math.min(limit, MAX_IDENTITY_LIMIT);
}

export function buildIdentityOrFilter(
  table: "protocols" | "cat_maps" | "calculators" | "drugs",
  term: string,
): string {
  const like = `%${term}%`;
  const parts = [`slug.ilike.${like}`, `source_id.ilike.${like}`, `source_slug.ilike.${like}`];
  if (table === "drugs") {
    parts.push(
      `dci.ilike.${like}`,
      `display_name.ilike.${like}`,
      `therapeutic_class.ilike.${like}`,
      `source_trace->>brand_names_sample.ilike.${like}`,
      `source_trace->>extra_tags.ilike.${like}`,
    );
  } else if (table === "cat_maps") {
    parts.push(`title.ilike.${like}`);
    parts.push(`source_trace->>tag_slugs.ilike.${like}`);
  } else {
    parts.push(`title.ilike.${like}`, `short_title.ilike.${like}`, `category_slug.ilike.${like}`);
    parts.push(`source_trace->>tag_slugs.ilike.${like}`);
  }
  if (table === "calculators") {
    parts.push(`source_trace->>abbreviations.ilike.${like}`);
  }
  return parts.join(",");
}

function buildBasicOrFilter(
  table: "protocols" | "cat_maps" | "calculators" | "drugs",
  term: string,
): string {
  const like = `%${term}%`;
  if (table === "drugs") {
    return [
      `slug.ilike.${like}`,
      `dci.ilike.${like}`,
      `display_name.ilike.${like}`,
      `therapeutic_class.ilike.${like}`,
      `source_id.ilike.${like}`,
    ].join(",");
  }
  if (table === "cat_maps") {
    return `slug.ilike.${like},title.ilike.${like},source_id.ilike.${like}`;
  }
  return [
    `slug.ilike.${like}`,
    `title.ilike.${like}`,
    `short_title.ilike.${like}`,
    `category_slug.ilike.${like}`,
    `source_id.ilike.${like}`,
  ].join(",");
}

function traceRecord(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

function rowToHit(
  type: IdentityContentType,
  row: Record<string, unknown>,
): IdentitySearchHit | null {
  const slug = typeof row.slug === "string" ? row.slug : "";
  if (!slug) {
    return null;
  }
  const trace = traceRecord(row.source_trace);
  const dci = typeof row.dci === "string" ? row.dci : null;
  const displayName = typeof row.display_name === "string" ? row.display_name : null;
  const title =
    type === "drug"
      ? displayName || dci || slug
      : typeof row.title === "string"
        ? row.title
        : slug;

  return {
    type,
    slug,
    title,
    shortTitle: typeof row.short_title === "string" ? row.short_title : null,
    dci,
    displayName,
    categorySlug:
      (typeof row.category_slug === "string" ? row.category_slug : null) ??
      (typeof row.therapeutic_class === "string" ? row.therapeutic_class : null),
    tags: identityTagsFromTrace(trace),
    brandNames: identityBrandsFromTrace(trace),
    abbreviations: identityAbbreviationsFromTrace(trace),
    sourceId: typeof row.source_id === "string" ? row.source_id : null,
    sourcePrefix: typeof row.source_prefix === "string" ? row.source_prefix : null,
    importedFrom: typeof row.imported_from === "string" ? row.imported_from : null,
    status: typeof row.status === "string" ? row.status : null,
    reviewStatus: typeof row.review_status === "string" ? row.review_status : null,
    visibility: typeof row.visibility === "string" ? row.visibility : null,
    clinicalPayloadStatus:
      typeof row.clinical_payload_status === "string" ? row.clinical_payload_status : null,
  };
}

async function queryIdentityTable(
  client: IdentitySearchClient,
  table: "protocols" | "cat_maps" | "calculators" | "drugs",
  columns: string,
  type: IdentityContentType,
  term: string,
  limit: number,
): Promise<IdentitySearchHit[]> {
  const run = async (filter: string) =>
    client.from(table).select(columns).or(filter).limit(limit);

  let { data, error } = await run(buildIdentityOrFilter(table, term));
  if (error) {
    console.warn(`identity search ${table} jsonb filter fallback:`, error.message);
    ({ data, error } = await run(buildBasicOrFilter(table, term)));
  }
  if (error) {
    console.warn(`identity search ${table}`, error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return rows
    .map((row) => rowToHit(type, row))
    .filter((hit): hit is IdentitySearchHit => Boolean(hit));
}

function tablesForFilter(
  type: SearchFilter | undefined,
): Array<"protocols" | "cat_maps" | "calculators" | "drugs"> {
  if (type === "interactions") {
    return [];
  }
  if (type === "cat") return ["cat_maps"];
  if (type === "protocols") return ["protocols"];
  if (type === "calculators") return ["calculators"];
  if (type === "drugs") return ["drugs"];
  return ["protocols", "cat_maps", "calculators", "drugs"];
}

export function planPayloadToIdentityHit(
  type: IdentityContentType,
  payload: Record<string, unknown>,
): IdentitySearchHit | null {
  return rowToHit(type, payload);
}

export function filterIdentityHits(
  hits: IdentitySearchHit[],
  query: string,
  limit = DEFAULT_IDENTITY_LIMIT,
): IdentitySearchHit[] {
  const matched = hits
    .filter((hit) => identityHitMatchesQuery(hit, query))
    .sort((a, b) => rankIdentityHit(b, query) - rankIdentityHit(a, query));
  return matched.slice(0, resolveIdentityLimit(limit));
}

export async function fetchIdentityHits(
  client: IdentitySearchClient,
  query: string,
  filters?: IdentitySearchFilters,
): Promise<IdentitySearchHit[]> {
  const term = sanitizeIdentityQuery(query);
  if (!term) {
    return [];
  }
  const type = filters?.type ?? "all";
  if (type === "interactions") {
    return [];
  }
  const limit = resolveIdentityLimit(filters?.limit);
  const tables = tablesForFilter(type);
  const jobs = tables.map((table) => {
    if (table === "protocols") {
      return queryIdentityTable(client, table, PROTOCOL_COLUMNS, "protocol", term, limit);
    }
    if (table === "cat_maps") {
      return queryIdentityTable(client, table, CAT_COLUMNS, "cat", term, limit);
    }
    if (table === "calculators") {
      return queryIdentityTable(client, table, CALCULATOR_COLUMNS, "calculator", term, limit);
    }
    return queryIdentityTable(client, table, DRUG_COLUMNS, "drug", term, limit);
  });
  const groups = await Promise.all(jobs);
  const hits = groups.flat().filter((hit) => identityHitMatchesQuery(hit, term));
  return hits.sort((a, b) => rankIdentityHit(b, term) - rankIdentityHit(a, term)).slice(0, limit * 4);
}

export function identityHitsToSearchResults(hits: IdentitySearchHit[]): SearchResult[] {
  return hits.map(identityHitToSearchResult);
}

export function identityHitsHaveClinicalFields(hits: IdentitySearchHit[]): string[] {
  const leaks: string[] = [];
  for (const hit of hits) {
    const record = hit as unknown as Record<string, unknown>;
    for (const key of [
      "body_html",
      "summary",
      "description",
      "formula_json",
      "map_json",
      "equation_logic_text",
    ]) {
      if (key in record && record[key] != null) {
        leaks.push(`${hit.slug}:${key}`);
      }
    }
  }
  return leaks;
}

export function collectIdentityHaystackTokens(hit: IdentitySearchHit): string[] {
  return [
    hit.title,
    hit.shortTitle,
    hit.slug,
    hit.dci,
    hit.displayName,
    hit.categorySlug,
    hit.sourceId,
    ...stringArray(hit.tags),
    ...stringArray(hit.brandNames),
    ...stringArray(hit.abbreviations),
  ].filter((value): value is string => Boolean(value));
}
