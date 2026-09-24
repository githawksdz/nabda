import { StatusChip } from "@/components/content-detail/StatusChip";
import { catWarningLabel } from "@/lib/internal/cat-preview-mappers";
import type { CatRenderSource } from "@/types/content-rendering-cat";

type CatWarningsPanelProps = {
  preview: CatRenderSource;
};

export function CatWarningsPanel({ preview }: CatWarningsPanelProps) {
  const { stats } = preview;
  const imageStatus = stats.pngAvailableCount
    ? `${stats.pngAvailableCount} PNG`
    : "PNG manquant";
  return (
    <details className="rounded-xl bg-surface-container-low p-3.5">
      <summary className="cursor-pointer list-none text-body-md font-medium [&::-webkit-details-marker]:hidden">
        Journal interne · {preview.protocolWarnings.length + preview.warningItems.length}{" "}
        signaux
      </summary>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <StatusChip label={`${stats.stepCount} étapes`} />
        <StatusChip
          label={`${stats.doseCount} dose`}
          variant={stats.doseCount ? "warning" : "soft"}
        />
        <StatusChip
          label={`${stats.emergencyCount} urgence`}
          variant={stats.emergencyCount ? "warning" : "soft"}
        />
        <StatusChip label={`${stats.calculatorCount} calculateurs`} />
        <StatusChip label={imageStatus} />
        <StatusChip
          label={stats.imagemapStripped ? "imagemap retirée" : "pas d'imagemap"}
        />
        <StatusChip label="graphe: non" />
        <StatusChip
          label={`${stats.unresolvedTitleCount} titres non mappés`}
          variant={stats.unresolvedTitleCount ? "warning" : "soft"}
        />
        <StatusChip
          label={stats.tooManySteps ? "trop d'étapes" : "volume OK"}
          variant={stats.tooManySteps ? "warning" : "soft"}
        />
        <StatusChip
          label={`${stats.samu15Count} SAMU 15`}
          variant={stats.samu15Count ? "warning" : "soft"}
        />
        <StatusChip label={`${stats.skippedSectionCount} sections hors étapes`} />
      </div>
      {preview.images.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1 text-label-sm text-on-surface-variant">
          {preview.images.map((image) => (
            <li key={image.filename}>
              média · {image.filename}
              {image.available ? "" : " · fichier absent"}
            </li>
          ))}
        </ul>
      ) : null}
      {preview.protocolWarnings.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1 text-body-sm text-on-surface-variant">
          {preview.protocolWarnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}
      {stats.skippedSectionTitles.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1 text-label-sm text-on-surface-variant">
          {stats.skippedSectionTitles.slice(0, 20).map((title) => (
            <li key={title}>section non extraite en étape · {title}</li>
          ))}
        </ul>
      ) : null}
      {preview.warningItems.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1 text-label-sm text-on-surface-variant">
          {preview.warningItems.slice(0, 40).map((item, index) => (
            <li key={`${item.type}-${item.stepId ?? index}`}>{catWarningLabel(item)}</li>
          ))}
        </ul>
      ) : null}
    </details>
  );
}
