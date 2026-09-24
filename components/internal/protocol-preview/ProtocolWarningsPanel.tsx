import { StatusChip } from "@/components/content-detail/StatusChip";
import { warningLabel } from "@/lib/internal/protocol-preview-mappers";
import type { ProtocolRenderSource } from "@/types/content-rendering-protocol";

type ProtocolWarningsPanelProps = {
  preview: ProtocolRenderSource;
};

export function ProtocolWarningsPanel({ preview }: ProtocolWarningsPanelProps) {
  const { stats } = preview;
  return (
    <details className="rounded-xl bg-surface-container-low p-3.5">
      <summary className="cursor-pointer list-none text-body-md font-medium [&::-webkit-details-marker]:hidden">
        Journal interne · {preview.protocolWarnings.length + preview.warningItems.length} signaux
      </summary>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <StatusChip label={`${stats.sectionCount} sections`} />
        <StatusChip label={`${stats.doseCount} dose`} variant={stats.doseCount ? "warning" : "soft"} />
        <StatusChip
          label={`${stats.emergencyCount} urgence`}
          variant={stats.emergencyCount ? "warning" : "soft"}
        />
        <StatusChip label={`${stats.tableCount} tableaux`} />
        <StatusChip label={`${stats.imageCount} images`} />
        <StatusChip label={`${stats.imagemapCount} imagemaps`} />
        <StatusChip label={`${stats.longSectionCount} longues`} />
        <StatusChip label={`${stats.unresolvedHeadingCount} titres non mappés`} />
      </div>
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
            <li key={`${item.type}-${item.sectionId ?? index}`}>{warningLabel(item)}</li>
          ))}
        </ul>
      ) : null}
    </details>
  );
}
