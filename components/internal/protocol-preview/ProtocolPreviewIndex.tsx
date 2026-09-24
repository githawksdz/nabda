"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { InternalPreviewBanner } from "@/components/internal/protocol-preview/InternalPreviewBanner";
import { internalProtocolPreviewHref } from "@/lib/internal/preview-access";
import { featuredPreviewSlugs } from "@/lib/internal/protocol-preview-mappers";
import type { ProtocolRenderIndexItem } from "@/types/content-rendering-protocol";

type ProtocolPreviewIndexProps = {
  items: ProtocolRenderIndexItem[];
  keepInternalQuery?: boolean;
};

export function ProtocolPreviewIndex({
  items,
  keepInternalQuery = false,
}: ProtocolPreviewIndexProps) {
  const [query, setQuery] = useState("");
  const featured = featuredPreviewSlugs();
  const filtered = useMemo(() => {
    const folded = query.trim().toLowerCase();
    if (!folded) {
      return items;
    }
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(folded) ||
        item.slug.includes(folded) ||
        item.sourceId.toLowerCase().includes(folded),
    );
  }, [items, query]);

  return (
    <div className="flex flex-col gap-4">
      <InternalPreviewBanner />
      <div>
        <h1 className="text-headline-sm">Aperçu interne des recommandations</h1>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          {items.length} identités normalisées depuis le dry-run. Pas d&apos;import Supabase, pas de
          Validé.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {featured.map((slug) => {
          const item = items.find((row) => row.slug === slug);
          if (!item) {
            return null;
          }
          return (
            <Link
              key={slug}
              href={internalProtocolPreviewHref(slug, keepInternalQuery)}
              className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm"
            >
              <span className="block text-body-md font-medium">{item.title}</span>
              <span className="mt-1 block text-label-sm text-on-surface-variant">
                {item.sectionCount} sections · {item.slug}
              </span>
            </Link>
          );
        })}
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-label-sm text-on-surface-variant">Filtrer par titre</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="asthme, abcès, maladies rares…"
          className="h-11 rounded-xl bg-surface-container-low px-3 text-body-md"
        />
      </label>
      <ul className="flex flex-col gap-2">
        {filtered.map((item) => (
          <li key={item.slug}>
            <Link
              href={internalProtocolPreviewHref(item.slug, keepInternalQuery)}
              className="block rounded-xl bg-surface-container-lowest p-3.5 shadow-sm"
            >
              <span className="block text-body-md font-medium">{item.title}</span>
              <span className="mt-1 block text-label-sm text-on-surface-variant">
                {item.sectionCount} sections
                {item.hasEmergency ? " · urgence" : ""}
                {item.hasDose ? " · dose" : ""}
                {item.tooLong ? " · long" : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
