"use client";

import { cn } from "@/lib/utils";
import { useDebouncedAnnouncement } from "@/components/ui/useDebouncedAnnouncement";
import type { GlasgowInterpretation } from "@/types/calculators";

type GlasgowResultCardProps = {
  interpretation: GlasgowInterpretation;
};

export function GlasgowResultCard({ interpretation }: GlasgowResultCardProps) {
  const pills = interpretation.formula.split(" ");
  const announcement = useDebouncedAnnouncement(
    `Score total ${interpretation.fraction}, ${interpretation.label}`,
  );

  return (
    <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <p className="text-label-sm text-on-surface-variant">Score total</p>
      <p className="mt-1 text-display text-on-surface">{interpretation.fraction}</p>
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
      <p className="mt-1 text-headline-sm">{interpretation.label}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {pills.map((pill) => (
          <span
            key={pill}
            className="rounded-full bg-surface-container-high px-2.5 py-1 text-label-md text-on-surface"
          >
            {pill}
          </span>
        ))}
      </div>
      <p
        className={cn(
          "mt-3 text-body-sm text-on-surface-variant",
          interpretation.severity === "severe" && "text-on-surface",
        )}
      >
        {interpretation.note}
      </p>
      <p className="mt-2 text-label-sm text-on-surface-variant">
        {interpretation.safety}
      </p>
    </section>
  );
}
