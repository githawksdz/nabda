import { StatusChip } from "@/components/content-detail/StatusChip";
import {
  calculatorWarningLabel,
  languageLabel,
} from "@/lib/internal/calculator-preview-ui";
import type { CalculatorRenderSource } from "@/types/content-rendering-calculator";

type CalculatorWarningsPanelProps = {
  preview: CalculatorRenderSource;
};

export function CalculatorWarningsPanel({ preview }: CalculatorWarningsPanelProps) {
  const signalCount = preview.warnings.length + preview.warningItems.length;

  return (
    <details className="rounded-xl bg-surface-container-low p-3.5">
      <summary className="cursor-pointer list-none text-body-md font-medium [&::-webkit-details-marker]:hidden">
        Journal interne · {signalCount} signaux
      </summary>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <StatusChip
          label={preview.hasRawJs ? "JS source présent" : "Pas de JS source"}
          variant={preview.hasRawJs ? "warning" : "soft"}
        />
        <StatusChip
          label={preview.locked ? "Haut risque / posologie" : `Risque ${preview.risk}`}
          variant={preview.locked ? "warning" : "soft"}
        />
        <StatusChip label={languageLabel(preview.language)} />
        {preview.localeStatus ? <StatusChip label={preview.localeStatus} variant="outline" /> : null}
        {preview.categorySlug ? <StatusChip label={preview.categorySlug} /> : null}
        {preview.specialties.slice(0, 6).map((specialty) => (
          <StatusChip key={specialty} label={specialty} variant="outline" />
        ))}
        {preview.hasConditionalInputs ? (
          <StatusChip label="Conditionnalité" variant="warning" />
        ) : null}
        {preview.inputCount > 8 ? (
          <StatusChip label={`${preview.inputCount} champs`} variant="warning" />
        ) : (
          <StatusChip label={`${preview.inputCount} champs`} />
        )}
        {preview.missingFormula ? (
          <StatusChip label="Formule manquante" variant="warning" />
        ) : null}
        {preview.uxPattern === "unknown" ? (
          <StatusChip label="UX non classée" variant="warning" />
        ) : null}
        {preview.logicLanguage === "r" ? (
          <StatusChip label="Logique R" variant="warning" />
        ) : null}
      </div>
      {preview.warnings.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1 text-body-sm text-on-surface-variant">
          {preview.warnings.map((warning) => (
            <li key={warning}>{calculatorWarningLabel(warning)}</li>
          ))}
        </ul>
      ) : null}
      {preview.warningItems.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1 text-label-sm text-on-surface-variant">
          {preview.warningItems.slice(0, 40).map((item, index) => (
            <li key={`${item.type}-${index}`}>
              {calculatorWarningLabel(item.type)}
              {item.logicLanguage ? ` · ${item.logicLanguage}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
      {preview.hasRawJs && preview.jsPreview ? (
        <details className="mt-3 rounded-xl bg-surface-container-lowest p-3">
          <summary className="cursor-pointer list-none text-label-md [&::-webkit-details-marker]:hidden">
            JS source · interne uniquement · non exécuté ({preview.jsCharCount} car.)
          </summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-label-sm text-on-surface-variant">
            {preview.jsPreview}
          </pre>
          {preview.jsContainsEval ? (
            <p className="mt-2 text-label-sm text-error">eval détecté dans la source · jamais exécuté</p>
          ) : null}
        </details>
      ) : null}
    </details>
  );
}
