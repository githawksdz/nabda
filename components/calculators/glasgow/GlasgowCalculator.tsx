"use client";

import { useMemo } from "react";
import { GlasgowLinkedProtocolCard } from "./GlasgowLinkedProtocolCard";
import { GlasgowOptionGroup } from "./GlasgowOptionGroup";
import { GlasgowResultCard } from "./GlasgowResultCard";
import { measureSync } from "@/lib/calculators/calculator-perf";
import { GLASGOW_GROUPS, interpretGlasgow } from "@/lib/calculators/glasgow";
import type { GlasgowAxis, GlasgowSelection } from "@/types/calculators";

type GlasgowCalculatorProps = {
  selection: GlasgowSelection;
  onChange: (selection: GlasgowSelection) => void;
  onReset: () => void;
};

export function GlasgowCalculator({
  selection,
  onChange,
  onReset,
}: GlasgowCalculatorProps) {
  const interpretation = useMemo(
    () =>
      measureSync("glasgow-coma-scale-score-gcs", () => interpretGlasgow(selection)),
    [selection],
  );

  function updateAxis(axis: GlasgowAxis, value: number) {
    onChange({ ...selection, [axis]: value });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          {GLASGOW_GROUPS.map((group) => (
            <GlasgowOptionGroup
              key={group.axis}
              label={group.label}
              max={group.max}
              options={group.options}
              value={selection[group.axis]}
              onChange={(value) => updateAxis(group.axis, value)}
            />
          ))}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-surface-container-low text-label-md text-on-surface"
          >
            Réinitialiser E4 V5 M6
          </button>
        </div>
        <div className="lg:sticky lg:top-[calc(72px+env(safe-area-inset-top,0px))]">
          <GlasgowResultCard interpretation={interpretation} />
        </div>
      </div>
      <GlasgowLinkedProtocolCard />
    </div>
  );
}
