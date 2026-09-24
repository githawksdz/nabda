"use client";

import { CatIcon } from "./cat-icons";
import { cn } from "@/lib/utils";
import type { CatEmergencyFilter, CatSubFilter } from "@/types/cat";

type CatEmergencyFilterChipsProps = {
  filters: CatEmergencyFilter[];
  active: CatSubFilter;
  onSelect: (id: CatSubFilter) => void;
};

export function CatEmergencyFilterChips({
  filters,
  active,
  onSelect,
}: CatEmergencyFilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {filters.map((filter) => {
        const isActive = active === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onSelect(filter.id)}
            className={cn(
              "flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-label-sm",
              isActive
                ? "bg-surface-container-highest text-on-surface"
                : "bg-surface-container-low text-on-surface-variant",
            )}
          >
            {filter.alert ? (
              <CatIcon name="alert" className="size-3.5 text-error" />
            ) : null}
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
