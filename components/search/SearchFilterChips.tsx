"use client";

import type { FilterChip, SearchFilter } from "@/types/search";
import { cn } from "@/lib/utils";

type SearchFilterChipsProps = {
  chips: FilterChip[];
  active: SearchFilter;
  onSelect: (id: SearchFilter) => void;
};

export function SearchFilterChips({
  chips,
  active,
  onSelect,
}: SearchFilterChipsProps) {
  return (
    <div
      id="search-filters"
      className="sticky top-[calc(64px+env(safe-area-inset-top,0px))] z-30 -mx-4 bg-background/90 px-4 py-2 backdrop-blur-xl"
    >
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {chips.map((chip) => {
          const id = chip.id as SearchFilter;
          const isActive = active === id;
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(id)}
              className={cn(
                "flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-label-md",
                isActive
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant",
              )}
            >
              {chip.label}
              {chip.count != null ? (
                <span
                  className={cn(
                    "flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-[13px]",
                    isActive
                      ? "bg-on-primary text-primary"
                      : "bg-surface-container-high text-on-surface",
                  )}
                >
                  {chip.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
