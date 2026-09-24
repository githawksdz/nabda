"use client";

import Link from "next/link";
import { ArrowLeft, Bookmark, BookmarkCheck } from "lucide-react";

type DrugDetailHeaderProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
};

export function DrugDetailHeader({
  title,
  subtitle = "Médicament",
  backHref = "/drugs",
  bookmarked = false,
  onToggleBookmark,
}: DrugDetailHeaderProps) {
  return (
    <header className="fixed top-0 left-1/2 z-50 w-full max-w-[390px] -translate-x-1/2 bg-surface/85 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 px-4">
        <Link
          href={backHref}
          aria-label="Retour"
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface"
        >
          <ArrowLeft className="size-5" strokeWidth={1.75} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-label-sm text-on-surface-variant">{subtitle}</p>
          <p className="truncate text-headline-sm">{title}</p>
        </div>
        {onToggleBookmark ? (
          <button
            type="button"
            aria-label={bookmarked ? "Retirer des favoris" : "Enregistrer la fiche"}
            aria-pressed={bookmarked}
            onClick={onToggleBookmark}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant"
          >
            {bookmarked ? (
              <BookmarkCheck className="size-5" strokeWidth={1.75} />
            ) : (
              <Bookmark className="size-5" strokeWidth={1.75} />
            )}
          </button>
        ) : null}
      </div>
    </header>
  );
}
