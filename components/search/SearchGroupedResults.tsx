"use client";

import { ListPagination } from "@/components/ui/ListPagination";
import { useListPage } from "@/components/ui/useListPage";
import { sliceGroupedPage } from "@/lib/ui/list-pagination";
import { SearchResultGroupSection } from "./SearchResultGroup";
import type { SearchResultGroup } from "@/types/search";

type SearchGroupedResultsProps = {
  query: string;
  total: number;
  groups: SearchResultGroup[];
  visitedKeys?: string[];
};

export function SearchGroupedResults({
  query,
  total,
  groups,
  visitedKeys = [],
}: SearchGroupedResultsProps) {
  const resetKey = groups
    .map((group) => group.results.map((result) => result.id).join(","))
    .join("|");
  const { page, setPage, pageSize, setPageSize } = useListPage(
    resetKey,
    "search-results",
  );
  const paged = sliceGroupedPage(groups, page, pageSize);

  return (
    <div id="search-results" className="flex min-w-0 scroll-mt-24 flex-col gap-5">
      <p className="text-body-sm text-text-secondary">
        <span className="font-medium text-text-primary">{total}</span>{" "}
        résultat{total > 1 ? "s" : ""} pour «{" "}
        <span className="break-words">{query}</span> »
      </p>
      {paged.groups.map((group) => (
        <SearchResultGroupSection
          key={group.id}
          group={group}
          visitedKeys={visitedKeys}
        />
      ))}
      <ListPagination
        page={paged.page}
        pageCount={paged.pageCount}
        total={paged.total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        label="Pagination des résultats"
      />
    </div>
  );
}
