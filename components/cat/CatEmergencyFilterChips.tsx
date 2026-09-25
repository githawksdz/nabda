"use client";

import { CatIcon } from "./cat-icons";
import { FilterChip, FilterChipRow } from "@/components/ui/FilterChip";
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
    <FilterChipRow label="Filtres d'urgence">
      {filters.map((filter) => (
        <FilterChip
          key={filter.id}
          selected={active === filter.id}
          onClick={() => onSelect(filter.id)}
          leading={
            filter.alert ? (
              <CatIcon name="alert" className="size-3.5 text-status-danger" />
            ) : null
          }
        >
          {filter.label}
        </FilterChip>
      ))}
    </FilterChipRow>
  );
}
