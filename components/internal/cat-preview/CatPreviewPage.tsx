"use client";

import { InternalPreviewBanner } from "@/components/internal/protocol-preview/InternalPreviewBanner";
import { CatPreviewHeader } from "@/components/internal/cat-preview/CatPreviewHeader";
import { CatWarningsPanel } from "@/components/internal/cat-preview/CatWarningsPanel";
import { CatSourceRenderer } from "@/components/content-renderers/cat/CatSourceRenderer";
import { internalCatPreviewHref } from "@/lib/internal/preview-access";
import type { CatRenderSource } from "@/types/content-rendering-cat";

type CatPreviewPageProps = {
  preview: CatRenderSource;
  keepInternalQuery?: boolean;
};

export function CatPreviewPage({
  preview,
  keepInternalQuery = false,
}: CatPreviewPageProps) {
  return (
    <div className="flex flex-col gap-4">
      <InternalPreviewBanner title="Aperçu interne · CAT linéaire" />
      <CatPreviewHeader
        title={preview.title}
        sourceId={preview.sourceId}
        backHref={
          keepInternalQuery
            ? "/internal/cat-preview?preview=internal"
            : "/internal/cat-preview"
        }
        stepCount={preview.stats.stepCount}
      />
      <CatSourceRenderer
        data={{
          ...preview,
          payloadSource: "local_normalized",
          activationState: "ux_normalized_preview",
        }}
        linkMode="internal"
        keepInternalQuery={keepInternalQuery}
        showProvenance
        variant="full"
      />
      <CatWarningsPanel preview={preview} />
      <p className="text-center text-label-sm text-on-surface-variant">
        Lien de cette fiche : {internalCatPreviewHref(preview.slug, keepInternalQuery)}
      </p>
    </div>
  );
}
