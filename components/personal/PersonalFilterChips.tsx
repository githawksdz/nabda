"use client";

import { cn } from "@/lib/utils";
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
    <div
      role="toolbar"
      aria-label="Filtres"
      className="flex gap-2 overflow-x-auto no-scrollbar"
    >
      {chips.map((chip) => {
        const isActive = active === chip.id;
        return (
          <button
            key={chip.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(chip.id)}
            className={cn(
              "flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-label-md",
              isActive
                ? "bg-primary text-on-primary"
                : "bg-surface-container-lowest text-on-surface-variant shadow-sm",
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
  );
}
