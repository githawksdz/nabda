/**
 * Stage A identity search mappers.
 * Titles, DCI, brands, tags, routes — never clinical HTML, doses, or formulas.
 */

import { isPlaceholderRecord } from "@/lib/content-source/readiness";
import { normalizeSlug } from "@/lib/nabda-db/slugs";
import type {
  IdentityContentType,
  IdentitySearchHit,
  MedicationSearchResult,
  SearchFilter,
  SearchResult,
  SearchResultGroup,
} from "@/types/search";

export const IDENTITY_STATUS_IMPORTED = "Importé · aperçu interne";
export const IDENTITY_STATUS_PREPARATION = "En préparation";
export const IDENTITY_STATUS_SOURCE_PRESERVED = "Source préservée";
export const IDENTITY_STATUS_PUBLISHED = "Publié";

export const IDENTITY_SUBTITLE: Record<IdentityContentType, string> = {
  cat: "Arbre décisionnel",
  protocol: "Protocole",
  calculator: "Score ou calculateur",
  drug: "Fiche médicament",
};

export const CLINICAL_OUTPUT_DENYLIST = [
  "body_html",
  "bodyHtml",
  "html",
  "sections",
  "posology",
  "posologie",
  "interactions",
  "pregnancy",
  "grossesse",
  "lactation",
  "allaitement",
  "formula_json",
  "formulaJson",
  "equation_logic_text",
  "equationLogicText",
  "map_json",
  "mapJson",
  "interpretation",
  "plain_text",
  "plainText",
  "content_json",
  "contentJson",
] as const;

const HTML_RE = /<\/?[a-z][\s\S]*>/i;
const LIVE_CALCULATOR_HREF: Record<string, string> = {
  glasgow: "/calculators/glasgow",
  "glasgow-coma-scale-score-gcs": "/calculators/glasgow",
  "cockcroft-gault": "/calculators/cockcroft-gault",
  "creatinine-clearance-cockcroft-gault-equation": "/calculators/cockcroft-gault",
};

export const SEARCH_GROUP_META: Array<{
  id: string;
  type: SearchResult["type"];
  title: string;
  subtitle: string;
  filter: SearchFilter;
  dotClassName: string;
}> = [
  {
    id: "cat",
    type: "cat",
    title: "Conduite à Tenir",
    subtitle: "Algorithmes d'urgence",
    filter: "cat",
    dotClassName: "bg-primary",
  },
  {
    id: "scores",
    type: "calculator",
    title: "Scores & Calculateurs",
    subtitle: "Outils au lit du patient",
    filter: "calculators",
    dotClassName: "bg-secondary",
  },
  {
    id: "drugs",
    type: "drug",
    title: "Médicaments",
    subtitle: "Fiches DCI",
    filter: "drugs",
    dotClassName: "bg-outline",
  },
  {
    id: "reco",
    type: "protocol",
    title: "Protocoles",
    subtitle: "HAS / Sociétés savantes",
    filter: "protocols",
    dotClassName: "bg-on-surface-variant",
  },
];

export function foldSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function looksLikeHtml(value: string | null | undefined): boolean {
  return Boolean(value && HTML_RE.test(value));
}

export function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function sanitizeIdentityText(
  value: string | null | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }
  const stripped = looksLikeHtml(value) ? stripHtml(value) : value.trim();
  return stripped || undefined;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
}

export function identityTagsFromTrace(trace: Record<string, unknown> | null): string[] {
  if (!trace) {
    return [];
  }
  return [
    ...new Set([
      ...stringArray(trace.tag_slugs),
      ...stringArray(trace.extra_tags),
      ...stringArray(trace.specialty_slugs),
    ]),
  ];
}

export function identityBrandsFromTrace(trace: Record<string, unknown> | null): string[] {
  return stringArray(trace?.brand_names_sample);
}

export function identityAbbreviationsFromTrace(
  trace: Record<string, unknown> | null,
): string[] {
  return stringArray(trace?.abbreviations);
}

export function canonicalSearchType(
  type: SearchResult["type"],
): IdentityContentType {
  if (type === "recommendation") {
    return "protocol";
  }
  return type;
}

export function identityContentHref(
  type: IdentityContentType,
  slug: string,
  sourceId?: string | null,
): string {
  const safe = normalizeSlug(slug);
  if (!safe) {
    return "/search";
  }
  if (type === "calculator") {
    const live =
      LIVE_CALCULATOR_HREF[safe] ??
      (sourceId ? LIVE_CALCULATOR_HREF[sourceId.replace(/^calc\./, "")] : undefined);
    if (live) {
      return live;
    }
    return `/calculators/${safe}`;
  }
  if (type === "cat") {
    return `/cat/${safe}`;
  }
  if (type === "drug") {
    return `/drugs/${safe}`;
  }
  return `/protocols/${safe}`;
}

export function identityStatusLabel(hit: IdentitySearchHit): string | undefined {
  if (isPlaceholderRecord(hit.status, hit.reviewStatus)) {
    return IDENTITY_STATUS_PREPARATION;
  }
  if (hit.status !== "published" || hit.clinicalPayloadStatus === "locked") {
    return IDENTITY_STATUS_PREPARATION;
  }
  if (hit.visibility === "premium") {
    return "Pro";
  }
  if (hit.visibility === "public_free") {
    return IDENTITY_STATUS_PUBLISHED;
  }
  return IDENTITY_STATUS_SOURCE_PRESERVED;
}

export function identityHaystack(hit: IdentitySearchHit): string {
  return foldSearchText(
    [
      hit.title,
      hit.shortTitle,
      hit.slug,
      hit.dci,
      hit.displayName,
      hit.categorySlug,
      hit.sourceId,
      ...(hit.tags ?? []),
      ...(hit.brandNames ?? []),
      ...(hit.abbreviations ?? []),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function identityHitMatchesQuery(hit: IdentitySearchHit, query: string): boolean {
  const folded = foldSearchText(query);
  if (!folded) {
    return false;
  }
  return identityHaystack(hit).includes(folded);
}

export function rankIdentityHit(hit: IdentitySearchHit, query: string): number {
  const folded = foldSearchText(query);
  const title = foldSearchText(hit.title);
  const slug = foldSearchText(hit.slug);
  const dci = foldSearchText(hit.dci ?? "");
  const sourceId = foldSearchText(hit.sourceId ?? "");
  const abbreviations = (hit.abbreviations ?? []).map(foldSearchText);

  if (title === folded || slug === folded || dci === folded) return 100;
  if (abbreviations.includes(folded)) return 90;
  if (title.startsWith(folded) || slug.startsWith(folded) || dci.startsWith(folded)) {
    return 80;
  }
  if (sourceId.includes(folded)) return 70;
  if (title.includes(folded) || dci.includes(folded)) return 60;
  if ((hit.brandNames ?? []).some((brand) => foldSearchText(brand).includes(folded))) {
    return 50;
  }
  if ((hit.tags ?? []).some((tag) => foldSearchText(tag).includes(folded))) return 40;
  if (foldSearchText(hit.categorySlug ?? "").includes(folded)) return 30;
  return 10;
}

export function identityHitToSearchResult(hit: IdentitySearchHit): SearchResult {
  const type = hit.type;
  const title =
    sanitizeIdentityText(hit.displayName || hit.title || hit.dci || hit.slug) ?? hit.slug;
  const category = sanitizeIdentityText(hit.categorySlug);
  const brands = (hit.brandNames ?? [])
    .map((brand) => sanitizeIdentityText(brand))
    .filter((brand): brand is string => Boolean(brand))
    .slice(0, 3);
  const dci = sanitizeIdentityText(hit.dci);
  const footerParts = [
    dci && foldSearchText(dci) !== foldSearchText(title) ? dci : null,
    category,
    brands.join(" · ") || null,
  ].filter((part): part is string => Boolean(part));

  return {
    id: `${type}-${hit.sourceId || hit.slug}`,
    type,
    slug: normalizeSlug(hit.slug) || hit.slug,
    title,
    description: undefined,
    category,
    extraLabel: IDENTITY_SUBTITLE[type],
    footer: footerParts.join(" · ") || undefined,
    statusLabel: identityStatusLabel(hit),
    href: identityContentHref(type, hit.slug, hit.sourceId),
    sourceId: hit.sourceId ?? undefined,
  };
}

export function resultDedupKey(result: SearchResult): string {
  if (result.sourceId) {
    return `source:${result.sourceId}`;
  }
  return `href:${canonicalSearchType(result.type)}:${result.href}`;
}

export function mergeSearchResults(
  primary: SearchResult[],
  overlay: SearchResult[],
): SearchResult[] {
  const seen = new Set(primary.map(resultDedupKey));
  const hrefs = new Set(primary.map((result) => result.href));
  const merged = [...primary];
  for (const item of overlay) {
    const key = resultDedupKey(item);
    if (seen.has(key) || hrefs.has(item.href)) {
      continue;
    }
    seen.add(key);
    hrefs.add(item.href);
    merged.push(item);
  }
  return merged;
}

function retitleGroup(group: SearchResultGroup): SearchResultGroup {
  const baseTitle = group.title.replace(/\s*\(\d+\)\s*$/, "");
  return {
    ...group,
    count: group.results.length,
    title: `${baseTitle} (${group.results.length})`,
  };
}

export function groupSearchResults(
  results: SearchResult[],
  filter: SearchFilter,
): SearchResultGroup[] {
  return SEARCH_GROUP_META.filter((group) => filter === "all" || filter === group.filter)
    .map((group) => {
      const items = results.filter(
        (item) => canonicalSearchType(item.type) === canonicalSearchType(group.type),
      );
      return retitleGroup({
        id: group.id,
        title: group.title,
        subtitle: group.subtitle,
        count: items.length,
        dotClassName: group.dotClassName,
        results: items,
      });
    })
    .filter((group) => group.count > 0);
}

export function mergeSearchGroups(
  primary: SearchResultGroup[],
  overlay: SearchResultGroup[],
): SearchResultGroup[] {
  if (overlay.length === 0) {
    return primary;
  }
  const byId = new Map(primary.map((group) => [group.id, group]));
  for (const group of overlay) {
    const existing = byId.get(group.id);
    if (!existing) {
      byId.set(group.id, retitleGroup(group));
      continue;
    }
    byId.set(
      group.id,
      retitleGroup({
        ...existing,
        results: mergeSearchResults(existing.results, group.results),
      }),
    );
  }
  const order = SEARCH_GROUP_META.map((meta) => meta.id);
  return order
    .map((id) => byId.get(id))
    .filter((group): group is SearchResultGroup => Boolean(group));
}

export function identityToMedicationSearchResult(
  result: SearchResult,
): MedicationSearchResult {
  const excerpt =
    sanitizeIdentityText(result.description) ||
    sanitizeIdentityText(result.footer) ||
    IDENTITY_SUBTITLE.drug;
  return {
    id: result.id,
    slug: result.slug,
    title: result.title,
    subtitle: result.extraLabel ?? result.category ?? IDENTITY_SUBTITLE.drug,
    statusChip: result.statusLabel,
    infoLabel: result.description ? "Extrait source" : "Identité",
    infoMeta: result.category,
    infoText: excerpt,
    footerText: result.footer,
    href: result.href,
    actions: [{ label: "Ouvrir", href: result.href, variant: "primary" }],
  };
}

export function mergeMedicationResults(
  primary: MedicationSearchResult[],
  overlay: MedicationSearchResult[],
): MedicationSearchResult[] {
  const hrefs = new Set(primary.map((item) => item.href));
  const slugs = new Set(primary.map((item) => item.slug));
  const merged = [...primary];
  for (const item of overlay) {
    if (hrefs.has(item.href) || slugs.has(item.slug)) {
      continue;
    }
    hrefs.add(item.href);
    slugs.add(item.slug);
    merged.push(item);
  }
  return merged;
}

export function mappedResultHasDeniedFields(result: SearchResult | MedicationSearchResult): boolean {
  return CLINICAL_OUTPUT_DENYLIST.some((key) => key in result);
}

export function collectMappedText(result: SearchResult | MedicationSearchResult): string[] {
  return Object.values(result).flatMap((value) => {
    if (typeof value === "string") {
      return [value];
    }
    if (Array.isArray(value)) {
      return value.flatMap((item) =>
        typeof item === "object" && item && "href" in item && typeof item.href === "string"
          ? [item.href, typeof item.label === "string" ? item.label : ""]
          : typeof item === "string"
            ? [item]
            : [],
      );
    }
    return [];
  });
}

export function mappedResultLooksClinicalHtml(
  result: SearchResult | MedicationSearchResult,
): boolean {
  return collectMappedText(result).some((value) => looksLikeHtml(value));
}
