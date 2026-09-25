"use client";

import { useMemo } from "react";
import { CockcroftFormulaStrip } from "./CockcroftFormulaStrip";
import { CockcroftInputForm } from "./CockcroftInputForm";
import { CockcroftLinkedResources } from "./CockcroftLinkedResources";
import { CockcroftResultCard } from "./CockcroftResultCard";
import { measureSync } from "@/lib/calculators/calculator-perf";
import {
  COCKCROFT_DISCLAIMER,
  computeCockcroft,
} from "@/lib/calculators/cockcroft-gault";
import type { CockcroftFormValues } from "@/types/calculators";

type CockcroftCalculatorProps = {
  values: CockcroftFormValues;
  onChange: (values: CockcroftFormValues) => void;
  onReset: () => void;
  onCopy: () => void;
};

export function CockcroftCalculator({
  values,
  onChange,
  onReset,
  onCopy,
}: CockcroftCalculatorProps) {
  const result = useMemo(
    () =>
      measureSync("creatinine-clearance-cockcroft-gault-equation", () =>
        computeCockcroft(values),
      ),
    [values],
  );

  return (
    <div className="flex flex-col gap-4">
      <CockcroftFormulaStrip />
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        <CockcroftInputForm values={values} onChange={onChange} />
        <div className="flex flex-col gap-4 lg:sticky lg:top-[calc(72px+env(safe-area-inset-top,0px))]">
          <CockcroftResultCard result={result} />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-label-md text-on-primary"
            >
              Copier le résultat
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-surface-container-low text-label-md text-on-surface"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
      <CockcroftLinkedResources />
      <p className="text-center text-label-sm text-on-surface-variant">
        {COCKCROFT_DISCLAIMER}
      </p>
    </div>
  );
}
