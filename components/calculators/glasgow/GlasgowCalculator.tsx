"use client";

import { useMemo } from "react";
import { GlasgowLinkedProtocolCard } from "./GlasgowLinkedProtocolCard";
import { GlasgowOptionGroup } from "./GlasgowOptionGroup";
import { GlasgowResultCard } from "./GlasgowResultCard";
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
    () => interpretGlasgow(selection),
    [selection],
  );

  function updateAxis(axis: GlasgowAxis, value: number) {
    onChange({ ...selection, [axis]: value });
  }

  return (
    <div className="flex flex-col gap-4">
      <GlasgowResultCard interpretation={interpretation} />

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

      <GlasgowLinkedProtocolCard />
    </div>
  );
}
