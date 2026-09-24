/* eslint-disable */
// @ts-nocheck
/**
 * GENERATED calculator engine — do not edit by hand.
 * sourceId: calc.solitary-pulmonary-nodule-spn-malignancy-risk-score-mayo-clinic-model
 * slug: solitary-pulmonary-nodule-spn-malignancy-risk-score-mayo-clinic-model
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

const REQUIRED = ["age","diameter","smoker","cancer","lobe","spiculation","pet1"] as const;

export const engine: CalculatorEngine<GeneratedInput, GeneratedOutput> = {
  slug: "solitary-pulmonary-nodule-spn-malignancy-risk-score-mayo-clinic-model",
  version: "1.0.0-865632",
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
      const primaryValue = __round((((__num(input["pet1"]) === 0)) ? ((__div(Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272)), (1 + Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272)))) * 100)) : ((((__num(input["pet1"]) === 1)) ? (__div(100, (1 + Math.exp((0 - ((0 - 4.739) + (3.691 * __div(Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272)), (1 + Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272))))))))))) : ((((__num(input["pet1"]) === 2)) ? (__div(100, (1 + Math.exp((0 - (((0 - 4.739) + (3.691 * __div(Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272)), (1 + Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272)))))) + 2.322)))))) : ((((__num(input["pet1"]) === 3)) ? (__div(100, (1 + Math.exp((0 - (((0 - 4.739) + (3.691 * __div(Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272)), (1 + Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272)))))) + 4.617)))))) : ((((__num(input["pet1"]) === 4)) ? (__div(100, (1 + Math.exp((0 - (((0 - 4.739) + (3.691 * __div(Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272)), (1 + Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272)))))) + 4.771)))))) : ("")))))))))), 1);
      if (typeof primaryValue === "number" && !Number.isFinite(primaryValue)) {
        return engineFail("invalid_value", "Résultat non fini (division par zéro ou domaine invalide)");
      }
      const extras = [
        { id: "4057_Solitary Pulmonary Nodule Malignancy Risk (Mayo)_result", label: "Probability of malignancy    One study suggests watchful waiting only at very low post-test probabilities ( 70%). See Ne", value: __round((((__num(input["pet1"]) === 0)) ? ((__div(Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272)), (1 + Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272)))) * 100)) : ((((__num(input["pet1"]) === 1)) ? (__div(100, (1 + Math.exp((0 - ((0 - 4.739) + (3.691 * __div(Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272)), (1 + Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272))))))))))) : ((((__num(input["pet1"]) === 2)) ? (__div(100, (1 + Math.exp((0 - (((0 - 4.739) + (3.691 * __div(Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272)), (1 + Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272)))))) + 2.322)))))) : ((((__num(input["pet1"]) === 3)) ? (__div(100, (1 + Math.exp((0 - (((0 - 4.739) + (3.691 * __div(Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272)), (1 + Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272)))))) + 4.617)))))) : ((((__num(input["pet1"]) === 4)) ? (__div(100, (1 + Math.exp((0 - (((0 - 4.739) + (3.691 * __div(Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272)), (1 + Math.exp((((((((0.0391 * __num(input["age"])) + (0.1274 * __num(input["diameter"]))) + (0.7917 * __num(input["smoker"]))) + (1.3388 * __num(input["cancer"]))) + (1.0407 * __num(input["spiculation"]))) + (0.7838 * __num(input["lobe"]))) - 6.8272)))))) + 4.771)))))) : ("")))))))))), 1) },
      ];
      return {
        ok: true,
        output: {
          value: primaryValue,
          label: "Probability of malignancy",
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
