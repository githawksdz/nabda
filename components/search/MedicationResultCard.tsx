"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { Surface } from "@/components/ui/Surface";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  isFavorite,
  toggleFavorite,
} from "@/lib/content-detail/user-content-actions";
import {
  FAVORITE_ADDED_MESSAGE,
  FAVORITE_REMOVED_MESSAGE,
  FAVORITE_SIGN_IN_MESSAGE,
  FAVORITE_WRITE_FAILED_MESSAGE,
} from "@/lib/ui/feedback-timing";
import { reconcileFavorite } from "@/lib/ui/favorite-result";
import { accessLabelToTone } from "@/lib/ui/access-status-display";
import type { MedicationSearchResult } from "@/types/search";

type MedicationResultCardProps = {
  result: MedicationSearchResult;
};

export function MedicationResultCard({ result }: MedicationResultCardProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(() =>
    Boolean(result.slug),
  );
  const [pending, setPending] = useState(false);
  const [emphasisKey, setEmphasisKey] = useState(0);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (!result.slug) {
      return;
    }
    let cancelled = false;
    void (async () => {
      const saved = await isFavorite("drug", result.slug);
      if (!cancelled) {
        setBookmarked(saved);
        setLoadingFavorite(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [result.slug]);

  async function handleBookmarkClick() {
    if (pending || !result.slug) {
      return;
    }
    const previous = bookmarked;
    const next = !bookmarked;
    setBookmarked(next);
    setPending(true);
    try {
      const mutation = await toggleFavorite("drug", result.slug);
      const reconciled = reconcileFavorite(previous, mutation);
      setBookmarked(reconciled.bookmarked);
      switch (reconciled.outcome) {
        case "unauthenticated":
          setAnnouncement(FAVORITE_SIGN_IN_MESSAGE);
          return;
        case "write_failed":
          setAnnouncement(FAVORITE_WRITE_FAILED_MESSAGE);
          return;
        case "saved":
        case "removed":
          setEmphasisKey((value) => value + 1);
          setAnnouncement(
            reconciled.outcome === "saved"
              ? FAVORITE_ADDED_MESSAGE
              : FAVORITE_REMOVED_MESSAGE,
          );
      }
    } finally {
      setPending(false);
    }
  }

  const favoriteLabel = bookmarked ? "Retirer des favoris" : "Ajouter aux favoris";

  return (
    <Surface variant="muted" className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-headline-sm text-text-primary [overflow-wrap:anywhere]">
            {result.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <StatusBadge tone="muted">Médicament</StatusBadge>
            {result.statusChip ? (
              <StatusBadge tone={accessLabelToTone(result.statusChip)}>
                {result.statusChip}
              </StatusBadge>
            ) : null}
            {result.warningChip ? (
              <StatusBadge tone="warning">{result.warningChip}</StatusBadge>
            ) : null}
          </div>
        </div>
        {result.slug ? (
          <button
            type="button"
            aria-label={favoriteLabel}
            aria-pressed={bookmarked}
            aria-busy={pending || loadingFavorite}
            disabled={pending || loadingFavorite}
            onClick={() => void handleBookmarkClick()}
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-surface-container disabled:opacity-50"
          >
            <Bookmark
              key={emphasisKey}
              className={emphasisKey ? "motion-emphasis size-4" : "size-4"}
              strokeWidth={1.75}
              fill={bookmarked ? "currentColor" : "none"}
              aria-hidden
            />
          </button>
        ) : null}
      </div>
      <p
        className="sr-only"
        role={announcement === FAVORITE_WRITE_FAILED_MESSAGE ? "alert" : "status"}
        aria-live={
          announcement === FAVORITE_WRITE_FAILED_MESSAGE ? "assertive" : "polite"
        }
      >
        {announcement}
      </p>
      <p className="text-body-sm text-text-secondary [overflow-wrap:anywhere]">
        {result.subtitle}
      </p>
      <Surface variant="elevated" className="p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-label-md text-text-primary">{result.infoLabel}</p>
          {result.infoMeta ? (
            <p className="text-label-sm text-text-secondary">{result.infoMeta}</p>
          ) : null}
        </div>
        <p className="mt-1 text-body-sm text-text-secondary [overflow-wrap:anywhere]">
          {result.infoText}
        </p>
      </Surface>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {result.footerText ? (
          <p className="text-label-sm text-text-muted">{result.footerText}</p>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap gap-1.5">
          {result.actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={
                action.variant === "secondary"
                  ? "inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-surface-container px-3 text-label-md text-text-primary"
                  : "inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-action-primary px-3 text-label-md text-text-inverse"
              }
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </Surface>
  );
}
