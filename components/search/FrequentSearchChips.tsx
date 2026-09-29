"use client";

import type { FrequentSearchChip } from "@/types/search";
import { TrendingUp } from "lucide-react";

type FrequentSearchChipsProps = {
  chips: FrequentSearchChip[];
  onSelect: (chip: FrequentSearchChip) => void;
};

export function FrequentSearchChips({ chips, onSelect }: FrequentSearchChipsProps) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-1.5">
        <TrendingUp className="size-3.5 text-on-surface-variant" strokeWidth={1.75} />
        <h2 className="text-label-md text-on-surface">Recherches fréquentes</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => onSelect(chip)}
            className="motion-color h-7 rounded-full bg-surface-container-low px-2.5 text-[10px] leading-3 font-medium text-on-surface-variant active:bg-surface-container"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </section>
  );
}
