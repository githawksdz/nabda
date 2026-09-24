/**
 * Classify nabda_db calculator input_schema for mobile UX.
 * Does not execute values or conditionality expressions.
 */

import type { NabdaDbCalcInput } from "@/lib/nabda-db/source-types";
import type { NabdaCalculatorInputType } from "@/types/nabda-calculator-analysis";

export type CalcInputExtended = NabdaDbCalcInput & {
  tips?: string;
  optional?: boolean;
  unit?: string;
  show_points?: boolean;
};

const SKIP_TYPES = new Set(["subheading", "visual", "heading", "info"]);

const FRENCH_HINT =
  /[àâäéèêëïîôùûüçœæ]|\b(pour|des|une|score de|critères|critere|âge|poids)\b/i;
const ENGLISH_HINT = /\b(the|and|with|score|risk|criteria|years|history|if|not testable)\b/i;

export function isScoredInput(input: CalcInputExtended): boolean {
  return Boolean(input.type) && !SKIP_TYPES.has(input.type ?? "");
}

export function classifySourceInputType(input: CalcInputExtended): NabdaCalculatorInputType {
  const type = (input.type ?? "").toLowerCase();
  if (SKIP_TYPES.has(type)) return "unknown";
  if (type === "radio") return "radio";
  if (type === "toggle" || type === "boolean") return "toggle";
  if (type === "dropdown" || type === "select") return "select";
  if (type === "checkbox" || type === "multiselect" || type === "multi_select") return "multi_select";
  if (type === "date" || type === "datepicker" || type === "datetime") return "date";
  if (type === "computed" || type === "hidden") return "computed";
  if (type === "textbox" || type === "number" || type === "numeric") {
    if (input.unit) return "unit_value";
    const name = `${input.name ?? ""} ${input.label ?? ""}`.toLowerCase();
    if (/\b(age|poids|weight|height|taille|cr|creat|score|dose|gfr|imc|bmi|rate|freq)\b/.test(name)) {
      return "number";
    }
    return "number";
  }
  if (type === "text" || type === "textarea") return "text";
  return "unknown";
}

export function optionCount(input: CalcInputExtended): number {
  return Array.isArray(input.options) ? input.options.length : 0;
}

export function isNumericOptionValue(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

export function isAdditiveInput(input: CalcInputExtended): boolean {
  if (!isScoredInput(input)) return false;
  const options = input.options ?? [];
  if (!options.length) return false;
  return options.every((option) => isNumericOptionValue(option.value));
}

export function isYesNoInput(input: CalcInputExtended): boolean {
  const options = input.options ?? [];
  if (options.length !== 2) return false;
  const labels = options.map((option) => String(option.label ?? "").toLowerCase());
  return labels.some((label) => /^(oui|non|yes|no|true|false|présent|absent)/i.test(label));
}

export function hasConditionality(input: CalcInputExtended): boolean {
  return Boolean(input.conditionality && String(input.conditionality).trim());
}

export function labelLooksMixedLanguage(text: string): boolean {
  return FRENCH_HINT.test(text) && ENGLISH_HINT.test(text);
}

export type InputClassification = {
  inputs: CalcInputExtended[];
  scoredInputs: CalcInputExtended[];
  inputCount: number;
  inputTypes: NabdaCalculatorInputType[];
  optionCount: number;
  hasUnits: boolean;
  hasConditionalInputs: boolean;
  hasOptionalInputs: boolean;
  hasDateFields: boolean;
  hasNumericFields: boolean;
  hasLongLabelsOrTips: boolean;
  hasMixedLanguageLabels: boolean;
  unknownInputTypes: string[];
  additiveRatio: number;
  yesNoCount: number;
  preview: Array<Record<string, unknown>>;
};

export function classifyCalculatorInputs(rawInputs: NabdaDbCalcInput[] | undefined): InputClassification {
  const inputs = (rawInputs ?? []) as CalcInputExtended[];
  const scoredInputs = inputs.filter(isScoredInput);
  const types = [...new Set(scoredInputs.map(classifySourceInputType))];
  const unknownInputTypes = scoredInputs
    .filter((input) => classifySourceInputType(input) === "unknown")
    .map((input) => input.type ?? "missing")
    .filter((type, index, all) => all.indexOf(type) === index);
  const additive = scoredInputs.filter(isAdditiveInput).length;
  return {
    inputs,
    scoredInputs,
    inputCount: scoredInputs.length,
    inputTypes: types,
    optionCount: scoredInputs.reduce((sum, input) => sum + optionCount(input), 0),
    hasUnits: scoredInputs.some((input) => Boolean(input.unit)),
    hasConditionalInputs: scoredInputs.some(hasConditionality),
    hasOptionalInputs: scoredInputs.some((input) => input.optional === true),
    hasDateFields: types.includes("date"),
    hasNumericFields: types.includes("number") || types.includes("unit_value"),
    hasLongLabelsOrTips: scoredInputs.some(
      (input) => (input.label?.length ?? 0) > 80 || (input.tips?.length ?? 0) > 160,
    ),
    hasMixedLanguageLabels: scoredInputs.some((input) => {
      const blob = `${input.label ?? ""} ${input.tips ?? ""} ${(input.options ?? []).map((option) => option.label).join(" ")}`;
      return labelLooksMixedLanguage(blob);
    }),
    unknownInputTypes,
    additiveRatio: scoredInputs.length ? additive / scoredInputs.length : 0,
    yesNoCount: scoredInputs.filter(isYesNoInput).length,
    preview: scoredInputs.slice(0, 8).map((input) => ({
      name: input.name ?? null,
      type: classifySourceInputType(input),
      sourceType: input.type ?? null,
      optionCount: optionCount(input),
      unit: input.unit ?? null,
      optional: Boolean(input.optional),
      conditional: hasConditionality(input),
    })),
  };
}
