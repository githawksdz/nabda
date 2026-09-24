"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { InternalPreviewBanner } from "@/components/internal/protocol-preview/InternalPreviewBanner";
import { featuredDrugPreviewSlugs } from "@/lib/internal/drug-preview-mappers";
import { internalDrugPreviewHref } from "@/lib/internal/preview-access";
import type { DrugRenderIndexItem } from "@/types/content-rendering-drug";

const PAGE_SIZE = 40;

type DrugPreviewIndexProps = {
  items: DrugRenderIndexItem[];
  keepInternalQuery?: boolean;
};

export function DrugPreviewIndex({
  items,
  keepInternalQuery = false,
}: DrugPreviewIndexProps) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const featured = featuredDrugPreviewSlugs();
  const filtered = useMemo(() => {
    const folded = query.trim().toLowerCase();
    if (!folded) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(folded) ||
        item.slug.includes(folded) ||
        item.sourceId.toLowerCase().includes(folded),
    );
  }, [items, query]);
  const page = filtered.slice(0, visible);

  return (
    <div className="flex flex-col gap-4">
      <InternalPreviewBanner title="Aperçu interne · Monographie médicament" />
      <div>
        <h1 className="text-headline-sm">Aperçu interne des monographies</h1>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          {items.length} identités depuis le dry-run. Pas d&apos;import Supabase, pas de Validé, pas
          de calculateur de dose.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {featured.map((slug) => {
          const item = items.find((row) => row.slug === slug);
          if (!item) return null;
          return (
            <Link
              key={slug}
              href={internalDrugPreviewHref(slug, keepInternalQuery)}
              className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm"
            >
              <span className="block text-body-md font-medium">{item.title}</span>
              <span className="mt-1 block text-label-sm text-on-surface-variant">
                {item.sectionCount} sections · {item.tableCount} tableaux · {item.slug}
              </span>
            </Link>
          );
        })}
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-label-sm text-on-surface-variant">Filtrer par titre</span>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setVisible(PAGE_SIZE);
          }}
          placeholder="amoxicilline, paracétamol, warfarine…"
          className="h-11 rounded-xl bg-surface-container-low px-3 text-body-md"
        />
      </label>
      <ul className="flex flex-col gap-2">
        {page.map((item) => (
          <li key={item.slug}>
            <Link
              href={internalDrugPreviewHref(item.slug, keepInternalQuery)}
              className="block rounded-xl bg-surface-container-lowest p-3.5 shadow-sm"
            >
              <span className="block text-body-md font-medium">{item.title}</span>
              <span className="mt-1 block text-label-sm text-on-surface-variant">
                {item.sectionCount} sections
                {item.hasRenalHepatic ? " · rénal/hépatique" : ""}
                {item.hasFrancePrescription ? " · France" : ""}
                {item.hasNestedTables ? " · imbriqué" : ""}
                {item.hasMissingKeys ? " · clés manquantes" : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {visible < filtered.length ? (
        <button
          type="button"
          onClick={() => setVisible((count) => count + PAGE_SIZE)}
          className="h-11 rounded-full bg-surface-container-low text-label-md"
        >
          Voir plus ({filtered.length - visible} restants)
        </button>
      ) : null}
    </div>
  );
}
