"use client";

import { useMemo, useState } from "react";
import { CalculatorContextGrid } from "./CalculatorContextGrid";
import { CalculatorEmptyState } from "./CalculatorEmptyState";
import { CalculatorFilterChips } from "./CalculatorFilterChips";
import { CalculatorList } from "./CalculatorList";
import { CalculatorSafetyNotice } from "./CalculatorSafetyNotice";
import { CalculatorSearchBar } from "./CalculatorSearchBar";
import { FrequentCalculatorsGrid } from "./FrequentCalculatorsGrid";
import {
  contextsForCatalog,
  filterCalculators,
  filterChipsForCatalog,
} from "@/lib/calculators/calculator-ui-config";
import type { ModuleListPromotionSlot } from "@/lib/promotions/resolve-module-promotion";
import type { CalculatorCategorySlug, CalculatorSummary } from "@/types/calculators";

type CalculatorsIndexPageProps = {
  calculators?: CalculatorSummary[];
  promotion?: ModuleListPromotionSlot;
  visitedKeys?: string[];
};

export function CalculatorsIndexPage({
  calculators = [],
  promotion = null,
  visitedKeys = [],
}: CalculatorsIndexPageProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] =
    useState<CalculatorCategorySlug>("all");

  const filtered = useMemo(
    () => filterCalculators(calculators, query, category),
    [calculators, query, category],
  );

  const chips = useMemo(
    () => filterChipsForCatalog(calculators),
    [calculators],
  );

  const contexts = useMemo(
    () => contextsForCatalog(calculators),
    [calculators],
  );

  const frequent = useMemo(
    () => filtered.filter((item) => item.frequentlyUsed),
    [filtered],
  );

  const isEmpty = filtered.length === 0;

  function resetFilters() {
    setQuery("");
    setCategory("all");
  }

  function selectCategory(next: CalculatorCategorySlug) {
    setCategory(next);
  }

  function selectContext(next: CalculatorCategorySlug) {
    setCategory((current) => (current === next ? "all" : next));
  }

  return (
    <>
      <div className="flex min-w-0 flex-col gap-5 pt-2">
        <CalculatorSafetyNotice />

        <CalculatorSearchBar value={query} onChange={setQuery} />

        <CalculatorFilterChips
          chips={chips}
          active={category}
          onSelect={selectCategory}
        />

        {isEmpty ? (
          <CalculatorEmptyState onReset={resetFilters} />
        ) : (
          <>
            <FrequentCalculatorsGrid calculators={frequent} />
            <CalculatorContextGrid
              contexts={contexts}
              active={category}
              onSelect={selectContext}
            />
            <CalculatorList
              calculators={filtered}
              promotion={query.trim() ? null : promotion}
              visitedKeys={visitedKeys}
            />
          </>
        )}

        <CalculatorSafetyNotice variant="professional" />
      </div>
    </>
  );
}
