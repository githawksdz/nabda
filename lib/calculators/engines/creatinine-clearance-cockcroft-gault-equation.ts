/**
 * Cockcroft–Gault engine wrapper — typed contract over existing computeCockcroft.
 */
import {
  computeCockcroft,
} from "@/lib/calculators/cockcroft-gault";
import {
  incompleteInput,
  invalidUnit,
  outOfRange,
  validationFail,
  validationOk,
} from "@/lib/calculators/engine-errors";
import type {
  CalculatorEngine,
  CalculatorValidationResult,
} from "@/lib/calculators/engine-types";
import type { CockcroftFormValues, CockcroftResult } from "@/types/calculators";

export const cockcroftGaultEngine: CalculatorEngine<
  CockcroftFormValues,
  CockcroftResult
> = {
  slug: "creatinine-clearance-cockcroft-gault-equation",
  version: "1.0.0",
  formulaType: "formula_calculator",

  validate(input): CalculatorValidationResult {
    const issues = [];
    if (!input?.sex) {
      issues.push({ code: "required", field: "sex", message: "Sexe requis" });
    }
    for (const field of ["age", "weight", "creatinine"] as const) {
      const raw = input?.[field];
      if (raw === null || raw === undefined || String(raw).trim() === "") {
        issues.push({
          code: "required",
          field,
          message: `${field} requis`,
        });
      }
    }
    return issues.length ? validationFail(issues) : validationOk();
  },

  calculate(input) {
    const validation = this.validate(input);
    if (!validation.ok) {
      const fields = validation.issues
        .map((i) => i.field)
        .filter((f): f is string => Boolean(f));
      return incompleteInput(fields, validation.issues[0]?.message);
    }

    const result = computeCockcroft(input);
    if (!result.valid) {
      if (result.rangeError) {
        return outOfRange("input", "Valeur hors limites");
      }
      if (!input.unit) {
        return invalidUnit("creatinine", "Unité de créatinine manquante");
      }
      return incompleteInput(
        ["age", "weight", "creatinine", "sex"],
        "Saisie incomplète",
      );
    }
    return { ok: true, output: result };
  },
};
