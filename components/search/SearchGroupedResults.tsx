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
    <div className="flex min-w-0 flex-col gap-5">
      <p className="text-body-sm text-text-secondary">
        <span className="font-medium text-text-primary">{total}</span>{" "}
        résultat{total > 1 ? "s" : ""} pour «{" "}
        <span className="break-words">{query}</span> »
      </p>
      {groups.map((group) => (
        <SearchResultGroupSection key={group.id} group={group} />
      ))}
    </div>
  );
}
