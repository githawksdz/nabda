"use client";

import { X } from "lucide-react";
import { CatIcon } from "./cat-icons";

type CatSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  showClear?: boolean;
};

export function CatSearchBar({
  value,
  onChange,
  placeholder,
  showClear = false,
}: CatSearchBarProps) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-xl bg-surface-container-low px-3 focus-within:bg-surface-container-lowest">
      <CatIcon name="search" className="size-4 shrink-0 text-on-surface-variant" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent text-body-md outline-none placeholder:text-on-surface-variant"
      />
      {showClear && value ? (
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
