/**
 * Raw nabda_db shapes and identity DTOs.
 *
 * These DTOs are for future import scripts. They are not clinical payloads
 * and must not be treated as validated Nabda content.
 *
 * ID prefixes in this pack (see nabda_db/index.json):
 * - g.*   guideline / reco (protocol + optional CAT)
 * - s.*   substance / DCI
 * - p.*   presentation (brandless forme + strength label + route)
 * - c.*   Algerian commercial product (not an ATC class)
 * - calc.* calculator
 * - atc.* ATC node
 */

export const IMPORTED_FROM_NABDA_DB = "nabda_db" as const;

export const IDENTITY_IMPORT_DEFAULTS = {
  publication_status: "imported",
  review_status: "unreviewed",
  visibility: "admin_only",
  clinical_payload_status: "locked",
  imported_from: IMPORTED_FROM_NABDA_DB,
} as const;

export type IdentityImportDefaults = typeof IDENTITY_IMPORT_DEFAULTS;

/** Mechanical brand rewriting only. Not medical validation. */
export type MapperLocalAdaptationStatus =
  | "mechanically_adapted"
  | "pending"
  | "to_verify"
  | "in_progress"
  | "adapted";

export type NabdaDbLocaleStatus =
  | "ok"
  | "adapted"
  | "needs_adaptation"
  | "france_specific"
  | "not_applicable_dz"
  | string;

export type NabdaDbGuideline = {
  id: string;
  title: string;
  body_html?: string;
  substance_ids?: string[];
  presentation_ids?: string[];
  related_cat_ids?: string[];
  calc_ids?: string[];
  source_context?: string;
  locale_status?: NabdaDbLocaleStatus;
  notes?: string[];
  sources?: Record<string, unknown>;
  adaptation?: Record<string, unknown>;
};

export type NabdaDbCalcInputOption = {
  label?: string;
  value?: string | number | boolean | null;
};

export type NabdaDbCalcInput = {
  type?: string;
  name?: string;
  label?: string;
  options?: NabdaDbCalcInputOption[];
  conditionality?: string;
};

export type NabdaDbCalculator = {
  id: string;
  slug?: string | null;
  language?: string | null;
  title: string;
  short_title?: string | null;
  calc_type?: string | null;
  purpose?: string[];
  specialties?: string[];
  diseases?: string[];
  chief_complaints?: string[];
  abbreviations?: string[];
  dosing?: boolean;
  runnable?: boolean;
  disabled?: boolean;
  formula?: string | null;
  short_description?: string | null;
  medium_description?: string | null;
  input_schema?: NabdaDbCalcInput[];
  equation_logic_text?: string | null;
  logic_language?: string | null;
  locale_status?: NabdaDbLocaleStatus;
  source_context?: string | null;
  cat_ids?: string[];
  substance_ids?: string[];
  related_calc_ids?: string[];
  references?: unknown[];
};

export type NabdaDbSubstance = {
  id: string;
  inns: string[];
  label: string;
  kind?: string;
  atc_id?: string | null;
  availability_dz?: string;
  cat_ids?: string[];
  sources?: Record<string, unknown>;
};

export type NabdaDbPresentation = {
  id: string;
  substance_id: string;
  label: string;
  forme?: string | null;
  forme_family?: string | null;
  route?: string | null;
  dose_tokens?: string[];
  atc_id?: string | null;
  monograph_id?: string | null;
  indication_ids?: string[];
  availability_dz?: string;
  local_names?: string[];
  cat_ids?: string[];
  sources?: Record<string, unknown>;
};

export type NabdaDbProduct = {
  id: string;
  name: string;
  presentation_id?: string | null;
  substance_id?: string | null;
  manufacturer_id?: string | null;
  forme?: string | null;
  dosage?: string | null;
  pack?: string | null;
  availability_dz?: string;
  local_only?: boolean;
  sources?: Record<string, unknown>;
};

export type NabdaDbMonograph = {
  id: string;
  presentation_id?: string;
  sections?: Record<string, string>;
  section_locale?: Record<string, string>;
  source_context?: string;
  locale_status?: NabdaDbLocaleStatus;
  sources?: Record<string, unknown>;
};

export type NabdaDbAtc = {
  id: string;
  code: string;
  name: string;
  parent_id?: string | null;
};

export type NabdaDbLinkEndpoint = {
  type: string;
  id: string;
};

export type NabdaDbLink = {
  from: NabdaDbLinkEndpoint | string;
  to: NabdaDbLinkEndpoint | string;
  role?: string;
  type?: string;
  kind?: string;
  rel?: string;
  confidence?: string | number | null;
};

export type ProtocolIdentity = IdentityImportDefaults & {
  source_id: string;
  source_prefix: "g";
  source_slug: string;
  slug: string;
  title: string;
  category_slug: string;
  tag_slugs: string[];
  has_body_html: boolean;
  has_flowchart_image: boolean;
  source_count: number;
  linked_drug_ids: string[];
  linked_calc_ids: string[];
  linked_protocol_ids: string[];
  local_adaptation_status: MapperLocalAdaptationStatus;
  source_trace: Record<string, unknown>;
};

export type CatIdentity = IdentityImportDefaults & {
  source_id: string;
  source_prefix: "g";
  protocol_source_id: string;
  source_slug: string;
  slug: string;
  title: string;
  category_slug: string;
  tag_slugs: string[];
  has_flowchart_image: true;
  flowchart_media_count: number;
  local_adaptation_status: MapperLocalAdaptationStatus;
  source_trace: Record<string, unknown>;
};

export type DrugIdentity = IdentityImportDefaults & {
  source_id: string;
  source_prefix: "s";
  source_slug: string;
  slug: string;
  display_name: string;
  dci_name: string;
  class_slug: string;
  class_label: string;
  presentation_count: number;
  product_count_dz: number;
  forms: string[];
  /** Marketed presentation strengths. Not posology. */
  strength_labels: string[];
  brand_names_sample: string[];
  has_monograph_html: boolean;
  has_posology_html: boolean;
  has_interaction_html: boolean;
  has_pregnancy_html: boolean;
  availability_dz: string | null;
  local_adaptation_status: MapperLocalAdaptationStatus;
  source_trace: Record<string, unknown>;
};

export type CalculatorRiskClassification =
  | "dosing_or_high_risk"
  | "needs_manual_logic_review"
  | "later_additive_candidate"
  | "identity_only";

export type CalculatorIdentity = IdentityImportDefaults & {
  source_id: string;
  source_prefix: "calc";
  source_slug: string;
  slug: string;
  title_en: string | null;
  title_fr_candidate: string | null;
  description_en: string | null;
  description_fr_candidate: string | null;
  language: string | null;
  specialty_slugs: string[];
  category_slug: string;
  tag_slugs: string[];
  calc_type: string | null;
  input_count: number;
  input_types: string[];
  has_formula_html: boolean;
  has_equation_logic_text: boolean;
  is_runnable_source: boolean;
  needs_adaptation: boolean;
  risk_classification: CalculatorRiskClassification;
  local_adaptation_status: MapperLocalAdaptationStatus;
  source_trace: Record<string, unknown>;
};

export type ContentLinkIdentity = {
  source_from_id: string;
  source_to_id: string;
  from_type: string;
  to_type: string;
  relation_type: string;
  confidence: string | number | null;
  imported_from: typeof IMPORTED_FROM_NABDA_DB;
};

export function identityImportDefaults(): IdentityImportDefaults {
  return { ...IDENTITY_IMPORT_DEFAULTS };
}

/**
 * locale_status "adapted" is mechanical spe/brand rewriting, never medical
 * validation. Phase 1 SQL allows pending|in_progress|to_verify|adapted —
 * importer must remap mechanically_adapted before upsert (see source_trace).
 */
export function mapLocaleStatus(
  localeStatus?: string | null,
): MapperLocalAdaptationStatus {
  switch (localeStatus) {
    case "adapted":
      return "mechanically_adapted";
    case "france_specific":
      return "to_verify";
    case "ok":
      return "pending";
    case "needs_adaptation":
    case "not_applicable_dz":
    default:
      return "pending";
  }
}

/**
 * Phase 1 SQL allows pending|in_progress|to_verify|adapted only.
 * mechanically_adapted must not be written to the database.
 */
export function toDbLocalAdaptationStatus(
  mapped: MapperLocalAdaptationStatus,
): "pending" | "in_progress" | "to_verify" | "adapted" {
  switch (mapped) {
    case "mechanically_adapted":
      return "in_progress";
    case "in_progress":
      return "in_progress";
    case "to_verify":
      return "to_verify";
    case "adapted":
      return "adapted";
    case "pending":
    default:
      return "pending";
  }
}
