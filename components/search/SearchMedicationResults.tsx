"use client";

import { DiscoveryList, DiscoveryListItem, DiscoveryListRow } from "@/components/discovery/DiscoveryListRow";
import { DrugIcon } from "@/components/drugs/DrugListRow";
import { ListPagination } from "@/components/ui/ListPagination";
import { useListPage } from "@/components/ui/useListPage";
import { slicePage } from "@/lib/ui/list-pagination";
import { hasVisited } from "@/lib/ui/content-list-state";
import type { MedicationSearchResult } from "@/types/search";

type SearchMedicationResultsProps = {
  results: MedicationSearchResult[];
  totalCount?: number;
  visitedKeys?: string[];
};

export function SearchMedicationResults({
  results,
  totalCount,
  visitedKeys = [],
}: SearchMedicationResultsProps) {
  const count = totalCount ?? results.length;
  const resetKey = results.map((result) => result.id).join("|");
  const { page, setPage, pageSize, setPageSize } = useListPage(
    resetKey,
    "search-medications",
  );
  const paged = slicePage(results, page, pageSize);

  return (
    <div id="search-medications" className="flex scroll-mt-24 flex-col gap-4">
      <p className="text-body-sm text-on-surface-variant">
        {count} résultat{count > 1 ? "s" : ""} · ordre alphabétique
      </p>

      <DiscoveryList>
        {paged.items.map((result) => (
          <DiscoveryListItem key={result.id}>
            <DiscoveryListRow
              href={result.href}
              title={result.title}
              contentType="drug"
              description={result.infoText}
              specialties={[result.categorySlug]}
              accessTier={result.statusChip === "Pro" ? "pro" : "free"}
              isNew={result.isNew}
              visited={hasVisited(visitedKeys, "drug", result.slug)}
              statusLabel={result.statusChip ?? result.warningChip}
              icon={<DrugIcon name="pill" className="size-4 text-text-primary" />}
            />
          </DiscoveryListItem>
        ))}
      </DiscoveryList>
      <ListPagination
        page={paged.page}
        pageCount={paged.pageCount}
        total={paged.total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        label="Pagination des médicaments"
      />
    </div>
  );
}
