"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SafeSourceHtml } from "@/components/content-renderers/shared/SafeSourceHtml";
import { DrugAdverseEffectAccordion } from "@/components/content-renderers/drug/DrugAdverseEffectAccordion";
import { DrugInteractionList } from "@/components/content-renderers/drug/DrugInteractionList";
import { DrugTableAccordion } from "@/components/content-renderers/drug/DrugTableAccordion";
import type { DrugRenderTable } from "@/types/content-rendering-drug";

type DrugTableRendererProps = {
  table: DrugRenderTable;
};

const PREVIEW_ROW_LIMIT = 12;

function CellCards({
  table,
  stacked,
}: {
  table: DrugRenderTable;
  stacked: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? table.rows : table.rows.slice(0, PREVIEW_ROW_LIMIT);
  const canExpand = table.rows.length > PREVIEW_ROW_LIMIT || table.truncated;
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, index) => (
        <article
          key={`${table.id}-${index}`}
          className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm"
        >
          {stacked
            ? row.map((cell, cellIndex) =>
                cell ? (
                  <p
                    key={`${cellIndex}-${cell.slice(0, 16)}`}
                    className={
                      cellIndex === 0
                        ? "text-label-md"
                        : "mt-1 text-body-sm text-on-surface-variant"
                    }
                  >
                    {table.headers[cellIndex] ? `${table.headers[cellIndex]} · ${cell}` : cell}
                  </p>
                ) : null,
              )
            : (
                <>
                  <p className="text-label-md">{row[0]}</p>
                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    {row.slice(1).filter(Boolean).join(" · ")}
                  </p>
                </>
              )}
        </article>
      ))}
      {canExpand ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="h-10 rounded-full bg-surface-container-low text-label-md"
        >
          {expanded ? "Réduire" : "Voir plus"}
        </button>
      ) : null}
    </div>
  );
}

function SearchableGrid({ table }: { table: DrugRenderTable }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const folded = query.trim().toLowerCase();
    if (!folded) return table.rows;
    return table.rows.filter((row) => row.join(" ").toLowerCase().includes(folded));
  }, [query, table.rows]);

  return (
    <div className="flex flex-col gap-2">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Filtrer le tableau source"
        className="h-11 rounded-xl bg-surface-container-low px-3 text-body-md"
      />
      {filtered.length === 0 ? (
        <p className="rounded-xl bg-surface-container-low px-3.5 py-4 text-center text-body-sm text-on-surface-variant">
          Aucune ligne ne correspond au filtre.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-surface-container-lowest">
          <table className="min-w-full text-left text-body-sm">
            {table.headers.length > 0 ? (
              <thead className="sticky top-0 bg-surface-container-lowest">
                <tr>
                  {table.headers.map((header) => (
                    <th key={header} className="px-3 py-2 font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {filtered.slice(0, 80).map((row, index) => (
                <tr
                  key={`${table.id}-r-${index}`}
                  className="border-t border-outline-variant/40"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`${cellIndex}-${cell.slice(0, 12)}`}
                      className="px-3 py-2 align-top"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {filtered.length > 80 ? (
        <p className="text-label-sm text-on-surface-variant">
          Affichage limité à 80 lignes. Affinez le filtre pour réduire.
        </p>
      ) : filtered.length > 0 ? (
        <p className="text-label-sm text-on-surface-variant">
          Cellules source, sans réécriture. Pas de règle clinique générée.
        </p>
      ) : null}
    </div>
  );
}

function displayLabel(display: DrugRenderTable["display"]): string {
  switch (display) {
    case "searchable_table":
      return "Tableau filtrable";
    case "stacked_cards":
      return "Cartes";
    case "key_value_card":
      return "Fiche";
    case "horizontal_scroll_table":
      return "Tableau";
    case "frequency_grouped_accordion":
      return "Effets indésirables";
    case "interaction_precaution_list":
      return "Interactions";
    case "accordion_group":
      return "Groupes";
    default:
      return "Tableau source";
  }
}

export function DrugTableRenderer({ table }: DrugTableRendererProps) {
  const display = table.display;
  return (
    <section className="flex flex-col gap-2">
      <p className="text-label-sm text-on-surface-variant">
        {table.sourceHeading} · {table.rowCount} ligne
        {table.rowCount > 1 ? "s" : ""} · {displayLabel(display)}
      </p>
      {display === "frequency_grouped_accordion" ? (
        <DrugAdverseEffectAccordion table={table} />
      ) : display === "interaction_precaution_list" ? (
        <DrugInteractionList table={table} />
      ) : display === "accordion_group" ? (
        <DrugTableAccordion table={table} />
      ) : display === "key_value_card" ? (
        <CellCards table={table} stacked />
      ) : display === "stacked_cards" ? (
        <CellCards table={table} stacked />
      ) : display === "searchable_table" || display === "horizontal_scroll_table" ? (
        <SearchableGrid table={table} />
      ) : (
        <details className="group rounded-xl bg-surface-container-low p-3">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
            <span className="text-body-md font-medium">Tableau source</span>
            <ChevronDown className="size-4 text-outline group-open:rotate-180" />
          </summary>
          <div className="mt-3">
            {table.safeTableHtml ? (
              <SafeSourceHtml html={table.safeTableHtml} guidelinePreview="drug" />
            ) : (
              <SearchableGrid table={table} />
            )}
          </div>
        </details>
      )}
    </section>
  );
}
