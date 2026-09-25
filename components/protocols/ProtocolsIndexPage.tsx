"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import type { ProtocolSummary } from "@/lib/protocols/protocol-catalog";

type ProtocolsIndexPageProps = {
  protocols?: ProtocolSummary[];
};

export function ProtocolsIndexPage({ protocols = [] }: ProtocolsIndexPageProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return protocols;
    }
    return protocols.filter((item) =>
      [item.title, item.summary, item.statusLabel]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [protocols, query]);

  return (
    <AppShell
      title="Protocoles"
      navVariant="text"
      frameClassName="max-w-[390px]"
      contentClassName="pb-[calc(96px+env(safe-area-inset-bottom,0px))]"
    >
      <div className="flex flex-col gap-4 pt-2">
        <section className="flex flex-col gap-2">
          <h2 className="text-headline-lg">Protocoles</h2>
          <p className="text-body-md text-on-surface-variant">
            Synthèses et guides cliniques disponibles dans Nabda.
          </p>
        </section>

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un protocole…"
          className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md outline-none"
          aria-label="Rechercher un protocole"
        />

        {protocols.length === 0 ? (
          <div className="rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm">
            <p className="text-headline-sm">Aucun protocole disponible</p>
            <p className="mt-2 text-body-sm text-on-surface-variant">
              Le référentiel sera enrichi au fur et à mesure des imports.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm">
            <p className="text-headline-sm">Aucun résultat</p>
            <p className="mt-2 text-body-sm text-on-surface-variant">
              Essayez un autre terme de recherche.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
            {filtered.map((item, index) => (
              <div key={item.id}>
                <Link
                  href={item.href}
                  className="flex flex-col gap-1 px-4 py-3 hover:bg-surface-container-low"
                >
                  <span className="text-body-md font-medium">{item.title}</span>
                  {item.summary ? (
                    <span className="text-body-sm text-on-surface-variant line-clamp-2">
                      {item.summary}
                    </span>
                  ) : null}
                  {item.statusLabel ? (
                    <span className="text-label-sm text-on-surface-variant">
                      {item.statusLabel}
                    </span>
                  ) : null}
                </Link>
                {index < filtered.length - 1 ? (
                  <div className="ml-4 h-px bg-surface-variant" />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
