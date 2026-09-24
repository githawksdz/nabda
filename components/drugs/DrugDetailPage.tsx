"use client";

import { useEffect, useState } from "react";
import { DrugDetailHeader } from "./DrugDetailHeader";
import { DrugFooterActions, type DrugDockAction } from "./DrugFooterActions";
import { DrugIdentityCard } from "./DrugIdentityCard";
import { DrugOverview, DrugFormsCard, DrugSourcesCard } from "./DrugOverview";
import { DrugPreparationState } from "./DrugPreparationState";
import { DrugRequestState, type DrugIndexationPayload } from "./DrugRequestState";
import { DrugSafetyTab } from "./DrugSafetyTab";
import { DrugTabs } from "./DrugTabs";
import { DrugSourceRenderer } from "@/components/content-renderers/drug/DrugSourceRenderer";
import {
  DRUG_MISSING_HEADER,
  DRUG_PREPARATION_HEADER,
  drugDetailHref,
  getDrugAlternatives,
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
  const [requested, setRequested] = useState(false);
  const sourceMode = Boolean(source);
  const activeTab = resolveDrugTab(tab);
  const canonicalSlug = detail?.slug ?? source?.slug ?? slug;
  const alternatives = getDrugAlternatives(canonicalSlug);
  const headerTitle = source?.title ?? detail?.genericName ?? "Médicament";
  const preparationOrRequest =
    !sourceMode && (mode === "preparation" || mode === "request");

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

  function reportSource() {
    showToast("Signalement enregistré localement");
  }

  function handleIndexation(payload: DrugIndexationPayload) {
    setRequested(true);
    showToast(
      payload.notify
        ? "Demande enregistrée. Alerte locale activée."
        : "Demande d'indexation enregistrée localement",
    );
  }

  const dockActions: DrugDockAction[] =
    (detail || source) && !preparationOrRequest
      ? [
          {
            id: "save",
            label: bookmarked ? "Enregistré" : "Enregistrer",
            icon: bookmarked ? "bookmark-check" : "bookmark",
            active: bookmarked,
            onClick: toggleBookmark,
          },
          {
            id: "sources",
            label: "Sources",
            icon: "sources",
            href: drugDetailHref(canonicalSlug, "sources"),
          },
          {
            id: "report",
            label: "Signaler",
            icon: "report",
            onClick: reportSource,
          },
        ]
      : [];

  return (
    <div className="min-h-dvh bg-background text-on-surface">
      <div className="relative mx-auto min-h-dvh w-full max-w-[390px]">
        <DrugDetailHeader
          title={
            sourceMode
              ? headerTitle
              : mode === "request"
                ? DRUG_MISSING_HEADER
                : mode === "preparation"
                  ? DRUG_PREPARATION_HEADER
                  : headerTitle
          }
          subtitle="Médicament"
          backHref="/drugs"
          bookmarked={bookmarked}
          onToggleBookmark={
            (detail || source) && !preparationOrRequest ? toggleBookmark : undefined
          }
        />
        <main
          className={
            preparationOrRequest
              ? "px-4 pt-[calc(64px+env(safe-area-inset-top,0px))] pb-[calc(32px+env(safe-area-inset-bottom,0px))]"
              : "px-4 pt-[calc(64px+env(safe-area-inset-top,0px))] pb-[calc(128px+env(safe-area-inset-bottom,0px))]"
          }
        >
          <div className="flex flex-col gap-4 pt-3">
            {sourceMode && source ? (
              <DrugSourceRenderer data={source} linkMode="public" />
            ) : null}
            {!sourceMode && mode === "request" ? (
              <DrugRequestState
                slug={canonicalSlug}
                moleculeName={detail?.genericName}
                alternatives={alternatives}
                submitted={requested}
                onSubmit={handleIndexation}
              />
            ) : null}
            {!sourceMode && mode === "preparation" ? (
              <DrugPreparationState
                slug={canonicalSlug}
                drug={detail}
                alternatives={alternatives}
                submitted={requested}
                onSubmit={handleIndexation}
              />
            ) : null}
            {!sourceMode && mode === "overview" && detail ? (
              <>
                <DrugIdentityCard
                  drug={detail}
                  variant={activeTab === "securite" ? "compact" : "full"}
                />
                <DrugTabs slug={canonicalSlug} active={activeTab} />
                {activeTab === "apercu" ? <DrugOverview drug={detail} /> : null}
                {activeTab === "securite" ? (
                  <DrugSafetyTab drug={detail} onReport={reportSource} />
                ) : null}
                {activeTab === "formes" ? (
                  <DrugFormsCard rows={detail.formStructure} />
                ) : null}
                {activeTab === "sources" ? (
                  <DrugSourcesCard drug={detail} />
                ) : null}
              </>
            ) : null}
          </div>
        </main>
        <DrugFooterActions
          actions={dockActions}
          meta={source ? "Source préservée · référentiel source" : "Référentiel de consultation · données à vérifier"}
        />
        {toast ? (
          <p
            role="status"
            aria-live="polite"
            className={
              preparationOrRequest
                ? "fixed bottom-[calc(24px+env(safe-area-inset-bottom,0px))] left-1/2 z-50 w-[min(358px,calc(100%-32px))] -translate-x-1/2 rounded-xl bg-primary px-4 py-3 text-center text-label-md text-on-primary shadow-sm"
                : "fixed bottom-[calc(96px+env(safe-area-inset-bottom,0px))] left-1/2 z-50 w-[min(358px,calc(100%-32px))] -translate-x-1/2 rounded-xl bg-primary px-4 py-3 text-center text-label-md text-on-primary shadow-sm"
            }
          >
            {toast}
          </p>
        ) : null}
      </div>
    </div>
  );
}
