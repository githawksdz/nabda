"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { PersonalEmptyState } from "@/components/personal/PersonalEmptyState";
import { PersonalFilterChips } from "@/components/personal/PersonalFilterChips";
import { FavoritesList } from "./FavoritesList";
import { FavoritesUtilityFooter } from "./FavoritesUtilityFooter";
import {
  FAVORITE_FILTER_CHIPS,
  FAVORITES_COPY,
} from "@/lib/personal/personal-ui-config";
import { chipsWithCounts, filterPersonalItems } from "@/lib/personal/personal-mappers";
import type { FavoriteItem, PersonalFilterId } from "@/types/personal";

type FavoritesPageProps = {
  items: FavoriteItem[];
};

export function FavoritesPage({ items }: FavoritesPageProps) {
  const [filter, setFilter] = useState<PersonalFilterId>("all");
  const chips = useMemo(() => chipsWithCounts(FAVORITE_FILTER_CHIPS, items), [items]);
  const visible = useMemo(
    () => filterPersonalItems(items, filter),
    [filter, items],
  );
  const isEmpty = items.length === 0;
  const filterEmpty = !isEmpty && visible.length === 0;

  return (
    <AppShell
      title={FAVORITES_COPY.title}
      navVariant="text"
      frameClassName="max-w-[390px]"
    >
      <div className="flex flex-col gap-5 pt-2">
        <section className="flex flex-col gap-1">
          <h2 className="text-headline-lg">{FAVORITES_COPY.title}</h2>
          <p className="text-body-md text-on-surface-variant">
            {FAVORITES_COPY.subtitle}
          </p>
        </section>

        <PersonalFilterChips
          chips={chips}
          active={filter}
          onSelect={setFilter}
        />

        {isEmpty ? (
          <PersonalEmptyState
            title={FAVORITES_COPY.emptyTitle}
            description={FAVORITES_COPY.emptyDescription}
            href={FAVORITES_COPY.emptyHref}
            actionLabel={FAVORITES_COPY.emptyAction}
            icon="bookmark"
          />
        ) : filterEmpty ? (
          <PersonalEmptyState
            title="Aucun favori dans ce filtre"
            description="Essayez un autre type de contenu ou réaffichez toutes vos références."
            actionLabel="Voir tous les favoris"
            icon="bookmark"
            onAction={() => setFilter("all")}
          />
        ) : (
          <FavoritesList items={visible} />
        )}

        <FavoritesUtilityFooter />
      </div>
    </AppShell>
  );
}
