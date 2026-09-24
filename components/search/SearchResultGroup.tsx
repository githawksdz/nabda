import Link from "next/link";
import { SearchResultCard } from "./SearchResultCard";
import { cn } from "@/lib/utils";
import type { SearchResultGroup } from "@/types/search";

type SearchResultGroupProps = {
  group: SearchResultGroup;
};

export function SearchResultGroupSection({ group }: SearchResultGroupProps) {
  return (
    <section>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span
            className={cn(
              "mt-1.5 size-1.5 shrink-0 rounded-full",
              group.dotClassName ?? "bg-primary",
            )}
          />
          <div>
            <h2 className="text-headline-sm">{group.title}</h2>
            {group.subtitle && !group.seeAllHref ? (
              <p className="text-label-sm text-on-surface-variant">{group.subtitle}</p>
            ) : null}
          </div>
        </div>
        {group.seeAllHref ? (
          <Link
            href={group.seeAllHref}
            className="text-label-md text-on-surface-variant"
          >
            {group.seeAllLabel ?? group.subtitle}
          </Link>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        {group.results.map((result) => (
          <SearchResultCard key={result.id} result={result} />
        ))}
      </div>
    </section>
  );
}
