import { DrugListRow } from "./DrugListRow";
import type { DrugSummary } from "@/types/drugs";

type DrugDirectoryListProps = {
  drugs: DrugSummary[];
  totalCount: number;
};

export function DrugDirectoryList({
  drugs,
  totalCount,
}: DrugDirectoryListProps) {
  if (drugs.length === 0) return null;

  const countLabel =
    totalCount > 1 ? `${totalCount} molécules` : `${totalCount} molécule`;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-headline-sm">Répertoire des molécules</h2>
          <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
            {countLabel}
          </span>
        </div>
        <span className="text-label-sm text-on-surface-variant">Ordre A-Z</span>
      </div>
      <div className="flex flex-col gap-2">
        {drugs.map((drug) => (
          <DrugListRow key={drug.id} drug={drug} />
        ))}
      </div>
    </section>
  );
}
