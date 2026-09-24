import { CockcroftSpectrumMeter } from "./CockcroftSpectrumMeter";
import { COCKCROFT_SAFETY_NOTE } from "@/lib/calculators/cockcroft-gault";
import type { CockcroftResult } from "@/types/calculators";

type CockcroftResultCardProps = {
  result: CockcroftResult;
};

export function CockcroftResultCard({ result }: CockcroftResultCardProps) {
  return (
    <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-label-sm text-on-surface-variant">
          Clairance calculée
        </p>
        <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-label-sm text-on-surface-variant">
          Calcul dynamique
        </span>
      </div>
      <p
        role="status"
        aria-live="polite"
        className="mt-1 text-display text-on-surface"
      >
        {result.display}{" "}
        <span className="text-headline-sm font-semibold text-on-surface-variant">
          mL/min
        </span>
      </p>
      <CockcroftSpectrumMeter result={result} />
      {result.rangeError ? (
        <p className="mt-3 text-body-sm text-on-surface-variant">
          Valeur hors plage — calcul non affiché.
        </p>
      ) : (
        <p className="mt-3 text-body-sm text-on-surface-variant">
          {COCKCROFT_SAFETY_NOTE}
        </p>
      )}
    </section>
  );
}
