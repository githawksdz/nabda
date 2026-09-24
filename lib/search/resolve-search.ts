import type {
  FilterChip,
  MedicationSearchResult,
  SearchFilter,
  SearchResult,
  SearchResultGroup,
  SearchScreenState,
} from "@/types/search";

export const SEARCH_FILTERS: SearchFilter[] = [
  "all",
  "cat",
  "protocols",
  "drugs",
  "calculators",
  "interactions",
];

export function parseSearchFilter(value?: string | null): SearchFilter {
  if (value && SEARCH_FILTERS.includes(value as SearchFilter)) {
    return value as SearchFilter;
  }
  return "all";
}

export function normalizeSearchQuery(value: string) {
  return value.trim().toLowerCase();
}

export function isZeroQuery(query: string) {
  const normalized = normalizeSearchQuery(query);
  return normalized === "syndrome xyz99" || normalized.includes("xyz99");
}

export function isDouleurQuery(query: string) {
  return normalizeSearchQuery(query).includes("douleur");
}

export function isAmoxQuery(query: string) {
  return normalizeSearchQuery(query).startsWith("amox");
}

export function resolveSearchScreen(query: string, filter: SearchFilter): SearchScreenState {
  if (!query.trim()) {
    return "initial";
  }
  if (isZeroQuery(query)) {
    return "zero";
  }
  if (filter === "drugs" || isAmoxQuery(query)) {
    return "drugs";
  }
  return "results";
}

export function countsFromGroups(groups: SearchResultGroup[]): Partial<Record<SearchFilter, number>> {
  const counts: Partial<Record<SearchFilter, number>> = {
    all: groups.reduce((sum, group) => sum + group.count, 0),
  };

  for (const group of groups) {
    if (group.id === "cat") counts.cat = group.count;
    if (group.id === "scores") counts.calculators = group.count;
    if (group.id === "drugs") counts.drugs = group.count;
    if (group.id === "reco") counts.protocols = group.count;
  }

  return counts;
}

export function chipsWithCounts(
  base: FilterChip[],
  counts: Partial<Record<SearchFilter, number>>,
): FilterChip[] {
  return base.map((chip) => {
    const id = chip.id as SearchFilter;
    const count = counts[id];
    return count != null ? { ...chip, count } : { ...chip, count: undefined };
  });
}

export function filterGroupedResults(
  groups: SearchResultGroup[],
  filter: SearchFilter,
): SearchResultGroup[] {
  if (filter === "all") {
    return groups;
  }
  if (filter === "interactions") {
    return [];
  }

  return groups.filter((group) => {
    if (filter === "cat") return group.id === "cat";
    if (filter === "calculators") return group.id === "scores";
    if (filter === "protocols") return group.id === "reco";
    if (filter === "drugs") return group.id === "drugs";
    return true;
  });
}

export function searchResultsToMedication(
  results: SearchResult[],
): MedicationSearchResult[] {
  return results.map((result) => ({
    id: result.id,
    slug: result.slug,
    title: result.title,
    subtitle: result.extraLabel ?? result.description ?? "DCI",
    statusChip: result.statusLabel,
    warningChip: result.warning,
    infoLabel: result.description ? "Extrait source" : "Identité",
    infoMeta: result.extraLabel,
    infoText:
      result.description ??
      result.badge ??
      "Fiche médicament — ouvrir pour le détail source.",
    footerText: result.footer,
    href: result.href,
    actions: [
      { label: "Ouvrir", href: result.href, variant: "primary" as const },
    ],
  }));
}
