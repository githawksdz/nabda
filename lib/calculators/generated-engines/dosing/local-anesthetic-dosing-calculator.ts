/* eslint-disable */
// @ts-nocheck
/**
 * GENERATED calculator engine — do not edit by hand.
 * sourceId: calc.local-anesthetic-dosing-calculator
 * slug: local-anesthetic-dosing-calculator
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

const REQUIRED = ["drug_1","weight","concentration","con_ropi","epi"] as const;

export const engine: CalculatorEngine<GeneratedInput, GeneratedOutput> = {
  slug: "local-anesthetic-dosing-calculator",
  version: "1.0.0-0c52eb",
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
      const primaryValue = __round(__div((__num(input["weight"]) * (((__num(input["drug_1"]) === 1)) ? (2) : (((((__num(input["drug_1"]) === 2) && (__num(input["epi"]) === 0))) ? (5) : (((((__num(input["drug_1"]) === 2) && (__num(input["epi"]) === 1))) ? (7) : (((((__num(input["drug_1"]) === 3) && (__num(input["epi"]) === 0))) ? (5) : (((((__num(input["drug_1"]) === 3) && (__num(input["epi"]) === 1))) ? (7) : ((((__num(input["drug_1"]) === 3.5)) ? (6) : ((((__num(input["drug_1"]) === 4)) ? (3) : (__num(input["drug_1"])))))))))))))))), (((__num(input["con_ropi"]) === 2)) ? (2) : ((((__num(input["con_ropi"]) === 2.5)) ? (2.5) : ((((__num(input["con_ropi"]) === 5)) ? (5) : ((((__num(input["con_ropi"]) === 7.5)) ? (7.5) : ((((__num(input["con_ropi"]) === 10)) ? (10) : ((((__num(input["con_ropi"]) === 15)) ? (15) : ((((__num(input["con_ropi"]) === 20)) ? (20) : ((((__num(input["con_ropi"]) === 30)) ? (30) : ((((__num(input["con_ropi"]) === 40)) ? (40) : (__num(input["concentration"])))))))))))))))))))), 1);
      if (typeof primaryValue === "number" && !Number.isFinite(primaryValue)) {
        return engineFail("invalid_value", "Résultat non fini (division par zéro ou domaine invalide)");
      }
      const extras = [
        { id: "10205_Local Anesthetic Dosing_result", label: "10205_Local Anesthetic Dosing_result", value: __round(__div((__num(input["weight"]) * (((__num(input["drug_1"]) === 1)) ? (2) : (((((__num(input["drug_1"]) === 2) && (__num(input["epi"]) === 0))) ? (5) : (((((__num(input["drug_1"]) === 2) && (__num(input["epi"]) === 1))) ? (7) : (((((__num(input["drug_1"]) === 3) && (__num(input["epi"]) === 0))) ? (5) : (((((__num(input["drug_1"]) === 3) && (__num(input["epi"]) === 1))) ? (7) : ((((__num(input["drug_1"]) === 3.5)) ? (6) : ((((__num(input["drug_1"]) === 4)) ? (3) : (__num(input["drug_1"])))))))))))))))), (((__num(input["con_ropi"]) === 2)) ? (2) : ((((__num(input["con_ropi"]) === 2.5)) ? (2.5) : ((((__num(input["con_ropi"]) === 5)) ? (5) : ((((__num(input["con_ropi"]) === 7.5)) ? (7.5) : ((((__num(input["con_ropi"]) === 10)) ? (10) : ((((__num(input["con_ropi"]) === 15)) ? (15) : ((((__num(input["con_ropi"]) === 20)) ? (20) : ((((__num(input["con_ropi"]) === 30)) ? (30) : ((((__num(input["con_ropi"]) === 40)) ? (40) : (__num(input["concentration"])))))))))))))))))))), 1) },
      ];
      return {
        ok: true,
        output: {
          value: primaryValue,
          label: "mini",
          unit: "mL",
          extras,
        },
      };
    } catch {
      return invalidValue("input", "Calcul impossible");
    }
  },
};

export default engine;
