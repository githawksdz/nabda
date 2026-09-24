/**
 * Glasgow GCS engine wrapper — typed contract over existing interpretGlasgow.
 */
import {
  GLASGOW_DEFAULT_SELECTION,
  GLASGOW_MAX,
  interpretGlasgow,
} from "@/lib/calculators/glasgow";
import {
  incompleteInput,
  outOfRange,
  validationFail,
  validationOk,
} from "@/lib/calculators/engine-errors";
import type {
  CalculatorEngine,
  CalculatorValidationResult,
} from "@/lib/calculators/engine-types";
import type { GlasgowInterpretation, GlasgowSelection } from "@/types/calculators";

export const glasgowComaScaleEngine: CalculatorEngine<
  GlasgowSelection,
  GlasgowInterpretation
> = {
  slug: "glasgow-coma-scale-score-gcs",
  version: "1.0.0",
  formulaType: "simple_score",

  validate(input): CalculatorValidationResult {
    const issues = [];
    for (const key of ["eyes", "verbal", "motor"] as const) {
      const value = input?.[key];
      if (value === null || value === undefined) {
        issues.push({
          code: "required",
          field: key,
          message: `${key} requis`,
        });
      } else if (!Number.isFinite(value) || value < 0 || value > 6) {
        issues.push({
          code: "out_of_range",
          field: key,
          message: `${key} hors limites`,
        });
      }
    }
    return issues.length ? validationFail(issues) : validationOk();
  },

  calculate(input) {
    const validation = this.validate(input ?? GLASGOW_DEFAULT_SELECTION);
    if (!validation.ok) {
      const fields = validation.issues
        .map((i) => i.field)
        .filter((f): f is string => Boolean(f));
      if (validation.issues.some((i) => i.code === "out_of_range")) {
        return outOfRange(fields[0] ?? "input", validation.issues[0]!.message);
      }
      return incompleteInput(fields);
    }
    const output = interpretGlasgow(input);
    if (output.total > GLASGOW_MAX) {
      return outOfRange("total", "Score GCS hors limites");
    }
    return { ok: true, output };
  },
};
