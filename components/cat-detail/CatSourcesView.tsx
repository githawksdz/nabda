import { Shield } from "lucide-react";
import { StatusChip } from "@/components/content-detail/StatusChip";
import {
  DEFAULT_STATUS_LABELS,
  localAdaptationLabel,
  reviewStatusLabel,
  timelineStatusLabel,
} from "@/lib/content-detail/status-labels";
import type { CatDetail } from "@/types/content-detail";

type CatSourcesViewProps = {
  detail: CatDetail;
};

export function CatSourcesView({ detail }: CatSourcesViewProps) {
  const rows = [
    {
      id: "structure",
      title: "Structure éditoriale",
      label: DEFAULT_STATUS_LABELS.structure,
    },
    {
      id: "review",
      title: "Révision médicale",
      label: reviewStatusLabel(detail.map.review_status),
    },
    {
      id: "local",
      title: "Adaptation locale Algérie",
      label: localAdaptationLabel(detail.map.local_adaptation_status ?? "to_verify"),
    },
    {
      id: "sources",
      title: "Sources à consolider",
      label: DEFAULT_STATUS_LABELS.sources,
    },
  ];

  return (
    <section className="rounded-2xl bg-surface-container-low p-4">
      <h2 className="text-headline-sm">Sources et relecture</h2>
      <p className="mt-2 text-body-sm text-on-surface-variant">
        Libellés conservateurs. Aucune validation finale n&apos;est revendiquée.
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-lowest px-3.5 py-3 shadow-sm"
          >
            <span className="text-body-sm">{row.title}</span>
            <StatusChip label={row.label} />
          </li>
        ))}
      </ul>
      {detail.timeline.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {detail.timeline.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 text-label-sm text-on-surface-variant"
            >
              <span>{item.title}</span>
              <span>{timelineStatusLabel(item.status)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {detail.references.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {detail.references.map((reference) => (
            <li key={reference.id}>
              <p className="text-body-md font-medium">{reference.title}</p>
              {reference.note ? (
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  {reference.note}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {detail.map.source_note ? (
        <p className="mt-4 flex items-start gap-2 text-label-sm text-on-surface-variant">
          <Shield className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} />
          {detail.map.source_note}
        </p>
      ) : null}
    </section>
  );
}
