"use client";

import { Mic, ScanLine, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RefObject } from "react";

type SearchInputBarProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onMic: () => void;
  onScan: () => void;
  placeholder: string;
  variant?: "hero" | "dock" | "compact";
  inputRef?: RefObject<HTMLInputElement | null>;
};

export function SearchInputBar({
  value,
  onChange,
  onClear,
  onMic,
  onScan,
  placeholder,
  variant = "hero",
  inputRef,
}: SearchInputBarProps) {
  const compact = variant === "compact";
  const docked = variant === "dock" || compact;

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
        className="h-full min-w-0 flex-1 bg-transparent text-body-md outline-none placeholder:text-on-surface-variant"
      />
      {value ? (
        <button
          type="button"
          aria-label="Effacer la recherche"
          onClick={onClear}
          className="flex size-7 items-center justify-center rounded-full bg-surface-variant text-on-surface"
        >
          <X className="size-4" strokeWidth={1.75} />
        </button>
      ) : null}
      {docked ? (
        <button
          type="button"
          aria-label="Dictée"
          onClick={onMic}
          className="flex size-9 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant"
        >
          <Mic className="size-4" strokeWidth={1.75} />
        </button>
      ) : (
        <>
          <button
            type="button"
            aria-label="Dictée"
            onClick={onMic}
            className="flex size-8 items-center justify-center rounded-full text-on-surface-variant"
          >
            <Mic className="size-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Scanner un document"
            onClick={onScan}
            className="flex size-8 items-center justify-center rounded-full text-on-surface-variant"
          >
            <ScanLine className="size-4" strokeWidth={1.75} />
          </button>
        </>
      )}
    </div>
  );
}
