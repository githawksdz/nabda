"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { FilterChip } from "@/components/ui/FilterChip";
import { SearchField } from "@/components/ui/TextField";
import type { SearchChip } from "@/types/home";

type HomeSearchBarProps = {
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
    <section className="flex min-w-0 w-full max-w-[var(--layout-reading)] flex-col gap-3">
      <form action="/search" method="get" onSubmit={onSubmit}>
        <SearchField
          name="q"
          value={query}
          onChange={setQuery}
          onClear={() => setQuery("")}
          placeholder={placeholder}
          className="bg-surface-elevated shadow-[var(--shadow-card)]"
        />
      </form>
      {chips.length > 0 ? (
        <nav
          aria-label="Raccourcis"
          className="flex max-w-full gap-2 overflow-x-auto no-scrollbar"
        >
          {chips.map((chip) => (
            <FilterChip key={chip.id} href={chip.href}>
              {chip.label}
            </FilterChip>
          ))}
        </nav>
      ) : null}
    </section>
  );
}
