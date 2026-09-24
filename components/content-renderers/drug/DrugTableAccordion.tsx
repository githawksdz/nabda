"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import type { DrugRenderTable } from "@/types/content-rendering-drug";

type DrugTableAccordionProps = {
  table: DrugRenderTable;
  groupBy?: "first-column" | "none";
};

export function DrugTableAccordion({
  table,
  groupBy = "first-column",
}: DrugTableAccordionProps) {
  const groups = useMemo(() => {
    if (groupBy !== "first-column") {
      return [{ title: table.sourceHeading, rows: table.rows }];
    }
    const map = new Map<string, string[][]>();
    for (const row of table.rows) {
      const title = row[0]?.trim() || "Autres";
      const list = map.get(title) ?? [];
      list.push(row);
      map.set(title, list);
    }
    return [...map.entries()].map(([title, rows]) => ({ title, rows }));
  }, [groupBy, table.rows, table.sourceHeading]);

  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => (
        <details key={group.title} className="group rounded-xl bg-surface-container-low p-3">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
            <span className="text-body-md font-medium">{group.title}</span>
            <ChevronDown className="size-4 shrink-0 text-outline group-open:rotate-180" />
          </summary>
          <ul className="mt-3 flex flex-col gap-2">
            {group.rows.map((row, index) => (
              <li
                key={`${group.title}-${index}`}
                className="rounded-lg bg-surface-container-lowest p-3"
              >
                {row.map((cell, cellIndex) =>
                  cell ? (
                    <p
                      key={`${cellIndex}-${cell.slice(0, 24)}`}
                      className={
                        cellIndex === 0
                          ? "text-label-md"
                          : "mt-1 text-body-sm text-on-surface-variant"
                      }
                    >
                      {table.headers[cellIndex] && cellIndex > 0
                        ? `${table.headers[cellIndex]} · ${cell}`
                        : cell}
                    </p>
                  ) : null,
                )}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
