/* eslint-disable */
// @ts-nocheck
/**
 * GENERATED calculator engine — do not edit by hand.
 * sourceId: calc.medication-regimen-complexity-icu-mrc-icu-score
 * slug: medication-regimen-complexity-icu-mrc-icu-score
 * version: 1.0.0
 * Build-time AST codegen only. No source JS execution.
 */
import type { CalculatorEngine, CalculatorEngineResult } from "@/lib/calculators/engine-types";
import { incompleteInput, invalidValue, engineFail } from "@/lib/calculators/engine-errors";

export type GeneratedInput = Record<string, number | string | boolean | null | undefined>;

export type GeneratedOutput = {
  value: number | string | boolean;
  label: string;
  unit?: string;
  extras?: Array<{ id: string; value: number | string | boolean; label: string }>;
};

function __num(v: unknown): number {
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(String(v).replace(",", "."));
    if (Number.isFinite(n)) return n;
  }
  return Number.NaN;
}

function __div(a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return Number.NaN;
  return a / b;
}

function __round(v: number, d: number): number {
  const f = 10 ** d;
  return Math.round(v * f) / f;
}

function __lookup(
  input: number | string | boolean,
  rows: Array<{ min?: number; max?: number; equals?: string | number | boolean; output: number | string }>,
): number | string {
  for (const row of rows) {
    if (row.equals !== undefined && row.equals === input) return row.output;
    if (typeof input === "number") {
      if (row.min !== undefined && input < row.min) continue;
      if (row.max !== undefined && input > row.max) continue;
      if (row.min !== undefined || row.max !== undefined) return row.output;
    }
  }
  return Number.NaN;
}

function __dateDiff(
  start: unknown,
  end: unknown,
  unit: "days" | "weeks" | "months" | "years",
): number {
  const s = start instanceof Date ? start : new Date(String(start));
  const e = end instanceof Date ? end : new Date(String(end));
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return Number.NaN;
  const ms = e.getTime() - s.getTime();
  const days = ms / 86400000;
  if (unit === "days") return days;
  if (unit === "weeks") return days / 7;
  if (unit === "months") return days / 30.4375;
  return days / 365.25;
}

const REQUIRED = ["q1","q2","q3","q4","q5","q6","q7","q8","q9","q10","q11","q12","q13","q14","q15","q16","q17","q18","q19","q20","q21","q22","q23","q24","q25","q26","q27","q28","q29","q30","q31","q32","q33","q34","q35","q36","q37","q38"] as const;

export const engine: CalculatorEngine<GeneratedInput, GeneratedOutput> = {
  slug: "medication-regimen-complexity-icu-mrc-icu-score",
  version: "1.0.0-a48e2d",
  formulaType: "formula_calculator",
  validate(input) {
    const issues = [];
    for (const key of REQUIRED) {
      const raw = input?.[key];
      if (raw === null || raw === undefined || raw === "") {
        issues.push({ code: "required", field: key, message: key + " requis" });
      } else if (typeof raw !== "boolean" && Number.isNaN(__num(raw))) {
        issues.push({ code: "invalid", field: key, message: key + " invalide" });
      }
    }
    return issues.length ? { ok: false as const, issues } : { ok: true as const, issues: [] as [] };
  },
  calculate(input): CalculatorEngineResult<GeneratedOutput> {
    const v = this.validate(input);
    if (!v.ok) {
      return incompleteInput(
        v.issues.map((i) => i.field).filter(Boolean) as string[],
        v.issues[0]?.message,
      );
    }
    try {
      const primaryValue = ((((((((((((((((((((((((((((((((((((((3 * __num(input["q1"])) + __num(input["q2"])) + (1 * __num(input["q3"]))) + (1 * __num(input["q4"]))) + (3 * __num(input["q5"]))) + __num(input["q6"])) + (2 * __num(input["q7"]))) + (2 * __num(input["q8"]))) + (3 * __num(input["q9"]))) + __num(input["q10"])) + __num(input["q11"])) + (1 * __num(input["q12"]))) + (1 * __num(input["q13"]))) + (3 * __num(input["q14"]))) + __num(input["q15"])) + __num(input["q16"])) + (2 * __num(input["q17"]))) + __num(input["q18"])) + (2 * __num(input["q19"]))) + __num(input["q20"])) + __num(input["q21"])) + __num(input["q22"])) + (1 * __num(input["q23"]))) + __num(input["q24"])) + __num(input["q25"])) + __num(input["q26"])) + __num(input["q27"])) + __num(input["q28"])) + __num(input["q29"])) + __num(input["q30"])) + (1 * __num(input["q31"]))) + (2 * __num(input["q32"]))) + (1 * __num(input["q33"]))) + (2 * __num(input["q34"]))) + __num(input["q35"])) + __num(input["q36"])) + __num(input["q37"])) + __num(input["q38"]));
      if (typeof primaryValue === "number" && !Number.isFinite(primaryValue)) {
        return engineFail("invalid_value", "Résultat non fini (division par zéro ou domaine invalide)");
      }
      const extras = [
        { id: "10582_MRC-ICU_result", label: "MRC-ICU Score", value: ((((((((((((((((((((((((((((((((((((((3 * __num(input["q1"])) + __num(input["q2"])) + (1 * __num(input["q3"]))) + (1 * __num(input["q4"]))) + (3 * __num(input["q5"]))) + __num(input["q6"])) + (2 * __num(input["q7"]))) + (2 * __num(input["q8"]))) + (3 * __num(input["q9"]))) + __num(input["q10"])) + __num(input["q11"])) + (1 * __num(input["q12"]))) + (1 * __num(input["q13"]))) + (3 * __num(input["q14"]))) + __num(input["q15"])) + __num(input["q16"])) + (2 * __num(input["q17"]))) + __num(input["q18"])) + (2 * __num(input["q19"]))) + __num(input["q20"])) + __num(input["q21"])) + __num(input["q22"])) + (1 * __num(input["q23"]))) + __num(input["q24"])) + __num(input["q25"])) + __num(input["q26"])) + __num(input["q27"])) + __num(input["q28"])) + __num(input["q29"])) + __num(input["q30"])) + (1 * __num(input["q31"]))) + (2 * __num(input["q32"]))) + (1 * __num(input["q33"]))) + (2 * __num(input["q34"]))) + __num(input["q35"])) + __num(input["q36"])) + __num(input["q37"])) + __num(input["q38"])) },
        { id: "10582_MRC-ICU_interpretation", label: "", value: (((((((((((((((((((((((((((((((((((((((((3 * __num(input["q1"])) + __num(input["q2"])) + (1 * __num(input["q3"]))) + (1 * __num(input["q4"]))) + (3 * __num(input["q5"]))) + __num(input["q6"])) + (2 * __num(input["q7"]))) + (2 * __num(input["q8"]))) + (3 * __num(input["q9"]))) + __num(input["q10"])) + __num(input["q11"])) + (1 * __num(input["q12"]))) + (1 * __num(input["q13"]))) + (3 * __num(input["q14"]))) + __num(input["q15"])) + __num(input["q16"])) + (2 * __num(input["q17"]))) + __num(input["q18"])) + (2 * __num(input["q19"]))) + __num(input["q20"])) + __num(input["q21"])) + __num(input["q22"])) + (1 * __num(input["q23"]))) + __num(input["q24"])) + __num(input["q25"])) + __num(input["q26"])) + __num(input["q27"])) + __num(input["q28"])) + __num(input["q29"])) + __num(input["q30"])) + (1 * __num(input["q31"]))) + (2 * __num(input["q32"]))) + (1 * __num(input["q33"]))) + (2 * __num(input["q34"]))) + __num(input["q35"])) + __num(input["q36"])) + __num(input["q37"])) + __num(input["q38"])) < 10)) ? ("Low") : ("High")) },
      ];
      return {
        ok: true,
        output: {
          value: primaryValue,
          label: "mini",
          unit: "points",
          extras,
        },
      };
    } catch {
      return invalidValue("input", "Calcul impossible");
    }
  },
};

export default engine;
