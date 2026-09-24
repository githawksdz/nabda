"use client";

import { Search, X } from "lucide-react";

type CalculatorSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CalculatorSearchBar({
  value,
  onChange,
}: CalculatorSearchBarProps) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-xl bg-surface-container-low px-3 shadow-sm focus-within:bg-surface-container-lowest">
      <Search
        className="size-4 shrink-0 text-on-surface-variant"
        strokeWidth={1.75}
      />
      <input
        id="calculator-search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Rechercher un score, formule, pathologie..."
        aria-label="Rechercher un score, formule, pathologie"
        className="h-full min-w-0 flex-1 bg-transparent text-body-md outline-none placeholder:text-on-surface-variant"
      />
      {value ? (
        <button
          type="button"
          aria-label="Effacer la recherche"
          onClick={() => onChange("")}
          className="flex size-7 items-center justify-center rounded-full text-on-surface-variant"
        >
          <X className="size-4" strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  );
}
