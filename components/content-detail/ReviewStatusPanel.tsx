import { Shield } from "lucide-react";
import { StatusChip } from "./StatusChip";
import {
  DEFAULT_STATUS_LABELS,
  localAdaptationLabel,
  reviewStatusLabel,
} from "@/lib/content-detail/status-labels";
import { REVIEW_PANEL_TITLE } from "@/lib/content-detail/content-detail-ui-config";
import type { Protocol, Reference } from "@/types/content-detail";

type ReviewStatusPanelProps = {
  protocol: Protocol;
  references: Reference[];
};

export function ReviewStatusPanel({
  protocol,
  references,
}: ReviewStatusPanelProps) {
  return (
    <section className="rounded-2xl bg-surface-container-low p-4">
      <h2 className="text-headline-sm">{REVIEW_PANEL_TITLE}</h2>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <StatusChip label={DEFAULT_STATUS_LABELS.structure} />
        <StatusChip label={reviewStatusLabel(protocol.review_status, protocol.status)} />
        <StatusChip label={localAdaptationLabel(protocol.local_adaptation_status)} />
        <StatusChip label={DEFAULT_STATUS_LABELS.sources} />
      </div>
      <ul className="mt-4 space-y-3">
        {references.map((reference) => (
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
      {protocol.source_note ? (
        <p className="mt-4 flex items-start gap-2 text-label-sm text-on-surface-variant">
          <Shield className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} />
          {protocol.source_note}
        </p>
      ) : null}
    </section>
  );
}
