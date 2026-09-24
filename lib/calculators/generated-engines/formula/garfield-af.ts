/* eslint-disable */
// @ts-nocheck
/**
 * GENERATED calculator engine — do not edit by hand.
 * sourceId: calc.garfield-af
 * slug: garfield-af
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

const REQUIRED = ["sex","age","weight","hf","vd","stroke","bleeding","cod","diabetes","ckd","dementia","smoker","ap","ethnicity","pulse","dbp","oac"] as const;

export const engine: CalculatorEngine<GeneratedInput, GeneratedOutput> = {
  slug: "garfield-af",
  version: "1.0.0-1d77a3",
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
      const primaryValue = __round(((1 - Math.pow(0.987921904, Math.exp(((((((((((((((((((((0 - 0.306202287) * __num(input["sex"])) + (0.693789082 * __num(input["hf"]))) + (0.306120964 * __num(input["vd"]))) + (0.26585298 * __num(input["stroke"]))) + (0.385407386 * __num(input["bleeding"]))) + (0.280133213 * __num(input["diabetes"]))) + (0.377903886 * __num(input["ckd"]))) + (0.489453313 * __num(input["dementia"]))) + (0.345481149 * __num(input["smoker"]))) - (0.414591263 * (((__num(input["oac"]) === 0)) ? (0) : ((((__num(input["oac"]) === 1)) ? (1) : ((((__num(input["oac"]) === 2)) ? (0) : ("")))))))) - (0.18593561 * (((__num(input["oac"]) === 0)) ? (0) : ((((__num(input["oac"]) === 1)) ? (0) : ((((__num(input["oac"]) === 2)) ? (1) : ("")))))))) + (0.157023564 * (((__num(input["ethnicity"]) === 0)) ? (0) : ((((__num(input["ethnicity"]) === 1)) ? (1) : ((((__num(input["ethnicity"]) === 2)) ? (0) : ((((__num(input["ethnicity"]) === 3)) ? (0) : ("")))))))))) - (0.609609055 * (((__num(input["ethnicity"]) === 0)) ? (0) : ((((__num(input["ethnicity"]) === 1)) ? (0) : ((((__num(input["ethnicity"]) === 2)) ? (1) : ((((__num(input["ethnicity"]) === 3)) ? (0) : ("")))))))))) + (0.375675102 * (((__num(input["ethnicity"]) === 0)) ? (0) : ((((__num(input["ethnicity"]) === 1)) ? (0) : ((((__num(input["ethnicity"]) === 2)) ? (0) : ((((__num(input["ethnicity"]) === 3)) ? (1) : ("")))))))))) + ((0.031050027 * (__num(input["age"]) - 65)) * (((__num(input["age"]) <= 65)) ? (1) : (0)))) + ((0.064594824 * (__num(input["age"]) - 65)) * (((__num(input["age"]) <= 65)) ? (0) : (1)))) - ((0.021535182 * (__num(input["weight"]) - 75)) * (((__num(input["weight"]) <= 75)) ? (1) : (0)))) + ((0.007678035 * (__num(input["pulse"]) - 120)) * (((__num(input["pulse"]) <= 120)) ? (1) : (0)))) - ((0.019304333 * (__num(input["dbp"]) - 80)) * (((__num(input["dbp"]) <= 80)) ? (1) : (0))))))) * 100), 1);
      if (typeof primaryValue === "number" && !Number.isFinite(primaryValue)) {
        return engineFail("invalid_value", "Résultat non fini (division par zéro ou domaine invalide)");
      }
      const extras = [
        { id: "10504_GARFIELD_AF_result (6 months)", label: "10504_GARFIELD_AF_result (6 months)", value: "" },
        { id: "10504_GARFIELD_AF_result (1 year)", label: "10504_GARFIELD_AF_result (1 year)", value: "" },
        { id: "10504_GARFIELD_AF_result (2 year)", label: "10504_GARFIELD_AF_result (2 year)", value: "" },
      ];
      return {
        ok: true,
        output: {
          value: primaryValue,
          label: "6 months all-cause mortality",
          unit: "%",
          extras,
        },
      };
    } catch {
      return invalidValue("input", "Calcul impossible");
    }
  },
};

export default engine;
