"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RefObject } from "react";

type SearchInputBarProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  variant?: "hero" | "dock" | "compact";
  inputRef?: RefObject<HTMLInputElement | null>;
};

export function SearchInputBar({
  value,
  onChange,
  onClear,
  placeholder,
  variant = "hero",
  inputRef,
}: SearchInputBarProps) {
  const compact = variant === "compact";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl bg-surface-container px-3 shadow-sm focus-within:bg-surface-container-lowest focus-within:shadow-md",
        compact ? "h-11" : "h-12",
      )}
    >
      <Search className="size-4 shrink-0 text-on-surface-variant" strokeWidth={1.75} />
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Recherche"
        className="h-full min-w-0 flex-1 bg-transparent text-body-md outline-none placeholder:text-on-surface-variant"
      />
      {value ? (
        <button
          type="button"
          aria-label="Effacer la recherche"
          onClick={onClear}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-surface-variant text-on-surface"
        >
          <X className="size-4" strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  );
}
