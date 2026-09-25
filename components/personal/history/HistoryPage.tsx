"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { PersonalEmptyState } from "@/components/personal/PersonalEmptyState";
import { PersonalFilterChips } from "@/components/personal/PersonalFilterChips";
import { HistoryGroup } from "./HistoryGroup";
import { HistoryPrivacyNotice } from "./HistoryPrivacyNotice";
import { PersonalLibraryTabs } from "@/components/personal/PersonalLibraryTabs";
import { HistoryRetentionFooter } from "./HistoryRetentionFooter";
import {
  HISTORY_COPY,
  HISTORY_FILTER_CHIPS,
} from "@/lib/personal/personal-ui-config";
import {
  chipsWithCounts,
  filterPersonalItems,
  groupHistoryItems,
} from "@/lib/personal/personal-mappers";
import { clearOwnHistory } from "@/lib/personal/personal-actions";
import type {
  HistoryItem,
  PersonalDataSource,
  PersonalFilterId,
} from "@/types/personal";

type HistoryPageProps = {
  items: HistoryItem[];
  source?: PersonalDataSource;
};

export function HistoryPage({ items, source = "mock" }: HistoryPageProps) {
  const [filter, setFilter] = useState<PersonalFilterId>("all");
  const [cleared, setCleared] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);
  const visibleSource = useMemo(
    () => (cleared ? [] : items),
    [cleared, items],
  );
  const chips = useMemo(
    () => chipsWithCounts(HISTORY_FILTER_CHIPS, visibleSource),
    [visibleSource],
  );
  const filtered = useMemo(
    () => filterPersonalItems(visibleSource, filter),
    [filter, visibleSource],
  );
  const groups = useMemo(() => groupHistoryItems(filtered), [filtered]);
  const isEmpty = visibleSource.length === 0;
  const filterEmpty = !isEmpty && filtered.length === 0;

  async function handleClear() {
    setClearError(null);
    if (source !== "db") {
      setCleared(true);
      setFilter("all");
      return true;
    }

    const result = await clearOwnHistory();
    if (result.ok) {
      setCleared(true);
      setFilter("all");
      return true;
    }

    setClearError(result.message ?? HISTORY_COPY.clearError);
    return false;
  }

  return (
    <AppShell title={HISTORY_COPY.title} navVariant="text" pageHeading={false}>
      <div className="flex flex-col gap-5 pt-2">
        <section className="flex flex-col gap-1">
          <h1 className="text-headline-lg">{HISTORY_COPY.title}</h1>
          <p className="text-body-md text-on-surface-variant">
            {HISTORY_COPY.subtitle}
          </p>
        </section>

        <PersonalLibraryTabs />

        <HistoryPrivacyNotice />

        <PersonalFilterChips
          chips={chips}
          active={filter}
          onSelect={setFilter}
        />

        {isEmpty ? (
          <PersonalEmptyState
            title={HISTORY_COPY.emptyTitle}
            description={HISTORY_COPY.emptyDescription}
            href={HISTORY_COPY.emptyHref}
            actionLabel={HISTORY_COPY.emptyAction}
            icon="history"
          />
        ) : filterEmpty ? (
          <PersonalEmptyState
            title="Aucune consultation dans ce filtre"
            description="Essayez un autre type de contenu ou réaffichez tout l’historique."
            actionLabel="Voir tout l’historique"
            icon="history"
            onAction={() => setFilter("all")}
          />
        ) : (
          <div className="flex flex-col gap-5">
            {groups.map((group) => (
              <HistoryGroup key={group.id} group={group} />
            ))}
          </div>
        )}

        <HistoryRetentionFooter
          disabled={isEmpty}
          error={clearError}
          onClear={handleClear}
        />
      </div>
    </AppShell>
  );
}
