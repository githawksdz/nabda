"use client";

import { CalculatorIcon } from "./calculator-icons";
import { cn } from "@/lib/utils";
import type {
  CalculatorCategorySlug,
  CalculatorContext,
} from "@/types/calculators";

type CalculatorContextGridProps = {
  contexts: CalculatorContext[];
  active: CalculatorCategorySlug;
  onSelect: (slug: CalculatorCategorySlug) => void;
};

export function CalculatorContextGrid({
  contexts,
  active,
  onSelect,
}: CalculatorContextGridProps) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-headline-sm">Explorer par contexte</h2>
        <span className="text-label-sm text-on-surface-variant">
          {contexts.length} spécialités
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {contexts.map((context) => {
          const isActive = active === context.slug;
          return (
            <button
              key={context.slug}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(context.slug)}
              className={cn(
                "flex flex-col items-center rounded-xl bg-surface-container-lowest px-2 py-3 text-center shadow-sm motion-surface",
                isActive && "ring-1 ring-primary",
              )}
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-surface-container-low">
                <CalculatorIcon
                  name={context.iconName}
                  className="size-4 text-on-surface"
                />
              </span>
              <span className="mt-2 block text-label-md text-on-surface">
                {context.label}
              </span>
              {context.count != null ? (
                <span className="mt-0.5 block text-label-sm text-on-surface-variant">
                  {context.count} scores
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
