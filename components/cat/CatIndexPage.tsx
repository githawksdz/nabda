"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { CatHeader } from "./CatHeader";
import { CatModuleIdentity } from "./CatModuleIdentity";
import { CatSearchBar } from "./CatSearchBar";
import { CatFilterChips } from "./CatFilterChips";
import { CatPinnedSection } from "./CatPinnedSection";
import { CatLatestSection } from "./CatLatestSection";
import { CatContextGrid } from "./CatContextGrid";
import { CatOfflineCallout } from "./CatOfflineCallout";
import { CatUrgencesView } from "./CatUrgencesView";
import { CatPreparationView } from "./CatPreparationView";
import { CatEmptyInlineState } from "./CatEmptyInlineState";
import { isDemoContentModeClient } from "@/lib/content-data/content-source-mode";
import {
  generalFilterChipsForCatalog,
} from "@/lib/cat/cat-ui-config";
import { getCatDemoFixturesSync } from "@/lib/demo-fixtures/load";
import {
  filterCatCards,
  matchesCatQuery,
  overlaySeedReview,
  resolveActiveCategory,
  resolveCatIndexState,
} from "@/lib/cat/resolve-cat-state";
import type { CatMap } from "@/types/content";
import type { CatCard, CatCategorySlug, CatSubFilter } from "@/types/cat";

type CatIndexPageProps = {
  initialCategory?: string;
  initialPreview?: string;
  seedCats?: CatMap[];
  catalog?: CatCard[];
};

export function CatIndexPage({
  initialCategory,
  initialPreview,
  seedCats = [],
  catalog = [],
}: CatIndexPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [subFilter, setSubFilter] = useState<CatSubFilter>("all");

  const category = resolveActiveCategory(
    searchParams.get("category") ?? initialCategory,
    searchParams.get("preview") ?? initialPreview,
  );
  const state = resolveCatIndexState(
    searchParams.get("category") ?? initialCategory,
    searchParams.get("preview") ?? initialPreview,
  );

  function selectCategory(next: CatCategorySlug) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("preview");
    if (next === "all") {
      params.delete("category");
    } else {
      params.set("category", next);
    }
    const qs = params.toString();
    router.replace(qs ? `/cat?${qs}` : "/cat", { scroll: false });
    setSubFilter("all");
  }

  const demoMode = isDemoContentModeClient();
  const demo = getCatDemoFixturesSync();
  const useCatalog = !demoMode || catalog.length > 0;

  const pinned = useMemo(() => {
    if (useCatalog) {
      return filterCatCards(
        catalog.filter((card) => card.urgency === "urgent" || card.urgency === "vital"),
        query,
        subFilter,
      );
    }
    const cards = (demo?.PINNED_CATS ?? []).map((card) =>
      overlaySeedReview(card, seedCats),
    );
    return cards.filter((card) =>
      matchesCatQuery(
        [card.title, card.meta, card.statusLabel].filter(Boolean).join(" "),
        query,
      ),
    );
  }, [catalog, demo, query, seedCats, subFilter, useCatalog]);

  const latest = useMemo(() => {
    if (useCatalog) {
      return filterCatCards(catalog, query, subFilter)
        .slice(0, 12)
        .map((card) => ({
          id: card.id,
          slug: card.slug,
          title: card.title,
          meta: card.meta ?? "",
          statusLabel: card.statusLabel ?? "",
          href: card.href,
        }));
    }
    return (demo?.LATEST_CAT_UPDATES ?? []).filter((item) =>
      matchesCatQuery(`${item.title} ${item.meta} ${item.statusLabel}`, query),
    );
  }, [catalog, demo, query, subFilter, useCatalog]);

  const emergencyCards = useMemo(() => {
    if (useCatalog) {
      return filterCatCards(
        catalog.filter((card) => card.urgency === "urgent" || card.urgency === "vital"),
        query,
        subFilter,
      );
    }
    return filterCatCards(
      (demo?.EMERGENCY_CATS ?? []).map((card) => overlaySeedReview(card, seedCats)),
      query,
      subFilter,
    );
  }, [catalog, demo, query, seedCats, subFilter, useCatalog]);

  const generalEmpty =
    Boolean(query.trim()) &&
    pinned.length === 0 &&
    latest.length === 0 &&
    (!useCatalog || filterCatCards(catalog, query, subFilter).length === 0);

  const generalChips = useMemo(
    () => generalFilterChipsForCatalog(useCatalog ? catalog : []),
    [catalog, useCatalog],
  );

  return (
    <AppShell
      title="Conduites À Tenir"
      navVariant="text"
      frameClassName="max-w-[390px]"
      avatarDot
      contentClassName="pb-[calc(96px+env(safe-area-inset-bottom,0px))]"
      headerActions={
        <CatHeader
          onTune={() =>
            document.getElementById("cat-filters")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
        />
      }
    >
      {state === "general" ? (
        <div className="flex flex-col gap-5 pt-2">
          <CatModuleIdentity catalogCount={useCatalog ? catalog.length : 0} />
          <CatSearchBar
            value={query}
            onChange={setQuery}
            placeholder="Rechercher une CAT (ex: douleur thoracique...)"
            showClear
          />
          <CatFilterChips
            chips={generalChips}
            active={category}
            onSelect={selectCategory}
          />
          {catalog.length === 0 && !demoMode ? (
            <CatEmptyInlineState
              title="Aucune CAT disponible"
              subtitle="Le référentiel sera enrichi au fur et à mesure des imports."
            />
          ) : generalEmpty ? (
            <CatEmptyInlineState
              title="Aucune CAT trouvée"
              subtitle="Vérifiez l'orthographe ou basculez vers la vue complète des CAT."
            />
          ) : (
            <>
              <CatPinnedSection cards={pinned} />
              <CatLatestSection updates={latest} />
            </>
          )}
          {demoMode && demo ? (
            <CatContextGrid contexts={demo.CAT_CONTEXTS} />
          ) : null}
          {demoMode ? <CatOfflineCallout /> : null}
        </div>
      ) : null}

      {state === "urgences" ? (
        <div className="pt-2">
          <CatUrgencesView
            query={query}
            onQueryChange={setQuery}
            category={category}
            onCategoryChange={selectCategory}
            subFilter={subFilter}
            onSubFilterChange={setSubFilter}
            cards={emergencyCards}
          />
        </div>
      ) : null}

      {state === "preparation" ? (
        <div className="pt-2">
          <CatPreparationView
            query={query}
            onQueryChange={setQuery}
            category={category}
            onCategoryChange={selectCategory}
          />
        </div>
      ) : null}
    </AppShell>
  );
}
