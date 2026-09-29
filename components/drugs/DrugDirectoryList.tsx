"use client";

import { DiscoveryListItem } from "@/components/discovery/DiscoveryListRow";
import { ModuleListPromoSlot } from "@/components/promotions/ModuleListPromoSlot";
import { ListPagination } from "@/components/ui/ListPagination";
import { useListPage } from "@/components/ui/useListPage";
import { interleaveModulePromotion } from "@/lib/promotions/module-list";
import type { ModuleListPromotionSlot } from "@/lib/promotions/resolve-module-promotion";
import { slicePage } from "@/lib/ui/list-pagination";
import { DrugListRow } from "./DrugListRow";
import type { DrugCatalogCardItem } from "@/types/drugs";

type DrugDirectoryListProps = {
  drugs: DrugCatalogCardItem[];
  promotion?: ModuleListPromotionSlot;
  visitedKeys?: string[];
};

export function DrugDirectoryList({
  drugs,
  promotion = null,
  visitedKeys = [],
}: DrugDirectoryListProps) {
  const resetKey = drugs.map((drug) => drug.cardKey).join("|");
  const { page, setPage, pageSize, setPageSize } = useListPage(
    resetKey,
    "drugs-directory",
  );
  const paged = slicePage(drugs, page, pageSize);

  if (drugs.length === 0) return null;

  return (
    <section>
      <ul
        id="drugs-directory"
        className="grid scroll-mt-24 grid-cols-2 gap-2"
      >
        {interleaveModulePromotion(
          paged.items,
          (drug) => (
            <DiscoveryListItem key={drug.cardKey}>
              <DrugListRow drug={drug} visitedKeys={visitedKeys} />
            </DiscoveryListItem>
          ),
          promotion && paged.page === 1 ? (
            <li key="module-promo" className="col-span-2 min-w-0">
              <ModuleListPromoSlot promotion={promotion} />
            </li>
          ) : null,
        )}
      </ul>
      <ListPagination
        page={paged.page}
        pageCount={paged.pageCount}
        total={paged.total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        label="Pagination des médicaments"
      />
    </section>
  );
}
