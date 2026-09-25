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
        className={cn("grid grid-cols-2 gap-1.5 sm:grid-cols-3", options.length === 4 && "sm:grid-cols-4")}
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
                "motion-color flex min-h-11 flex-col items-center justify-center rounded-[var(--radius-control)] px-1 py-1.5 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-primary",
                selected
                  ? "bg-action-primary font-semibold text-text-inverse"
                  : "bg-surface-muted text-text-secondary",
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
