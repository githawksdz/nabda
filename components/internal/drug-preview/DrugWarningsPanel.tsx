import { StatusChip } from "@/components/content-detail/StatusChip";
import { drugWarningLabel } from "@/lib/internal/drug-preview-mappers";
import type { DrugRenderSource } from "@/types/content-rendering-drug";

type DrugWarningsPanelProps = {
  preview: DrugRenderSource;
};

export function DrugWarningsPanel({ preview }: DrugWarningsPanelProps) {
  const { stats } = preview;
  return (
    <details className="rounded-xl bg-surface-container-low p-3.5">
      <summary className="cursor-pointer list-none text-body-md font-medium [&::-webkit-details-marker]:hidden">
        Journal interne · {preview.protocolWarnings.length + preview.warningItems.length} signaux
      </summary>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <StatusChip label={`${stats.sectionCount} sections`} />
        <StatusChip label={`${stats.tableCount} tableaux`} />
        <StatusChip label={`${stats.nestedTableCount} imbriqués`} />
        <StatusChip
          label={`${stats.hugeTableCount} volumineux`}
          variant={stats.hugeTableCount ? "warning" : "soft"}
        />
        <StatusChip
          label={`${stats.brokenImageCount} images cassées`}
          variant={stats.brokenImageCount ? "warning" : "soft"}
        />
        <StatusChip
          label={`${stats.francePrescriptionCount} France Rx`}
          variant={stats.francePrescriptionCount ? "warning" : "soft"}
        />
        <StatusChip
          label={`${stats.renalHepaticPosologyCount} rénal/hépatique`}
          variant={stats.renalHepaticPosologyCount ? "warning" : "soft"}
        />
        <StatusChip
          label={`${stats.missingRcpKeyCount} clés RCP manquantes`}
          variant={stats.missingRcpKeyCount ? "warning" : "soft"}
        />
        <StatusChip label={preview.missingFullHtml ? "HTML incomplet" : "HTML sanitizé"} />
      </div>
      {stats.displayStrategyCounts.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1 text-label-sm text-on-surface-variant">
          {stats.displayStrategyCounts.map((item) => (
            <li key={item.key}>
              display · {item.key} · {item.count}
            </li>
          ))}
        </ul>
      ) : null}
      {preview.missingExpectedKeys.length > 0 ? (
        <p className="mt-3 text-label-sm text-on-surface-variant">
          Clés RCP manquantes : {preview.missingExpectedKeys.join(", ")}
        </p>
      ) : null}
      {preview.protocolWarnings.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1 text-body-sm text-on-surface-variant">
          {preview.protocolWarnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}
      {preview.warningItems.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1 text-label-sm text-on-surface-variant">
          {preview.warningItems.slice(0, 40).map((item, index) => (
            <li key={`${item.type}-${item.sourceKey ?? index}`}>{drugWarningLabel(item)}</li>
          ))}
        </ul>
      ) : null}
    </details>
  );
}
