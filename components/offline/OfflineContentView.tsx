"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
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
      <EmptyState
        title="Contenu local illisible"
        description="Ce contenu local est illisible. Supprimez-le puis téléchargez-le à nouveau."
        actionLabel="Gérer les téléchargements"
        actionHref="/offline"
      />
    );
  }

  if (missing) {
    return (
      <EmptyState
        title="Disponible uniquement en ligne."
        description="Cette fiche n’est pas présente dans les téléchargements de cet appareil."
        actionLabel="Gérer les téléchargements"
        actionHref="/offline"
      />
    );
  }

  if (!payload) {
    return <PageSkeleton variant="detail" label="Ouverture du contenu local…" />;
  }

  const title = String(payload.title ?? slug);

  return (
    <>
      <StatusBadge tone="downloaded">Copie locale · version résumée</StatusBadge>
      {contentType === "calculator" ? (
        <div className="mt-4">
          <h1 className="text-headline-sm">{title}</h1>
          <GeneratedFormulaCalculator data={payload as unknown as CalculatorRenderData} />
        </div>
      ) : (
        <article className="mt-4 space-y-3">
          <h1 className="text-headline-sm">{title}</h1>
          <p className="text-body-sm text-on-surface-variant">
            Fiche téléchargée. Version hors-ligne résumée. La mise en page complète
            est disponible en ligne.
          </p>
          {"summary" in payload && payload.summary ? (
            <p className="text-body-md">{String(payload.summary)}</p>
          ) : null}
        </article>
      )}
    </>
  );
}
