"use client";

import { FilterChip, FilterChipRow } from "@/components/ui/FilterChip";
import type { CatCategorySlug, CatFilterChip } from "@/types/cat";

type CatFilterChipsProps = {
  chips: CatFilterChip[];
  active: CatCategorySlug;
  onSelect: (id: CatCategorySlug) => void;
  variant?: "general" | "urgences" | "preparation";
};

export function CatFilterChips({
  chips,
  active,
  onSelect,
  variant = "general",
}: CatFilterChipsProps) {
  return (
    <FilterChipRow id="cat-filters" sticky>
      {chips.map((chip) => {
        const isActive = active === chip.id;
        const baseLabel = chip.label.replace(/\s*\(\d+\)\s*$/, "");
        return (
          <FilterChip
            key={chip.id}
            selected={isActive}
            count={chip.count}
            onClick={() => onSelect(chip.id)}
            leading={
              variant === "urgences" && isActive && chip.id === "urgences" ? (
                <span className="size-1.5 rounded-full bg-status-danger-container" />
              ) : null
            }
          >
            {baseLabel}
          </FilterChip>
        );
      })}
    </FilterChipRow>
  );
}
