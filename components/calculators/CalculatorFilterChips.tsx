"use client";

import { FilterChip, FilterChipRow } from "@/components/ui/FilterChip";
import type {
  CalculatorCategorySlug,
  CalculatorFilterChip,
} from "@/types/calculators";

type CalculatorFilterChipsProps = {
  chips: CalculatorFilterChip[];
  active: CalculatorCategorySlug;
  onSelect: (id: CalculatorCategorySlug) => void;
};

export function CalculatorFilterChips({
  chips,
  active,
  onSelect,
}: CalculatorFilterChipsProps) {
  return (
    <FilterChipRow id="calculator-filters" sticky>
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
