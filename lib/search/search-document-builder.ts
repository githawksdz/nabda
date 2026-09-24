/**
 * Search Stage B document builder.
 * Builds public-safe search_documents drafts from identities + source payloads.
 * Never indexes raw JS, equation logic, or admin diagnostics.
 */

import { foldSearchText, identityContentHref } from "@/lib/search/search-result-mappers";
import { drugSectionAnchorId } from "@/lib/content-rendering/drug";
import { sectionAnchorId } from "@/lib/content-rendering/protocol";
import { normalizeSlug } from "@/lib/nabda-db/slugs";
import type {
  SearchDocumentContentType,
  SearchDocumentDraft,
  SearchDocumentEntityType,
  SearchDocumentGenerationPlan,
  SearchDocumentSkip,
} from "@/types/search-documents";

export const SEARCH_SNIPPET_MAX = 220;
export const SEARCH_TABLE_PREVIEW_MAX = 160;
export const SEARCH_TABLE_BODY_MAX_CHARS = 1200;
export const SEARCH_DOCUMENTS_IMPORTED_FROM = "nabda_db";

const SCRIPT_RE = /<\s*script\b|javascript:|on\w+\s*=/i;
const STYLE_BLOCK_RE = /<\s*style[\s\S]*?<\/\s*style\s*>/gi;
const SCRIPT_BLOCK_RE = /<\s*script[\s\S]*?<\/\s*script\s*>/gi;
const TAG_RE = /<[^>]+>/g;
const ENTITY_RE = /&(#x?[0-9a-f]+|[a-z]+);/gi;

const FORBIDDEN_SNIPPET_TOKENS = [
  "equation_logic_text",
  "jspreview",
  "admin_only",
  "nabda_db",
  "<script",
];

const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export type IdentityRow = {
  slug: string;
  title?: string | null;
  short_title?: string | null;
  dci?: string | null;
  display_name?: string | null;
  therapeutic_class?: string | null;
  category_slug?: string | null;
  source_id?: string | null;
  status?: string | null;
  review_status?: string | null;
  visibility?: string | null;
  clinical_payload_status?: string | null;
  source_trace?: Record<string, unknown> | null;
};

export type PayloadRow = {
  source_id: string;
  source_slug: string;
  entity_slug: string;
  entity_type: string;
  payload_item_id: string;
  sort_order: number;
  payload: Record<string, unknown> | null;
  plain_text: string | null;
  review_status?: string | null;
  activation_state?: string | null;
  visibility?: string | null;
};

export type CalculatorPayloadRow = PayloadRow & {
  // payload may include analysis fields
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
}

export function decodeHtmlEntities(value: string): string {
  return value.replace(ENTITY_RE, (_, entity: string) => {
    const key = entity.toLowerCase();
    if (key.startsWith("#x")) {
      const code = Number.parseInt(key.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    }
    if (key.startsWith("#")) {
      const code = Number.parseInt(key.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    }
    return ENTITY_MAP[key] ?? "";
  });
}

export function stripUnsafeMarkup(value: string): string {
  return decodeHtmlEntities(
    value
      .replace(SCRIPT_BLOCK_RE, " ")
      .replace(STYLE_BLOCK_RE, " ")
      .replace(TAG_RE, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function looksUnsafeSourceText(value: string): boolean {
  if (SCRIPT_RE.test(value)) return true;
  const folded = value.toLowerCase();
  return FORBIDDEN_SNIPPET_TOKENS.some((token) => folded.includes(token));
}

export function makeSnippet(
  value: string | null | undefined,
  max = SEARCH_SNIPPET_MAX,
): { snippet: string | null; truncated: boolean; blocked: boolean } {
  if (!value || !value.trim()) {
    return { snippet: null, truncated: false, blocked: false };
  }
  if (looksUnsafeSourceText(value)) {
    return { snippet: null, truncated: false, blocked: true };
  }
  const cleaned = stripUnsafeMarkup(value);
  if (!cleaned || looksUnsafeSourceText(cleaned)) {
    return { snippet: null, truncated: false, blocked: Boolean(cleaned) };
  }
  if (cleaned.length <= max) {
    return { snippet: cleaned, truncated: false, blocked: false };
  }
  return {
    snippet: `${cleaned.slice(0, Math.max(0, max - 1)).trimEnd()}…`,
    truncated: true,
    blocked: false,
  };
}

function joinSearchable(parts: Array<string | null | undefined>): string {
  const raw = parts
    .map((part) => (part ? stripUnsafeMarkup(part) : ""))
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (!raw) return "";
  const folded = foldSearchText(raw);
  // Keep original wording plus accent-folded tokens for ilike/trigram recall.
  return folded && folded !== raw.toLowerCase() ? `${raw} ${folded}` : raw;
}

function publicStatusLabel(reviewStatus: string | null | undefined): string {
  return reviewStatus && reviewStatus.trim() ? reviewStatus : "unreviewed";
}

function draftBase(input: {
  entityType: SearchDocumentEntityType;
  entitySlug: string;
  entitySourceId: string | null;
  contentType: SearchDocumentContentType;
  contentId: string;
  contentOrder?: number;
  title: string;
  subtitle?: string | null;
  snippet?: string | null;
  searchableText: string;
  routeHref: string;
  sectionAnchor?: string | null;
  categorySlug?: string | null;
  tags?: string[];
  priority?: number;
  reviewStatus?: string | null;
  activationState?: string | null;
  sourceTrace?: Record<string, unknown>;
}): SearchDocumentDraft | null {
  const entitySlug = normalizeSlug(input.entitySlug) || input.entitySlug;
  const routeHref = input.routeHref.trim();
  if (!entitySlug || !input.title.trim() || !input.searchableText.trim()) {
    return null;
  }
  if (!routeHref.startsWith("/") || routeHref.startsWith("/internal")) {
    return null;
  }
  if (
    looksUnsafeSourceText(input.title) ||
    looksUnsafeSourceText(input.searchableText) ||
    (input.snippet && looksUnsafeSourceText(input.snippet))
  ) {
    return null;
  }

  return {
    entity_type: input.entityType,
    entity_slug: entitySlug,
    entity_source_id: input.entitySourceId,
    content_type: input.contentType,
    content_id: input.contentId,
    content_order: input.contentOrder ?? 0,
    title: stripUnsafeMarkup(input.title).slice(0, 240),
    subtitle: input.subtitle ? stripUnsafeMarkup(input.subtitle).slice(0, 180) : null,
    snippet: input.snippet ?? null,
    searchable_text: input.searchableText.slice(0, 8000),
    route_href: routeHref,
    section_anchor: input.sectionAnchor ?? null,
    category_slug: input.categorySlug ?? null,
    tags: input.tags ?? [],
    priority: input.priority ?? 0,
    visibility: "public_free",
    review_status: publicStatusLabel(input.reviewStatus),
    activation_state: input.activationState ?? "source_preserved_active",
    imported_from: SEARCH_DOCUMENTS_IMPORTED_FROM,
    source_trace: input.sourceTrace ?? {},
  };
}

function tagsFromTrace(trace: Record<string, unknown> | null | undefined): string[] {
  if (!trace) return [];
  return [
    ...new Set([
      ...stringArray(trace.tag_slugs),
      ...stringArray(trace.extra_tags),
      ...stringArray(trace.specialty_slugs),
      ...stringArray(trace.abbreviations),
      ...stringArray(trace.brand_names_sample),
    ]),
  ].slice(0, 24);
}

export function buildIdentityDocuments(input: {
  protocols: IdentityRow[];
  cats: IdentityRow[];
  drugs: IdentityRow[];
  calculators: IdentityRow[];
}): { docs: SearchDocumentDraft[]; skips: SearchDocumentSkip[] } {
  const docs: SearchDocumentDraft[] = [];
  const skips: SearchDocumentSkip[] = [];

  for (const row of input.protocols) {
    const slug = normalizeSlug(row.slug);
    if (!slug) {
      skips.push({ reason: "missing_slug", entity_type: "protocol", detail: String(row.source_id) });
      continue;
    }
    const title = asString(row.title) || asString(row.short_title) || slug;
    const searchable = joinSearchable([
      title,
      row.short_title,
      slug,
      row.category_slug,
      row.source_id,
      ...tagsFromTrace(row.source_trace),
    ]);
    const doc = draftBase({
      entityType: "protocol",
      entitySlug: slug,
      entitySourceId: asString(row.source_id),
      contentType: "identity",
      contentId: "identity",
      title,
      subtitle: asString(row.category_slug) ?? "Recommandation",
      snippet: makeSnippet(asString(row.short_title) ?? title).snippet,
      searchableText: searchable,
      routeHref: identityContentHref("protocol", slug, row.source_id),
      categorySlug: asString(row.category_slug),
      tags: tagsFromTrace(row.source_trace),
      priority: 100,
      reviewStatus: row.review_status,
      activationState: "source_preserved_active",
      sourceTrace: { kind: "identity", table: "protocols" },
    });
    if (doc) docs.push(doc);
  }

  for (const row of input.cats) {
    const slug = normalizeSlug(row.slug);
    if (!slug) {
      skips.push({ reason: "missing_slug", entity_type: "cat", detail: String(row.source_id) });
      continue;
    }
    const title = asString(row.title) || slug;
    const searchable = joinSearchable([
      title,
      slug,
      row.source_id,
      ...tagsFromTrace(row.source_trace),
    ]);
    const doc = draftBase({
      entityType: "cat",
      entitySlug: slug,
      entitySourceId: asString(row.source_id),
      contentType: "identity",
      contentId: "identity",
      title,
      subtitle: "Conduite à tenir",
      snippet: makeSnippet(title).snippet,
      searchableText: searchable,
      routeHref: identityContentHref("cat", slug, row.source_id),
      tags: tagsFromTrace(row.source_trace),
      priority: 100,
      reviewStatus: row.review_status,
      activationState: "source_preserved_active",
      sourceTrace: { kind: "identity", table: "cat_maps" },
    });
    if (doc) docs.push(doc);
  }

  for (const row of input.drugs) {
    const slug = normalizeSlug(row.slug);
    if (!slug) {
      skips.push({ reason: "missing_slug", entity_type: "drug", detail: String(row.source_id) });
      continue;
    }
    const title =
      asString(row.display_name) || asString(row.dci) || asString(row.title) || slug;
    const searchable = joinSearchable([
      title,
      row.dci,
      row.display_name,
      row.therapeutic_class,
      slug,
      row.source_id,
      ...tagsFromTrace(row.source_trace),
    ]);
    const doc = draftBase({
      entityType: "drug",
      entitySlug: slug,
      entitySourceId: asString(row.source_id),
      contentType: "identity",
      contentId: "identity",
      title,
      subtitle: asString(row.therapeutic_class) ?? asString(row.dci) ?? "Médicament",
      snippet: makeSnippet(
        [asString(row.dci), asString(row.therapeutic_class)].filter(Boolean).join(" · ") ||
          title,
      ).snippet,
      searchableText: searchable,
      routeHref: identityContentHref("drug", slug, row.source_id),
      categorySlug: asString(row.therapeutic_class),
      tags: tagsFromTrace(row.source_trace),
      priority: 100,
      reviewStatus: row.review_status,
      activationState: "source_preserved_active",
      sourceTrace: { kind: "identity", table: "drugs" },
    });
    if (doc) docs.push(doc);
  }

  for (const row of input.calculators) {
    const slug = normalizeSlug(row.slug);
    if (!slug) {
      skips.push({
        reason: "missing_slug",
        entity_type: "calculator",
        detail: String(row.source_id),
      });
      continue;
    }
    const title = asString(row.title) || asString(row.short_title) || slug;
    const locked =
      row.clinical_payload_status === "locked" ||
      row.visibility === "admin_only" ||
      row.status === "draft";
    const abbreviations = tagsFromTrace(row.source_trace);
    const searchable = joinSearchable([
      title,
      row.short_title,
      slug,
      row.category_slug,
      row.source_id,
      ...abbreviations,
    ]);
    const snippet = locked
      ? "Calculateur catalogue · saisie non activée"
      : makeSnippet(asString(row.short_title) ?? title).snippet;
    const doc = draftBase({
      entityType: "calculator",
      entitySlug: slug,
      entitySourceId: asString(row.source_id),
      contentType: "identity",
      contentId: "identity",
      title,
      subtitle: asString(row.category_slug) ?? "Score",
      snippet,
      searchableText: searchable,
      routeHref: identityContentHref("calculator", slug, row.source_id),
      categorySlug: asString(row.category_slug),
      tags: abbreviations,
      priority: locked ? 90 : 100,
      reviewStatus: row.review_status,
      activationState: locked ? "source_preserved_locked" : "source_preserved_active",
      sourceTrace: {
        kind: "identity",
        table: "calculators",
        locked,
      },
    });
    if (doc) docs.push(doc);
  }

  return { docs, skips };
}

function payloadKind(payload: Record<string, unknown> | null): string | null {
  if (!payload) return null;
  return (
    asString(payload.kind) ||
    asString(payload.display) ||
    asString(payload.priority) ||
    asString(payload.tab)
  );
}

/** Reject plain-text lines that look like body dumps / HTML / Word junk. */
export function isUnsafeSectionTitleCandidate(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  if (v.length > 80) return true;
  if (/[<>{}]|<\/?\w|mso-|font-size|stylesheet|javascript:|equation_logic|jsPreview/i.test(v)) {
    return true;
  }
  if (/\.{5,}|_{5,}|\|{2,}/.test(v)) return true;
  if ((v.match(/\d/g) ?? []).length > 12) return true;
  // Body-like sentences: too many spaces + lowercase start of clinical prose
  if (v.split(/\s+/).length > 10) return true;
  return false;
}

/**
 * Drug/protocol section title order:
 * 1) explicit source heading
 * 2) normalized title
 * 3) kind label
 * 4) safe first plain_text line (last resort)
 */
export function resolveSectionTitlePart(
  payload: Record<string, unknown> | null,
  plainText?: string | null,
  fallback = "Section",
): { title: string; source: "sourceHeading" | "title" | "heading" | "sectionTitle" | "kind" | "plain_text" | "fallback" } {
  const sourceHeading = asString(payload?.sourceHeading);
  if (sourceHeading && !isUnsafeSectionTitleCandidate(sourceHeading)) {
    return { title: sourceHeading, source: "sourceHeading" };
  }
  const title = asString(payload?.title);
  if (title && !isUnsafeSectionTitleCandidate(title)) {
    return { title, source: "title" };
  }
  const heading = asString(payload?.heading) || asString(payload?.sectionTitle);
  if (heading && !isUnsafeSectionTitleCandidate(heading)) {
    return {
      title: heading,
      source: asString(payload?.heading) ? "heading" : "sectionTitle",
    };
  }
  const kind = payloadKind(payload);
  if (kind && !isUnsafeSectionTitleCandidate(kind)) {
    return { title: kind, source: "kind" };
  }
  if (plainText) {
    const line = plainText
      .split(/\r?\n/)
      .map((part) => part.trim())
      .find((part) => part.length > 0);
    if (line && !isUnsafeSectionTitleCandidate(line)) {
      return {
        title: line.length > 80 ? `${line.slice(0, 79)}…` : line,
        source: "plain_text",
      };
    }
  }
  return { title: fallback, source: "fallback" };
}

function payloadTitle(payload: Record<string, unknown> | null): string | null {
  // Legacy helper for non-drug callers — prefer explicit source heading first.
  return resolveSectionTitlePart(payload).title;
}

export function buildProtocolSectionDocuments(
  rows: PayloadRow[],
  identityTitles: Map<string, string>,
): { docs: SearchDocumentDraft[]; skips: SearchDocumentSkip[]; truncated: number; blocked: number } {
  const docs: SearchDocumentDraft[] = [];
  const skips: SearchDocumentSkip[] = [];
  let truncated = 0;
  let blocked = 0;

  for (const row of rows) {
    if (row.entity_type === "protocol_bundle") {
      skips.push({
        reason: "bundle_skipped",
        entity_type: "protocol",
        detail: row.payload_item_id,
      });
      continue;
    }
    const slug = normalizeSlug(row.entity_slug);
    if (!slug) {
      skips.push({ reason: "missing_slug", entity_type: "protocol", detail: row.source_id });
      continue;
    }
    const sectionTitle = payloadTitle(row.payload) || "Section";
    const entityTitle = identityTitles.get(slug) || asString(row.payload?.protocolTitle) || slug;
    const plain = asString(row.plain_text) || asString(row.payload?.text);
    const snip = makeSnippet(plain);
    if (snip.truncated) truncated += 1;
    if (snip.blocked) {
      blocked += 1;
      skips.push({
        reason: "unsafe_text_blocked",
        entity_type: "protocol",
        detail: row.payload_item_id,
      });
      continue;
    }
    const searchable = joinSearchable([entityTitle, sectionTitle, plain]);
    if (!searchable) {
      skips.push({ reason: "empty_text", entity_type: "protocol", detail: row.payload_item_id });
      continue;
    }
    const sectionId = asString(row.payload?.id) || row.payload_item_id;
    const doc = draftBase({
      entityType: "protocol",
      entitySlug: slug,
      entitySourceId: row.source_id,
      contentType: "section",
      contentId: row.payload_item_id,
      contentOrder: row.sort_order,
      title: `${entityTitle} · ${sectionTitle}`,
      subtitle: payloadKind(row.payload) ?? "Section",
      snippet: snip.snippet,
      searchableText: searchable,
      routeHref: `/protocols/${slug}`,
      sectionAnchor: sectionAnchorId(sectionId),
      priority: 50,
      reviewStatus: row.review_status,
      activationState: row.activation_state ?? "source_preserved_active",
      sourceTrace: { kind: "source_protocol_sections", payload_item_id: row.payload_item_id },
    });
    if (doc) docs.push(doc);
    else skips.push({ reason: "draft_rejected", entity_type: "protocol", detail: row.payload_item_id });
  }

  return { docs, skips, truncated, blocked };
}

export function buildCatStepDocuments(
  rows: PayloadRow[],
  identityTitles: Map<string, string>,
): { docs: SearchDocumentDraft[]; skips: SearchDocumentSkip[]; truncated: number; blocked: number } {
  const docs: SearchDocumentDraft[] = [];
  const skips: SearchDocumentSkip[] = [];
  let truncated = 0;
  let blocked = 0;

  for (const row of rows) {
    if (row.entity_type === "cat_bundle") {
      skips.push({ reason: "bundle_skipped", entity_type: "cat", detail: row.payload_item_id });
      continue;
    }
    const slug = normalizeSlug(row.entity_slug);
    if (!slug) {
      skips.push({ reason: "missing_slug", entity_type: "cat", detail: row.source_id });
      continue;
    }
    const stepTitle = payloadTitle(row.payload) || "Étape";
    const entityTitle = identityTitles.get(slug) || asString(row.payload?.protocolTitle) || slug;
    const plain = asString(row.plain_text) || asString(row.payload?.text);
    const snip = makeSnippet(plain);
    if (snip.truncated) truncated += 1;
    if (snip.blocked) {
      blocked += 1;
      skips.push({ reason: "unsafe_text_blocked", entity_type: "cat", detail: row.payload_item_id });
      continue;
    }
    const searchable = joinSearchable([entityTitle, stepTitle, plain]);
    if (!searchable) {
      skips.push({ reason: "empty_text", entity_type: "cat", detail: row.payload_item_id });
      continue;
    }
    const stepId = asString(row.payload?.id) || row.payload_item_id;
    const priority =
      asString(row.payload?.priority) === "critical" ||
      asString(row.payload?.priority) === "urgent" ||
      row.payload?.containsEmergencySignal === true
        ? 80
        : 50;
    const doc = draftBase({
      entityType: "cat",
      entitySlug: slug,
      entitySourceId: row.source_id,
      contentType: "step",
      contentId: row.payload_item_id,
      contentOrder: row.sort_order,
      title: `${entityTitle} · ${stepTitle}`,
      subtitle: payloadKind(row.payload) ?? "Étape",
      snippet: snip.snippet,
      searchableText: searchable,
      routeHref: `/cat/${slug}`,
      sectionAnchor: stepId,
      priority,
      reviewStatus: row.review_status,
      activationState: row.activation_state ?? "source_preserved_active",
      sourceTrace: { kind: "source_cat_steps", payload_item_id: row.payload_item_id },
    });
    if (doc) docs.push(doc);
    else skips.push({ reason: "draft_rejected", entity_type: "cat", detail: row.payload_item_id });
  }

  return { docs, skips, truncated, blocked };
}

export function buildDrugSectionDocuments(
  rows: PayloadRow[],
  identityTitles: Map<string, string>,
): { docs: SearchDocumentDraft[]; skips: SearchDocumentSkip[]; truncated: number; blocked: number } {
  const docs: SearchDocumentDraft[] = [];
  const skips: SearchDocumentSkip[] = [];
  let truncated = 0;
  let blocked = 0;

  for (const row of rows) {
    if (row.entity_type === "drug_bundle") {
      skips.push({ reason: "bundle_skipped", entity_type: "drug", detail: row.payload_item_id });
      continue;
    }
    const slug = normalizeSlug(row.entity_slug);
    if (!slug) {
      skips.push({ reason: "missing_slug", entity_type: "drug", detail: row.source_id });
      continue;
    }
    const plain = asString(row.plain_text) || asString(row.payload?.text);
    const resolved = resolveSectionTitlePart(row.payload, plain);
    const sectionTitle = resolved.title;
    const entityTitle =
      identityTitles.get(slug) ||
      asString(row.payload?.drugTitle) ||
      asString(row.payload?.dci) ||
      slug;
    const presentationLabel =
      asString(row.payload?.presentation) ||
      (identityTitles.has(slug) ? null : slug);
    const titleCore =
      presentationLabel &&
      foldSearchText(presentationLabel) !== foldSearchText(entityTitle)
        ? `${entityTitle} · ${presentationLabel} · ${sectionTitle}`
        : `${entityTitle} · ${sectionTitle}`;
    const snip = makeSnippet(plain);
    if (snip.truncated) truncated += 1;
    if (snip.blocked) {
      blocked += 1;
      skips.push({ reason: "unsafe_text_blocked", entity_type: "drug", detail: row.payload_item_id });
      continue;
    }
    const searchable = joinSearchable([
      entityTitle,
      presentationLabel,
      asString(row.payload?.dci),
      sectionTitle,
      plain,
    ]);
    if (!searchable) {
      skips.push({ reason: "empty_text", entity_type: "drug", detail: row.payload_item_id });
      continue;
    }
    const sectionId = asString(row.payload?.id) || row.payload_item_id;
    const doc = draftBase({
      entityType: "drug",
      entitySlug: slug,
      entitySourceId: row.source_id,
      contentType: "drug_section",
      contentId: row.payload_item_id,
      contentOrder: row.sort_order,
      title: titleCore,
      subtitle: payloadKind(row.payload) ?? "Section médicament",
      snippet: snip.snippet,
      searchableText: searchable,
      routeHref: `/drugs/${slug}`,
      sectionAnchor: drugSectionAnchorId(sectionId),
      priority: 50,
      reviewStatus: row.review_status,
      activationState: row.activation_state ?? "source_preserved_active",
      sourceTrace: {
        kind: "source_drug_sections",
        payload_item_id: row.payload_item_id,
        title_source: resolved.source,
      },
    });
    if (doc) docs.push(doc);
    else skips.push({ reason: "draft_rejected", entity_type: "drug", detail: row.payload_item_id });
  }

  return { docs, skips, truncated, blocked };
}

export function buildDrugTableDocuments(
  rows: PayloadRow[],
  identityTitles: Map<string, string>,
): {
  docs: SearchDocumentDraft[];
  skips: SearchDocumentSkip[];
  truncated: number;
  blocked: number;
  largeSkipped: number;
} {
  const docs: SearchDocumentDraft[] = [];
  const skips: SearchDocumentSkip[] = [];
  let truncated = 0;
  let blocked = 0;
  let largeSkipped = 0;

  for (const row of rows) {
    const slug = normalizeSlug(row.entity_slug);
    if (!slug) {
      skips.push({ reason: "missing_slug", entity_type: "drug", detail: row.source_id });
      continue;
    }
    const heading =
      asString(row.payload?.sourceHeading) ||
      asString(row.payload?.title) ||
      "Tableau";
    const headers = stringArray(row.payload?.headers);
    const preview =
      asString(row.payload?.textPreview) ||
      asString(row.plain_text) ||
      headers.join(" · ");
    const rawLen = (asString(row.plain_text) ?? "").length;
    if (rawLen > SEARCH_TABLE_BODY_MAX_CHARS && !headers.length && !asString(row.payload?.textPreview)) {
      largeSkipped += 1;
      skips.push({
        reason: "large_table_skipped",
        entity_type: "drug",
        detail: row.payload_item_id,
      });
      continue;
    }
    const snip = makeSnippet(preview, SEARCH_TABLE_PREVIEW_MAX);
    if (snip.truncated) truncated += 1;
    if (snip.blocked) {
      blocked += 1;
      skips.push({
        reason: "unsafe_text_blocked",
        entity_type: "drug",
        detail: row.payload_item_id,
      });
      continue;
    }
    const entityTitle = identityTitles.get(slug) || slug;
    const searchable = joinSearchable([
      entityTitle,
      heading,
      asString(row.payload?.tableKind),
      headers.join(" "),
      snip.snippet,
    ]);
    if (!searchable) {
      skips.push({ reason: "empty_text", entity_type: "drug", detail: row.payload_item_id });
      continue;
    }
    const doc = draftBase({
      entityType: "drug",
      entitySlug: slug,
      entitySourceId: row.source_id,
      contentType: "drug_table",
      contentId: row.payload_item_id,
      contentOrder: row.sort_order,
      title: `${entityTitle} · ${heading}`,
      subtitle: asString(row.payload?.tableKind) ?? "Tableau source",
      snippet: snip.snippet,
      searchableText: searchable,
      routeHref: `/drugs/${slug}`,
      priority: 40,
      reviewStatus: row.review_status,
      activationState: row.activation_state ?? "source_preserved_active",
      sourceTrace: {
        kind: "source_drug_tables",
        payload_item_id: row.payload_item_id,
        headers_only: rawLen > SEARCH_TABLE_BODY_MAX_CHARS,
      },
    });
    if (doc) docs.push(doc);
    else skips.push({ reason: "draft_rejected", entity_type: "drug", detail: row.payload_item_id });
  }

  return { docs, skips, truncated, blocked, largeSkipped };
}

function inputLabelsFromSchema(schema: unknown): string[] {
  if (!Array.isArray(schema)) return [];
  const labels: string[] = [];
  for (const item of schema) {
    if (!isRecord(item)) continue;
    const label = asString(item.label) || asString(item.name);
    if (label) labels.push(label);
  }
  return labels.slice(0, 40);
}

export function buildCalculatorProfileDocuments(
  rows: CalculatorPayloadRow[],
  identityTitles: Map<string, string>,
  identityLocked: Map<string, boolean>,
): {
  docs: SearchDocumentDraft[];
  skips: SearchDocumentSkip[];
  truncated: number;
  blocked: number;
  lockedOnly: number;
} {
  const docs: SearchDocumentDraft[] = [];
  const skips: SearchDocumentSkip[] = [];
  let truncated = 0;
  let blocked = 0;
  let lockedOnly = 0;

  for (const row of rows) {
    const slug = normalizeSlug(row.entity_slug) || normalizeSlug(asString(row.payload?.slug) ?? "");
    if (!slug) {
      skips.push({ reason: "missing_slug", entity_type: "calculator", detail: row.source_id });
      continue;
    }
    const payload = row.payload ?? {};
    const risk = asString(payload.risk);
    const shouldStayLocked = payload.shouldStayLocked === true;
    const hasRawJs = payload.hasRawJs === true;
    const hasDosing = payload.hasDosingLanguage === true;
    const highRisk = risk === "high" || shouldStayLocked || hasDosing || hasRawJs;
    const identityIsLocked = identityLocked.get(slug) === true;

    if (highRisk || identityIsLocked) {
      lockedOnly += 1;
      skips.push({
        reason: "calculator_locked_identity_only",
        entity_type: "calculator",
        detail: row.payload_item_id,
      });
      continue;
    }

    // Never index executable fields
    if (
      asString(payload.equationLogicText) ||
      asString(payload.equation_logic_text) ||
      asString(payload.jsPreview) ||
      asString(payload.js_preview)
    ) {
      blocked += 1;
      skips.push({
        reason: "calculator_executable_blocked",
        entity_type: "calculator",
        detail: row.payload_item_id,
      });
      continue;
    }

    const title =
      asString(payload.titleFrCandidate) ||
      asString(payload.titleEn) ||
      identityTitles.get(slug) ||
      slug;
    const inputLabels = inputLabelsFromSchema(payload.inputSchemaPreview);
    const formulaPreview = makeSnippet(
      asString(payload.formulaHtmlPreview) || asString(payload.formulaPreview),
      180,
    );
    if (formulaPreview.truncated) truncated += 1;
    if (formulaPreview.blocked) {
      blocked += 1;
      skips.push({
        reason: "unsafe_text_blocked",
        entity_type: "calculator",
        detail: row.payload_item_id,
      });
      continue;
    }

    const searchable = joinSearchable([
      title,
      asString(payload.kind),
      asString(payload.uxPattern),
      ...inputLabels,
      formulaPreview.snippet,
    ]);
    if (!searchable) {
      skips.push({ reason: "empty_text", entity_type: "calculator", detail: row.payload_item_id });
      continue;
    }

    const doc = draftBase({
      entityType: "calculator",
      entitySlug: slug,
      entitySourceId: row.source_id,
      contentType: "calculator_profile",
      contentId: row.payload_item_id,
      contentOrder: row.sort_order,
      title,
      subtitle: [asString(payload.uxPattern), asString(payload.risk)]
        .filter(Boolean)
        .join(" · ") || "Profil catalogue",
      snippet:
        formulaPreview.snippet ||
        makeSnippet(inputLabels.join(" · ") || "Schéma d'entrées catalogue").snippet,
      searchableText: searchable,
      routeHref: identityContentHref("calculator", slug, row.source_id),
      priority: 60,
      reviewStatus: row.review_status,
      activationState: row.activation_state ?? "source_preserved_active",
      sourceTrace: {
        kind: "source_calculator_profiles",
        payload_item_id: row.payload_item_id,
        risk,
      },
    });
    if (doc) docs.push(doc);
    else
      skips.push({
        reason: "draft_rejected",
        entity_type: "calculator",
        detail: row.payload_item_id,
      });
  }

  return { docs, skips, truncated, blocked, lockedOnly };
}

export function summarizeGenerationPlan(
  docs: SearchDocumentDraft[],
  skips: SearchDocumentSkip[],
  extras: {
    truncated: number;
    blocked: number;
    largeTableSkipped: number;
    lockedCalculators: number;
  },
): SearchDocumentGenerationPlan {
  const byEntity: Record<string, number> = {};
  const byContent: Record<string, number> = {};
  let emptySnippet = 0;
  let estimatedBytes = 0;
  const routes = new Set<string>();

  for (const doc of docs) {
    byEntity[doc.entity_type] = (byEntity[doc.entity_type] ?? 0) + 1;
    byContent[doc.content_type] = (byContent[doc.content_type] ?? 0) + 1;
    if (!doc.snippet) emptySnippet += 1;
    estimatedBytes +=
      doc.title.length +
      doc.searchable_text.length +
      (doc.snippet?.length ?? 0) +
      doc.route_href.length +
      120;
    routes.add(doc.route_href.split("#")[0] ?? doc.route_href);
  }

  const skipReasons: Record<string, number> = {};
  for (const skip of skips) {
    skipReasons[skip.reason] = (skipReasons[skip.reason] ?? 0) + 1;
  }

  return {
    generated_at: new Date().toISOString(),
    total_docs: docs.length,
    docs_by_entity_type: byEntity,
    docs_by_content_type: byContent,
    skipped_docs: skips.length,
    skip_reasons: skipReasons,
    truncated_count: extras.truncated,
    blocked_unsafe_count: extras.blocked,
    large_table_skipped: extras.largeTableSkipped,
    locked_calculators_identity_only: extras.lockedCalculators,
    empty_snippet_count: emptySnippet,
    route_coverage: routes.size,
    estimated_index_bytes: estimatedBytes,
    safety: {
      internal_routes: docs.filter((d) => d.route_href.startsWith("/internal")).length,
      script_hits: docs.filter(
        (d) =>
          looksUnsafeSourceText(d.searchable_text) ||
          (d.snippet ? looksUnsafeSourceText(d.snippet) : false),
      ).length,
      valide_hits: docs.filter(
        (d) =>
          (/\bvalid[eé]\b/i.test(d.snippet ?? "") || /\bvalid[eé]\b/i.test(d.title)) &&
          d.review_status !== "validated",
      ).length,
    },
    sample_titles: docs.slice(0, 12).map((d) => d.title),
  };
}

export function buildAllSearchDocuments(input: {
  protocols: IdentityRow[];
  cats: IdentityRow[];
  drugs: IdentityRow[];
  calculators: IdentityRow[];
  protocolSections: PayloadRow[];
  catSteps: PayloadRow[];
  drugSections: PayloadRow[];
  drugTables: PayloadRow[];
  calculatorProfiles: CalculatorPayloadRow[];
}): {
  docs: SearchDocumentDraft[];
  skips: SearchDocumentSkip[];
  plan: SearchDocumentGenerationPlan;
} {
  const identity = buildIdentityDocuments(input);
  const protocolTitles = new Map(
    input.protocols.map((row) => [
      normalizeSlug(row.slug) || row.slug,
      asString(row.title) || asString(row.short_title) || row.slug,
    ]),
  );
  const catTitles = new Map(
    input.cats.map((row) => [
      normalizeSlug(row.slug) || row.slug,
      asString(row.title) || row.slug,
    ]),
  );
  const drugTitles = new Map(
    input.drugs.map((row) => [
      normalizeSlug(row.slug) || row.slug,
      asString(row.display_name) || asString(row.dci) || row.slug,
    ]),
  );
  const calcTitles = new Map(
    input.calculators.map((row) => [
      normalizeSlug(row.slug) || row.slug,
      asString(row.title) || asString(row.short_title) || row.slug,
    ]),
  );
  const calcLocked = new Map(
    input.calculators.map((row) => [
      normalizeSlug(row.slug) || row.slug,
      row.clinical_payload_status === "locked" ||
        row.visibility === "admin_only" ||
        row.status === "draft",
    ]),
  );

  const sections = buildProtocolSectionDocuments(input.protocolSections, protocolTitles);
  const steps = buildCatStepDocuments(input.catSteps, catTitles);
  const drugSections = buildDrugSectionDocuments(input.drugSections, drugTitles);
  const drugTables = buildDrugTableDocuments(input.drugTables, drugTitles);
  const calcProfiles = buildCalculatorProfileDocuments(
    input.calculatorProfiles,
    calcTitles,
    calcLocked,
  );

  const docs = [
    ...identity.docs,
    ...sections.docs,
    ...steps.docs,
    ...drugSections.docs,
    ...drugTables.docs,
    ...calcProfiles.docs,
  ];
  const skips = [
    ...identity.skips,
    ...sections.skips,
    ...steps.skips,
    ...drugSections.skips,
    ...drugTables.skips,
    ...calcProfiles.skips,
  ];

  // Deduplicate by unique key (last write wins — prefer higher priority)
  const byKey = new Map<string, SearchDocumentDraft>();
  for (const doc of docs) {
    const key = `${doc.entity_type}|${doc.entity_slug}|${doc.content_type}|${doc.content_id}`;
    const existing = byKey.get(key);
    if (!existing || doc.priority >= existing.priority) {
      byKey.set(key, doc);
    }
  }
  const uniqueDocs = [...byKey.values()].sort(
    (a, b) => b.priority - a.priority || a.content_order - b.content_order,
  );

  const plan = summarizeGenerationPlan(uniqueDocs, skips, {
    truncated:
      sections.truncated +
      steps.truncated +
      drugSections.truncated +
      drugTables.truncated +
      calcProfiles.truncated,
    blocked:
      sections.blocked +
      steps.blocked +
      drugSections.blocked +
      drugTables.blocked +
      calcProfiles.blocked,
    largeTableSkipped: drugTables.largeSkipped,
    lockedCalculators: calcProfiles.lockedOnly,
  });

  return { docs: uniqueDocs, skips, plan };
}

export function draftToDbRow(doc: SearchDocumentDraft): Record<string, unknown> {
  return {
    ...doc,
    updated_at: new Date().toISOString(),
  };
}
