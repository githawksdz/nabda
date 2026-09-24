/* eslint-disable */
// @ts-nocheck
/**
 * GENERATED calculator engine — do not edit by hand.
 * sourceId: calc.hestia-criteria-outpatient-pulmonary-embolism-treatment
 * slug: hestia-criteria-outpatient-pulmonary-embolism-treatment
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

const REQUIRED = ["unstable","thrombolysis","activebleeding","oxygen","anticoagulant","painmeds","medicalsocial","crcl","liver","preg","hit"] as const;

export const engine: CalculatorEngine<GeneratedInput, GeneratedOutput> = {
  slug: "hestia-criteria-outpatient-pulmonary-embolism-treatment",
  version: "1.0.0-3a7a2e",
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
      const primaryValue = ((((((((((__num(input["unstable"]) + __num(input["thrombolysis"])) + __num(input["activebleeding"])) + __num(input["oxygen"])) + __num(input["anticoagulant"])) + __num(input["painmeds"])) + __num(input["medicalsocial"])) + __num(input["crcl"])) + __num(input["liver"])) + __num(input["preg"])) + __num(input["hit"]));
      if (typeof primaryValue === "number" && !Number.isFinite(primaryValue)) {
        return engineFail("invalid_value", "Résultat non fini (division par zéro ou domaine invalide)");
      }
      const extras = [
        { id: "3918_Hestia Criteria_result", label: "Hestia Criteria", value: ((((((((((__num(input["unstable"]) + __num(input["thrombolysis"])) + __num(input["activebleeding"])) + __num(input["oxygen"])) + __num(input["anticoagulant"])) + __num(input["painmeds"])) + __num(input["medicalsocial"])) + __num(input["crcl"])) + __num(input["liver"])) + __num(input["preg"])) + __num(input["hit"])) },
        { id: "3918_Hestia Criteria_interpretation", label: "3918_Hestia Criteria_interpretation", value: (((((((((((((__num(input["unstable"]) + __num(input["thrombolysis"])) + __num(input["activebleeding"])) + __num(input["oxygen"])) + __num(input["anticoagulant"])) + __num(input["painmeds"])) + __num(input["medicalsocial"])) + __num(input["crcl"])) + __num(input["liver"])) + __num(input["preg"])) + __num(input["hit"])) < 1)) ? ("Low") : ("Not low")) },
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
