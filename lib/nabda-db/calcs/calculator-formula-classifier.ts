/**
 * Classify calculator formula / equation text without executing it.
 * Never eval, never emit production formula_json.
 */

import { htmlToPlainText } from "@/lib/nabda-db/html/html-cleaner";
import type { NabdaCalculatorFormulaType } from "@/types/nabda-calculator-analysis";
import type { InputClassification } from "@/lib/nabda-db/calcs/calculator-input-classifier";

const ARITH_RE = /[=+\-×x*/÷^]|mg\/kg|mL\/min|\bCrCl\b|\(140/;
const DATE_RE = /due date|ddr|naegele|gestation|semaines\*|lmp\b|estimated due/i;
const MULTI_EQ_RE = /\n.+=.+\n.+=/m;
const DOSING_RE = /dose,?\s*mg|µg\/jour|mcg\/(kg|day)|mg\/kg|bolus|perfusion|posologie/i;
const TABLE_RE = /\| --- \|/;

export function formulaLooksLikeHtml(formula?: string | null): boolean {
  if (!formula) return false;
  return /<\/?[a-z][\s\S]*>/i.test(formula) || /!\[[^\]]*]\(/i.test(formula);
}

export function formulaPreview(formula?: string | null, max = 420): string | undefined {
  if (!formula) return undefined;
  const text = htmlToPlainText(formula).replace(/\s+/g, " ").trim();
  if (!text) return undefined;
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function classifyFormulaType(input: {
  formula?: string | null;
  equationLogicText?: string | null;
  dosing: boolean;
  hasDateFields: boolean;
  additiveRatio: number;
  hasConditionalInputs: boolean;
}): NabdaCalculatorFormulaType {
  const formula = input.formula ?? "";
  if (input.dosing || DOSING_RE.test(formula)) return "dosing_formula";
  if (input.hasDateFields || DATE_RE.test(formula)) return "date_arithmetic";
  if (input.additiveRatio >= 0.8) return "additive_points";
  if (input.hasConditionalInputs && input.equationLogicText) return "algorithmic_branching";
  if (input.equationLogicText && (MULTI_EQ_RE.test(formula) || /if\s*\(|else if/i.test(input.equationLogicText))) {
    return formula && ARITH_RE.test(formula) ? "multi_equation" : "algorithmic_branching";
  }
  if (TABLE_RE.test(formula) && !ARITH_RE.test(formula)) return "rule_table";
  if (formula && ARITH_RE.test(formula) && MULTI_EQ_RE.test(formula)) return "multi_equation";
  if (formula && ARITH_RE.test(formula)) return "single_equation";
  if (input.additiveRatio >= 0.8) return "additive_points";
  if (formula && !ARITH_RE.test(formula) && !input.equationLogicText) return "free_text_only";
  if (!formula && !input.equationLogicText) return "unknown";
  return "unknown";
}

export function inspectEquationLogic(text?: string | null): {
  present: boolean;
  looksLikeJs: boolean;
  containsEval: boolean;
  charCount: number;
} {
  if (!text) {
    return { present: false, looksLikeJs: false, containsEval: false, charCount: 0 };
  }
  return {
    present: true,
    looksLikeJs: /function\s|parseFloat|var\s|let\s|const\s|calc_output/.test(text),
    containsEval: /\beval\s*\(|new Function\s*\(/i.test(text),
    charCount: text.length,
  };
}

export function classifyFormulaBundle(
  formula: string | null | undefined,
  equationLogicText: string | null | undefined,
  dosing: boolean,
  inputs: InputClassification,
): {
  formulaType: NabdaCalculatorFormulaType;
  hasFormulaHtml: boolean;
  preview?: string;
  hasTables: boolean;
  logic: ReturnType<typeof inspectEquationLogic>;
} {
  const logic = inspectEquationLogic(equationLogicText);
  return {
    formulaType: classifyFormulaType({
      formula,
      equationLogicText,
      dosing,
      hasDateFields: inputs.hasDateFields,
      additiveRatio: inputs.additiveRatio,
      hasConditionalInputs: inputs.hasConditionalInputs,
    }),
    hasFormulaHtml: formulaLooksLikeHtml(formula),
    preview: formulaPreview(formula),
    hasTables: TABLE_RE.test(formula ?? ""),
    logic,
  };
}
