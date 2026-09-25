import { resolveCalculatorSlug } from "@/lib/calculators/calculator-slugs";
import { inferCalculatorType } from "@/lib/calculators/calculator-mappers";
import type { Calculator } from "@/types/content";
import type { CalculatorType } from "@/types/calculators";
import type { Json } from "@/types/content";

const FEATURED_SCORE_TYPES = new Set<CalculatorType>([
  "score",
  "risk_score",
  "classification",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readFormulaType(formulaJson: Json | null | undefined): string | null {
  if (!isRecord(formulaJson)) {
    return null;
  }
  return typeof formulaJson.formulaType === "string"
    ? formulaJson.formulaType
    : null;
}

/** Home-only catalog typing — does not change calculator engines or detail modes. */
export function homeFeaturedCalculatorType(row: Calculator): CalculatorType {
  const formulaType = readFormulaType(row.formula_json);
  if (formulaType === "date_arithmetic") {
    return "date_calculator";
  }
  if (
    formulaType === "single_equation" ||
    formulaType === "multi_equation" ||
    formulaType === "rule_table" ||
    formulaType === "algorithmic_branching"
  ) {
    return "formula";
  }
  return inferCalculatorType(resolveCalculatorSlug(row.slug));
}

export function isFeaturedScoreCalculator(row: Calculator): boolean {
  return FEATURED_SCORE_TYPES.has(homeFeaturedCalculatorType(row));
}
