/**
 * Explicit specialty engine: Pregnancy due dates (Naegele).
 * sourceId: calc.pregnancy-due-dates-calculator
 * Formula (documented): DPA = LMP + 40 weeks; if cycle > 28 days, add (cycle - 28) days.
 * No source JS available — implemented from verified formula text.
 * version: 1.0.0
 * Units: calendar days; cycle length in days.
 * Rounding: whole days.
 */
import {
  incompleteInput,
  invalidValue,
  validationFail,
  validationOk,
} from "@/lib/calculators/engine-errors";
import type {
  CalculatorEngine,
  CalculatorValidationResult,
} from "@/lib/calculators/engine-types";

export type PregnancyDueDatesInput = {
  /** LMP / DDR — source field `date` */
  date: string;
  cyclelength?: string | number | null;
};

export type PregnancyDueDatesOutput = {
  dueDate: string;
  conceptionEstimate: string;
  gestationalAgeDays: number;
  cycleAdjustmentDays: number;
};

function parseDate(value: string): Date | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const pregnancyDueDatesEngine: CalculatorEngine<
  PregnancyDueDatesInput,
  PregnancyDueDatesOutput
> = {
  slug: "pregnancy-due-dates-calculator",
  version: "1.0.0",
  formulaType: "date_calculator",

  validate(input): CalculatorValidationResult {
    if (!input?.date || !String(input.date).trim()) {
      return validationFail([
        { code: "required", field: "date", message: "DDR requise" },
      ]);
    }
    if (!parseDate(String(input.date))) {
      return validationFail([
        { code: "invalid", field: "date", message: "DDR invalide" },
      ]);
    }
    return validationOk();
  },

  calculate(input) {
    const v = this.validate(input);
    if (!v.ok) {
      return incompleteInput(
        v.issues.map((i) => i.field).filter(Boolean) as string[],
        v.issues[0]?.message,
      );
    }
    const lmp = parseDate(String(input.date))!;
    const cycleRaw =
      input.cyclelength === null || input.cyclelength === undefined
        ? 28
        : Number(String(input.cyclelength).replace(",", "."));
    if (!Number.isFinite(cycleRaw) || cycleRaw < 20 || cycleRaw > 45) {
      return invalidValue("cyclelength", "Durée de cycle hors limites");
    }
    const adjustment = Math.max(0, Math.round(cycleRaw - 28));
    const due = addDays(lmp, 280 + adjustment);
    const conception = addDays(lmp, 14 + adjustment);
    const today = new Date();
    const ga = Math.floor((today.getTime() - lmp.getTime()) / 86400000);
    return {
      ok: true,
      output: {
        dueDate: iso(due),
        conceptionEstimate: iso(conception),
        gestationalAgeDays: ga,
        cycleAdjustmentDays: adjustment,
      },
    };
  },
};

export default pregnancyDueDatesEngine;
