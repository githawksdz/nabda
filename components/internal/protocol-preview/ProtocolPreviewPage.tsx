"use client";

import { InternalPreviewBanner } from "@/components/internal/protocol-preview/InternalPreviewBanner";
import { ProtocolPreviewHeader } from "@/components/internal/protocol-preview/ProtocolPreviewHeader";
import { ProtocolWarningsPanel } from "@/components/internal/protocol-preview/ProtocolWarningsPanel";
import { ProtocolSourceRenderer } from "@/components/content-renderers/protocol/ProtocolSourceRenderer";
import { internalProtocolPreviewHref } from "@/lib/internal/preview-access";
import type { ProtocolRenderSource } from "@/types/content-rendering-protocol";

type ProtocolPreviewPageProps = {
  preview: ProtocolRenderSource;
  keepInternalQuery?: boolean;
};

export function ProtocolPreviewPage({
  preview,
  keepInternalQuery = false,
}: ProtocolPreviewPageProps) {
  return (
    <div className="flex flex-col gap-4">
      <InternalPreviewBanner />
      <ProtocolPreviewHeader
        title={preview.title}
        sourceId={preview.sourceId}
        backHref={
          keepInternalQuery
            ? "/internal/protocol-preview?preview=internal"
            : "/internal/protocol-preview"
        }
        sectionCount={preview.stats.sectionCount}
      />
      <ProtocolSourceRenderer
        data={{
          ...preview,
          payloadSource: "local_normalized",
          activationState: "ux_normalized_preview",
        }}
        linkMode="internal"
        keepInternalQuery={keepInternalQuery}
        showProvenance={false}
      />
      <ProtocolWarningsPanel preview={preview} />
      <p className="text-center text-label-sm text-on-surface-variant">
        Lien de cette fiche : {internalProtocolPreviewHref(preview.slug, keepInternalQuery)}
      </p>
    </div>
  );
}
