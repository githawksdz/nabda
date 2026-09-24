"use client";

import Link from "next/link";
import { ArrowLeft, Bookmark, BookmarkCheck, Search, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentTypeLabel } from "@/types/content-detail";

// TODO: DrugDetailHeader and CalculatorDetailHeader share this translucent
// back/title/actions chrome. Extract a shared DetailChrome only if CAT,
// Recommandation, Médicament and Calculateur can keep independent eyebrows.

type DetailHeaderProps = {
  contentType: ContentTypeLabel;
  title: string;
  backHref?: string;
  searchHref?: string;
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
  onShare?: () => void;
};

export function DetailHeader({
  contentType,
  title,
  backHref = "/search?type=protocols",
  searchHref = "/search",
  bookmarked = false,
  onToggleBookmark,
  onShare,
}: DetailHeaderProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-1/2 z-50 w-full max-w-[390px] -translate-x-1/2 bg-surface/85 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl",
      )}
    >
      <div className="flex h-16 items-center gap-2 px-4">
        <Link
          href={backHref}
          aria-label="Retour"
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface"
        >
          <ArrowLeft className="size-5" strokeWidth={1.75} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-label-sm text-on-surface-variant">{contentType}</p>
          <p className="truncate text-headline-sm">{title}</p>
        </div>
        {onShare ? (
          <button
            type="button"
            aria-label="Partager"
            onClick={onShare}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant"
          >
            <Share2 className="size-5" strokeWidth={1.75} />
          </button>
        ) : (
          <Link
            href={searchHref}
            aria-label="Recherche"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant"
          >
            <Search className="size-5" strokeWidth={1.75} />
          </Link>
        )}
        {onToggleBookmark ? (
          <button
            type="button"
            aria-label={bookmarked ? "Retirer des favoris" : "Enregistrer"}
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
