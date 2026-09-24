"use client";

import { useEffect, useState } from "react";
import { DetailHeader } from "@/components/content-detail/DetailHeader";
import { BottomReadingDock, type DockAction } from "@/components/content-detail/BottomReadingDock";
import { EmptyContentState } from "@/components/content-detail/EmptyContentState";
import { ProtocolOverview } from "./ProtocolOverview";
import { ProtocolDeepSection } from "./ProtocolDeepSection";
import { ProtocolPreparationState } from "./ProtocolPreparationState";
import { ProtocolSourceRenderer } from "@/components/content-renderers/protocol/ProtocolSourceRenderer";
import {
  adjacentSections,
  findSection,
  protocolHref,
  resolveProtocolViewMode,
} from "@/lib/content-detail/content-detail-ui-config";
import { toggleFavorite } from "@/lib/content-detail/user-content-actions";
import type { ProtocolDetail } from "@/types/content-detail";
import type { ProtocolRenderData } from "@/types/content-rendering";

type ProtocolDetailPageProps = {
  detail?: ProtocolDetail;
  source?: ProtocolRenderData | null;
  sectionSlug?: string;
  viewState?: string;
  initialBookmarked?: boolean;
};

export function ProtocolDetailPage({
  detail,
  source,
  sectionSlug,
  viewState,
  initialBookmarked = false,
}: ProtocolDetailPageProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [notified, setNotified] = useState(false);
  const [suggested, setSuggested] = useState(false);
  const [summarySaved, setSummarySaved] = useState(initialBookmarked);
  const [toast, setToast] = useState<string | null>(null);

  const sourceMode = Boolean(source);
  const mode = sourceMode
    ? "overview"
    : resolveProtocolViewMode({
        detail,
        section: sectionSlug,
        state: viewState,
      });
  const section = detail ? findSection(detail, sectionSlug) : undefined;
  const headerTitle =
    mode === "section" && section
      ? section.nav_label
      : (source?.title ??
        detail?.protocol.short_title ??
        detail?.protocol.title ??
        "Recommandation");
  const backHref =
    mode === "section" && detail
      ? protocolHref(detail.protocol.slug)
      : "/search?type=protocols";

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
    const slug = detail?.protocol.slug ?? source?.slug;
    if (!slug) {
      return;
    }
    const result = await toggleFavorite("protocol", slug);
    if (!result.skipped) {
      setBookmarked(result.saved);
      setSummarySaved(result.saved);
    }
  }

  function toggleBookmark() {
    const next = !bookmarked;
    setBookmarked(next);
    setSummarySaved(next);
    showToast(next ? "Synthèse sauvegardée" : "Synthèse retirée");
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

  function toggleSummarySave() {
    const next = !summarySaved;
    setSummarySaved(next);
    setBookmarked(next);
    showToast(next ? "Synthèse sauvegardée" : "Synthèse retirée");
    void persistFavorite();
  }

  async function shareSummary() {
    const title = source?.title ?? detail?.protocol.title ?? "Recommandation Nabda";
    const text = detail?.available_summary ?? detail?.protocol.summary ?? title;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: text ?? title, url });
        showToast("Résumé prêt à partager");
        return;
      }
      await navigator.clipboard.writeText(`${title}\n${url}`);
      showToast("Lien du résumé copié");
    } catch {
      showToast("Partage annulé");
    }
  }

  let dockActions: DockAction[] = [];
  let dockMeta: string | undefined;

  if ((detail || source) && mode !== "missing") {
    const { next } = section
      ? adjacentSections(detail!, section.slug)
      : { next: detail?.sections.find((item) => item.show_in_cards) };
    dockMeta = source ? "Lecture / Garde · même source" : "Aperçu local";

    if (mode === "preparation") {
      dockActions = [
        {
          id: "save",
          label: summarySaved ? "Enregistré" : "Enregistrer",
          icon: summarySaved ? "bookmark-check" : "bookmark",
          active: summarySaved,
          onClick: toggleSummarySave,
        },
        {
          id: "share",
          label: "Partager",
          icon: "share",
          onClick: shareSummary,
        },
        {
          id: "sources",
          label: "Sources",
          icon: "sources",
          href: "/search?type=protocols",
        },
        {
          id: "cat",
          label: "Mode garde",
          icon: "cat",
          href: "/cat",
        },
      ];
    } else {
      const slug = detail?.protocol.slug ?? source?.slug ?? "";
      const nextHref = next
        ? protocolHref(slug, { section: next.slug })
        : `/cat/${slug}`;
      const catHref = `/cat/${slug}`;
      dockActions = [
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
          href: source ? `/cat/${slug}` : protocolHref(slug, { section: "sources" }),
        },
        {
          id: "next",
          label: next ? "Suivant" : "CAT",
          icon: "next",
          href: nextHref,
        },
        {
          id: "cat",
          label: "Mode garde",
          icon: "cat",
          href: catHref,
        },
      ];
    }
  }

  return (
    <div className="min-h-dvh bg-background text-on-surface">
      <div className="relative mx-auto min-h-dvh w-full max-w-[390px]">
        <DetailHeader
          contentType="Recommandation"
          title={headerTitle}
          backHref={backHref}
          bookmarked={bookmarked || summarySaved}
          onToggleBookmark={mode === "preparation" ? toggleSummarySave : toggleBookmark}
        />
        <main className="px-4 pt-[calc(64px+env(safe-area-inset-top,0px))] pb-[calc(128px+env(safe-area-inset-bottom,0px))]">
          <div className="pt-3">
            {source ? (
              <ProtocolSourceRenderer data={source} linkMode="public" />
            ) : null}
            {!source && (mode === "missing" || !detail) ? (
              <EmptyContentState
                title="Recommandation introuvable"
                description="Cette fiche n'est pas encore disponible. Structure en préparation."
              />
            ) : null}
            {!source && mode === "overview" && detail ? (
              <ProtocolOverview detail={detail} />
            ) : null}
            {!source && mode === "section" && detail && section ? (
              <ProtocolDeepSection detail={detail} section={section} />
            ) : null}
            {!source && mode === "preparation" && detail ? (
              <ProtocolPreparationState
                detail={detail}
                notified={notified}
                suggested={suggested}
                summarySaved={summarySaved}
                onNotify={toggleNotify}
                onSuggest={() => setSuggested(true)}
                onSaveSummary={toggleSummarySave}
                onShare={shareSummary}
              />
            ) : null}
          </div>
        </main>
        {dockActions.length > 0 ? (
          <BottomReadingDock actions={dockActions} meta={dockMeta} />
        ) : null}
        {toast ? (
          <p
            role="status"
            aria-live="polite"
            className="fixed bottom-[calc(96px+env(safe-area-inset-bottom,0px))] left-1/2 z-50 w-[min(358px,calc(100%-32px))] -translate-x-1/2 rounded-xl bg-primary px-4 py-3 text-center text-label-md text-on-primary shadow-sm"
          >
            {toast}
          </p>
        ) : null}
      </div>
    </div>
  );
}
