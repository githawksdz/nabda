/* eslint-disable */
// @ts-nocheck
/**
 * GENERATED calculator engine — do not edit by hand.
 * sourceId: calc.sodium-correction-rate-hyponatremia-hypernatremia
 * slug: sodium-correction-rate-hyponatremia-hypernatremia
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

const REQUIRED = ["sex","age","weight","weight_nonadult","sodium","fluid_type_140","fluid_type_hyper","fluid_type_hypo","origrate"] as const;

export const engine: CalculatorEngine<GeneratedInput, GeneratedOutput> = {
  slug: "sodium-correction-rate-hyponatremia-hypernatremia",
  version: "1.0.0-69250f",
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
      const primaryValue = " ";
      if (typeof primaryValue === "number" && !Number.isFinite(primaryValue)) {
        return engineFail("invalid_value", "Résultat non fini (division par zéro ou domaine invalide)");
      }
      const extras = [
        { id: "480_Na Correction Rate in Hyponatremia/Hypernatremia_result", label: "Choose a different fluid: your patient’s serum Na is higher than the fluid’s Na!", value: " " },
        { id: "mini", label: "mini", value: __round(((((__div(__div((__num(input["origrate"]) * 24), __div((((((__num(input["fluid_type_hypo"]) || 0) === 1)) ? (513) : (((((__num(input["fluid_type_hypo"]) || 0) === 0)) ? (341) : (((((__num(input["fluid_type_hypo"]) || 0) === 2)) ? (154) : (((((__num(input["fluid_type_hypo"]) || 0) === 3)) ? (130) : (((((__num(input["fluid_type_hypo"]) || 0) === 4)) ? (856) : (((((__num(input["fluid_type_hypo"]) || 0) === 5)) ? (34) : (((((__num(input["fluid_type_hypo"]) || 0) === 6)) ? (0) : ("")))))))))))))) - __num(input["sodium"])), (((((__num(input["age"]) === 1)) ? (0.6) : ((((__num(input["age"]) === 2)) ? ((((__num(input["sex"]) === 1)) ? (0.5) : (0.6))) : ((((__num(input["age"]) === 3)) ? ((((__num(input["sex"]) === 1)) ? (0.45) : (0.5))) : ("")))))) * ((((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0))) !== 0)) ? ((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0)))) : (((((__num(input["weight"]) || 0) !== 0)) ? ((__num(input["weight"]) || 0)) : (0))))) + 1))), 24) * 1000) < 0)) ? (((__div(__div((__num(input["origrate"]) * 24), __div((((((__num(input["fluid_type_hypo"]) || 0) === 1)) ? (513) : (((((__num(input["fluid_type_hypo"]) || 0) === 0)) ? (341) : (((((__num(input["fluid_type_hypo"]) || 0) === 2)) ? (154) : (((((__num(input["fluid_type_hypo"]) || 0) === 3)) ? (130) : (((((__num(input["fluid_type_hypo"]) || 0) === 4)) ? (856) : (((((__num(input["fluid_type_hypo"]) || 0) === 5)) ? (34) : (((((__num(input["fluid_type_hypo"]) || 0) === 6)) ? (0) : ("")))))))))))))) - __num(input["sodium"])), (((((__num(input["age"]) === 1)) ? (0.6) : ((((__num(input["age"]) === 2)) ? ((((__num(input["sex"]) === 1)) ? (0.5) : (0.6))) : ((((__num(input["age"]) === 3)) ? ((((__num(input["sex"]) === 1)) ? (0.45) : (0.5))) : ("")))))) * ((((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0))) !== 0)) ? ((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0)))) : (((((__num(input["weight"]) || 0) !== 0)) ? ((__num(input["weight"]) || 0)) : (0))))) + 1))), 24) * 1000) * (0 - 1))) : ((__div(__div((__num(input["origrate"]) * 24), __div((((((__num(input["fluid_type_hypo"]) || 0) === 1)) ? (513) : (((((__num(input["fluid_type_hypo"]) || 0) === 0)) ? (341) : (((((__num(input["fluid_type_hypo"]) || 0) === 2)) ? (154) : (((((__num(input["fluid_type_hypo"]) || 0) === 3)) ? (130) : (((((__num(input["fluid_type_hypo"]) || 0) === 4)) ? (856) : (((((__num(input["fluid_type_hypo"]) || 0) === 5)) ? (34) : (((((__num(input["fluid_type_hypo"]) || 0) === 6)) ? (0) : ("")))))))))))))) - __num(input["sodium"])), (((((__num(input["age"]) === 1)) ? (0.6) : ((((__num(input["age"]) === 2)) ? ((((__num(input["sex"]) === 1)) ? (0.5) : (0.6))) : ((((__num(input["age"]) === 3)) ? ((((__num(input["sex"]) === 1)) ? (0.45) : (0.5))) : ("")))))) * ((((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0))) !== 0)) ? ((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0)))) : (((((__num(input["weight"]) || 0) !== 0)) ? ((__num(input["weight"]) || 0)) : (0))))) + 1))), 24) * 1000))), 0) },
        { id: "480_Na Correction Rate in Hyponatremia/Hypernatremia_result", label: "480_Na Correction Rate in Hyponatremia/Hypernatremia_result", value: __round(((((__div(__div((__num(input["origrate"]) * 24), __div((((((__num(input["fluid_type_hypo"]) || 0) === 1)) ? (513) : (((((__num(input["fluid_type_hypo"]) || 0) === 0)) ? (341) : (((((__num(input["fluid_type_hypo"]) || 0) === 2)) ? (154) : (((((__num(input["fluid_type_hypo"]) || 0) === 3)) ? (130) : (((((__num(input["fluid_type_hypo"]) || 0) === 4)) ? (856) : (((((__num(input["fluid_type_hypo"]) || 0) === 5)) ? (34) : (((((__num(input["fluid_type_hypo"]) || 0) === 6)) ? (0) : ("")))))))))))))) - __num(input["sodium"])), (((((__num(input["age"]) === 1)) ? (0.6) : ((((__num(input["age"]) === 2)) ? ((((__num(input["sex"]) === 1)) ? (0.5) : (0.6))) : ((((__num(input["age"]) === 3)) ? ((((__num(input["sex"]) === 1)) ? (0.45) : (0.5))) : ("")))))) * ((((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0))) !== 0)) ? ((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0)))) : (((((__num(input["weight"]) || 0) !== 0)) ? ((__num(input["weight"]) || 0)) : (0))))) + 1))), 24) * 1000) < 0)) ? (((__div(__div((__num(input["origrate"]) * 24), __div((((((__num(input["fluid_type_hypo"]) || 0) === 1)) ? (513) : (((((__num(input["fluid_type_hypo"]) || 0) === 0)) ? (341) : (((((__num(input["fluid_type_hypo"]) || 0) === 2)) ? (154) : (((((__num(input["fluid_type_hypo"]) || 0) === 3)) ? (130) : (((((__num(input["fluid_type_hypo"]) || 0) === 4)) ? (856) : (((((__num(input["fluid_type_hypo"]) || 0) === 5)) ? (34) : (((((__num(input["fluid_type_hypo"]) || 0) === 6)) ? (0) : ("")))))))))))))) - __num(input["sodium"])), (((((__num(input["age"]) === 1)) ? (0.6) : ((((__num(input["age"]) === 2)) ? ((((__num(input["sex"]) === 1)) ? (0.5) : (0.6))) : ((((__num(input["age"]) === 3)) ? ((((__num(input["sex"]) === 1)) ? (0.45) : (0.5))) : ("")))))) * ((((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0))) !== 0)) ? ((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0)))) : (((((__num(input["weight"]) || 0) !== 0)) ? ((__num(input["weight"]) || 0)) : (0))))) + 1))), 24) * 1000) * (0 - 1))) : ((__div(__div((__num(input["origrate"]) * 24), __div((((((__num(input["fluid_type_hypo"]) || 0) === 1)) ? (513) : (((((__num(input["fluid_type_hypo"]) || 0) === 0)) ? (341) : (((((__num(input["fluid_type_hypo"]) || 0) === 2)) ? (154) : (((((__num(input["fluid_type_hypo"]) || 0) === 3)) ? (130) : (((((__num(input["fluid_type_hypo"]) || 0) === 4)) ? (856) : (((((__num(input["fluid_type_hypo"]) || 0) === 5)) ? (34) : (((((__num(input["fluid_type_hypo"]) || 0) === 6)) ? (0) : ("")))))))))))))) - __num(input["sodium"])), (((((__num(input["age"]) === 1)) ? (0.6) : ((((__num(input["age"]) === 2)) ? ((((__num(input["sex"]) === 1)) ? (0.5) : (0.6))) : ((((__num(input["age"]) === 3)) ? ((((__num(input["sex"]) === 1)) ? (0.45) : (0.5))) : ("")))))) * ((((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0))) !== 0)) ? ((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0)))) : (((((__num(input["weight"]) || 0) !== 0)) ? ((__num(input["weight"]) || 0)) : (0))))) + 1))), 24) * 1000))), 0) },
        { id: "mini", label: "Choose a different fluid!", value: " " },
        { id: "480_Na Correction Rate in Hyponatremia/Hypernatremia_result", label: "Choose a different fluid: your patient’s serum Na is less than the fluid’s Na!", value: " " },
        { id: "mini", label: "mini", value: __round(((((__div(__div((__num(input["origrate"]) * 24), __div((((((__num(input["fluid_type_hyper"]) || 0) === 1)) ? (513) : (((((__num(input["fluid_type_hyper"]) || 0) === 2)) ? (154) : (((((__num(input["fluid_type_hyper"]) || 0) === 3)) ? (130) : (((((__num(input["fluid_type_hyper"]) || 0) === 4)) ? (77) : (((((__num(input["fluid_type_hyper"]) || 0) === 5)) ? (34) : (((((__num(input["fluid_type_hyper"]) || 0) === 6)) ? (0) : ("")))))))))))) - __num(input["sodium"])), (((((__num(input["age"]) === 1)) ? (0.6) : ((((__num(input["age"]) === 2)) ? ((((__num(input["sex"]) === 1)) ? (0.5) : (0.6))) : ((((__num(input["age"]) === 3)) ? ((((__num(input["sex"]) === 1)) ? (0.45) : (0.5))) : ("")))))) * ((((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0))) !== 0)) ? ((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0)))) : (((((__num(input["weight"]) || 0) !== 0)) ? ((__num(input["weight"]) || 0)) : (0))))) + 1))), 24) * 1000) < 0)) ? (((__div(__div((__num(input["origrate"]) * 24), __div((((((__num(input["fluid_type_hyper"]) || 0) === 1)) ? (513) : (((((__num(input["fluid_type_hyper"]) || 0) === 2)) ? (154) : (((((__num(input["fluid_type_hyper"]) || 0) === 3)) ? (130) : (((((__num(input["fluid_type_hyper"]) || 0) === 4)) ? (77) : (((((__num(input["fluid_type_hyper"]) || 0) === 5)) ? (34) : (((((__num(input["fluid_type_hyper"]) || 0) === 6)) ? (0) : ("")))))))))))) - __num(input["sodium"])), (((((__num(input["age"]) === 1)) ? (0.6) : ((((__num(input["age"]) === 2)) ? ((((__num(input["sex"]) === 1)) ? (0.5) : (0.6))) : ((((__num(input["age"]) === 3)) ? ((((__num(input["sex"]) === 1)) ? (0.45) : (0.5))) : ("")))))) * ((((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0))) !== 0)) ? ((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0)))) : (((((__num(input["weight"]) || 0) !== 0)) ? ((__num(input["weight"]) || 0)) : (0))))) + 1))), 24) * 1000) * (0 - 1))) : ((__div(__div((__num(input["origrate"]) * 24), __div((((((__num(input["fluid_type_hyper"]) || 0) === 1)) ? (513) : (((((__num(input["fluid_type_hyper"]) || 0) === 2)) ? (154) : (((((__num(input["fluid_type_hyper"]) || 0) === 3)) ? (130) : (((((__num(input["fluid_type_hyper"]) || 0) === 4)) ? (77) : (((((__num(input["fluid_type_hyper"]) || 0) === 5)) ? (34) : (((((__num(input["fluid_type_hyper"]) || 0) === 6)) ? (0) : ("")))))))))))) - __num(input["sodium"])), (((((__num(input["age"]) === 1)) ? (0.6) : ((((__num(input["age"]) === 2)) ? ((((__num(input["sex"]) === 1)) ? (0.5) : (0.6))) : ((((__num(input["age"]) === 3)) ? ((((__num(input["sex"]) === 1)) ? (0.45) : (0.5))) : ("")))))) * ((((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0))) !== 0)) ? ((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0)))) : (((((__num(input["weight"]) || 0) !== 0)) ? ((__num(input["weight"]) || 0)) : (0))))) + 1))), 24) * 1000))), 0) },
        { id: "480_Na Correction Rate in Hyponatremia/Hypernatremia_result", label: "480_Na Correction Rate in Hyponatremia/Hypernatremia_result", value: __round(((((__div(__div((__num(input["origrate"]) * 24), __div((((((__num(input["fluid_type_hyper"]) || 0) === 1)) ? (513) : (((((__num(input["fluid_type_hyper"]) || 0) === 2)) ? (154) : (((((__num(input["fluid_type_hyper"]) || 0) === 3)) ? (130) : (((((__num(input["fluid_type_hyper"]) || 0) === 4)) ? (77) : (((((__num(input["fluid_type_hyper"]) || 0) === 5)) ? (34) : (((((__num(input["fluid_type_hyper"]) || 0) === 6)) ? (0) : ("")))))))))))) - __num(input["sodium"])), (((((__num(input["age"]) === 1)) ? (0.6) : ((((__num(input["age"]) === 2)) ? ((((__num(input["sex"]) === 1)) ? (0.5) : (0.6))) : ((((__num(input["age"]) === 3)) ? ((((__num(input["sex"]) === 1)) ? (0.45) : (0.5))) : ("")))))) * ((((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0))) !== 0)) ? ((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0)))) : (((((__num(input["weight"]) || 0) !== 0)) ? ((__num(input["weight"]) || 0)) : (0))))) + 1))), 24) * 1000) < 0)) ? (((__div(__div((__num(input["origrate"]) * 24), __div((((((__num(input["fluid_type_hyper"]) || 0) === 1)) ? (513) : (((((__num(input["fluid_type_hyper"]) || 0) === 2)) ? (154) : (((((__num(input["fluid_type_hyper"]) || 0) === 3)) ? (130) : (((((__num(input["fluid_type_hyper"]) || 0) === 4)) ? (77) : (((((__num(input["fluid_type_hyper"]) || 0) === 5)) ? (34) : (((((__num(input["fluid_type_hyper"]) || 0) === 6)) ? (0) : ("")))))))))))) - __num(input["sodium"])), (((((__num(input["age"]) === 1)) ? (0.6) : ((((__num(input["age"]) === 2)) ? ((((__num(input["sex"]) === 1)) ? (0.5) : (0.6))) : ((((__num(input["age"]) === 3)) ? ((((__num(input["sex"]) === 1)) ? (0.45) : (0.5))) : ("")))))) * ((((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0))) !== 0)) ? ((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0)))) : (((((__num(input["weight"]) || 0) !== 0)) ? ((__num(input["weight"]) || 0)) : (0))))) + 1))), 24) * 1000) * (0 - 1))) : ((__div(__div((__num(input["origrate"]) * 24), __div((((((__num(input["fluid_type_hyper"]) || 0) === 1)) ? (513) : (((((__num(input["fluid_type_hyper"]) || 0) === 2)) ? (154) : (((((__num(input["fluid_type_hyper"]) || 0) === 3)) ? (130) : (((((__num(input["fluid_type_hyper"]) || 0) === 4)) ? (77) : (((((__num(input["fluid_type_hyper"]) || 0) === 5)) ? (34) : (((((__num(input["fluid_type_hyper"]) || 0) === 6)) ? (0) : ("")))))))))))) - __num(input["sodium"])), (((((__num(input["age"]) === 1)) ? (0.6) : ((((__num(input["age"]) === 2)) ? ((((__num(input["sex"]) === 1)) ? (0.5) : (0.6))) : ((((__num(input["age"]) === 3)) ? ((((__num(input["sex"]) === 1)) ? (0.45) : (0.5))) : ("")))))) * ((((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0))) !== 0)) ? ((((__num(input["UOMSYSTEM"]) === true)) ? (((__num(input["weight_nonadult"]) || 0) * 0.453592)) : ((__num(input["weight_nonadult"]) || 0)))) : (((((__num(input["weight"]) || 0) !== 0)) ? ((__num(input["weight"]) || 0)) : (0))))) + 1))), 24) * 1000))), 0) },
      ];
      return {
        ok: true,
        output: {
          value: primaryValue,
          label: "Choose a different fluid!",
          unit: " ",
          extras,
        },
      };
    } catch {
      return invalidValue("input", "Calcul impossible");
    }
  },
};

export default engine;
