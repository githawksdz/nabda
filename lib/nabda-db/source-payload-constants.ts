export const SOURCE_PAYLOAD_IMPORTED_FROM = "nabda_db";

export const SOURCE_PAYLOAD_DEFAULTS = {
  imported_from: SOURCE_PAYLOAD_IMPORTED_FROM,
  activation_state: "source_preserved_locked",
  review_status: "unreviewed",
  visibility: "admin_only",
  clinical_payload_status: "locked",
} as const;

export const SOURCE_PAYLOAD_BUNDLE_ITEM_ID = "_bundle";

export const SOURCE_PAYLOAD_TABLES = {
  protocolSections: "source_protocol_sections",
  catSteps: "source_cat_steps",
  drugSections: "source_drug_sections",
  drugTables: "source_drug_tables",
  calculatorProfiles: "source_calculator_profiles",
} as const;

export const LARGE_PAYLOAD_BYTES = 100_000;
