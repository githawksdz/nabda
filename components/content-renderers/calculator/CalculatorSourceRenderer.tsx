import { StatusChip } from "@/components/content-detail/StatusChip";
import { CalculatorFormulaPreview } from "@/components/content-renderers/calculator/CalculatorFormulaPreview";
import { CalculatorInputSchemaPreview } from "@/components/content-renderers/calculator/CalculatorInputSchemaPreview";
import { CalculatorLockedNotice } from "@/components/content-renderers/calculator/CalculatorLockedNotice";
import { CalculatorReferencesPanel } from "@/components/content-renderers/calculator/CalculatorReferencesPanel";
import { CalculatorUxPatternCard } from "@/components/content-renderers/calculator/CalculatorUxPatternCard";
import { SourceProvenanceStrip } from "@/components/content-renderers/shared/SourceProvenanceStrip";
import {
  kindLabel,
  languageLabel,
  riskLabel,
} from "@/lib/content-rendering/calculator";
import type { CalculatorRenderData, ContentLinkMode } from "@/types/content-rendering";

type CalculatorSourceRendererProps = {
  data: CalculatorRenderData;
  linkMode?: ContentLinkMode;
  keepInternalQuery?: boolean;
  showProvenance?: boolean;
  showIdentity?: boolean;
  /** Soft note when specialty formula engine is not wired yet. */
  enginePending?: boolean;
};

export function CalculatorSourceRenderer({
  data,
  linkMode = "public",
  keepInternalQuery = false,
  showProvenance = linkMode === "internal",
  showIdentity = true,
  enginePending = false,
}: CalculatorSourceRendererProps) {
  const showPlanningChrome = linkMode === "internal";

  return (
    <div className="flex flex-col gap-4">
      {showIdentity ? (
        <header className="space-y-2">
          <h2 className="text-headline-sm">{data.title}</h2>
          <div className="flex flex-wrap gap-1.5">
            <StatusChip label={kindLabel(data.kind)} />
            <StatusChip
              label={`Risque ${riskLabel(data.risk).toLowerCase()}`}
              variant={data.risk === "high" ? "warning" : "soft"}
            />
            <StatusChip label={languageLabel(data.language)} />
          </div>
        </header>
      ) : null}
      {showProvenance ? (
        <SourceProvenanceStrip
          payloadSource={data.payloadSource}
          activationState={data.activationState}
          extra="Aucun JavaScript source n’est exécuté. Les moteurs sont des modules TypeScript compilés."
        />
      ) : null}
      <CalculatorLockedNotice
        locked={false}
        risk={data.risk}
        enginePending={enginePending}
      />
      {showPlanningChrome ? <CalculatorUxPatternCard preview={data} /> : null}
      <CalculatorInputSchemaPreview inputs={data.inputs} />
      <CalculatorFormulaPreview
        preview={data}
        keepInternalQuery={keepInternalQuery}
        linkMode={linkMode}
      />
      <CalculatorReferencesPanel
        preview={data}
        keepInternalQuery={keepInternalQuery}
        linkMode={linkMode}
      />
      {data.publicDemo ? (
        <p className="rounded-xl bg-surface-container-low px-3.5 py-3 text-body-sm text-on-surface-variant">
          Une version interactive connexe est disponible.{" "}
          <a
            href={data.publicDemo.href}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            {data.publicDemo.label}
          </a>
        </p>
      ) : null}
    </div>
  );
}
