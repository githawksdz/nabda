import Link from "next/link";
import type { SearchResult } from "@/types/search";

type SearchResultCardProps = {
  result: SearchResult;
};

export function SearchResultCard({ result }: SearchResultCardProps) {
  return (
    <Link
      href={result.href}
      className="block space-y-2 rounded-xl bg-surface-container-lowest p-4 shadow-sm"
    >
      <span className="block text-body-md font-medium">{result.title}</span>
      {result.statusLabel || result.extraLabel ? (
        <span className="flex flex-wrap gap-1.5">
          {result.statusLabel ? (
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
              {result.statusLabel}
            </span>
          ) : null}
          {result.extraLabel ? (
            <span className="text-label-sm text-on-surface-variant">
              {result.extraLabel}
            </span>
          ) : null}
        </span>
      ) : null}
      {result.description ? (
        <span className="block text-body-sm text-on-surface-variant">
          {result.description}
        </span>
      ) : null}
      {result.badge ? (
        <span className="inline-flex rounded-lg bg-surface-container px-2 py-1 text-label-sm">
          {result.badge}
        </span>
      ) : null}
      {result.warning ? (
        <span className="block text-label-sm text-error">{result.warning}</span>
      ) : null}
      {result.footer ? (
        <span className="block text-label-sm text-on-surface-variant">
          {result.footer}
        </span>
      ) : null}
    </Link>
  );
}
