"use client";

import { useEffect, useState } from "react";
import { ClinicalDetailFrame } from "@/components/content-detail/ClinicalDetailFrame";
import { DetailLibraryStatus } from "@/components/content-detail/DetailLibraryStatus";
import {
  BottomReadingDock,
  type DockAction,
} from "@/components/content-detail/BottomReadingDock";
import { DrugIdentityCard } from "./DrugIdentityCard";
import { DrugOverview, DrugFormsCard, DrugSourcesCard } from "./DrugOverview";
import { DrugSafetyTab } from "./DrugSafetyTab";
import { DrugTabs } from "./DrugTabs";
import { DrugSourceRenderer } from "@/components/content-renderers/drug/DrugSourceRenderer";
import {
  drugDetailHref,
  resolveDrugTab,
} from "@/lib/drugs/drug-ui-config";
import { toggleFavorite } from "@/lib/content-detail/user-content-actions";
import type { DrugDetail, DrugDetailMode } from "@/types/drugs";
import type { DrugRenderData } from "@/types/content-rendering";

type DrugDetailPageProps = {
  slug: string;
  detail?: DrugDetail;
  source?: DrugRenderData | null;
  tab?: string;
  mode?: DrugDetailMode;
  initialBookmarked?: boolean;
};

export function DrugDetailPage({
  slug,
  detail,
  source,
  tab,
  mode = "overview",
  initialBookmarked = false,
}: DrugDetailPageProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [toast, setToast] = useState<string | null>(null);
  const sourceMode = Boolean(source);
  const activeTab = resolveDrugTab(tab);
  const canonicalSlug = detail?.slug ?? source?.slug ?? slug;
  const headerTitle = source?.title ?? detail?.genericName ?? "Médicament";

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeoutId = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  function showToast(message: string) {
    setToast(message);
  }

  async function persistFavorite() {
    const favoriteSlug = detail?.slug ?? source?.slug;
    if (!favoriteSlug) {
      return;
    }
    const result = await toggleFavorite("drug", favoriteSlug);
    if (!result.skipped) {
      setBookmarked(result.saved);
    }
  }

  function toggleBookmark() {
    const next = !bookmarked;
    setBookmarked(next);
    showToast(next ? "Fiche enregistrée" : "Fiche retirée");
    void persistFavorite();
  }

  const dockActions: DockAction[] =
    detail || source
      ? [
          {
            id: "save",
            label: bookmarked ? "Retirer" : "Favoris",
            icon: bookmarked ? "bookmark-check" : "bookmark",
            active: bookmarked,
            onClick: toggleBookmark,
          },
          {
            id: "sources",
            label: "Références",
            icon: "sources",
            href: drugDetailHref(canonicalSlug, "sources"),
          },
        ]
      : [];

  return (
    <ClinicalDetailFrame title={headerTitle} backHref="/drugs">
        <DetailLibraryStatus contentType="drug" slug={canonicalSlug} />
        <div className="flex flex-col gap-4 pt-3">
            {sourceMode && source ? (
              <DrugSourceRenderer data={source} linkMode="public" />
            ) : null}
            {!sourceMode && mode === "overview" && detail ? (
              <>
                <DrugIdentityCard
                  drug={detail}
                  variant={activeTab === "securite" ? "compact" : "full"}
                />
                <DrugTabs slug={canonicalSlug} active={activeTab} />
                {activeTab === "apercu" ? <DrugOverview drug={detail} /> : null}
                {activeTab === "securite" ? <DrugSafetyTab drug={detail} /> : null}
                {activeTab === "formes" ? (
                  <DrugFormsCard rows={detail.formStructure} />
                ) : null}
                {activeTab === "sources" ? (
                  <DrugSourcesCard drug={detail} />
                ) : null}
              </>
            ) : null}
          </div>
        <BottomReadingDock
          actions={dockActions}
          meta={source ? "Contenu clinique Nabda" : "Référentiel de consultation"}
        />
        {toast ? (
          <p
            role="status"
            aria-live="polite"
            className="fixed bottom-[calc(96px+env(safe-area-inset-bottom,0px))] left-1/2 z-50 w-[min(42rem,calc(100%-32px))] -translate-x-1/2 rounded-xl bg-primary px-4 py-3 text-center text-label-md text-on-primary shadow-sm"
          >
            {toast}
          </p>
        ) : null}
    </ClinicalDetailFrame>
  );
}
