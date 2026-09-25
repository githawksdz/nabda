"use client";

import { FilterChip, FilterChipRow } from "@/components/ui/FilterChip";
import type { DrugCategorySlug, DrugFilterChip } from "@/types/drugs";

type DrugCategoryChipsProps = {
  chips: DrugFilterChip[];
  active: DrugCategorySlug;
  onSelect: (id: DrugCategorySlug) => void;
};

export function DrugCategoryChips({
  chips,
  active,
  onSelect,
}: DrugCategoryChipsProps) {
  return (
    <FilterChipRow id="drug-filters" sticky>
      {chips.map((chip) => (
        <FilterChip
          key={chip.id}
          selected={active === chip.id}
          count={chip.count}
          onClick={() => onSelect(chip.id)}
        >
          {chip.label}
        </FilterChip>
      ))}
    </FilterChipRow>
  );
}
