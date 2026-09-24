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
        <TrendingUp className="size-4 text-on-surface-variant" strokeWidth={1.75} />
        <h2 className="text-headline-sm">Recherches fréquentes</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => onSelect(chip)}
            className="h-8 rounded-lg bg-surface-container-low px-3 text-body-sm text-on-surface-variant active:scale-95"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </section>
  );
}
