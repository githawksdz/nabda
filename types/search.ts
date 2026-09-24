export type SearchFilter =
  | "all"
  | "cat"
  | "protocols"
  | "drugs"
  | "calculators"
  | "interactions";

export type SearchScreenState = "initial" | "results" | "drugs" | "zero";

export type SearchResultType =
  | "cat"
  | "protocol"
  | "recommendation"
  | "drug"
  | "calculator";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  meta?: string;
  statusLabel?: string;
  extraLabel?: string;
  footer?: string;
  warning?: string;
  badge?: string;
  href: string;
  /** Stable nabda_db id when the hit comes from an imported identity. */
  sourceId?: string;
};

/** Re-export Stage B document types for callers. */
export type {
  SearchDocumentContentType,
  SearchDocumentEntityType,
  SearchDocumentHit,
} from "@/types/search-documents";

/** Stage A identity hit — titles, DCI, brands, tags. No clinical bodies. */
export type IdentityContentType = "protocol" | "cat" | "calculator" | "drug";

export type IdentitySearchHit = {
  type: IdentityContentType;
  slug: string;
  title: string;
  shortTitle?: string | null;
  dci?: string | null;
  displayName?: string | null;
  categorySlug?: string | null;
  tags?: string[];
  brandNames?: string[];
  abbreviations?: string[];
  sourceId?: string | null;
  sourcePrefix?: string | null;
  importedFrom?: string | null;
  status?: string | null;
  reviewStatus?: string | null;
  visibility?: string | null;
  clinicalPayloadStatus?: string | null;
};

export type IdentitySearchFilters = {
  type?: SearchFilter;
  limit?: number;
};

export type SearchResultGroup = {
  id: string;
  title: string;
  subtitle?: string;
  count: number;
  seeAllHref?: string;
  seeAllLabel?: string;
  dotClassName?: string;
  results: SearchResult[];
};

export type MedicationSearchResult = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  statusChip?: string;
  warningChip?: string;
  infoLabel: string;
  infoMeta?: string;
  infoText: string;
  footerText?: string;
  href: string;
  actions: Array<{
    label: string;
    href: string;
    variant?: "primary" | "secondary";
  }>;
};

export type FrequentSearchChip = {
  id: string;
  label: string;
  query: string;
  filter?: SearchFilter;
};

export type RecentConsultation = {
  id: string;
  title: string;
  meta: string;
  href: string;
  icon: string;
};

export type ExploreModule = {
  id: string;
  title: string;
  subtitle: string;
  label?: string;
  href: string;
  icon: string;
  featured?: boolean;
};

export type FilterChip = {
  id: SearchFilter | string;
  label: string;
  count?: number;
};

export type PivotSuggestion = {
  id: string;
  title: string;
  href: string;
  icon: string;
};
