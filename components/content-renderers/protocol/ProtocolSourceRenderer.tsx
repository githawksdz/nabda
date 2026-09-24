"use client";

import { useMemo, useState } from "react";
import { ProtocolSectionCard } from "@/components/content-renderers/protocol/ProtocolSectionCard";
import { ProtocolSectionChips } from "@/components/content-renderers/protocol/ProtocolSectionChips";
import { ProtocolSectionRenderer } from "@/components/content-renderers/protocol/ProtocolSectionRenderer";
import { ProtocolShiftModeToggle } from "@/components/content-renderers/protocol/ProtocolShiftModeToggle";
import { SourceProvenanceStrip } from "@/components/content-renderers/shared/SourceProvenanceStrip";
import {
  alertSections,
  buildPreviewGroups,
  heroSections,
} from "@/lib/content-rendering/protocol";
import type { ProtocolRenderMode } from "@/types/content-rendering-protocol";
import type { ContentLinkMode, ProtocolRenderData } from "@/types/content-rendering";

type ProtocolSourceRendererProps = {
  data: ProtocolRenderData;
  linkMode?: ContentLinkMode;
  keepInternalQuery?: boolean;
  showProvenance?: boolean;
};

export function ProtocolSourceRenderer({
  data,
  linkMode = "public",
  keepInternalQuery = false,
  showProvenance = true,
}: ProtocolSourceRendererProps) {
  const [mode, setMode] = useState<ProtocolRenderMode>("lecture");
  const [activeId, setActiveId] = useState<string | null>(null);
  const { heroes, alerts, visibleGroups } = useMemo(() => {
    const groups = buildPreviewGroups(data, mode);
    const nextHeroes = mode === "lecture" ? heroSections(data.sections) : [];
    const nextAlerts = alertSections(data.sections).filter(
      (section) => !nextHeroes.some((hero) => hero.id === section.id),
    );
    const pinnedIds = new Set([
      ...nextHeroes.map((section) => section.id),
      ...(mode === "lecture" ? nextAlerts.map((section) => section.id) : []),
    ]);
    return {
      heroes: nextHeroes,
      alerts: nextAlerts,
      visibleGroups: groups
        .map((group) => ({
          ...group,
          sections: group.sections.filter((section) => !pinnedIds.has(section.id)),
        }))
        .filter((group) => group.sections.length > 0),
    };
  }, [data, mode]);

  return (
    <div className="flex flex-col gap-4">
      {showProvenance ? (
        <SourceProvenanceStrip
          payloadSource={data.payloadSource}
          activationState={data.activationState}
        />
      ) : null}
      <ProtocolShiftModeToggle value={mode} onChange={setMode} />
      <p className="text-label-sm text-on-surface-variant">
        {mode === "garde"
          ? "Garde : urgence, prise en charge et traitements d'abord. Le contexte reste replié."
          : "Lecture : ordre des onglets cliniques. Les sources restent en bas."}
      </p>
      <ProtocolSectionChips groups={visibleGroups} activeId={activeId} onActiveId={setActiveId} />
      {heroes.length > 0 ? (
        <div className="flex flex-col gap-3">
          {heroes.map((section) => (
            <ProtocolSectionCard
              key={`hero-${section.id}`}
              section={section}
              keepInternalQuery={keepInternalQuery}
              linkMode={linkMode}
              defaultOpen
            />
          ))}
        </div>
      ) : null}
      {alerts.length > 0 && mode === "lecture" ? (
        <div className="flex flex-col gap-3">
          {alerts
            .filter((section) => !heroes.some((hero) => hero.id === section.id))
            .map((section) => (
              <ProtocolSectionCard
                key={`alert-${section.id}`}
                section={section}
                keepInternalQuery={keepInternalQuery}
                linkMode={linkMode}
                defaultOpen
              />
            ))}
        </div>
      ) : null}
      <ProtocolSectionRenderer
        groups={visibleGroups}
        keepInternalQuery={keepInternalQuery}
        linkMode={linkMode}
      />
    </div>
  );
}
