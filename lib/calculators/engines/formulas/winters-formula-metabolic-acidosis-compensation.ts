/**
 * Explicit specialty engine: Winters' formula (metabolic acidosis compensation).
 * sourceId: calc.winters-formula-metabolic-acidosis-compensation
 * Formula (documented): expected PCO₂ = 1.5 × HCO₃ + 8 ± 2
 * No source JS — implemented from verified formula text.
 * version: 1.0.0
 * Units: HCO3 in mEq/L; PCO2 in mmHg.
 * Rounding: 1 decimal.
 */
import {
  incompleteInput,
  outOfRange,
  validationFail,
  validationOk,
} from "@/lib/calculators/engine-errors";
import { round } from "@/lib/calculators/engine-primitives";
import type {
  CalculatorEngine,
  CalculatorValidationResult,
} from "@/lib/calculators/engine-types";

export type WintersInput = {
  bicarbonate: string | number;
};

export type WintersOutput = {
  expectedPco2: number;
  low: number;
  high: number;
  unit: "mmHg";
};

export const wintersFormulaEngine: CalculatorEngine<WintersInput, WintersOutput> =
  {
    slug: "winters-formula-metabolic-acidosis-compensation",
    version: "1.0.0",
    formulaType: "formula_calculator",

    validate(input): CalculatorValidationResult {
      const n = Number(String(input?.bicarbonate ?? "").replace(",", "."));
      if (!String(input?.bicarbonate ?? "").trim() || !Number.isFinite(n)) {
        return validationFail([
          { code: "required", field: "bicarbonate", message: "HCO₃ requis" },
        ]);
      }
      if (n <= 0 || n > 60) {
        return validationFail([
          {
            code: "out_of_range",
            field: "bicarbonate",
            message: "HCO₃ hors limites",
          },
        ]);
      }
      return validationOk();
    },

    calculate(input) {
      const v = this.validate(input);
      if (!v.ok) {
        const code = v.issues[0]?.code;
        if (code === "out_of_range") {
          return outOfRange("bicarbonate", v.issues[0]!.message);
        }
        return incompleteInput(["bicarbonate"], v.issues[0]?.message);
      }
      const hco3 = Number(String(input.bicarbonate).replace(",", "."));
      const expected = round(1.5 * hco3 + 8, 1);
      return {
        ok: true,
        output: {
          expectedPco2: expected,
          low: round(expected - 2, 1),
          high: round(expected + 2, 1),
          unit: "mmHg",
        },
      };
    },
  };

export default wintersFormulaEngine;
