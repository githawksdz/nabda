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
  sectionSlug?: string;
};

function resolveGroupId(
  groups: { id: string; sections: { id: string }[] }[],
  slug?: string | null,
): string | null {
  if (groups.length === 0) return null;
  if (slug && groups.some((group) => group.id === slug)) return slug;
  if (slug) {
    const match = groups.find((group) =>
      group.sections.some((section) => section.id === slug),
    );
    if (match) return match.id;
  }
  return groups[0]?.id ?? null;
}

export function ProtocolSourceRenderer({
  data,
  linkMode = "public",
  keepInternalQuery = false,
  showProvenance = linkMode === "internal",
  sectionSlug,
}: ProtocolSourceRendererProps) {
  const [mode, setMode] = useState<ProtocolRenderMode>("lecture");
  const [activeId, setActiveId] = useState<string | null>(sectionSlug ?? null);
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

  const currentGroupId = resolveGroupId(visibleGroups, activeId ?? sectionSlug);

  function selectSection(id: string) {
    setActiveId(id);
    if (typeof window === "undefined") {
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("section", id);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

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
      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start lg:gap-6">
        <ProtocolSectionChips
          groups={visibleGroups}
          activeId={currentGroupId}
          onActiveId={selectSection}
        />
        <div className="layout-reading flex flex-col gap-4">
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
            activeGroupId={currentGroupId}
          />
        </div>
      </div>
    </div>
  );
}
