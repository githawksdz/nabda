"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
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
  const [toast, setToast] = useState<string | null>(null);
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

  function resetGlasgow() {
    setSelection(GLASGOW_DEFAULT_SELECTION);
    showToast("Score réinitialisé · E4 V5 M6");
  }

  function resetCockcroft() {
    setCockcroft(COCKCROFT_EMPTY_VALUES);
    showToast("Paramètres réinitialisés");
  }

  async function persistFavorite() {
    const result = await toggleFavorite("calculator", slug);
    if (!result.skipped) {
      setBookmarked(result.saved);
    }
  }

  function toggleBookmark() {
    const next = !bookmarked;
    setBookmarked(next);
    showToast(next ? "Score enregistré" : "Score retiré");
    void persistFavorite();
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
      showToast("Résultat copié");
    } catch {
      showToast("Partage annulé");
    }
  }

  async function copyCockcroftResult() {
    try {
      const copyText = await resolveCopyText();
      await navigator.clipboard.writeText(copyText);
      showToast("Résultat copié");
    } catch {
      showToast("Copie indisponible");
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
          onClick: toggleBookmark,
        },
        {
          id: "share",
          label: "Partager",
          icon: "share",
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
            onClick: toggleBookmark,
          },
          {
            id: "share",
            label: "Partager",
            icon: "share",
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
      <BottomReadingDock
        actions={dockActions}
        meta={specialtyActive ? "Aide au calcul · interprétation clinique" : undefined}
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
