"use client";

import { cn } from "@/lib/utils";
import type { GlasgowOption } from "@/types/calculators";

type GlasgowOptionGroupProps = {
  label: string;
  max: number;
  options: GlasgowOption[];
  value: number;
  onChange: (value: number) => void;
};

export function GlasgowOptionGroup({
  label,
  max,
  options,
  value,
  onChange,
}: GlasgowOptionGroupProps) {
  const columns = options.length === 4 ? "grid-cols-4" : "grid-cols-3";

  return (
    <section>
      <div className="mb-2 flex items-end justify-between gap-2">
        <h2 className="text-headline-sm">{label}</h2>
        <span className="text-label-sm text-on-surface-variant">
          {value}/{max}
        </span>
      </div>
      <div
        role="radiogroup"
        aria-label={label}
        className={cn("grid gap-1.5", columns)}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={option.ariaLabel}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex min-h-[56px] flex-col items-center justify-center rounded-xl px-1 py-1.5 text-center active:scale-[0.98]",
                selected
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-on-surface-variant",
              )}
            >
              <span className="text-label-md font-medium">{option.value}</span>
              <span className="text-label-sm leading-tight">{option.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
