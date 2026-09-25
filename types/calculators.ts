export type CalculatorStatus =
  | "draft"
  | "needs_validation"
  | "validated"
  | "published"
  | "hidden";

export type CalculatorType =
  | "formula"
  | "score"
  | "risk_score"
  | "classification"
  | "normal_range_interpreter"
  | "date_calculator";

export type CalculatorReviewStatus =
  | "unreviewed"
  | "needs_revision"
  | "validated"
  | "editorial_reviewed";

export type CalculatorVisibility =
  | "public_free"
  | "premium"
  | "preview_only"
  | "stub";

export type CalculatorCategorySlug =
  | "all"
  | "urgences"
  | "cardiologie"
  | "pneumologie"
  | "neurologie"
  | "reanimation"
  | "obstetrique"
  | "biologie"
  | "nephrologie";

export type CalculatorSummary = {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  type: CalculatorType;
  categorySlugs: CalculatorCategorySlug[];
  categoryLabel: string;
  description: string;
  estimatedTime?: string;
  status: CalculatorStatus;
  reviewStatus: CalculatorReviewStatus;
  visibility: CalculatorVisibility;
  href: string;
  iconName: string;
  frequentlyUsed?: boolean;
  searchTerms: string[];
  listTitle?: string;
  listSubtitle?: string;
  frequentTitle?: string;
  frequentSubtitle?: string;
  frequentMeta?: string;
  frequentCategoryLabel?: string;
  listOrder?: number;
};

export type CalculatorFilterChip = {
  id: CalculatorCategorySlug;
  label: string;
  count?: number;
};

export type CalculatorContext = {
  slug: CalculatorCategorySlug;
  label: string;
  count?: number;
  iconName: string;
};

export type GlasgowAxis = "eyes" | "verbal" | "motor";

export type GlasgowSelection = {
  eyes: number;
  verbal: number;
  motor: number;
};

export type GlasgowOption = {
  value: number;
  label: string;
  ariaLabel: string;
};

export type GlasgowSeverity = "normal" | "mild" | "moderate" | "severe";

export type GlasgowInterpretation = {
  total: number;
  max: number;
  fraction: string;
  formula: string;
  label: string;
  note: string;
  safety: string;
  severity: GlasgowSeverity;
};

export type LinkedCalculatorResource = {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  kind: "cat" | "protocol" | "coming_soon";
  disabled?: boolean;
};

export type BiologicalSex = "male" | "female";

export type CreatinineUnit = "umol_l" | "mg_dl";

export type CockcroftFormValues = {
  sex: BiologicalSex | null;
  age: string;
  weight: string;
  creatinine: string;
  unit: CreatinineUnit;
};

export type CockcroftBand =
  | "unknown"
  | "lt15"
  | "15_30"
  | "30_60"
  | "60_90"
  | "gte90";

export type CockcroftResult = {
  valid: boolean;
  clcr: number | null;
  display: string;
  k: number | null;
  creatinineUmolL: number | null;
  band: CockcroftBand;
  rangeError: boolean;
};

export type CalculatorDetailMode =
  | "specialty"
  | "additive"
  | "formula"
  | "source"
  | "missing";

export type CalculatorVariablePreview = {
  id: string;
  label: string;
  points: string;
};
