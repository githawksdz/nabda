"use client";

import { useMemo, useState } from "react";
import { InternalPreviewBanner } from "@/components/internal/protocol-preview/InternalPreviewBanner";
import { CalculatorMetricsGrid } from "@/components/internal/calculator-preview/CalculatorMetricsGrid";
import { CalculatorPreviewCard } from "@/components/internal/calculator-preview/CalculatorPreviewCard";
import { CalculatorPreviewFilters } from "@/components/internal/calculator-preview/CalculatorPreviewFilters";
import { CalculatorPreviewHeader } from "@/components/internal/calculator-preview/CalculatorPreviewHeader";
import {
  CALCULATOR_PREVIEW_PAGE_SIZE,
  featuredCalculatorPreviewSlugs,
  groupKeyForItem,
  groupLabel,
  itemMatchesFilter,
  summarizeCalculatorPreviewIndex,
} from "@/lib/internal/calculator-preview-ui";
import type { CalculatorRenderIndexItem } from "@/types/content-rendering-calculator";
import type {
  CalculatorPreviewFilter,
  CalculatorPreviewGroupBy,
} from "@/types/internal-preview";

type CalculatorPreviewIndexProps = {
  items: CalculatorRenderIndexItem[];
  keepInternalQuery?: boolean;
};

export function CalculatorPreviewIndex({
  items,
  keepInternalQuery = false,
}: CalculatorPreviewIndexProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CalculatorPreviewFilter>("tous");
  const [groupBy, setGroupBy] = useState<CalculatorPreviewGroupBy>("ux");
  const [visible, setVisible] = useState(CALCULATOR_PREVIEW_PAGE_SIZE);
  const metrics = useMemo(() => summarizeCalculatorPreviewIndex(items), [items]);
  const featured = featuredCalculatorPreviewSlugs();

  const filtered = useMemo(() => {
    const folded = query.trim().toLowerCase();
    return items.filter((item) => {
      if (!itemMatchesFilter(item, filter)) return false;
      if (!folded) return true;
      return (
        item.title.toLowerCase().includes(folded) ||
        item.slug.includes(folded) ||
        item.sourceId.toLowerCase().includes(folded)
      );
    });
  }, [filter, items, query]);

  const groups = useMemo(() => {
    const map = new Map<string, CalculatorRenderIndexItem[]>();
    for (const item of filtered) {
      const key = groupKeyForItem(item, groupBy);
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return [...map.entries()].sort((a, b) =>
      groupLabel(groupBy, a[0]).localeCompare(groupLabel(groupBy, b[0]), "fr"),
    );
  }, [filtered, groupBy]);

  const page = filtered.slice(0, visible);
  const pageSlugs = new Set(page.map((item) => item.slug));

  return (
    <div className="flex flex-col gap-4">
      <InternalPreviewBanner title="Aperçu interne · Catalogue calculateurs" />
      <CalculatorPreviewHeader
        title="Catalogue calculateurs"
        sourceId=""
        count={items.length}
      />
      <CalculatorMetricsGrid metrics={metrics} />
      <div className="flex flex-col gap-2">
        {featured.map((slug) => {
          const item = items.find((row) => row.slug === slug);
          if (!item) return null;
          return (
            <CalculatorPreviewCard
              key={`featured-${slug}`}
              item={item}
              keepInternalQuery={keepInternalQuery}
            />
          );
        })}
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-label-sm text-on-surface-variant">Rechercher</span>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setVisible(CALCULATOR_PREVIEW_PAGE_SIZE);
          }}
          placeholder="GCS, APGAR, CURB-65, tPA…"
          className="h-11 rounded-xl bg-surface-container-low px-3 text-body-md"
        />
      </label>
      <CalculatorPreviewFilters
        filter={filter}
        groupBy={groupBy}
        onFilterChange={(next) => {
          setFilter(next);
          setVisible(CALCULATOR_PREVIEW_PAGE_SIZE);
        }}
        onGroupByChange={(next) => {
          setGroupBy(next);
          setVisible(CALCULATOR_PREVIEW_PAGE_SIZE);
        }}
      />
      <div className="flex flex-col gap-4">
        {groups.map(([key, groupItems]) => {
          const shown = groupItems.filter((item) => pageSlugs.has(item.slug));
          if (shown.length === 0) return null;
          return (
            <section key={key} className="flex flex-col gap-2">
              <h2 className="text-body-md font-medium">
                {groupLabel(groupBy, key)}
                <span className="ml-2 text-label-sm text-on-surface-variant">
                  {groupItems.length}
                </span>
              </h2>
              {shown.map((item) => (
                <CalculatorPreviewCard
                  key={item.slug}
                  item={item}
                  keepInternalQuery={keepInternalQuery}
                />
              ))}
            </section>
          );
        })}
      </div>
      {visible < filtered.length ? (
        <button
          type="button"
          onClick={() => setVisible((count) => count + CALCULATOR_PREVIEW_PAGE_SIZE)}
          className="h-11 rounded-full bg-surface-container-low text-label-md"
        >
          Voir plus ({filtered.length - visible} restants)
        </button>
      ) : null}
      <aside className="rounded-xl bg-surface-container-low p-3.5 text-body-sm">
        <p className="font-medium">Légende verrouillage / risque</p>
        <p className="mt-1 text-on-surface-variant">
          Verrouillé = posologie, thrombolyse, chimiothérapie, insuline, opioïdes, toxidromes
          ou suicide. Aucun moteur n’est activé. GCS et Cockcroft restent les seules démos
          publiques existantes.
        </p>
      </aside>
    </div>
  );
}
