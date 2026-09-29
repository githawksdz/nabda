"use client";

import { useMemo, useState } from "react";
import {
  DiscoveryList,
  DiscoveryListItem,
} from "@/components/discovery/DiscoveryListRow";
import { IndexPageIntro } from "@/components/discovery/IndexPageIntro";
import { ProtocolListCard } from "@/components/protocols/ProtocolListCard";
import { ModuleListPromoSlot } from "@/components/promotions/ModuleListPromoSlot";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListPagination } from "@/components/ui/ListPagination";
import { SearchField } from "@/components/ui/TextField";
import { useListPage } from "@/components/ui/useListPage";
import { slicePage } from "@/lib/ui/list-pagination";
import { interleaveModulePromotion } from "@/lib/promotions/module-list";
import type { ModuleListPromotionSlot } from "@/lib/promotions/resolve-module-promotion";
import { hasVisited } from "@/lib/ui/content-list-state";
import type { ProtocolSummary } from "@/lib/protocols/protocol-catalog";

type ProtocolsIndexPageProps = {
  protocols?: ProtocolSummary[];
  promotion?: ModuleListPromotionSlot;
  visitedKeys?: string[];
};

export function ProtocolsIndexPage({
  protocols = [],
  promotion = null,
  visitedKeys = [],
}: ProtocolsIndexPageProps) {
  const [query, setQuery] = useState("");
  const { page, setPage, pageSize, setPageSize } = useListPage(
    query,
    "protocols-list",
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return protocols;
    }
    return protocols.filter((item) =>
      [item.title, item.summary, item.statusLabel]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [protocols, query]);

  const paged = slicePage(filtered, page, pageSize);

  return (
    <div className="flex min-w-0 flex-col gap-4 pt-2">
        <IndexPageIntro description="Synthèses et guides cliniques disponibles dans Nabda." />

        <SearchField
          value={query}
          onChange={setQuery}
          onClear={() => setQuery("")}
          placeholder="Filtrer cette liste…"
          label="Filtrer les protocoles"
          compact
          className="bg-surface-muted shadow-none"
        />

        {protocols.length === 0 ? (
          <EmptyState
            compact
            headingLevel="h2"
            title="Aucun protocole disponible"
            description="Le référentiel sera enrichi au fur et à mesure des imports."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            compact
            headingLevel="h2"
            title="Aucun résultat"
            description="Essayez un autre terme de recherche."
            actionLabel="Effacer le filtre"
            onAction={() => setQuery("")}
          />
        ) : (
          <>
            <DiscoveryList id="protocols-list" className="scroll-mt-24">
              {interleaveModulePromotion(
                paged.items,
                (item) => (
                  <DiscoveryListItem key={item.id}>
                    <ProtocolListCard
                      href={item.href}
                      title={item.title}
                      description={item.summary ?? undefined}
                      categorySlug={item.categorySlug}
                      accessTier={
                        item.visibility === "premium" ? "pro" : "free"
                      }
                      isNew={item.isNew}
                      visited={hasVisited(visitedKeys, "protocol", item.slug)}
                      statusLabel={item.statusLabel ?? undefined}
                    />
                  </DiscoveryListItem>
                ),
                query.trim() || paged.page !== 1 || !promotion ? null : (
                  <DiscoveryListItem key="module-promo">
                    <ModuleListPromoSlot promotion={promotion} />
                  </DiscoveryListItem>
                ),
              )}
            </DiscoveryList>
            <ListPagination
              page={paged.page}
              pageCount={paged.pageCount}
              total={paged.total}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              label="Pagination des protocoles"
            />
          </>
        )}
    </div>
  );
}
