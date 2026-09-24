/* eslint-disable */
// @ts-nocheck
/**
 * GENERATED calculator engine — do not edit by hand.
 * sourceId: calc.cisplatin-associated-acute-kidney-iInjury-cp-aki-risk-calculator
 * slug: cisplatin-associated-acute-kidney-iinjury-cp-aki-risk-calculator
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

const REQUIRED = ["age","htn","db","cis","scr","alb","mg","hgb","wbc","plt"] as const;

export const engine: CalculatorEngine<GeneratedInput, GeneratedOutput> = {
  slug: "cisplatin-associated-acute-kidney-iinjury-cp-aki-risk-calculator",
  version: "1.0.0-50caeb",
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
      const primaryValue = __round((__div(1, (1 + Math.exp((0 - (((((((((((((((((((((((((((((((((((((((((((((((((((0 - 3.6866591) + (0.044214254 * __num(input["age"]))) + (0.000018348499 * Math.pow(Math.max((__num(input["age"]) - 30), 0), 3))) - (0.00021632274 * Math.pow(Math.max((__num(input["age"]) - 51), 0), 3))) + (0.00043949087 * Math.pow(Math.max((__num(input["age"]) - 59), 0), 3))) - (0.00029073073 * Math.pow(Math.max((__num(input["age"]) - 66), 0), 3))) + (0.000049214096 * Math.pow(Math.max((__num(input["age"]) - 76), 0), 3))) - (0.61378579 * (((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["mg"]) * 0.41152)) : (0)))) - (83.326389 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["mg"]) * 0.41152)) : (0)) - 0.69938), 0), 3))) + (429.34737 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["mg"]) * 0.41152)) : (0)) - 0.80041984), 0), 3))) - (628.33396 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["mg"]) * 0.41152)) : (0)) - 0.86394), 0), 3))) + (261.92771 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["mg"]) * 0.41152)) : (0)) - 0.90508), 0), 3))) + (20.385264 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["mg"]) * 0.41152)) : (0)) - 1.0005248), 0), 3))) - (0.0044711175 * (((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["hgb"]) * 10)) : (0)))) - (0.0000099846422 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["hgb"]) * 10)) : (0)) - 91), 0), 3))) + (0.00007499566 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["hgb"]) * 10)) : (0)) - 116), 0), 3))) - (0.00013559529 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["hgb"]) * 10)) : (0)) - 128), 0), 3))) + (0.000085953694 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["hgb"]) * 10)) : (0)) - 139), 0), 3))) - (0.000015369425 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["hgb"]) * 10)) : (0)) - 155), 0), 3))) + (0.019937356 * __num(input["wbc"]))) - (0.0032371261 * Math.pow(Math.max((__num(input["wbc"]) - 3.8), 0), 3))) + (0.021769977 * Math.pow(Math.max((__num(input["wbc"]) - 5.8), 0), 3))) - (0.031784129 * Math.pow(Math.max((__num(input["wbc"]) - 7.1), 0), 3))) + (0.014112456 * Math.pow(Math.max((__num(input["wbc"]) - 8.8), 0), 3))) - (0.0008611787 * Math.pow(Math.max((__num(input["wbc"]) - 14.5), 0), 3))) - (0.049906175 * (((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["alb"]) * 10)) : (0)))) - (0.000026815478 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["alb"]) * 10)) : (0)) - 30), 0), 3))) + (0.0043129527 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["alb"]) * 10)) : (0)) - 38), 0), 3))) - (0.013504946 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["alb"]) * 10)) : (0)) - 41), 0), 3))) + (0.010667241 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["alb"]) * 10)) : (0)) - 43), 0), 3))) - (0.0014484323 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["alb"]) * 10)) : (0)) - 47), 0), 3))) + (0.04708185 * __num(input["cis"]))) - (0.000010283972 * Math.pow(Math.max((__num(input["cis"]) - 38), 0), 3))) + (0.000023916443 * Math.pow(Math.max((__num(input["cis"]) - 65), 0), 3))) - (0.000015216143 * Math.pow(Math.max((__num(input["cis"]) - 90), 0), 3))) + (0.0000020390423 * Math.pow(Math.max((__num(input["cis"]) - 150), 0), 3))) - (4.5536951e-7 * Math.pow(Math.max((__num(input["cis"]) - 220), 0), 3))) + (0.0039756597 * __num(input["plt"]))) - (5.1450041e-7 * Math.pow(Math.max((__num(input["plt"]) - 137), 0), 3))) + (0.0000022274503 * Math.pow(Math.max((__num(input["plt"]) - 210), 0), 3))) - (0.0000024590048 * Math.pow(Math.max((__num(input["plt"]) - 255), 0), 3))) + (7.631055e-7 * Math.pow(Math.max((__num(input["plt"]) - 312), 0), 3))) - (1.7050632e-8 * Math.pow(Math.max((__num(input["plt"]) - 488), 0), 3))) - (0.052338388 * (((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["scr"]) * 88.4)) : (0)))) + (0.00013607494 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["scr"]) * 88.4)) : (0)) - 53.04102), 0), 3))) - (0.00027206623 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["scr"]) * 88.4)) : (0)) - 61.88119), 0), 3))) + (0.00033691501 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["scr"]) * 88.4)) : (0)) - 79.56153), 0), 3))) - (0.00022259575 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["scr"]) * 88.4)) : (0)) - 88.4017), 0), 3))) + (0.000021672031 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["scr"]) * 88.4)) : (0)) - 114.92221), 0), 3))) + (0.27399516 * __num(input["htn"]))) + (0.25285513 * __num(input["db"]))))))) * 100), 1);
      if (typeof primaryValue === "number" && !Number.isFinite(primaryValue)) {
        return engineFail("invalid_value", "Résultat non fini (division par zéro ou domaine invalide)");
      }
      const extras = [
        { id: "10585_CP-AKI_result", label: "Risk of CP-AKI", value: __round((__div(1, (1 + Math.exp((0 - (((((((((((((((((((((((((((((((((((((((((((((((((((0 - 3.6866591) + (0.044214254 * __num(input["age"]))) + (0.000018348499 * Math.pow(Math.max((__num(input["age"]) - 30), 0), 3))) - (0.00021632274 * Math.pow(Math.max((__num(input["age"]) - 51), 0), 3))) + (0.00043949087 * Math.pow(Math.max((__num(input["age"]) - 59), 0), 3))) - (0.00029073073 * Math.pow(Math.max((__num(input["age"]) - 66), 0), 3))) + (0.000049214096 * Math.pow(Math.max((__num(input["age"]) - 76), 0), 3))) - (0.61378579 * (((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["mg"]) * 0.41152)) : (0)))) - (83.326389 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["mg"]) * 0.41152)) : (0)) - 0.69938), 0), 3))) + (429.34737 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["mg"]) * 0.41152)) : (0)) - 0.80041984), 0), 3))) - (628.33396 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["mg"]) * 0.41152)) : (0)) - 0.86394), 0), 3))) + (261.92771 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["mg"]) * 0.41152)) : (0)) - 0.90508), 0), 3))) + (20.385264 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["mg"]) * 0.41152)) : (0)) - 1.0005248), 0), 3))) - (0.0044711175 * (((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["hgb"]) * 10)) : (0)))) - (0.0000099846422 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["hgb"]) * 10)) : (0)) - 91), 0), 3))) + (0.00007499566 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["hgb"]) * 10)) : (0)) - 116), 0), 3))) - (0.00013559529 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["hgb"]) * 10)) : (0)) - 128), 0), 3))) + (0.000085953694 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["hgb"]) * 10)) : (0)) - 139), 0), 3))) - (0.000015369425 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["hgb"]) * 10)) : (0)) - 155), 0), 3))) + (0.019937356 * __num(input["wbc"]))) - (0.0032371261 * Math.pow(Math.max((__num(input["wbc"]) - 3.8), 0), 3))) + (0.021769977 * Math.pow(Math.max((__num(input["wbc"]) - 5.8), 0), 3))) - (0.031784129 * Math.pow(Math.max((__num(input["wbc"]) - 7.1), 0), 3))) + (0.014112456 * Math.pow(Math.max((__num(input["wbc"]) - 8.8), 0), 3))) - (0.0008611787 * Math.pow(Math.max((__num(input["wbc"]) - 14.5), 0), 3))) - (0.049906175 * (((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["alb"]) * 10)) : (0)))) - (0.000026815478 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["alb"]) * 10)) : (0)) - 30), 0), 3))) + (0.0043129527 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["alb"]) * 10)) : (0)) - 38), 0), 3))) - (0.013504946 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["alb"]) * 10)) : (0)) - 41), 0), 3))) + (0.010667241 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["alb"]) * 10)) : (0)) - 43), 0), 3))) - (0.0014484323 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["alb"]) * 10)) : (0)) - 47), 0), 3))) + (0.04708185 * __num(input["cis"]))) - (0.000010283972 * Math.pow(Math.max((__num(input["cis"]) - 38), 0), 3))) + (0.000023916443 * Math.pow(Math.max((__num(input["cis"]) - 65), 0), 3))) - (0.000015216143 * Math.pow(Math.max((__num(input["cis"]) - 90), 0), 3))) + (0.0000020390423 * Math.pow(Math.max((__num(input["cis"]) - 150), 0), 3))) - (4.5536951e-7 * Math.pow(Math.max((__num(input["cis"]) - 220), 0), 3))) + (0.0039756597 * __num(input["plt"]))) - (5.1450041e-7 * Math.pow(Math.max((__num(input["plt"]) - 137), 0), 3))) + (0.0000022274503 * Math.pow(Math.max((__num(input["plt"]) - 210), 0), 3))) - (0.0000024590048 * Math.pow(Math.max((__num(input["plt"]) - 255), 0), 3))) + (7.631055e-7 * Math.pow(Math.max((__num(input["plt"]) - 312), 0), 3))) - (1.7050632e-8 * Math.pow(Math.max((__num(input["plt"]) - 488), 0), 3))) - (0.052338388 * (((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["scr"]) * 88.4)) : (0)))) + (0.00013607494 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["scr"]) * 88.4)) : (0)) - 53.04102), 0), 3))) - (0.00027206623 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["scr"]) * 88.4)) : (0)) - 61.88119), 0), 3))) + (0.00033691501 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["scr"]) * 88.4)) : (0)) - 79.56153), 0), 3))) - (0.00022259575 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["scr"]) * 88.4)) : (0)) - 88.4017), 0), 3))) + (0.000021672031 * Math.pow(Math.max(((((__num(input["UOMSYSTEM"]) === true)) ? ((__num(input["scr"]) * 88.4)) : (0)) - 114.92221), 0), 3))) + (0.27399516 * __num(input["htn"]))) + (0.25285513 * __num(input["db"]))))))) * 100), 1) },
      ];
      return {
        ok: true,
        output: {
          value: primaryValue,
          label: "Risk of CP-AKI",
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
