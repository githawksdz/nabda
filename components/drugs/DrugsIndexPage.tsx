"use client";

import { useMemo, useState } from "react";
import { IndexPageIntro } from "@/components/discovery/IndexPageIntro";
import { DrugCategoryChips } from "./DrugCategoryChips";
import { DrugDirectoryList } from "./DrugDirectoryList";
import { DrugEmptyState } from "./DrugEmptyState";
import { DrugSearchBar } from "./DrugSearchBar";
import {
  DRUG_IDENTITY,
  filterChipsForDrugCatalog,
  filterDrugCards,
} from "@/lib/drugs/drug-ui-config";
import type { ModuleListPromotionSlot } from "@/lib/promotions/resolve-module-promotion";
import type { DrugCategorySlug, DrugSummary } from "@/types/drugs";

type DrugsIndexPageProps = {
  drugs?: DrugSummary[];
  promotion?: ModuleListPromotionSlot;
  visitedKeys?: string[];
};

export function DrugsIndexPage({
  drugs = [],
  promotion = null,
  visitedKeys = [],
}: DrugsIndexPageProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DrugCategorySlug>("all");

  const filtered = useMemo(
    () => filterDrugCards(drugs, query, category),
    [drugs, query, category],
  );

  const chips = useMemo(() => filterChipsForDrugCatalog(drugs), [drugs]);
  const isEmpty = filtered.length === 0;
  const catalogEmpty = drugs.length === 0;

  function resetFilters() {
    setQuery("");
    setCategory("all");
  }

  function selectCategory(next: DrugCategorySlug) {
    setCategory(next);
  }

  return (
    <div className="flex min-w-0 flex-col gap-5 pt-2">
      <IndexPageIntro description={DRUG_IDENTITY.subtitle} />

      <DrugSearchBar value={query} onChange={setQuery} />

      <DrugCategoryChips
        chips={chips}
        active={category}
        onSelect={selectCategory}
      />

      {isEmpty ? (
        <DrugEmptyState onReset={resetFilters} catalogEmpty={catalogEmpty} />
      ) : (
        <DrugDirectoryList
          drugs={filtered}
          promotion={query.trim() ? null : promotion}
          visitedKeys={visitedKeys}
        />
      )}
    </div>
  );
}
