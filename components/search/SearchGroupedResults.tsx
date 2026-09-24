import { ArrowUpDown, ChevronDown, Lightbulb } from "lucide-react";
import { SearchResultGroupSection } from "./SearchResultGroup";
import type { SearchResultGroup } from "@/types/search";

type SearchGroupedResultsProps = {
  query: string;
  total: number;
  groups: SearchResultGroup[];
};

export function SearchGroupedResults({
  query,
  total,
  groups,
}: SearchGroupedResultsProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-body-sm text-on-surface-variant">
          {total} résultats pour « {query} »
        </p>
        <span className="inline-flex items-center gap-1 rounded-lg bg-surface-container px-2 py-1 text-label-sm">
          <ArrowUpDown className="size-3.5" strokeWidth={1.75} />
          Pertinence clinique
          <ChevronDown className="size-3.5" strokeWidth={1.75} />
        </span>
      </div>
      {groups.map((group) => (
        <SearchResultGroupSection key={group.id} group={group} />
      ))}
      <aside className="flex gap-3 rounded-xl bg-surface-container-low p-4">
        <Lightbulb className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
        <div>
          <p className="text-label-md">Règle d&apos;or antalgique</p>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            L&apos;évaluation systématique de l&apos;EVA toutes les 30 min après
            administration parentérale conditionne la prescription de relais.
          </p>
        </div>
      </aside>
    </div>
  );
}
