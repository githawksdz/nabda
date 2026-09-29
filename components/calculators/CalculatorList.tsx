"use client";

import { DiscoveryList, DiscoveryListItem } from "@/components/discovery/DiscoveryListRow";
import { ModuleListPromoSlot } from "@/components/promotions/ModuleListPromoSlot";
import { ListPagination } from "@/components/ui/ListPagination";
import { useListPage } from "@/components/ui/useListPage";
import { interleaveModulePromotion } from "@/lib/promotions/module-list";
import type { ModuleListPromotionSlot } from "@/lib/promotions/resolve-module-promotion";
import { slicePage } from "@/lib/ui/list-pagination";
import { CalculatorListRow } from "./CalculatorListRow";
import type { CalculatorSummary } from "@/types/calculators";

type CalculatorListProps = {
  calculators: CalculatorSummary[];
  promotion?: ModuleListPromotionSlot;
  visitedKeys?: string[];
};

export function CalculatorList({
  calculators,
  promotion = null,
  visitedKeys = [],
}: CalculatorListProps) {
  const resetKey = calculators.map((item) => item.id).join("|");
  const { page, setPage, pageSize, setPageSize } = useListPage(
    resetKey,
    "calculators-list",
  );
  const paged = slicePage(calculators, page, pageSize);

  if (calculators.length === 0) return null;

  const count = calculators.length;
  const countLabel = count > 1 ? `${count} indexés` : `${count} indexé`;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-headline-sm">Tous les outils</h2>
          <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
            {countLabel}
          </span>
        </div>
        <span className="text-label-sm text-on-surface-variant">Ordre A-Z</span>
      </div>
      <DiscoveryList id="calculators-list" className="scroll-mt-24">
        {interleaveModulePromotion(
          paged.items,
          (calculator) => (
            <DiscoveryListItem key={calculator.id}>
              <CalculatorListRow
                calculator={calculator}
                visitedKeys={visitedKeys}
              />
            </DiscoveryListItem>
          ),
          promotion && paged.page === 1 ? (
            <DiscoveryListItem key="module-promo">
              <ModuleListPromoSlot promotion={promotion} />
            </DiscoveryListItem>
          ) : null,
        )}
      </DiscoveryList>
      <ListPagination
        page={paged.page}
        pageCount={paged.pageCount}
        total={paged.total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        label="Pagination des calculateurs"
      />
    </section>
  );
}
