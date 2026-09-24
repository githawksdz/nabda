import { StatusChip } from "@/components/content-detail/StatusChip";
import { DrugSectionRenderer } from "@/components/content-renderers/drug/DrugSectionRenderer";
import type { DrugRenderSection, DrugRenderTable } from "@/types/content-rendering-drug";

type DrugSourcesPanelProps = {
  sections: DrugRenderSection[];
  tables: DrugRenderTable[];
  keepInternalQuery?: boolean;
};

export function DrugSourcesPanel({
  sections,
  tables,
  keepInternalQuery = false,
}: DrugSourcesPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-surface-container-low p-3.5">
        <StatusChip label="France · Sources" variant="warning" />
        <p className="mt-2 text-body-sm">
          Les informations de prescription France (liste, remboursement, AMM) restent en Sources.
          Elles ne constituent pas le parcours algérien principal.
        </p>
      </div>
      <DrugSectionRenderer
        sections={sections}
        tables={tables}
        keepInternalQuery={keepInternalQuery}
      />
    </div>
  );
}
