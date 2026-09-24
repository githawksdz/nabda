"use client";

import { cn } from "@/lib/utils";
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
    <div
      id="cat-filters"
      className="sticky top-[calc(64px+env(safe-area-inset-top,0px))] z-30 -mx-4 bg-background/90 px-4 py-2 backdrop-blur-xl"
    >
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {chips.map((chip) => {
          const isActive = active === chip.id;
          const baseLabel = chip.label.replace(/\s*\(\d+\)\s*$/, "");
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(chip.id)}
              className={cn(
                "flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-label-md",
                isActive
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
              )}
            >
              {variant === "preparation" && isActive ? (
                <span className="size-1.5 rounded-full bg-on-primary opacity-80" />
              ) : null}
              {variant === "urgences" && isActive && chip.id === "urgences" ? (
                <span className="size-1.5 rounded-full bg-error-container" />
              ) : null}
              {baseLabel}
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
