/**
 * Orchestrate calculator HTML / formula dry-run analysis.
 * Does not eval equation_logic_text or generate production formula_json.
 */

import { mapCalculatorIdentity } from "@/lib/nabda-db/calculator-mapper";
import { classifyCalculatorInputs } from "@/lib/nabda-db/calcs/calculator-input-classifier";
import { classifyFormulaBundle } from "@/lib/nabda-db/calcs/calculator-formula-classifier";
import {
  classifyCalculatorRisk,
  hasDosingLanguage,
  hasEmergencyUse,
  hasPediatricUse,
  isHighRiskCalculator,
} from "@/lib/nabda-db/calcs/calculator-risk-classifier";
import { classifyCalculatorKind, classifyCalculatorUx } from "@/lib/nabda-db/calcs/calculator-ux-classifier";
import type { NabdaDbCalculator } from "@/lib/nabda-db/source-types";
import type { NabdaCalculatorAnalysis } from "@/types/nabda-calculator-analysis";

const LOCAL_DEMO_IDS = new Set([
  "calc.glasgow-coma-scale-score-gcs",
  "calc.creatinine-clearance-cockcroft-gault-equation",
]);

function stringifyUnknown(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

export function analyzeCalculator(source: NabdaDbCalculator): NabdaCalculatorAnalysis {
  const identity = mapCalculatorIdentity(source);
  const extra = source as NabdaDbCalculator & {
    how_to_use?: unknown;
    next_steps?: unknown;
    more_info?: string | null;
    evidence?: string | null;
  };
  const inputs = classifyCalculatorInputs(source.input_schema);
  const highRisk = isHighRiskCalculator(source);
  const formula = classifyFormulaBundle(
    source.formula,
    source.equation_logic_text,
    Boolean(source.dosing) || highRisk,
    inputs,
  );
  const kind = classifyCalculatorKind({
    highRisk,
    additiveRatio: inputs.additiveRatio,
    hasDateFields: inputs.hasDateFields,
    hasNumericFields: inputs.hasNumericFields,
    hasConditionalInputs: inputs.hasConditionalInputs,
    title: `${source.title} ${source.short_title ?? ""}`,
    calcType: source.calc_type ?? null,
    formulaType: formula.formulaType,
  });
  const risk = classifyCalculatorRisk({
    source,
    highRisk,
    additive: inputs.additiveRatio >= 0.8,
    hasRawJs: formula.logic.present,
    hasConditionalInputs: inputs.hasConditionalInputs,
  });
  const ux = classifyCalculatorUx({
    shouldStayLocked: risk.shouldStayLocked,
    kind,
    inputs,
    emergency: hasEmergencyUse(source),
  });
  const interpretation = stringifyUnknown(extra.next_steps ?? extra.more_info ?? extra.how_to_use);
  const warnings = [...risk.warnings];
  if (formula.logic.present) warnings.push("raw_js_present");
  if (formula.logic.containsEval) warnings.push("eval_in_source_js");
  if (formula.logic.present && (source.logic_language ?? "").toLowerCase() === "javascript") {
    warnings.push("logic_language_javascript");
  }
  if ((source.logic_language ?? "").toLowerCase() === "r") warnings.push("logic_language_r");
  if (inputs.inputCount > 8) warnings.push("too_many_inputs");
  if (inputs.hasConditionalInputs) warnings.push("conditional_complexity");
  if (!source.formula && !source.equation_logic_text) warnings.push("missing_formula");
  if (inputs.hasMixedLanguageLabels) warnings.push("mixed_language");
  if (inputs.hasLongLabelsOrTips) warnings.push("long_labels_or_tips");
  if (inputs.unknownInputTypes.length) warnings.push("unknown_input_type");
  if (formula.logic.present) warnings.push("never_eval_imported_js");
  if (LOCAL_DEMO_IDS.has(source.id)) warnings.push("already_has_local_demo_engine");

  return {
    sourceId: source.id,
    sourceSlug: identity.source_slug,
    slug: identity.slug,
    titleEn: identity.title_en ?? undefined,
    titleFrCandidate: identity.title_fr_candidate ?? undefined,
    descriptionEn: identity.description_en ?? undefined,
    kind,
    risk: risk.risk,
    uxPattern: ux.uxPattern,
    formulaType: formula.formulaType,
    sourceCalcType: source.calc_type ?? null,
    language: source.language ?? null,
    inputCount: inputs.inputCount,
    inputTypes: inputs.inputTypes,
    optionCount: inputs.optionCount,
    hasFormulaHtml: formula.hasFormulaHtml,
    hasEquationLogicText: formula.logic.present,
    hasInterpretationHtml: /<\/?[a-z]|!\[| \| --- \|/.test(interpretation),
    hasReferences: Array.isArray(source.references) && source.references.length > 0,
    hasUnits: inputs.hasUnits,
    hasConditionalInputs: inputs.hasConditionalInputs,
    hasDosingLanguage: hasDosingLanguage(source),
    hasEmergencyUse: hasEmergencyUse(source),
    hasPediatricUse: hasPediatricUse(source),
    hasRawJs: formula.logic.present,
    alreadyHasLocalDemoEngine: LOCAL_DEMO_IDS.has(source.id),
    formulaHtmlPreview: formula.preview,
    inputSchemaPreview: inputs.preview,
    outputPreview: interpretation
      ? interpretation.replace(/\s+/g, " ").trim().slice(0, 280)
      : undefined,
    canBecomeTapScoreCandidate: ux.canBecomeTapScoreCandidate,
    canBecomeNumericFormulaCandidate: ux.canBecomeNumericFormulaCandidate,
    requiresStepwiseUx: ux.requiresStepwiseUx,
    shouldStayLocked: risk.shouldStayLocked,
    warnings: [...new Set(warnings)],
  };
}
