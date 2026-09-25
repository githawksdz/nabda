"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { IndexPageIntro } from "@/components/discovery/IndexPageIntro";
import { DrugCategoryChips } from "./DrugCategoryChips";
import { DrugClassGrid } from "./DrugClassGrid";
import { DrugDirectoryList } from "./DrugDirectoryList";
import { DrugEmptyState } from "./DrugEmptyState";
import { DrugSafetyNotice } from "./DrugSafetyNotice";
import { DrugSearchBar } from "./DrugSearchBar";
import { DrugsHeader } from "./DrugsHeader";
import { FrequentDrugsGrid } from "./FrequentDrugsGrid";
import {
  DRUG_CLASS_TILES,
  DRUG_IDENTITY,
  filterChipsForDrugCatalog,
  filterDrugs,
  frequentDrugs,
} from "@/lib/drugs/drug-ui-config";
import { scrollElementIntoView } from "@/lib/ui/scroll-behavior";
import type { DrugCategorySlug, DrugSummary } from "@/types/drugs";

type DrugsIndexPageProps = {
  drugs?: DrugSummary[];
};

export function DrugsIndexPage({ drugs = [] }: DrugsIndexPageProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DrugCategorySlug>("all");

  const filtered = useMemo(
    () => filterDrugs(drugs, query, category),
    [drugs, query, category],
  );

  const chips = useMemo(() => filterChipsForDrugCatalog(drugs), [drugs]);
  const frequent = useMemo(() => frequentDrugs(filtered), [filtered]);
  const isEmpty = filtered.length === 0;
  const catalogEmpty = drugs.length === 0;

  function resetFilters() {
    setQuery("");
    setCategory("all");
  }

  function selectCategory(next: DrugCategorySlug) {
    setCategory(next);
  }

  function selectClass(next: DrugCategorySlug) {
    setCategory((current) => (current === next ? "all" : next));
  }

  function scrollToFilters() {
    document.getElementById("drug-search")?.focus();
    const filters = document.getElementById("drug-filters");
    if (filters) {
      scrollElementIntoView(filters, { block: "start" });
    }
  }

  return (
    <AppShell
      title="Médicaments"
      pageHeading={false}
      navVariant="text"
      frame="clinical"
      avatarDot
      headerActions={<DrugsHeader onTune={scrollToFilters} />}
    >
      <div className="flex min-w-0 flex-col gap-5 pt-2">
        <IndexPageIntro
          title={DRUG_IDENTITY.title}
          description={DRUG_IDENTITY.subtitle}
        />

        <DrugSafetyNotice />

        <DrugSearchBar value={query} onChange={setQuery} />

        <DrugCategoryChips
          chips={chips}
          active={category}
          onSelect={selectCategory}
        />

        {isEmpty ? (
          <DrugEmptyState
            onReset={resetFilters}
            catalogEmpty={catalogEmpty}
          />
        ) : (
          <>
            <FrequentDrugsGrid drugs={frequent} />
            <DrugClassGrid
              classes={DRUG_CLASS_TILES}
              active={category}
              onSelect={selectClass}
            />
            <DrugDirectoryList
              drugs={filtered}
              totalCount={filtered.length}
            />
          </>
        )}

        <DrugSafetyNotice variant="prudence" />
      </div>
    </AppShell>
  );
}
