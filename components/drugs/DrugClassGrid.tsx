"use client";

import { DrugIcon } from "./DrugListRow";
import { cn } from "@/lib/utils";
import type { DrugCategorySlug, DrugClassTile } from "@/types/drugs";

type DrugClassGridProps = {
  classes: DrugClassTile[];
  active: DrugCategorySlug;
  onSelect: (slug: DrugCategorySlug) => void;
};

export function DrugClassGrid({
  classes,
  active,
  onSelect,
}: DrugClassGridProps) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-headline-sm">Explorer par classe</h2>
        <span className="text-label-sm text-on-surface-variant">
          {classes.length} classes
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {classes.map((item) => {
          const isActive = active === item.slug;
          return (
            <button
              key={item.slug}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(item.slug)}
              className={cn(
                "flex flex-col items-center rounded-xl bg-surface-container-lowest px-2 py-3 text-center shadow-sm motion-surface",
                isActive && "ring-1 ring-primary",
              )}
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-surface-container-low">
                <DrugIcon
                  name={item.iconName}
                  className="size-4 text-on-surface"
                />
              </span>
              <span className="mt-2 block text-label-md text-on-surface">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
