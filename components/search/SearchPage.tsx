"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { SearchInputBar } from "./SearchInputBar";
import { SearchFilterChips } from "./SearchFilterChips";
import { SearchInitialState } from "./SearchInitialState";
import { SearchGroupedResults } from "./SearchGroupedResults";
import { SearchMedicationResults } from "./SearchMedicationResults";
import { SearchZeroState } from "./SearchZeroState";
import { searchContent } from "@/features/content/api";
import {
  DRUG_FILTERS,
  GROUPED_FILTERS,
  INITIAL_FILTERS,
  ZERO_FILTERS,
} from "@/lib/search/search-ui-constants";
import { isDemoContentModeClient } from "@/lib/content-data/content-source-mode";
import { getSearchDemoFixturesSync } from "@/lib/demo-fixtures/load";
import {
  groupSearchResults,
  identityToMedicationSearchResult,
  mergeMedicationResults,
  mergeSearchGroups,
} from "@/lib/search/search-result-mappers";
import {
  chipsWithCounts,
  countsFromGroups,
  filterGroupedResults,
  isAmoxQuery,
  isDouleurQuery,
  parseSearchFilter,
  resolveSearchScreen,
  searchResultsToMedication,
} from "@/lib/search/resolve-search";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { FrequentSearchChip, SearchFilter, SearchResult } from "@/types/search";

type SearchPageProps = {
  initialQuery?: string;
  initialFilter?: string;
};

export function SearchPage({
  initialQuery = "",
  initialFilter = "all",
}: SearchPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<SearchFilter>(
    parseSearchFilter(initialFilter),
  );
  const [recentsCleared, setRecentsCleared] = useState(false);
  const [suggested, setSuggested] = useState(false);
  const [suggestedQuery, setSuggestedQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [identity, setIdentity] = useState<{
    query: string;
    results: SearchResult[];
  } | null>(null);

  const screen = resolveSearchScreen(query, filter);
  const demoMode = isDemoContentModeClient();
  const demo = demoMode ? getSearchDemoFixturesSync() : null;
  const demoQuery =
    demoMode && (isDouleurQuery(query) || isAmoxQuery(query));
  const needsLookup =
    Boolean(query.trim()) && screen !== "initial" && screen !== "zero";
  const identityResults = useMemo(
    () => (identity?.query === query.trim() ? identity.results : []),
    [query, identity],
  );
  const loading = needsLookup && !demoQuery && identity?.query !== query.trim();
  const douleurGroupsSource = useMemo(
    () => demo?.DOULEUR_GROUPS ?? [],
    [demo],
  );
  const amoxMedications = useMemo(
    () => demo?.AMOX_MEDICATIONS ?? [],
    [demo],
  );

  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    const urlFilter = parseSearchFilter(searchParams.get("type"));
    if (document.activeElement === inputRef.current) {
      return;
    }
    setQuery(urlQuery);
    setFilter(urlFilter);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (filter !== "all") params.set("type", filter);
    const next = params.toString();
    const current = searchParams.toString();
    if (next === current) {
      return;
    }
    const timer = window.setTimeout(() => {
      router.replace(next ? `/search?${next}` : "/search", { scroll: false });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [filter, query, router, searchParams]);

  useEffect(() => {
    if (!needsLookup) {
      return;
    }

    const trimmed = query.trim();
    let cancelled = false;

    const run = async () => {
      try {
        if (!isSupabaseConfigured()) {
          if (!cancelled) {
            setIdentity({ query: trimmed, results: [] });
          }
          return;
        }
        const rows = await searchContent(query, { type: filter });
        if (!cancelled) {
          setIdentity({ query: trimmed, results: rows });
        }
      } catch (error) {
        console.warn("searchContent failed.", error);
        if (!cancelled) {
          setIdentity({ query: trimmed, results: [] });
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [filter, needsLookup, query]);

  const clearQuery = useCallback(() => {
    setQuery("");
    setNotice(null);
    setSuggested(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
  }, []);

  const douleurGroups = useMemo(
    () =>
      demoMode ? filterGroupedResults(douleurGroupsSource, filter) : [],
    [demoMode, douleurGroupsSource, filter],
  );
  const identityGroups = useMemo(
    () => groupSearchResults(identityResults, filter),
    [filter, identityResults],
  );
  const grouped =
    demoQuery && isDouleurQuery(query)
      ? mergeSearchGroups(douleurGroups, identityGroups)
      : identityGroups;
  const groupedTotal = grouped.reduce((sum, group) => sum + group.count, 0);
  const identityMedications = identityResults
    .filter((result) => result.type === "drug")
    .map(identityToMedicationSearchResult);
  const medicationResults =
    demoQuery && isAmoxQuery(query)
      ? mergeMedicationResults(amoxMedications, identityMedications)
      : demoQuery && isDouleurQuery(query)
        ? mergeMedicationResults(
            searchResultsToMedication(
              douleurGroupsSource.find((group) => group.id === "drugs")
                ?.results ?? [],
            ),
            identityMedications,
          )
        : identityMedications;

  const visibleScreen =
    loading && needsLookup
      ? screen
      : screen === "results" && groupedTotal === 0
        ? "zero"
        : screen === "drugs" && medicationResults.length === 0
          ? "zero"
          : screen;

  const chips = useMemo(() => {
    if (visibleScreen === "zero") return ZERO_FILTERS;
    if (visibleScreen === "drugs") return DRUG_FILTERS;
    if (visibleScreen === "results" && demoQuery && isDouleurQuery(query)) {
      return GROUPED_FILTERS;
    }
    if (visibleScreen === "results") {
      return chipsWithCounts(INITIAL_FILTERS, countsFromGroups(grouped));
    }
    return INITIAL_FILTERS;
  }, [demoQuery, grouped, query, visibleScreen]);

  const inputVariant =
    visibleScreen === "drugs"
      ? "compact"
      : visibleScreen === "results" || visibleScreen === "zero"
        ? "dock"
        : "hero";

  const placeholder =
    visibleScreen === "drugs"
      ? "Rechercher une DCI, spécialité..."
      : "Rechercher CAT, médicament, score…";

  return (
    <AppShell
      title="Recherche"
      navVariant="text"
      headerActions={
        <button
          type="button"
          aria-label="Filtres"
          onClick={() =>
            document.getElementById("search-filters")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
          className="flex size-11 items-center justify-center rounded-full text-on-surface-variant"
        >
          <SlidersHorizontal className="size-5" strokeWidth={1.75} />
        </button>
      }
    >
      <div className="flex flex-col gap-4 pt-2">
        <SearchInputBar
          value={query}
          onChange={(value) => {
            setQuery(value);
            setSuggested(false);
          }}
          onClear={clearQuery}
          onMic={() => showNotice("Dictée bientôt disponible.")}
          onScan={() => showNotice("Scanner bientôt disponible.")}
          placeholder={placeholder}
          variant={inputVariant}
          inputRef={inputRef}
        />
        {notice ? (
          <p className="text-label-sm text-on-surface-variant">{notice}</p>
        ) : null}

        <SearchFilterChips
          chips={chips}
          active={filter}
          onSelect={setFilter}
        />

        {visibleScreen === "initial" ? (
          <SearchInitialState
            recentsCleared={recentsCleared}
            onClearRecents={() => setRecentsCleared(true)}
            onFrequent={(chip: FrequentSearchChip) => {
              setQuery(chip.query);
              setSuggested(false);
              if (chip.filter) setFilter(chip.filter);
            }}
          />
        ) : null}

        {visibleScreen === "results" ? (
          loading ? (
            <p className="text-body-sm text-on-surface-variant">
              Recherche en cours…
            </p>
          ) : (
            <SearchGroupedResults
              query={query.trim()}
              total={
                demoQuery &&
                isDouleurQuery(query) &&
                filter === "all" &&
                identityResults.length === 0
                  ? 12
                  : groupedTotal
              }
              groups={grouped}
            />
          )
        ) : null}

        {visibleScreen === "drugs" ? (
          loading ? (
            <p className="text-body-sm text-on-surface-variant">
              Recherche en cours…
            </p>
          ) : (
            <SearchMedicationResults
              results={medicationResults}
              totalCount={
                demoQuery &&
                isAmoxQuery(query) &&
                identityMedications.length === 0
                  ? 24
                  : medicationResults.length
              }
            />
          )
        ) : null}

        {visibleScreen === "zero" ? (
          <SearchZeroState
            query={query.trim()}
            suggested={suggested && suggestedQuery === query.trim()}
            onClear={clearQuery}
            onSuggest={() => {
              setSuggested(true);
              setSuggestedQuery(query.trim());
            }}
          />
        ) : null}
      </div>
    </AppShell>
  );
}
