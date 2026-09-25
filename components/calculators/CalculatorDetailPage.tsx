"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ClinicalDetailFrame } from "@/components/content-detail/ClinicalDetailFrame";
import { DetailLibraryStatus } from "@/components/content-detail/DetailLibraryStatus";
import {
  BottomReadingDock,
  type DockAction,
} from "@/components/content-detail/BottomReadingDock";
import { CalculatorIdentity } from "./CalculatorIdentity";
import { CalculatorSourceRenderer } from "@/components/content-renderers/calculator/CalculatorSourceRenderer";
import {
  COCKCROFT_EMPTY_VALUES,
  GLASGOW_DEFAULT_SELECTION,
  SpecialtyCalculatorShell,
} from "./SpecialtyCalculatorShell";
import type { SpecialtyCalculatorUiKind } from "@/lib/calculators/specialty-calculator-ui";
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
import type {
  CalculatorDetailMode,
  CalculatorSummary,
  CockcroftFormValues,
  GlasgowSelection,
} from "@/types/calculators";
import type { CalculatorRenderData } from "@/types/content-rendering";

const AdditivePointsCalculator = dynamic(
  () => import("./AdditivePointsCalculator").then((mod) => mod.AdditivePointsCalculator),
  { ssr: false },
);
const GeneratedFormulaCalculator = dynamic(
  () =>
    import("./GeneratedFormulaCalculator").then((mod) => mod.GeneratedFormulaCalculator),
  { ssr: false },
);

type CalculatorDetailPageProps = {
  slug: string;
  calculator: CalculatorSummary;
  source?: CalculatorRenderData | null;
  mode: CalculatorDetailMode;
  specialtyUi?: SpecialtyCalculatorUiKind | null;
  initialBookmarked?: boolean;
};

export function CalculatorDetailPage({
  slug,
  calculator,
  source,
  mode,
  specialtyUi,
  initialBookmarked = false,
}: CalculatorDetailPageProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pendingFavorite, setPendingFavorite] = useState(false);
  const [favoriteEmphasis, setFavoriteEmphasis] = useState(0);
  const [favoriteAnnouncement, setFavoriteAnnouncement] = useState("");
  const { notice, showToast, dismissToast } = useNotice();
  const copied = useTimedFlag(COPY_LABEL_MS);
  const [selection, setSelection] = useState<GlasgowSelection>(
    GLASGOW_DEFAULT_SELECTION,
  );
  const [cockcroft, setCockcroft] = useState<CockcroftFormValues>(
    COCKCROFT_EMPTY_VALUES,
  );

  const specialtyActive = mode === "specialty" && Boolean(specialtyUi);
  const additiveActive = mode === "additive" && Boolean(source);
  const formulaActive = mode === "formula" && Boolean(source);
  const sourceMode = mode === "source" && Boolean(source);

  async function persistFavorite(previous: boolean) {
    setPendingFavorite(true);
    const result = await toggleFavorite("calculator", slug);
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

  function resetGlasgow() {
    setSelection(GLASGOW_DEFAULT_SELECTION);
    showToast("Score réinitialisé · E4 V5 M6");
  }

  function resetCockcroft() {
    setCockcroft(COCKCROFT_EMPTY_VALUES);
    showToast("Paramètres réinitialisés");
  }

  async function resolveCopyText() {
    if (specialtyUi === "glasgow") {
      const { glasgowCopyText, interpretGlasgow } = await import(
        "@/lib/calculators/glasgow"
      );
      return glasgowCopyText(interpretGlasgow(selection));
    }
    if (specialtyUi === "cockcroft") {
      const { cockcroftCopyText, computeCockcroft } = await import(
        "@/lib/calculators/cockcroft-gault"
      );
      return cockcroftCopyText(cockcroft, computeCockcroft(cockcroft));
    }
    return calculator.name;
  }

  async function shareCalculator() {
    const title = source?.title ?? calculator.name;
    const url = window.location.href;
    const copyText = await resolveCopyText();
    try {
      if (navigator.share) {
        await navigator.share({ title, text: copyText, url });
        showToast("Fiche prête à partager");
        return;
      }
      await navigator.clipboard.writeText(`${copyText}\n${url}`);
      copied.start();
    } catch {
      showToast("Partage annulé", "alert");
    }
  }

  async function copyCockcroftResult(): Promise<boolean> {
    try {
      const copyText = await resolveCopyText();
      await navigator.clipboard.writeText(copyText);
      return true;
    } catch {
      showToast("Copie indisponible", "alert");
      return false;
    }
  }

  const headerTitle =
    source?.title ?? calculator.shortName ?? calculator.name ?? "Calculateur";

  const dockActions: DockAction[] = specialtyActive
    ? [
        {
          id: "reset",
          label: "Réinit.",
          icon: "reset",
          onClick: specialtyUi === "glasgow" ? resetGlasgow : resetCockcroft,
        },
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
          id: "share",
          label: copied.active ? "Copié" : "Partager",
          icon: copied.active ? "check" : "share",
          onClick: shareCalculator,
        },
      ]
    : sourceMode || additiveActive || formulaActive
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
            id: "share",
            label: copied.active ? "Copié" : "Partager",
            icon: copied.active ? "check" : "share",
            onClick: shareCalculator,
          },
        ]
      : [];

  return (
    <ClinicalDetailFrame title={headerTitle} backHref="/calculators">
      <DetailLibraryStatus contentType="calculator" slug={slug} />
      <div className="flex flex-col gap-4 pt-3">
        <CalculatorIdentity calculator={calculator} />

        {specialtyActive && specialtyUi ? (
          <SpecialtyCalculatorShell
            uiKind={specialtyUi}
            glasgowSelection={selection}
            onGlasgowChange={setSelection}
            onGlasgowReset={resetGlasgow}
            cockcroftValues={cockcroft}
            onCockcroftChange={setCockcroft}
            onCockcroftReset={resetCockcroft}
            onCockcroftCopy={copyCockcroftResult}
          />
        ) : null}

        {additiveActive && source ? (
          <AdditivePointsCalculator data={source} />
        ) : null}

        {formulaActive && source ? (
          <GeneratedFormulaCalculator data={source} />
        ) : null}

        {sourceMode && source ? (
          <CalculatorSourceRenderer
            data={source}
            linkMode="public"
            showIdentity={false}
            enginePending={false}
          />
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
