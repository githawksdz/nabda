"use client";

import { InternalPreviewBanner } from "@/components/internal/protocol-preview/InternalPreviewBanner";
import { DrugPreviewHeader } from "@/components/internal/drug-preview/DrugPreviewHeader";
import { DrugWarningsPanel } from "@/components/internal/drug-preview/DrugWarningsPanel";
import { DrugSourceRenderer } from "@/components/content-renderers/drug/DrugSourceRenderer";
import { internalDrugPreviewHref } from "@/lib/internal/preview-access";
import type { DrugRenderSource } from "@/types/content-rendering-drug";

type DrugPreviewPageProps = {
  preview: DrugRenderSource;
  keepInternalQuery?: boolean;
};

export function DrugPreviewPage({
  preview,
  keepInternalQuery = false,
}: DrugPreviewPageProps) {
  return (
    <div className="flex flex-col gap-4">
      <InternalPreviewBanner title="Aperçu interne · Monographie médicament" />
      <DrugPreviewHeader
        title={preview.title}
        sourceId={preview.sourceId}
        backHref={
          keepInternalQuery
            ? "/internal/drug-preview?preview=internal"
            : "/internal/drug-preview"
        }
        localeStatus={preview.localeStatus}
        sectionCount={preview.stats.sectionCount}
      />
      <DrugSourceRenderer
        data={{
          ...preview,
          payloadSource: "local_normalized",
          activationState: "ux_normalized_preview",
        }}
        linkMode="internal"
        keepInternalQuery={keepInternalQuery}
        showProvenance
        showModeToggle
        showFilters
      />
      <DrugWarningsPanel preview={preview} />
      <p className="text-center text-label-sm text-on-surface-variant">
        Lien de cette fiche : {internalDrugPreviewHref(preview.slug, keepInternalQuery)}
      </p>
    </div>
  );
}
