"use client";

import { useState } from "react";
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
import {
  FAVORITE_ADDED_MESSAGE,
  FAVORITE_REMOVED_MESSAGE,
  FAVORITE_SIGN_IN_MESSAGE,
  FAVORITE_WRITE_FAILED_MESSAGE,
} from "@/lib/ui/feedback-timing";
import { reconcileFavorite } from "@/lib/ui/favorite-result";
import { StatusToast } from "@/components/ui/StatusToast";
import { useNotice } from "@/components/ui/useTimedFlag";
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
  const [pendingFavorite, setPendingFavorite] = useState(false);
  const [favoriteEmphasis, setFavoriteEmphasis] = useState(0);
  const [favoriteAnnouncement, setFavoriteAnnouncement] = useState("");
  const { notice, showToast, dismissToast } = useNotice();
  const sourceMode = Boolean(source);
  const activeTab = resolveDrugTab(tab);
  const canonicalSlug = detail?.slug ?? source?.slug ?? slug;
  const headerTitle = source?.title ?? detail?.genericName ?? "Médicament";

  async function persistFavorite(previous: boolean) {
    const favoriteSlug = detail?.slug ?? source?.slug;
    if (!favoriteSlug) {
      setBookmarked(previous);
      return;
    }
    setPendingFavorite(true);
    const result = await toggleFavorite("drug", favoriteSlug);
    const next = reconcileFavorite(previous, result);
    setBookmarked(next.bookmarked);
    setPendingFavorite(false);
    switch (next.outcome) {
      case "unauthenticated":
        showToast(FAVORITE_SIGN_IN_MESSAGE);
        return;
      case "write_failed":
        showToast(FAVORITE_WRITE_FAILED_MESSAGE, "alert");
        return;
      case "saved":
      case "removed":
        setFavoriteEmphasis((value) => value + 1);
        setFavoriteAnnouncement(
          next.outcome === "saved"
            ? FAVORITE_ADDED_MESSAGE
            : FAVORITE_REMOVED_MESSAGE,
        );
    }
  }

  function toggleBookmark() {
    if (pendingFavorite) {
      return;
    }
    const previous = bookmarked;
    setBookmarked(!bookmarked);
    void persistFavorite(previous);
  }

  const dockActions: DockAction[] =
    detail || source
      ? [
          {
            id: "save",
            label: bookmarked ? "Retirer" : "Favoris",
            icon: bookmarked ? "bookmark-check" : "bookmark",
            active: bookmarked,
            disabled: pendingFavorite,
            busy: pendingFavorite,
            emphasisKey: favoriteEmphasis,
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
                <div className="layout-reading flex flex-col gap-4">
                {activeTab === "apercu" ? <DrugOverview drug={detail} /> : null}
                {activeTab === "securite" ? <DrugSafetyTab drug={detail} /> : null}
                {activeTab === "formes" ? (
                  <DrugFormsCard rows={detail.formStructure} />
                ) : null}
                {activeTab === "sources" ? (
                  <DrugSourcesCard drug={detail} />
                ) : null}
                </div>
              </>
            ) : null}
          </div>
        <BottomReadingDock actions={dockActions} />
        <p className="sr-only" role="status" aria-live="polite">
          {favoriteAnnouncement}
        </p>
        <StatusToast notice={notice} onDismiss={dismissToast} />
    </ClinicalDetailFrame>
  );
}
