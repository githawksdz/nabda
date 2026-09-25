"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CatIcon } from "./cat-icons";
import { CatSearchBar } from "./CatSearchBar";
import { CatFilterChips } from "./CatFilterChips";
import { CatEmergencyFilterChips } from "./CatEmergencyFilterChips";
import { CatUrgencyBanner } from "./CatUrgencyBanner";
import { CatEmergencyList } from "./CatEmergencyList";
import { CatEmptyInlineState } from "./CatEmptyInlineState";
import {
  COMMITTEE_FOOTNOTE,
  EMERGENCY_SUB_FILTERS,
  urgencesFilterChipsForCatalog,
} from "@/lib/cat/cat-ui-config";
import type { CatCard, CatCategorySlug, CatSubFilter } from "@/types/cat";

type CatUrgencesViewProps = {
  query: string;
  onQueryChange: (value: string) => void;
  category: CatCategorySlug;
  onCategoryChange: (id: CatCategorySlug) => void;
  subFilter: CatSubFilter;
  onSubFilterChange: (id: CatSubFilter) => void;
  cards: CatCard[];
};

export function CatUrgencesView({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  subFilter,
  onSubFilterChange,
  cards,
}: CatUrgencesViewProps) {
  const chips = useMemo(() => urgencesFilterChipsForCatalog(cards), [cards]);
  const urgentCount = cards.length;
  const filterLabel =
    urgentCount > 0
      ? `Filtre actif : Urgences (${urgentCount})`
      : "Filtre actif : Urgences";
  const searchPlaceholder =
    urgentCount > 0
      ? `Rechercher parmi les ${urgentCount} CAT d'urgence...`
      : "Rechercher une CAT d'urgence...";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="text-headline-lg">CAT</h1>
          <span className="inline-flex items-center rounded-full bg-surface-container px-2.5 py-1 text-label-sm">
            {filterLabel}
          </span>
        </div>
        <Link
          href="/offline"
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-surface-container-low px-2.5 text-label-sm text-on-surface-variant"
        >
          <CatIcon name="cloud" className="size-3.5" />
          Hors-ligne
        </Link>
      </div>

      <CatSearchBar
        value={query}
        onChange={onQueryChange}
        placeholder={searchPlaceholder}
        showClear
      />

      <CatFilterChips
        chips={chips}
        active={category}
        onSelect={onCategoryChange}
        variant="urgences"
      />

      <CatEmergencyFilterChips
        filters={EMERGENCY_SUB_FILTERS}
        active={subFilter}
        onSelect={onSubFilterChange}
      />

      <CatUrgencyBanner />

      {cards.length === 0 ? (
        <CatEmptyInlineState
          title="Aucune CAT urgente trouvée"
          subtitle="Essayez un autre filtre ou revenez à la vue générale."
        />
      ) : (
        <CatEmergencyList cards={cards} />
      )}

      <p className="pb-2 text-center text-label-sm text-on-surface-variant">
        {COMMITTEE_FOOTNOTE}
      </p>
    </div>
  );
}
