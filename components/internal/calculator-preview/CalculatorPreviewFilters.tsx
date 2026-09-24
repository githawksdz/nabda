"use client";

import { cn } from "@/lib/utils";
import {
  CALCULATOR_FILTERS,
  CALCULATOR_GROUP_OPTIONS,
} from "@/lib/internal/calculator-preview-ui";
import type {
  CalculatorPreviewFilter,
  CalculatorPreviewGroupBy,
} from "@/types/internal-preview";

type CalculatorPreviewFiltersProps = {
  filter: CalculatorPreviewFilter;
  groupBy: CalculatorPreviewGroupBy;
  onFilterChange: (filter: CalculatorPreviewFilter) => void;
  onGroupByChange: (groupBy: CalculatorPreviewGroupBy) => void;
};

export function CalculatorPreviewFilters({
  filter,
  groupBy,
  onFilterChange,
  onGroupByChange,
}: CalculatorPreviewFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {CALCULATOR_FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onFilterChange(item.id)}
            className={cn(
              "h-9 shrink-0 rounded-full px-3 text-label-md",
              filter === item.id
                ? "bg-primary text-on-primary"
                : "bg-surface-container-low text-on-surface-variant",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {CALCULATOR_GROUP_OPTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onGroupByChange(item.id)}
            className={cn(
              "h-9 flex-1 rounded-full text-label-sm",
              groupBy === item.id
                ? "bg-secondary-container text-on-secondary-container"
                : "bg-surface-container-low text-on-surface-variant",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
