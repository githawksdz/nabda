"use client";

import { useMemo, useState } from "react";
import { MentionChip } from "@/components/content-detail/rich-content/MentionChip";
import { CatPreviewModeToggle } from "@/components/content-renderers/cat/CatPreviewModeToggle";
import { CatShiftGroups } from "@/components/content-renderers/cat/CatShiftGroups";
import { CatStaticImageCard } from "@/components/content-renderers/cat/CatStaticImageCard";
import { CatStepChips } from "@/components/content-renderers/cat/CatStepChips";
import { SourceProvenanceStrip } from "@/components/content-renderers/shared/SourceProvenanceStrip";
import {
  buildCatPreviewGroups,
  extractionStatusCopy,
} from "@/lib/content-rendering/cat";
import type { CatRenderMode } from "@/types/content-rendering-cat";
import type { CatRenderData, ContentLinkMode } from "@/types/content-rendering";

type CatSourceRendererProps = {
  data: CatRenderData;
  linkMode?: ContentLinkMode;
  keepInternalQuery?: boolean;
  showProvenance?: boolean;
  variant?: "full" | "steps" | "image";
};

export function CatSourceRenderer({
  data,
  linkMode = "public",
  keepInternalQuery = false,
  showProvenance = linkMode === "internal",
  variant = "full",
}: CatSourceRendererProps) {
  const [mode, setMode] = useState<CatRenderMode>(
    variant === "image" ? "image" : "etapes",
  );
  const [activeId, setActiveId] = useState<string | null>(
    variant === "image" ? "image" : "tout",
  );
  const effectiveMode: CatRenderMode =
    variant === "image" ? "image" : mode;
  const groups = useMemo(
    () => buildCatPreviewGroups(data.steps, effectiveMode),
    [data.steps, effectiveMode],
  );
  const hasImage = data.images.length > 0 || data.hasStaticFlowchartImage;
  const imageCompact = false;
  const showImage = effectiveMode === "image";
  const showSteps = effectiveMode !== "image";
  const showToggle = variant === "full" || variant === "steps";

  return (
    <div className="flex flex-col gap-4">
      {showProvenance ? (
        <SourceProvenanceStrip
          payloadSource={data.payloadSource}
          activationState={data.activationState}
          extra={extractionStatusCopy(data.extractionMode)}
        />
      ) : null}
      {showToggle ? (
        <>
          <CatPreviewModeToggle
            value={mode}
            onChange={(next) => {
              setMode(next);
              setActiveId(next === "image" ? "image" : "tout");
            }}
          />
          <p className="text-label-sm text-on-surface-variant">
            {mode === "garde"
              ? "Garde : urgence, examens et traitements d'abord. Le contexte reste replié."
              : mode === "image"
                ? "Image : illustration source, sans zones cliquables."
                : "Étapes : ordre clinique linéaire. Les sources restent en bas."}
          </p>
        </>
      ) : null}
      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start lg:gap-6">
        {showToggle ? (
          <CatStepChips
            groups={groups}
            mode={mode}
            activeId={activeId}
            hasImage={hasImage}
            onActiveId={setActiveId}
            onSelectImage={() => setMode("image")}
            onSelectTout={() => {
              if (mode === "image") {
                setMode("etapes");
              }
            }}
          />
        ) : null}
        <div className="layout-reading flex flex-col gap-4">
          {showImage ? (
            <CatStaticImageCard
              images={effectiveMode === "image" ? data.images : data.images.slice(0, 1)}
              imagemapStripped={data.imagemapStripped}
              zoomable={effectiveMode === "image"}
              compact={imageCompact}
            />
          ) : null}
          {showSteps ? (
            <>
              {!data.hasInteractiveGraph ? (
                <p className="rounded-xl bg-surface-container-low px-3.5 py-3 text-label-sm text-on-surface-variant">
                  Étapes linéaires uniquement. Le schéma interactif n&apos;est pas disponible
                  (aucune arête de graphe).
                </p>
              ) : null}
              <CatShiftGroups
                groups={groups}
                keepInternalQuery={keepInternalQuery}
                linkMode={linkMode}
                activeGroupId={activeId}
              />
            </>
          ) : null}
          {data.linkedTools.length > 0 && effectiveMode !== "image" ? (
            <section className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm">
              <h2 className="text-body-md font-medium">Outils liés</h2>
              <p className="mt-1 text-label-sm text-on-surface-variant">
                Ouverture de fiche uniquement. Aucun calcul automatique.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {data.linkedTools.map((chip) => (
                  <MentionChip
                    key={chip.id}
                    type={
                      chip.kind === "calculator"
                        ? "calculator_mention"
                        : chip.kind === "drug"
                          ? "drug_mention"
                          : "protocol_mention"
                    }
                    label={chip.label}
                    href={chip.href}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
