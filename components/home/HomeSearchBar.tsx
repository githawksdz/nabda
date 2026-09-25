"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { HomeMode, SearchChip } from "@/types/home";

type HomeSearchBarProps = {
  mode: HomeMode;
  chips: SearchChip[];
};

export function HomeSearchBar({ chips }: HomeSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const placeholder = "DCI, marque, CAT, protocole, score…";

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
        <Search className="size-4 shrink-0 text-on-surface-variant" strokeWidth={1.75} aria-hidden />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          aria-label="Recherche"
          className="h-full min-w-0 flex-1 bg-transparent text-body-md outline-none placeholder:text-on-surface-variant"
        />
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
