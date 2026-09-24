export type DrugReviewStatus =
  | "unreviewed"
  | "needs_revision"
  | "pharmacist_review_required"
  | "pharmacist_reviewed"
  | "validated";

export type DrugPublicationStatus =
  | "draft"
  | "seed_placeholder"
  | "needs_pharmacology_review"
  | "published"
  | "hidden"
  | "archived";

export type DrugVisibility =
  | "public_free"
  | "premium"
  | "preview_only"
  | "stub"
  | "admin_only";

export type DrugCategorySlug =
  | "all"
  | "antibiotiques"
  | "antalgiques"
  | "cardio"
  | "urgences"
  | "grossesse"
  | "pediatrie"
  | "rein"
  | "anticoagulants"
  | "diabete";

export type DrugSummary = {
  id: string;
  slug: string;
  genericName: string;
  brandNames?: string[];
  className: string;
  shortClassName?: string;
  atcCode?: string;
  categorySlugs: DrugCategorySlug[];
  status: DrugPublicationStatus;
  reviewStatus: DrugReviewStatus;
  visibility: DrugVisibility;
  href: string;
  iconName: string;
  searchTerms: string[];
  frequentlyConsulted?: boolean;
};

export type DrugTab = "apercu" | "securite" | "formes" | "sources";

export type DrugTabItem = {
  id: DrugTab;
  label: string;
};

export type DrugStructureRow = {
  id: string;
  label: string;
  status: string;
};

export type DrugSafetyPreview = {
  id: string;
  title: string;
  statusLabel: string;
};

export type DrugSafetyItem = {
  id: string;
  label: string;
  description?: string;
  severity: "info" | "caution" | "warning" | "contraindication";
  sourceStatus: "placeholder" | "to_verify" | "reviewed" | "validated";
};

export type LinkedDrugResource = {
  label: string;
  subtitle?: string;
  href: string;
  status?: string;
};

export type DrugReference = {
  label: string;
  href?: string;
  sourceStatus: "placeholder" | "to_verify" | "reviewed" | "validated";
};

export type DrugDetail = DrugSummary & {
  subtitle?: string;
  classChip?: string;
  safetyNote: string;
  summary: string;
  formsStatus: string;
  posologyStatus: string;
  posologyBody: string;
  formStructure: DrugStructureRow[];
  safetyPreviews: DrugSafetyPreview[];
  contraindications: DrugSafetyItem[];
  warnings: DrugSafetyItem[];
  pregnancyLactationStatus: string;
  renalHepaticStatus: string;
  linkedProtocols: LinkedDrugResource[];
  linkedCalculators: LinkedDrugResource[];
  references: DrugReference[];
};

export type DrugFilterChip = {
  id: DrugCategorySlug;
  label: string;
  count?: number;
};

export type DrugClassTile = {
  slug: DrugCategorySlug;
  label: string;
  iconName: string;
};

export type DrugDetailMode = "overview" | "preparation" | "request";
