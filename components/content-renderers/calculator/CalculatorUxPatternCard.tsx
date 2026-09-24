import { StatusChip } from "@/components/content-detail/StatusChip";
import {
  formulaTypeLabel,
  kindLabel,
  uxPatternLabel,
} from "@/lib/content-rendering/calculator";
import type { CalculatorRenderSource } from "@/types/content-rendering-calculator";

type CalculatorUxPatternCardProps = {
  preview: CalculatorRenderSource;
};

export function CalculatorUxPatternCard({ preview }: CalculatorUxPatternCardProps) {
  return (
    <section className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm">
      <h2 className="text-body-md font-medium">Motif UX</h2>
      <p className="mt-1 text-body-sm">{uxPatternLabel(preview.uxPattern)}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <StatusChip label={kindLabel(preview.kind)} />
        <StatusChip label={formulaTypeLabel(preview.formulaType)} />
        {preview.canBecomeTapScoreCandidate ? <StatusChip label="Candidat tap score" /> : null}
        {preview.canBecomeNumericFormulaCandidate ? (
          <StatusChip label="Candidat formule" />
        ) : null}
        {preview.requiresStepwiseUx ? (
          <StatusChip label="Assistant recommandé" variant="outline" />
        ) : null}
        {preview.hasEmergencyUse ? <StatusChip label="Urgence" variant="warning" /> : null}
      </div>
      <p className="mt-2 text-label-sm text-on-surface-variant">
        Aperçu de planification UX uniquement. Les champs ci-dessous ne calculent rien.
      </p>
    </section>
  );
}
