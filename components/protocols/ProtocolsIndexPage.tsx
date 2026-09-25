"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import {
  DiscoveryList,
  DiscoveryListItem,
  DiscoveryListRow,
} from "@/components/discovery/DiscoveryListRow";
import { IndexPageIntro } from "@/components/discovery/IndexPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchField } from "@/components/ui/TextField";
import { accessLabelToTone } from "@/lib/ui/access-status-display";
import type { ProtocolSummary } from "@/lib/protocols/protocol-catalog";
import { FileText } from "lucide-react";

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
      pageHeading={false}
      navVariant="text"
      frame="clinical"
    >
      <div className="flex min-w-0 flex-col gap-4 pt-2">
        <IndexPageIntro
          title="Protocoles"
          description="Synthèses et guides cliniques disponibles dans Nabda."
        />

        <SearchField
          value={query}
          onChange={setQuery}
          onClear={() => setQuery("")}
          placeholder="Filtrer cette liste…"
          label="Filtrer les protocoles"
          compact
          className="bg-surface-muted shadow-none"
        />

        {protocols.length === 0 ? (
          <EmptyState
            compact
            headingLevel="h2"
            title="Aucun protocole disponible"
            description="Le référentiel sera enrichi au fur et à mesure des imports."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            compact
            headingLevel="h2"
            title="Aucun résultat"
            description="Essayez un autre terme de recherche."
            actionLabel="Effacer le filtre"
            onAction={() => setQuery("")}
          />
        ) : (
          <DiscoveryList>
            {filtered.map((item) => (
              <DiscoveryListItem key={item.id}>
                <DiscoveryListRow
                  href={item.href}
                  title={item.title}
                  typeLabel="Protocole"
                  description={item.summary ?? undefined}
                  statusLabel={item.statusLabel ?? undefined}
                  statusTone={
                    item.statusLabel
                      ? accessLabelToTone(item.statusLabel)
                      : undefined
                  }
                  icon={
                    <FileText className="size-4" strokeWidth={1.75} aria-hidden />
                  }
                />
              </DiscoveryListItem>
            ))}
          </DiscoveryList>
        )}
      </div>
    </AppShell>
  );
}
