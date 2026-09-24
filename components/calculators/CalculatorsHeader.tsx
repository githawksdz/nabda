"use client";

import { SlidersHorizontal } from "lucide-react";

type CalculatorsHeaderProps = {
  onTune: () => void;
};

export function CalculatorsHeader({ onTune }: CalculatorsHeaderProps) {
  return (
    <button
      type="button"
      aria-label="Filtres"
      onClick={onTune}
      className="flex size-11 items-center justify-center rounded-full text-on-surface-variant"
    >
      <SlidersHorizontal className="size-5" strokeWidth={1.75} />
    </button>
  );
}
