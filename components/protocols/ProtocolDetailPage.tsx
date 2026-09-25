"use client";

import { useState } from "react";
import { ClinicalDetailFrame } from "@/components/content-detail/ClinicalDetailFrame";
import { DetailLibraryStatus } from "@/components/content-detail/DetailLibraryStatus";
import { BottomReadingDock, type DockAction } from "@/components/content-detail/BottomReadingDock";
import { EmptyContentState } from "@/components/content-detail/EmptyContentState";
import { ProtocolOverview } from "./ProtocolOverview";
import { ProtocolDeepSection } from "./ProtocolDeepSection";
import { ProtocolSourceRenderer } from "@/components/content-renderers/protocol/ProtocolSourceRenderer";
import {
  adjacentSections,
  findSection,
  protocolHref,
  resolveProtocolViewMode,
} from "@/lib/content-detail/content-detail-ui-config";
import { toggleFavorite } from "@/lib/content-detail/user-content-actions";
import {
  COPY_LABEL_MS,
  FAVORITE_ADDED_MESSAGE,
  FAVORITE_REMOVED_MESSAGE,
  FAVORITE_SIGN_IN_MESSAGE,
  FAVORITE_WRITE_FAILED_MESSAGE,
} from "@/lib/ui/feedback-timing";
import { reconcileFavorite } from "@/lib/ui/favorite-result";
import { StatusToast } from "@/components/ui/StatusToast";
import { useNotice, useTimedFlag } from "@/components/ui/useTimedFlag";
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
  const [summarySaved, setSummarySaved] = useState(initialBookmarked);
  const [pendingFavorite, setPendingFavorite] = useState(false);
  const [favoriteEmphasis, setFavoriteEmphasis] = useState(0);
  const [favoriteAnnouncement, setFavoriteAnnouncement] = useState("");
  const { notice, showToast, dismissToast } = useNotice();
  const copied = useTimedFlag(COPY_LABEL_MS);

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
        "Protocole");
  const backHref =
    mode === "section" && detail
      ? protocolHref(detail.protocol.slug)
      : "/search?type=protocols";

  async function persistFavorite(previous: boolean) {
    const slug = detail?.protocol.slug ?? source?.slug;
    if (!slug) {
      setBookmarked(previous);
      setSummarySaved(previous);
      return;
    }
    setPendingFavorite(true);
    const result = await toggleFavorite("protocol", slug);
    const next = reconcileFavorite(previous, result);
    setBookmarked(next.bookmarked);
    setSummarySaved(next.bookmarked);
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
    const next = !bookmarked;
    setBookmarked(next);
    setSummarySaved(next);
    void persistFavorite(previous);
  }

  function toggleSummarySave() {
    if (pendingFavorite) {
      return;
    }
    const previous = summarySaved;
    const next = !summarySaved;
    setSummarySaved(next);
    setBookmarked(next);
    void persistFavorite(previous);
  }

  async function shareSummary() {
    const title = source?.title ?? detail?.protocol.title ?? "Protocole";
    const text = detail?.available_summary ?? detail?.protocol.summary ?? title;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: text ?? title, url });
        showToast("Résumé prêt à partager");
        return;
      }
      await navigator.clipboard.writeText(`${title}\n${url}`);
      copied.start();
    } catch {
      showToast("Partage annulé", "alert");
    }
  }

  let dockActions: DockAction[] = [];
  let dockMeta: string | undefined;

  if ((detail || source) && mode !== "missing") {
    const { next } = section
      ? adjacentSections(detail!, section.slug)
      : { next: detail?.sections.find((item) => item.show_in_cards) };
    dockMeta = undefined;

    if (mode === "preparation") {
      dockActions = [
        {
          id: "save",
          label: summarySaved ? "Retirer" : "Favoris",
          icon: summarySaved ? "bookmark-check" : "bookmark",
          active: summarySaved,
          disabled: pendingFavorite,
          busy: pendingFavorite,
          emphasisKey: favoriteEmphasis,
          onClick: toggleSummarySave,
        },
        {
          id: "share",
          label: copied.active ? "Copié" : "Partager",
          icon: copied.active ? "check" : "share",
          onClick: shareSummary,
        },
        {
          id: "sources",
          label: "Références",
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
    <ClinicalDetailFrame title={headerTitle} backHref={backHref}>
        <DetailLibraryStatus
          contentType="protocol"
          slug={detail?.protocol.slug ?? source?.slug ?? ""}
        />
        <div className="pt-3">
            {source ? (
              <ProtocolSourceRenderer
                data={source}
                linkMode="public"
                sectionSlug={sectionSlug}
              />
            ) : null}
            {!source && (mode === "missing" || !detail) ? (
              <EmptyContentState
                title="Protocole introuvable"
                description="Cette fiche n'est pas disponible dans Nabda."
              />
            ) : null}
            {!source && mode === "overview" && detail ? (
              <ProtocolOverview detail={detail} />
            ) : null}
            {!source && mode === "section" && detail && section ? (
              <ProtocolDeepSection detail={detail} section={section} />
            ) : null}
          </div>
        {dockActions.length > 0 ? (
          <BottomReadingDock actions={dockActions} meta={dockMeta} />
        ) : null}
        <p className="sr-only" role="status" aria-live="polite">
          {favoriteAnnouncement}
        </p>
        <StatusToast notice={notice} onDismiss={dismissToast} />
    </ClinicalDetailFrame>
  );
}
