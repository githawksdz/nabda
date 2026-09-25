"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app/AppShell";
import { GeneratedFormulaCalculator } from "@/components/calculators/GeneratedFormulaCalculator";
import { createClient } from "@/lib/supabase/client";
import { contentRepository } from "@/lib/offline/repository";
import type { OfflineContentType } from "@/lib/offline/types";
import type { CalculatorRenderData } from "@/types/content-rendering";

type OfflineContentViewProps = {
  contentType: OfflineContentType;
  slug: string;
};

export function OfflineContentView({ contentType, slug }: OfflineContentViewProps) {
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [missing, setMissing] = useState(false);
  const [corrupt, setCorrupt] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setMissing(true);
        return;
      }
      const local = await contentRepository.getLocalPayload(user.id, contentType, slug);
      if (cancelled) return;
      if (!local) {
        const health = await contentRepository.inspectLocal(user.id, contentType, slug);
        if (health === "corrupt") {
          setCorrupt(true);
          return;
        }
        setMissing(true);
        return;
      }
      setPayload(local as Record<string, unknown>);
    })();
    return () => {
      cancelled = true;
    };
  }, [contentType, slug]);

  if (corrupt) {
    return (
      <AppShell title="Hors-ligne">
        <p className="text-body-md">
          Ce contenu local est illisible. Supprimez-le puis téléchargez-le à nouveau.
        </p>
        <Link href="/offline" className="mt-4 inline-flex min-h-11 items-center text-label-md">
          Gérer les téléchargements
        </Link>
      </AppShell>
    );
  }

  if (missing) {
    return (
      <AppShell title="Hors-ligne">
        <p className="text-body-md">Contenu disponible uniquement en ligne.</p>
        <Link href="/offline" className="mt-4 inline-flex text-label-md underline">
          Gérer les téléchargements
        </Link>
      </AppShell>
    );
  }

  if (!payload) {
    return (
      <AppShell title="Hors-ligne">
        <p className="text-body-sm text-on-surface-variant">Ouverture du contenu local…</p>
      </AppShell>
    );
  }

  const title = String(payload.title ?? slug);

  return (
    <AppShell title={title}>
      <p className="text-label-sm text-on-surface-variant">Copie locale chiffrée</p>
      {contentType === "calculator" ? (
        <div className="mt-4">
          <GeneratedFormulaCalculator data={payload as unknown as CalculatorRenderData} />
        </div>
      ) : (
        <article className="mt-4 space-y-3">
          <h2 className="text-headline-sm">{title}</h2>
          <p className="text-body-sm text-on-surface-variant">
            Fiche téléchargée. Version hors-ligne résumée. La mise en page complète
            est disponible en ligne.
          </p>
          {"summary" in payload && payload.summary ? (
            <p className="text-body-md">{String(payload.summary)}</p>
          ) : null}
        </article>
      )}
    </AppShell>
  );
}
