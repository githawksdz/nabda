"use client";

import { useMemo, useState } from "react";
import { groupInteractionRows } from "@/lib/content-rendering/drug";
import type { DrugRenderTable } from "@/types/content-rendering-drug";

type DrugInteractionListProps = {
  table: DrugRenderTable;
};

export function DrugInteractionList({ table }: DrugInteractionListProps) {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => groupInteractionRows(table), [table]);
  const searchable = table.rowCount >= 20 || table.rows.length >= 20;
  const filtered = useMemo(() => {
    const folded = query.trim().toLowerCase();
    if (!folded) return groups;
    return groups
      .map((group) => ({
        ...group,
        rows: group.rows.filter((row) => row.join(" ").toLowerCase().includes(folded)),
      }))
      .filter((group) => group.rows.length > 0);
  }, [groups, query]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-label-sm text-on-surface-variant">
        Affichage source uniquement. Aucun moteur d&apos;interactions.
      </p>
      {searchable ? (
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filtrer les associations"
          className="h-11 rounded-xl bg-surface-container-low px-3 text-body-md"
        />
      ) : null}
      {filtered.map((group) => (
        <section key={group.id} className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm">
          <h4 className="text-body-md font-medium">{group.label}</h4>
          <ul className="mt-2 flex flex-col gap-2">
            {group.rows.map((row, index) => (
              <li
                key={`${group.id}-${index}`}
                className="rounded-lg bg-surface-container-low p-3 text-body-sm"
              >
                {row.filter(Boolean).join(" · ")}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
