"use client";

import { FilterChip, FilterChipRow } from "@/components/ui/FilterChip";
import type { PersonalFilterChip, PersonalFilterId } from "@/types/personal";

type PersonalFilterChipsProps = {
  chips: PersonalFilterChip[];
  active: PersonalFilterId;
  onSelect: (id: PersonalFilterId) => void;
};

export function PersonalFilterChips({
  chips,
  active,
  onSelect,
}: PersonalFilterChipsProps) {
  return (
    <FilterChipRow label="Filtres">
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
