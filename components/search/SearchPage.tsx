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
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { searchContent } from "@/features/content/api";
import { createClient } from "@/lib/supabase/client";
import { contentRepository } from "@/lib/offline/repository";
import {
  DRUG_FILTERS,
  GROUPED_FILTERS,
  INITIAL_FILTERS,
  ZERO_FILTERS,
} from "@/lib/search/search-ui-constants";
import { isDemoContentModeClient } from "@/lib/content-data/content-source-mode";
import { getSearchDemoFixturesSync } from "@/lib/demo-fixtures/load";
import { scrollElementIntoView } from "@/lib/ui/scroll-behavior";
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
import {
  SEARCH_ERROR_HELP,
  SEARCH_ERROR_TITLE,
  SEARCH_LOADING_LABEL,
} from "@/lib/search/search-outcome";
import { SEARCH_FIELD_PLACEHOLDER } from "@/lib/ui/access-status-display";
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
  const [lookupAttempt, setLookupAttempt] = useState(0);
  const [identity, setIdentity] = useState<{
    query: string;
    results: SearchResult[];
    failed: boolean;
  } | null>(null);

  const screen = resolveSearchScreen(query, filter);
  const demoMode = isDemoContentModeClient();
  const demo = demoMode ? getSearchDemoFixturesSync() : null;
  const demoQuery =
    demoMode && (isDouleurQuery(query) || isAmoxQuery(query));
  const needsLookup =
    Boolean(query.trim()) && screen !== "initial" && screen !== "zero";
  const identityMatches = identity?.query === query.trim();
  const identityResults = useMemo(
    () => (identityMatches && !identity?.failed ? identity.results : []),
    [identity, identityMatches],
  );
  const lookupFailed = Boolean(needsLookup && identityMatches && identity?.failed);
  const loading = needsLookup && !identityMatches;
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
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          const rows = user
            ? await contentRepository.searchContent(user.id, trimmed)
            : [];
          if (!cancelled) {
            setIdentity({ query: trimmed, results: rows, failed: false });
          }
          return;
        }
        if (!isSupabaseConfigured()) {
          if (!cancelled) {
            setIdentity({ query: trimmed, results: [], failed: true });
          }
          return;
        }
        const rows = await searchContent(query, { type: filter });
        if (!cancelled) {
          setIdentity({ query: trimmed, results: rows, failed: false });
        }
      } catch (error) {
        console.warn("searchContent failed.", error);
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          const rows = user
            ? await contentRepository.searchContent(user.id, trimmed)
            : [];
          if (!cancelled) {
            if (rows.length > 0) {
              setIdentity({ query: trimmed, results: rows, failed: false });
            } else {
              setIdentity({ query: trimmed, results: [], failed: true });
            }
          }
        } catch {
          if (!cancelled) {
            setIdentity({ query: trimmed, results: [], failed: true });
          }
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [filter, lookupAttempt, needsLookup, query]);

  const clearQuery = useCallback(() => {
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
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

  const requestFailed =
    lookupFailed && groupedTotal === 0 && medicationResults.length === 0;
  const visibleScreen =
    loading && needsLookup
      ? screen
      : requestFailed
        ? "error"
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

  const placeholder = SEARCH_FIELD_PLACEHOLDER;

  return (
    <AppShell
      title="Recherche"
      pageHeading={false}
      navVariant="text"
      headerActions={
        <button
          type="button"
          aria-label="Filtres"
          onClick={() => {
            const filters = document.getElementById("search-filters");
            if (filters) {
              scrollElementIntoView(filters, { block: "start" });
            }
          }}
          className="flex size-11 items-center justify-center rounded-full text-on-surface-variant"
        >
          <SlidersHorizontal className="size-5" strokeWidth={1.75} />
        </button>
      }
    >
      <div className="flex min-w-0 flex-col gap-4 pt-2">
        <h1 className="sr-only">Recherche clinique</h1>
        <SearchInputBar
          value={query}
          onChange={setQuery}
          onClear={clearQuery}
          placeholder={placeholder}
          inputRef={inputRef}
        />
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
              if (chip.filter) setFilter(chip.filter);
            }}
          />
        ) : null}

        {visibleScreen === "results" ? (
          loading ? (
            <LoadingIndicator label={SEARCH_LOADING_LABEL} />
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
            <LoadingIndicator label={SEARCH_LOADING_LABEL} />
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
          <SearchZeroState query={query.trim()} onClear={clearQuery} />
        ) : null}

        {visibleScreen === "error" ? (
          <EmptyState
            headingLevel="h2"
            title={SEARCH_ERROR_TITLE}
            description={SEARCH_ERROR_HELP}
            actionLabel="Réessayer"
            onAction={() => {
              setIdentity(null);
              setLookupAttempt((attempt) => attempt + 1);
            }}
          />
        ) : null}
      </div>
    </AppShell>
  );
}
