"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import Link from "next/link";
import { Mic, ScanLine, Search, SlidersHorizontal } from "lucide-react";
import type { HomeMode, SearchChip } from "@/types/home";

type HomeSearchBarProps = {
  mode: HomeMode;
  chips: SearchChip[];
};

export function HomeSearchBar({ mode, chips }: HomeSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const pro = mode === "pro-practitioner";
  const placeholder = pro
    ? "Recherche rapide (CAT, DCI, Scores, Interactions)..."
    : "Rechercher CAT, médicament, score…";

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = query.trim();
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  }

  return (
    <section className="flex flex-col gap-2.5">
      <form
        onSubmit={onSubmit}
        className="flex h-12 items-center gap-2 rounded-xl bg-surface-container-low px-3"
      >
        {pro ? (
          <Search className="size-4 shrink-0 text-on-surface-variant" strokeWidth={1.75} />
        ) : null}
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-body-md outline-none placeholder:text-on-surface-variant"
        />
        {pro ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Dictée"
              className="flex size-8 items-center justify-center rounded-full text-on-surface-variant"
            >
              <Mic className="size-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label="Scanner un document"
              className="flex size-8 items-center justify-center rounded-full text-on-surface-variant"
            >
              <ScanLine className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        ) : mode === "freemium-complete" ? (
          <Link
            href="/search"
            aria-label="Filtres"
            className="flex size-8 items-center justify-center rounded-full text-on-surface-variant"
          >
            <SlidersHorizontal className="size-4" strokeWidth={1.75} />
          </Link>
        ) : (
          <button
            type="button"
            aria-label="Dictée"
            className="flex size-8 items-center justify-center rounded-full text-on-surface-variant"
          >
            <Mic className="size-4" strokeWidth={1.75} />
          </button>
        )}
      </form>
      {chips.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {chips.map((chip) => (
            <Link
              key={chip.id}
              href={chip.href}
              className={
                chip.active
                  ? "rounded-full bg-primary px-3 py-1.5 text-label-md text-on-primary"
                  : "rounded-full bg-surface-container-high px-3 py-1.5 text-label-md text-on-surface"
              }
            >
              {chip.label}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
