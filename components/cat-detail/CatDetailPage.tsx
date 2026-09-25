"use client";

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { ClinicalDetailFrame } from "@/components/content-detail/ClinicalDetailFrame";
import { DetailLibraryStatus } from "@/components/content-detail/DetailLibraryStatus";
import { BottomReadingDock, type DockAction } from "@/components/content-detail/BottomReadingDock";
import { EmptyContentState } from "@/components/content-detail/EmptyContentState";
import { CatIdentityCard } from "./CatIdentityCard";
import { CatSegmentedTabs } from "./CatSegmentedTabs";
import { CatStepsView } from "./CatStepsView";
import { CatNotesView } from "./CatNotesView";
import { CatSourcesView } from "./CatSourcesView";
import { CatMapPreparationState } from "./CatMapPreparationState";
import { CatRedFlags } from "./CatRedFlags";
import { CatLinkedTools } from "./CatLinkedTools";
import { CatFlowchartCanvas } from "@/components/cat-flowchart/CatFlowchartCanvas";
import { CatSourceRenderer } from "@/components/content-renderers/cat/CatSourceRenderer";
import {
  catHref,
  resolveCatDetailMode,
  resolveCatTab,
} from "@/lib/content-detail/content-detail-ui-config";
import { getFlowchartDemoFixtures } from "@/lib/demo-fixtures/load";
import { toggleFavorite } from "@/lib/content-detail/user-content-actions";
import type { CatDetail, CatTab } from "@/types/content-detail";
import type { CatRenderData } from "@/types/content-rendering";

type CatDetailPageProps = {
  detail?: CatDetail;
  source?: CatRenderData | null;
  tab?: string;
  viewState?: string;
  initialBookmarked?: boolean;
};

export function CatDetailPage({
  detail,
  source,
  tab,
  viewState,
  initialBookmarked = false,
}: CatDetailPageProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [notified, setNotified] = useState(false);
  const [suggested, setSuggested] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const sourceMode = Boolean(source);
  const mode = sourceMode ? "tabs" : resolveCatDetailMode({ detail, state: viewState });
  const activeTab: CatTab = mode === "preparation" ? "carte" : resolveCatTab(tab);
  const headerTitle =
    source?.title ?? detail?.map.short_title ?? detail?.map.title ?? "CAT";
  const showClinicalExtras =
    !sourceMode &&
    mode === "tabs" &&
    (activeTab === "carte" || activeTab === "etapes");
  const flowchart = detail ? resolveVisibleFlowchart(detail) : undefined;

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
    const slug = detail?.map.slug ?? source?.slug;
    if (!slug) {
      return;
    }
    const result = await toggleFavorite("cat", slug);
    if (!result.skipped) {
      setBookmarked(result.saved);
    }
  }

  function toggleBookmark() {
    const next = !bookmarked;
    setBookmarked(next);
    showToast(next ? "CAT enregistrée" : "CAT retirée");
    void persistFavorite();
  }

  function toggleNotify() {
    const next = !notified;
    setNotified(next);
    showToast(
      next
        ? "Notification programmée dès la parution officielle"
        : "Alerte de publication retirée",
    );
  }

  async function shareCat() {
    const title = source?.title ?? detail?.map.title ?? "CAT Nabda";
    const text = detail?.map.summary ?? title;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: text ?? title, url });
        showToast("Fiche prête à partager");
        return;
      }
      await navigator.clipboard.writeText(`${title}\n${url}`);
      showToast("Lien de la CAT copié");
    } catch {
      showToast("Partage annulé");
    }
  }

  const dockActions: DockAction[] = detail || source
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
          label: "Sources",
          icon: "sources",
          href: catHref(detail?.map.slug ?? source?.slug ?? "", { tab: "sources" }),
        },
        {
          id: "next",
          label: activeTab === "etapes" ? "Carte" : "Étapes",
          icon: "next",
          href: catHref(detail?.map.slug ?? source?.slug ?? "", {
            tab: activeTab === "etapes" ? "carte" : "etapes",
          }),
        },
        {
          id: "share",
          label: "Partager",
          icon: "share",
          onClick: shareCat,
        },
      ]
    : [];

  return (
    <ClinicalDetailFrame title={headerTitle} backHref="/cat">
        <DetailLibraryStatus
          contentType="cat"
          slug={detail?.map.slug ?? source?.slug ?? ""}
        />
        <div className="flex flex-col gap-5 pt-3">
            {mode === "missing" && !source ? (
              <EmptyContentState
                title="CAT introuvable"
                description="Cette carte clinique n'est pas encore disponible. Structure en préparation."
                href="/cat"
                actionLabel="Retour aux CAT"
              />
            ) : (
              <>
                {detail ? (
                  <CatIdentityCard map={detail.map} />
                ) : (
                  <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
                    <p className="text-label-sm uppercase tracking-[0.04em] text-on-surface-variant">
                      CAT
                    </p>
                    <h1 className="mt-1 text-headline-sm">{source?.title}</h1>
                  </section>
                )}
                {detail?.map.safety_note ? (
                  <p className="flex items-start gap-2 text-label-sm text-on-surface-variant">
                    <Shield className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} />
                    {detail.map.safety_note}
                  </p>
                ) : null}
                <CatSegmentedTabs
                  slug={detail?.map.slug ?? source?.slug ?? ""}
                  active={activeTab}
                />
                {mode === "preparation" && detail && !source ? (
                  <CatMapPreparationState
                    detail={detail}
                    notified={notified}
                    suggested={suggested}
                    onNotify={toggleNotify}
                    onSuggest={() => setSuggested(true)}
                  />
                ) : null}
                <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
                  <div
                    className={
                      mode === "tabs" && activeTab !== "carte"
                        ? "hidden min-w-0 lg:block"
                        : "min-w-0"
                    }
                  >
                    {mode === "tabs" && (activeTab === "carte" || Boolean(flowchart) || Boolean(source)) ? (
                      flowchart ? (
                        <CatFlowchartCanvas map={flowchart} />
                      ) : source ? (
                        <CatSourceRenderer
                          data={source}
                          linkMode="public"
                          variant="image"
                          showProvenance
                        />
                      ) : detail ? (
                        <CatMapPreparationState
                          detail={detail}
                          notified={notified}
                          suggested={suggested}
                          onNotify={toggleNotify}
                          onSuggest={() => setSuggested(true)}
                        />
                      ) : null
                    ) : null}
                  </div>
                  <div className="min-w-0 lg:max-w-[42rem]">
                {mode === "tabs" && (activeTab === "etapes" || activeTab === "carte") ? (
                  <div className={activeTab === "carte" ? "hidden lg:block" : undefined}>
                  {source ? (
                    <CatSourceRenderer
                      data={source}
                      linkMode="public"
                      variant="full"
                      showProvenance={false}
                    />
                  ) : (
                    <CatStepsView steps={detail?.steps ?? []} />
                  )}
                  </div>
                ) : null}
                {mode === "tabs" && activeTab === "notes" ? (
                  source ? (
                    <p className="rounded-xl bg-surface-container-low p-3.5 text-body-sm text-on-surface-variant">
                      Illustration source non interactive. Les étapes linéaires sont dans
                      l&apos;onglet Étapes. Aucun graphe interactif n&apos;est disponible pour
                      cette fiche.
                    </p>
                  ) : (
                    <CatNotesView
                      catTitle={detail?.map.short_title ?? detail?.map.title ?? "CAT"}
                    />
                  )
                ) : null}
                {mode === "tabs" && activeTab === "sources" ? (
                  detail && !source ? (
                    <CatSourcesView detail={detail} />
                  ) : (
                    <p className="rounded-xl bg-surface-container-low p-3.5 text-body-sm text-on-surface-variant">
                      Contenu source préservé. Pas de validation clinique automatique.
                    </p>
                  )
                ) : null}
                {showClinicalExtras && detail ? (
                  <>
                    <CatRedFlags flags={detail.red_flags} />
                    <CatLinkedTools items={detail.linked_tools} />
                  </>
                ) : null}
                  </div>
                </div>
              </>
            )}
          </div>
        {dockActions.length > 0 ? (
          <BottomReadingDock
            actions={dockActions}
            meta={source ? "Source préservée" : "Aperçu local · référence clinique"}
          />
        ) : null}
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

function resolveVisibleFlowchart(detail: CatDetail) {
  if (detail.flowchart && detail.flowchart.nodes.length > 0) {
    return detail.flowchart;
  }
  return (
    getFlowchartDemoFixtures()?.getMockFlowchartForSlug(detail.map.slug) ??
    undefined
  );
}
