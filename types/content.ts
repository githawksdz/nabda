export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BillingPeriod = "monthly" | "yearly" | "manual" | "lifetime";
export type PlanSlug = "freemium" | "pro_yearly";
export type PlanStatus = "active" | "pending" | "expired" | "cancelled";
export type SubscriptionStatus =
  | "active"
  | "pending"
  | "expired"
  | "cancelled"
  | "rejected";
export type SubscriptionSource = "manual" | "admin" | "test_seed" | "payment_proof";

export type ContentVisibility =
  | "public_free"
  | "premium"
  | "preview_only"
  | "hidden"
  | "admin_only";

export type EditorialReviewStatus =
  | "unreviewed"
  | "editorial_placeholder"
  | "editorial_reviewed"
  | "medical_reviewed"
  | "validated"
  | "needs_revision";

export type ClinicalPayloadStatus = "locked" | "unlocked";

export type LocalAdaptationStatusValue =
  | "pending"
  | "in_progress"
  | "to_verify"
  | "adapted";

/** Provenance columns added in 0010_nabda_db_import_metadata.sql */
export type ContentImportMetadata = {
  source_id: string | null;
  source_prefix: string | null;
  source_slug: string | null;
  imported_from: string | null;
  imported_at: string | null;
  source_trace: Json;
  local_adaptation_status: string | null;
  clinical_payload_status: ClinicalPayloadStatus | string;
};

export type ContentImportMetadataInsert = {
  source_id?: string | null;
  source_prefix?: string | null;
  source_slug?: string | null;
  imported_from?: string | null;
  imported_at?: string | null;
  source_trace?: Json;
  local_adaptation_status?: string | null;
  clinical_payload_status?: ClinicalPayloadStatus | string;
};

export type SubscriptionPlan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_dzd: number | null;
  billing_period: BillingPeriod;
  is_active: boolean;
  features: Json;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type UserSubscription = {
  id: string;
  user_id: string;
  plan_slug: string;
  status: SubscriptionStatus;
  starts_at: string;
  ends_at: string | null;
  source: SubscriptionSource;
  metadata: Json;
  created_at: string;
  updated_at: string;
};

export type ContentCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type Protocol = {
  id: string;
  slug: string;
  title: string;
  short_title: string | null;
  summary: string | null;
  category_slug: string | null;
  content_type: "protocol" | "recommendation" | "guide";
  status: string;
  review_status: EditorialReviewStatus | string;
  visibility: ContentVisibility | string;
  is_featured: boolean;
  published_at: string | null;
  source_note: string | null;
  search_text: string;
  offline_available?: boolean;
  created_at: string;
  updated_at: string;
} & ContentImportMetadata;

export type CatMap = {
  id: string;
  protocol_id: string | null;
  slug: string;
  title: string;
  summary: string | null;
  status: string;
  review_status: string;
  visibility: string;
  map_json: Json;
  is_featured: boolean;
  published_at: string | null;
  source_note: string | null;
  created_at: string;
  updated_at: string;
  offline_available?: boolean;
} & ContentImportMetadata;

export type Calculator = {
  id: string;
  slug: string;
  title: string;
  short_title: string | null;
  description: string | null;
  category_slug: string | null;
  status: string;
  review_status: string;
  visibility: string;
  formula_json: Json;
  is_featured: boolean;
  usage_context: string | null;
  search_text: string;
  /** Compiled TypeScript engine slug when wired. */
  engine_slug?: string | null;
  engine_version?: string | null;
  engine_implemented?: boolean | null;
  created_at: string;
  updated_at: string;
  offline_available?: boolean;
} & ContentImportMetadata;

export type Drug = {
  id: string;
  slug: string;
  dci: string;
  display_name: string;
  therapeutic_class: string | null;
  summary: string | null;
  status: string;
  review_status: string;
  visibility: string;
  is_featured: boolean;
  source_note: string | null;
  search_text: string;
  created_at: string;
  updated_at: string;
  offline_available?: boolean;
} & ContentImportMetadata;

export type HomeFeedItem = {
  id: string;
  title: string;
  description: string | null;
  label: string | null;
  category_slug: string | null;
  item_type: string;
  target_type: string | null;
  target_slug: string | null;
  visibility: string;
  plan_required: "freemium" | "pro" | string;
  audience_professions: string[];
  audience_interests: string[];
  is_active: boolean;
  priority: number;
  published_at: string | null;
  review_status: string;
  created_at: string;
  updated_at: string;
} & ContentImportMetadata;

export type FavoriteItemType = "protocol" | "cat" | "calculator" | "drug";
export type HistoryItemType = FavoriteItemType | "search";

export type ProtocolSectionRow = {
  id: string;
  protocol_id: string;
  heading: string;
  section_type: string;
  order_index: number;
  visibility: string;
  adaptation_flags: string[];
  content_json: Json;
  plain_text: string | null;
  review_status: string;
  created_at: string;
  updated_at: string;
} & ContentImportMetadata;

export type ProtocolReferenceRow = {
  id: string;
  protocol_id: string;
  section_id: string | null;
  label: string;
  url: string | null;
  reference_type: string;
  year: number | null;
  order_index: number;
  review_status: string;
  created_at: string;
  updated_at: string;
} & ContentImportMetadata;

export type ProtocolLinkRow = {
  id: string;
  protocol_id: string;
  target_type: string;
  target_id: string | null;
  target_slug: string | null;
  label: string;
  relationship: string;
  order_index: number;
  created_at: string;
} & ContentImportMetadata;

export type CatBlockRow = {
  id: string;
  cat_map_id: string;
  block_key: string;
  block_type: string;
  title: string | null;
  text: string | null;
  rich_content: Json | null;
  x: number | string;
  y: number | string;
  width: number | string;
  height: number | string;
  style: Json;
  order_index: number | null;
  flags: string[];
  linked_drug_ids: string[];
  linked_calculator_ids: string[];
  linked_protocol_ids: string[];
  review_status: string;
  created_at: string;
  updated_at: string;
} & ContentImportMetadata;

export type CatEdgeRow = {
  id: string;
  cat_map_id: string;
  from_block_id: string;
  to_block_id: string;
  label: string | null;
  relationship: string;
  confidence: string;
  path: Json | null;
  style: Json;
  order_index: number | null;
  review_status: string;
  created_at: string;
  updated_at: string;
} & ContentImportMetadata;

export type ContentReviewEvent = {
  id: string;
  entity_type: string;
  entity_id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
};
