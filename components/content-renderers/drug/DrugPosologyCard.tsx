import { StatusChip } from "@/components/content-detail/StatusChip";
import { SafeSourceHtml } from "@/components/content-renderers/shared/SafeSourceHtml";
import { DrugTableRenderer } from "@/components/content-renderers/drug/DrugTableRenderer";
import type { DrugRenderSection, DrugRenderTable } from "@/types/content-rendering-drug";

type DrugPosologyCardProps = {
  section: DrugRenderSection;
  tables: DrugRenderTable[];
  keepInternalQuery?: boolean;
};

export function DrugPosologyCard({
  section,
  tables,
  keepInternalQuery = false,
}: DrugPosologyCardProps) {
  return (
    <article className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm ring-1 ring-outline-variant/40">
      <h3 className="text-body-md font-medium">{section.title}</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <StatusChip label="Texte source — non adapté" />
        <StatusChip label="Pas de calculateur" variant="outline" />
        {section.containsRenalHepatic ? (
          <StatusChip label="Rénal / hépatique" variant="warning" />
        ) : null}
      </div>
      <p className="mt-2 text-label-sm text-on-surface-variant">
        Présentation et dosages produit éventuels ne constituent pas une posologie
        adaptée. Aucune adaptation automatique.
      </p>
      <div className="mt-3 flex flex-col gap-3">
        {tables.map((table) => (
          <DrugTableRenderer key={table.id} table={table} />
        ))}
        {section.html ? (
          <SafeSourceHtml
            html={section.html}
            keepInternalQuery={keepInternalQuery}
            guidelinePreview="drug"
          />
        ) : (
          <p className="whitespace-pre-wrap text-body-sm">{section.textPreview ?? section.text}</p>
        )}
      </div>
    </article>
  );
}
