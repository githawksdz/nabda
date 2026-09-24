import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InternalPreviewBanner } from "@/components/internal/protocol-preview/InternalPreviewBanner";
import { CalculatorWarningsPanel } from "@/components/internal/calculator-preview/CalculatorWarningsPanel";
import { CalculatorSourceRenderer } from "@/components/content-renderers/calculator/CalculatorSourceRenderer";
import type { CalculatorRenderSource } from "@/types/content-rendering-calculator";

type CalculatorPreviewPageProps = {
  preview: CalculatorRenderSource;
  keepInternalQuery?: boolean;
};

export function CalculatorPreviewPage({
  preview,
  keepInternalQuery = false,
}: CalculatorPreviewPageProps) {
  const backHref = keepInternalQuery
    ? "/internal/calculator-preview?preview=internal"
    : "/internal/calculator-preview";

  return (
    <div className="flex flex-col gap-4">
      <InternalPreviewBanner title="Aperçu interne · Calculateur source" />
      <header className="flex items-start gap-2">
        <Link
          href={backHref}
          aria-label="Retour au catalogue interne"
          className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface"
        >
          <ArrowLeft className="size-5" strokeWidth={1.75} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-label-sm text-on-surface-variant">Calculateur · aperçu interne</p>
          <p className="truncate text-label-sm text-on-surface-variant">{preview.sourceId}</p>
        </div>
      </header>
      <CalculatorSourceRenderer
        data={{
          ...preview,
          payloadSource: "local_normalized",
          activationState: "ux_normalized_preview",
        }}
        linkMode="internal"
        keepInternalQuery={keepInternalQuery}
        showProvenance
        showIdentity
      />
      <CalculatorWarningsPanel preview={preview} />
    </div>
  );
}
