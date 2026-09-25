"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { DrugPreviewModeToggle } from "@/components/content-renderers/drug/DrugPreviewModeToggle";
import { DrugPreviewTabs } from "@/components/content-renderers/drug/DrugPreviewTabs";
import { DrugSectionRenderer } from "@/components/content-renderers/drug/DrugSectionRenderer";
import { DrugSourcesPanel } from "@/components/content-renderers/drug/DrugSourcesPanel";
import { SourceProvenanceStrip } from "@/components/content-renderers/shared/SourceProvenanceStrip";
import {
  DRUG_TAB_FILTERS,
  previewTabForSection,
  sectionMatchesFilter,
  tabOrderForMode,
} from "@/lib/content-rendering/drug";
import type {
  DrugRenderMode,
  DrugRenderTabFilter,
} from "@/types/content-rendering-drug";
import type { NabdaDrugDetailTab } from "@/types/nabda-drug-sections";
import type { ContentLinkMode, DrugRenderData } from "@/types/content-rendering";

type DrugSourceRendererProps = {
  data: DrugRenderData;
  linkMode?: ContentLinkMode;
  keepInternalQuery?: boolean;
  showProvenance?: boolean;
  showModeToggle?: boolean;
  showFilters?: boolean;
};

export function DrugSourceRenderer({
  data,
  linkMode = "public",
  keepInternalQuery = false,
  showProvenance = linkMode === "internal",
  showModeToggle = true,
  showFilters = false,
}: DrugSourceRendererProps) {
  const [mode, setMode] = useState<DrugRenderMode>("standard");
  const [tab, setTab] = useState<NabdaDrugDetailTab>("Aperçu");
  const [filter, setFilter] = useState<DrugRenderTabFilter>("tout");
  const tabs = tabOrderForMode(mode);
  const counts = useMemo(() => {
    const next: Record<string, number> = {};
    for (const name of tabs) next[name] = 0;
    for (const section of data.sections) {
      next[previewTabForSection(section)] =
        (next[previewTabForSection(section)] ?? 0) + 1;
    }
    return next;
  }, [data.sections, tabs]);

  const tabSections = useMemo(
    () =>
      data.sections
        .filter((section) => previewTabForSection(section) === tab)
        .filter((section) => sectionMatchesFilter(section, filter)),
    [data.sections, filter, tab],
  );
  const tabSectionIds = new Set(tabSections.map((section) => section.id));
  const tabTables = data.tables.filter((table) => tabSectionIds.has(table.sectionId));

  return (
    <div className="flex flex-col gap-4">
      {showProvenance ? (
        <SourceProvenanceStrip
          payloadSource={data.payloadSource}
          activationState={data.activationState}
          extra="Aucune règle de posologie ou d’interaction n’est générée."
        />
      ) : null}
      {showModeToggle ? (
        <>
          <DrugPreviewModeToggle
            value={mode}
            onChange={(next) => {
              setMode(next);
              setTab(tabOrderForMode(next)[0] ?? "Aperçu");
            }}
          />
          <p className="text-label-sm text-on-surface-variant">
            {mode === "pharmacien"
              ? "Pharmacien : sécurité, interactions et posologie d'abord. Même texte, autre ordre."
              : "Standard : onglets cliniques. La prescription France reste en Sources."}
          </p>
        </>
      ) : null}
      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start lg:gap-6">
      <DrugPreviewTabs tabs={tabs} value={tab} counts={counts} onChange={setTab} />
      <div className="layout-reading">
      {showFilters ? (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {DRUG_TAB_FILTERS.map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={cn(
                  "flex h-8 shrink-0 items-center rounded-full px-3.5 text-label-md",
                  active
                    ? "bg-primary font-semibold text-on-primary"
                    : "bg-surface-container-low text-on-surface-variant",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
      {tab === "Sources" ? (
        <DrugSourcesPanel
          sections={tabSections}
          tables={tabTables}
          keepInternalQuery={keepInternalQuery}
        />
      ) : (
        <DrugSectionRenderer
          sections={tabSections}
          tables={tabTables}
          keepInternalQuery={keepInternalQuery}
        />
      )}
      </div>
      </div>
    </div>
  );
}
