import {
  COCKCROFT_FORMULA_LINE,
  COCKCROFT_FORMULA_NOTE,
  COCKCROFT_FORMULA_TITLE,
} from "@/lib/calculators/cockcroft-gault";

export function CockcroftFormulaStrip() {
  return (
    <section className="rounded-2xl bg-surface-container-low p-4">
      <p className="text-label-sm uppercase tracking-[0.04em] text-on-surface-variant">
        {COCKCROFT_FORMULA_TITLE}
      </p>
      <p className="mt-2 text-body-md font-medium">{COCKCROFT_FORMULA_LINE}</p>
      <p className="mt-2 text-body-sm text-on-surface-variant">
        {COCKCROFT_FORMULA_NOTE}
      </p>
    </section>
  );
}
