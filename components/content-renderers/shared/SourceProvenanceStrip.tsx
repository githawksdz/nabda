import { StatusChip } from "@/components/content-detail/StatusChip";
import { payloadSourceDisplayLabel } from "@/lib/content-rendering/source-labels";
import type { ContentActivationState, ContentPayloadSource } from "@/types/content-rendering";

type SourceProvenanceStripProps = {
  payloadSource: ContentPayloadSource;
  activationState: ContentActivationState;
  extra?: string;
};

function activationLabel(state: ContentActivationState): string {
  switch (state) {
    case "production_published":
    case "nabda_adapted_active":
    case "source_preserved_active":
      return "Consultation";
    case "ux_normalized_preview":
    case "imported_identity":
      return "Aperçu";
    case "source_preserved_locked":
      return "Verrouillé";
    case "demo_mock":
      return "Démo";
    default:
      return "Aperçu";
  }
}

export function SourceProvenanceStrip({
  payloadSource,
  activationState,
  extra,
}: SourceProvenanceStripProps) {
  const sourceLabel = payloadSourceDisplayLabel(payloadSource);

  return (
    <div className="rounded-xl bg-surface-container-low p-3.5 text-body-sm">
      <div className="flex flex-wrap gap-1.5">
        <StatusChip label="Texte source" />
        <StatusChip label={sourceLabel} variant="outline" />
        <StatusChip label={activationLabel(activationState)} variant="soft" />
      </div>
      <p className="mt-2 text-on-surface-variant">
        Contenu source, rendu mobile Nabda. Non validé cliniquement ici.
      </p>
      {extra ? <p className="mt-1 text-on-surface-variant">{extra}</p> : null}
    </div>
  );
}
