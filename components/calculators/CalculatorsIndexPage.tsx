"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { IndexPageIntro } from "@/components/discovery/IndexPageIntro";
import { CalculatorContextGrid } from "./CalculatorContextGrid";
import { CalculatorEmptyState } from "./CalculatorEmptyState";
import { CalculatorFilterChips } from "./CalculatorFilterChips";
import { CalculatorList } from "./CalculatorList";
import { CalculatorSafetyNotice } from "./CalculatorSafetyNotice";
import { CalculatorSearchBar } from "./CalculatorSearchBar";
import { CalculatorsHeader } from "./CalculatorsHeader";
import { FrequentCalculatorsGrid } from "./FrequentCalculatorsGrid";
import {
  contextsForCatalog,
  filterCalculators,
  filterChipsForCatalog,
} from "@/lib/calculators/calculator-ui-config";
import { scrollElementIntoView } from "@/lib/ui/scroll-behavior";
import type { CalculatorCategorySlug, CalculatorSummary } from "@/types/calculators";

type CalculatorsIndexPageProps = {
  calculators?: CalculatorSummary[];
};

export function CalculatorsIndexPage({
  calculators = [],
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

  function scrollToFilters() {
    document.getElementById("calculator-search")?.focus();
    const filters = document.getElementById("calculator-filters");
    if (filters) {
      scrollElementIntoView(filters, { block: "start" });
    }
  }

  return (
    <AppShell
      title="Scores"
      pageHeading={false}
      navVariant="text"
      frame="clinical"
      avatarDot
      headerActions={<CalculatorsHeader onTune={scrollToFilters} />}
    >
      <div className="flex min-w-0 flex-col gap-5 pt-2">
        <IndexPageIntro title="Calculateurs cliniques & scores" />

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
            <CalculatorList calculators={filtered} />
          </>
        )}

        <CalculatorSafetyNotice variant="professional" />
      </div>
    </AppShell>
  );
}
