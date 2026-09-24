/**
 * Calculator HTML / formula dry-run analysis.
 * Display and safety classification only. Do not eval or emit formula_json.
 */

export type NabdaCalculatorKind =
  | "simple_score"
  | "formula_calculator"
  | "date_calculator"
  | "rule_based"
  | "diagnostic_criteria"
  | "dosing_or_high_risk"
  | "mixed"
  | "unknown";

export type NabdaCalculatorInputType =
  | "radio"
  | "toggle"
  | "select"
  | "number"
  | "text"
  | "date"
  | "unit_value"
  | "multi_select"
  | "computed"
  | "unknown";

export type NabdaCalculatorUxPattern =
  | "tap_score"
  | "numeric_formula"
  | "date_wheel"
  | "checklist"
  | "stepwise_wizard"
  | "compact_emergency"
  | "long_form"
  | "locked_dosing"
  | "unknown";

export type NabdaCalculatorRisk = "low" | "moderate" | "high";

export type NabdaCalculatorFormulaType =
  | "additive_points"
  | "single_equation"
  | "multi_equation"
  | "date_arithmetic"
  | "rule_table"
  | "algorithmic_branching"
  | "free_text_only"
  | "dosing_formula"
  | "unknown";

export type NabdaCalculatorAnalysis = {
  sourceId: string;
  sourceSlug: string;
  slug: string;

  titleEn?: string;
  titleFrCandidate?: string;
  descriptionEn?: string;

  kind: NabdaCalculatorKind;
  risk: NabdaCalculatorRisk;
  uxPattern: NabdaCalculatorUxPattern;
  formulaType: NabdaCalculatorFormulaType;
  sourceCalcType: string | null;
  language: string | null;

  inputCount: number;
  inputTypes: NabdaCalculatorInputType[];
  optionCount: number;

  hasFormulaHtml: boolean;
  hasEquationLogicText: boolean;
  hasInterpretationHtml: boolean;
  hasReferences: boolean;
  hasUnits: boolean;
  hasConditionalInputs: boolean;
  hasDosingLanguage: boolean;
  hasEmergencyUse: boolean;
  hasPediatricUse: boolean;
  hasRawJs: boolean;
  alreadyHasLocalDemoEngine: boolean;

  formulaHtmlPreview?: string;
  inputSchemaPreview?: unknown;
  outputPreview?: unknown;

  canBecomeTapScoreCandidate: boolean;
  canBecomeNumericFormulaCandidate: boolean;
  requiresStepwiseUx: boolean;
  shouldStayLocked: boolean;

  warnings: string[];
};
