"use client";

import { FilterChip, FilterChipRow } from "@/components/ui/FilterChip";
import type { FilterChip as SearchFilterChip, SearchFilter } from "@/types/search";

type SearchFilterChipsProps = {
  chips: SearchFilterChip[];
  active: SearchFilter;
  onSelect: (id: SearchFilter) => void;
};

export function SearchFilterChips({
  chips,
  active,
  onSelect,
}: SearchFilterChipsProps) {
  return (
    <FilterChipRow id="search-filters" sticky edgeFade>
      {chips.map((chip) => {
        const id = chip.id as SearchFilter;
        return (
          <FilterChip
            key={chip.id}
            selected={active === id}
            count={chip.count}
            onClick={() => onSelect(id)}
          >
            {chip.label}
          </FilterChip>
        );
      })}
    </FilterChipRow>
  );
}
