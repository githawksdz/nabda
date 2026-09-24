"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { StatusChip } from "@/components/content-detail/StatusChip";
import { groupAdverseEffectRows } from "@/lib/content-rendering/drug";
import type { DrugRenderTable } from "@/types/content-rendering-drug";

type DrugAdverseEffectAccordionProps = {
  table: DrugRenderTable;
};

export function DrugAdverseEffectAccordion({ table }: DrugAdverseEffectAccordionProps) {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => groupAdverseEffectRows(table), [table]);
  const searchable = table.rowCount >= 20 || table.rows.length >= 20;
  const filtered = useMemo(() => {
    const folded = query.trim().toLowerCase();
    if (!folded) return groups;
    return groups
      .map((group) => ({
        ...group,
        rows: group.rows.filter((row) => row.join(" ").toLowerCase().includes(folded)),
      }))
      .filter((group) => group.rows.length > 0 || group.title.toLowerCase().includes(folded));
  }, [groups, query]);

  return (
    <div className="flex flex-col gap-2">
      {searchable ? (
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filtrer les effets indésirables"
          className="h-11 rounded-xl bg-surface-container-low px-3 text-body-md"
        />
      ) : null}
      {filtered.map((group) => (
        <details key={group.title} className="group rounded-xl bg-surface-container-low p-3">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0">
              <span className="block text-body-md font-medium">{group.title}</span>
              {group.frequency ? (
                <span className="mt-1 inline-block">
                  <StatusChip label={group.frequency} variant="soft" />
                </span>
              ) : null}
            </span>
            <ChevronDown className="size-4 shrink-0 text-outline group-open:rotate-180" />
          </summary>
          <ul className="mt-3 flex flex-col gap-2">
            {group.rows.map((row, index) => (
              <li
                key={`${group.title}-${index}`}
                className="rounded-lg bg-surface-container-lowest p-3 text-body-sm"
              >
                {row.filter(Boolean).join(" · ")}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
