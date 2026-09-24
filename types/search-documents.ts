export type SearchDocumentEntityType = "protocol" | "cat" | "drug" | "calculator";

export type SearchDocumentContentType =
  | "identity"
  | "section"
  | "step"
  | "drug_section"
  | "drug_table"
  | "calculator_profile";

export type SearchDocumentDraft = {
  entity_type: SearchDocumentEntityType;
  entity_slug: string;
  entity_source_id: string | null;
  content_type: SearchDocumentContentType;
  content_id: string;
  content_order: number;
  title: string;
  subtitle: string | null;
  snippet: string | null;
  searchable_text: string;
  route_href: string;
  section_anchor: string | null;
  category_slug: string | null;
  tags: string[];
  priority: number;
  visibility: "public_free" | "premium";
  review_status: string;
  activation_state: string;
  imported_from: string;
  source_trace: Record<string, unknown>;
};

export type SearchDocumentRow = SearchDocumentDraft & {
  id: string;
  created_at: string;
  updated_at: string;
};

/** Public client-safe search hit — never includes searchable_text. */
export type SearchDocumentHit = {
  id: string;
  entityType: SearchDocumentEntityType;
  entitySlug: string;
  contentType: SearchDocumentContentType;
  title: string;
  subtitle: string | null;
  snippet: string | null;
  routeHref: string;
  sectionAnchor: string | null;
  categorySlug: string | null;
  tags: string[];
  priority: number;
  reviewStatus: string;
  activationState: string;
};

export type SearchDocumentSkip = {
  reason: string;
  entity_type?: SearchDocumentEntityType | string;
  detail?: string;
};

export type SearchDocumentGenerationPlan = {
  generated_at: string;
  total_docs: number;
  docs_by_entity_type: Record<string, number>;
  docs_by_content_type: Record<string, number>;
  skipped_docs: number;
  skip_reasons: Record<string, number>;
  truncated_count: number;
  blocked_unsafe_count: number;
  large_table_skipped: number;
  locked_calculators_identity_only: number;
  empty_snippet_count: number;
  route_coverage: number;
  estimated_index_bytes: number;
  safety: {
    internal_routes: number;
    script_hits: number;
    valide_hits: number;
  };
  sample_titles: string[];
};
