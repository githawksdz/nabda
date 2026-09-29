import Link from "next/link";
import { SearchResultList } from "./SearchResultCard";
import { cn } from "@/lib/utils";
import type { SearchResultGroup } from "@/types/search";

type SearchResultGroupProps = {
  group: SearchResultGroup;
  visitedKeys?: string[];
};

export function SearchResultGroupSection({
  group,
  visitedKeys = [],
}: SearchResultGroupProps) {
  return (
    <section aria-labelledby={`search-group-${group.id}`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <span
            className={cn(
              "mt-2 size-1.5 shrink-0 rounded-full",
              group.dotClassName ?? "bg-primary",
            )}
            aria-hidden
          />
          <div className="min-w-0">
            <h2
              id={`search-group-${group.id}`}
              className="text-label-md text-text-primary"
            >
              {group.title}
            </h2>
            {group.subtitle && !group.seeAllHref ? (
              <p className="text-label-sm text-text-secondary">{group.subtitle}</p>
            ) : null}
          </div>
        </div>
        {group.seeAllHref ? (
          <Link
            href={group.seeAllHref}
            className="shrink-0 text-label-sm text-text-secondary underline-offset-2 hover:underline"
          >
            {group.seeAllLabel ?? group.subtitle}
          </Link>
        ) : null}
      </div>
      <ul className="flex min-w-0 flex-col gap-1.5">
        <SearchResultList results={group.results} visitedKeys={visitedKeys} />
      </ul>
    </section>
  );
}
