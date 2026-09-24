import type { ContentRenderProvenance } from "@/types/content-rendering-core";
import type {
  NabdaCalculatorAnalysis,
  NabdaCalculatorFormulaType,
  NabdaCalculatorInputType,
  NabdaCalculatorKind,
  NabdaCalculatorRisk,
  NabdaCalculatorUxPattern,
} from "@/types/nabda-calculator-analysis";

export type CalculatorRenderWarning = {
  type: string;
  sourceId?: string;
  logicLanguage?: string;
};

export type CalculatorRenderIndexItem = {
  title: string;
  slug: string;
  sourceId: string;
  kind: NabdaCalculatorKind;
  uxPattern: NabdaCalculatorUxPattern;
  risk: NabdaCalculatorRisk;
  inputCount: number;
  formulaType: NabdaCalculatorFormulaType;
  hasRawJs: boolean;
  language: string | null;
  warningCount: number;
  locked: boolean;
  hasEmergencyUse: boolean;
  needsAdaptation: boolean;
  alreadyHasLocalDemoEngine: boolean;
  specialties: string[];
};

export type CalculatorRenderInput = {
  name: string;
  label: string;
  type: NabdaCalculatorInputType;
  sourceType: string | null;
  options: Array<{ label: string; value: string }>;
  optionCount: number;
  unit: string | null;
  optional: boolean;
  required: boolean;
  conditional: boolean;
  conditionality?: string;
  longLabel: boolean;
  tips?: string;
  yesNo: boolean;
};

export type CalculatorRenderReference = {
  label: string;
  href?: string;
};

export type CalculatorRenderDemo = {
  label: string;
  href: string;
};

export type CalculatorRenderFormula = {
  formulaType: NabdaCalculatorFormulaType;
  formulaPreview?: string;
  formulaHtml?: string;
  missingFormula: boolean;
  hasFormulaHtml: boolean;
};

export type CalculatorRenderSource = {
  slug: string;
  title: string;
  sourceId: string;
  description?: string;
  kind: NabdaCalculatorKind;
  uxPattern: NabdaCalculatorUxPattern;
  risk: NabdaCalculatorRisk;
  formulaType: NabdaCalculatorFormulaType;
  language: string | null;
  localeStatus: string | null;
  specialties: string[];
  categorySlug: string | null;
  inputCount: number;
  optionCount: number;
  locked: boolean;
  hasRawJs: boolean;
  hasEquationLogicText: boolean;
  logicLanguage: string | null;
  jsCharCount: number;
  jsLooksLikeJs: boolean;
  jsContainsEval: boolean;
  alreadyHasLocalDemoEngine: boolean;
  publicDemo: CalculatorRenderDemo | null;
  canBecomeTapScoreCandidate: boolean;
  canBecomeNumericFormulaCandidate: boolean;
  requiresStepwiseUx: boolean;
  hasConditionalInputs: boolean;
  hasDosingLanguage: boolean;
  hasEmergencyUse: boolean;
  hasPediatricUse: boolean;
  hasFormulaHtml: boolean;
  hasReferences: boolean;
  missingFormula: boolean;
  formulaPreview?: string;
  formulaHtml?: string;
  jsPreview?: string;
  inputs: CalculatorRenderInput[];
  references: CalculatorRenderReference[];
  relatedCalcIds: string[];
  warnings: string[];
  warningItems: CalculatorRenderWarning[];
};

export type CalculatorRenderProvenance = ContentRenderProvenance;

export type CalculatorRenderData = CalculatorRenderSource & CalculatorRenderProvenance;

export type CalculatorAnalysisFile = {
  generated_at?: string;
  previewOnly?: boolean;
  calculators: NabdaCalculatorAnalysis[];
};

export type CalculatorWarningFile = {
  generated_at?: string;
  counts?: Array<{ key: string; count: number }>;
  items?: CalculatorRenderWarning[];
};

export type CalculatorReportFile = {
  generated_at?: string;
  totalCalculators?: number;
};
