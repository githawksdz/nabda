"use client";

import { Search, X } from "lucide-react";

type DrugSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DrugSearchBar({ value, onChange }: DrugSearchBarProps) {
  return (
    <div className="flex h-[var(--size-input)] items-center gap-2 rounded-xl bg-surface-container-low px-3 shadow-sm focus-within:bg-surface-container-lowest">
      <Search
        className="size-4 shrink-0 text-on-surface-variant"
        strokeWidth={1.75}
      />
      <input
        id="drug-search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Rechercher molécule, classe, marque…"
        aria-label="Rechercher molécule, classe, marque"
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
