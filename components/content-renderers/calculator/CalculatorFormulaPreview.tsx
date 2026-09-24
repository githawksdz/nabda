import { StatusChip } from "@/components/content-detail/StatusChip";
import { SafeSourceHtml } from "@/components/content-renderers/shared/SafeSourceHtml";
import { formulaTypeLabel } from "@/lib/content-rendering/calculator";
import type { CalculatorRenderSource } from "@/types/content-rendering-calculator";
import type { ContentLinkMode } from "@/types/content-rendering";

type CalculatorFormulaPreviewProps = {
  preview: CalculatorRenderSource;
  keepInternalQuery?: boolean;
  linkMode?: ContentLinkMode;
};

export function CalculatorFormulaPreview({
  preview,
  keepInternalQuery = false,
  linkMode = "internal",
}: CalculatorFormulaPreviewProps) {
  return (
    <section className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm">
      <h2 className="text-body-md font-medium">Formule / source</h2>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <StatusChip label={formulaTypeLabel(preview.formulaType)} />
        {preview.hasFormulaHtml ? <StatusChip label="HTML source" /> : null}
        {preview.hasRawJs ? (
          <StatusChip label="Script source présent · non exécuté" variant="warning" />
        ) : (
          <StatusChip label="Pas de script source" variant="outline" />
        )}
        {preview.missingFormula ? (
          <StatusChip label="Formule manquante" variant="warning" />
        ) : null}
      </div>
      {preview.formulaHtml ? (
        <div className="mt-3">
          <SafeSourceHtml
            html={preview.formulaHtml}
            keepInternalQuery={keepInternalQuery}
            guidelinePreview="calculator"
            linkMode={linkMode}
          />
        </div>
      ) : preview.formulaPreview ? (
        <p className="mt-3 whitespace-pre-wrap text-body-sm text-on-surface-variant">
          {preview.formulaPreview}
        </p>
      ) : (
        <p className="mt-3 text-body-sm text-on-surface-variant">
          Aucune formule source à afficher.
        </p>
      )}
      <p className="mt-3 text-label-sm text-on-surface-variant">
        Aucun JavaScript source n’est exécuté. Aucun moteur de calcul n’est généré dans cet
        aperçu.
      </p>
    </section>
  );
}
