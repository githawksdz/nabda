/**
 * Map calculator analysis to a Nabda mobile UX pattern.
 * Does not enable engines or dosing tools.
 */

import type {
  NabdaCalculatorKind,
  NabdaCalculatorUxPattern,
} from "@/types/nabda-calculator-analysis";
import type { InputClassification } from "@/lib/nabda-db/calcs/calculator-input-classifier";

export function classifyCalculatorKind(input: {
  highRisk: boolean;
  additiveRatio: number;
  hasDateFields: boolean;
  hasNumericFields: boolean;
  hasConditionalInputs: boolean;
  title: string;
  calcType: string | null;
  formulaType: string;
}): NabdaCalculatorKind {
  if (input.highRisk) return "dosing_or_high_risk";
  if (input.hasDateFields || input.formulaType === "date_arithmetic") return "date_calculator";
  const diagnostic =
    input.calcType === "diagnostic_criteria" ||
    /crit[eè]res|criteria|classification/i.test(input.title);
  if (input.additiveRatio >= 0.8 && diagnostic) return "diagnostic_criteria";
  if (input.additiveRatio >= 0.8) return "simple_score";
  if (diagnostic) return "diagnostic_criteria";
  if (input.hasConditionalInputs || input.formulaType === "algorithmic_branching" || input.formulaType === "rule_table") {
    return "rule_based";
  }
  if (input.hasNumericFields || input.formulaType === "single_equation" || input.formulaType === "multi_equation") {
    return "formula_calculator";
  }
  if (input.hasNumericFields && input.additiveRatio > 0 && input.additiveRatio < 0.8) return "mixed";
  return "unknown";
}

export function classifyCalculatorUx(input: {
  shouldStayLocked: boolean;
  kind: NabdaCalculatorKind;
  inputs: InputClassification;
  emergency: boolean;
}): {
  uxPattern: NabdaCalculatorUxPattern;
  canBecomeTapScoreCandidate: boolean;
  canBecomeNumericFormulaCandidate: boolean;
  requiresStepwiseUx: boolean;
} {
  const { inputs } = input;
  const canBecomeTapScoreCandidate =
    !input.shouldStayLocked &&
    inputs.additiveRatio >= 0.8 &&
    inputs.inputCount > 0 &&
    inputs.inputCount <= 10 &&
    !inputs.hasNumericFields;
  const canBecomeNumericFormulaCandidate =
    !input.shouldStayLocked &&
    inputs.hasNumericFields &&
    inputs.inputCount > 0 &&
    inputs.inputCount <= 8 &&
    inputs.additiveRatio < 0.5;
  const requiresStepwiseUx = inputs.hasConditionalInputs || inputs.inputCount > 8;

  if (input.shouldStayLocked) {
    return {
      uxPattern: "locked_dosing",
      canBecomeTapScoreCandidate: false,
      canBecomeNumericFormulaCandidate: false,
      requiresStepwiseUx,
    };
  }
  if (input.kind === "date_calculator" || inputs.hasDateFields) {
    return {
      uxPattern: "date_wheel",
      canBecomeTapScoreCandidate,
      canBecomeNumericFormulaCandidate,
      requiresStepwiseUx,
    };
  }
  if (canBecomeTapScoreCandidate && input.emergency && inputs.inputCount <= 6) {
    return {
      uxPattern: "compact_emergency",
      canBecomeTapScoreCandidate: true,
      canBecomeNumericFormulaCandidate,
      requiresStepwiseUx,
    };
  }
  if (canBecomeTapScoreCandidate) {
    return {
      uxPattern: "tap_score",
      canBecomeTapScoreCandidate: true,
      canBecomeNumericFormulaCandidate,
      requiresStepwiseUx,
    };
  }
  if (inputs.yesNoCount >= 6 && inputs.inputCount >= 6) {
    return {
      uxPattern: "checklist",
      canBecomeTapScoreCandidate,
      canBecomeNumericFormulaCandidate,
      requiresStepwiseUx,
    };
  }
  if (inputs.hasConditionalInputs) {
    return {
      uxPattern: "stepwise_wizard",
      canBecomeTapScoreCandidate,
      canBecomeNumericFormulaCandidate,
      requiresStepwiseUx: true,
    };
  }
  if (canBecomeNumericFormulaCandidate) {
    return {
      uxPattern: "numeric_formula",
      canBecomeTapScoreCandidate,
      canBecomeNumericFormulaCandidate: true,
      requiresStepwiseUx,
    };
  }
  if (inputs.inputCount > 8) {
    return {
      uxPattern: "long_form",
      canBecomeTapScoreCandidate,
      canBecomeNumericFormulaCandidate,
      requiresStepwiseUx: true,
    };
  }
  return {
    uxPattern: "unknown",
    canBecomeTapScoreCandidate,
    canBecomeNumericFormulaCandidate,
    requiresStepwiseUx,
  };
}
