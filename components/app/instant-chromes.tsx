"use client";

import { PageSkeleton } from "@/components/ui/Skeleton";
import { INITIAL_FILTERS } from "@/lib/search/search-ui-constants";

export const INSTANT_INDEX_HREFS = [
  "/home",
  "/search",
  "/history",
  "/favorites",
  "/protocols",
  "/drugs",
  "/calculators",
  "/offline",
] as const;

export type InstantIndexHref = (typeof INSTANT_INDEX_HREFS)[number];

export function isInstantIndexHref(pathname: string): pathname is InstantIndexHref {
  return (INSTANT_INDEX_HREFS as readonly string[]).includes(pathname);
}

function ListChrome({ label }: { label: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-4 pt-2">
      <div className="h-[var(--size-input)] rounded-[var(--radius-control)] bg-surface-container" />
      <PageSkeleton variant="list" label={label} />
    </div>
  );
}

export function SearchIndexChrome() {
  return (
    <div className="flex min-w-0 flex-col gap-4 pt-2">
      <div
        className="h-[var(--size-input)] rounded-[var(--radius-control)] bg-surface-container"
        aria-hidden
      />
      <div className="flex gap-2 overflow-hidden">
        {INITIAL_FILTERS.map((chip) => (
          <span
            key={chip.id}
            className="h-8 min-w-16 rounded-full bg-surface-muted"
            aria-hidden
          />
        ))}
      </div>
      <PageSkeleton variant="list" label="Chargement de la recherche…" />
    </div>
  );
}

export function HomeIndexChrome() {
  return (
    <div className="layout-reading flex flex-col gap-6 pt-1">
      <div className="flex flex-col gap-2">
        <div className="h-9 w-40 rounded-md bg-surface-muted" />
        <div className="h-4 w-24 rounded-md bg-surface-muted" />
      </div>
      <PageSkeleton variant="page" label="Chargement de l’accueil…" />
    </div>
  );
}

export function InstantIndexChrome({ href }: { href: string }) {
  if (href === "/search") return <SearchIndexChrome />;
  if (href === "/home") return <HomeIndexChrome />;
  if (href === "/offline") {
    return <ListChrome label="Chargement du hors-ligne…" />;
  }
  if (href === "/history") {
    return <ListChrome label="Chargement des récents…" />;
  }
  if (href === "/favorites") {
    return <ListChrome label="Chargement des favoris…" />;
  }
  if (href === "/protocols") {
    return <ListChrome label="Chargement des protocoles…" />;
  }
  if (href === "/drugs") {
    return <ListChrome label="Chargement des médicaments…" />;
  }
  if (href === "/calculators") {
    return <ListChrome label="Chargement des scores…" />;
  }
  return <PageSkeleton variant="page" label="Chargement…" />;
}
