"use client";

import { useEffect, useMemo, useState } from "react";
import { CalculatorBottomDock } from "./CalculatorBottomDock";
import { CalculatorDetailHeader } from "./CalculatorDetailHeader";
import { CalculatorIdentity } from "./CalculatorIdentity";
import { CalculatorPreparationState } from "./CalculatorPreparationState";
import { AdditivePointsCalculator } from "./AdditivePointsCalculator";
import { GeneratedFormulaCalculator } from "./GeneratedFormulaCalculator";
import { CockcroftCalculator } from "./cockcroft/CockcroftCalculator";
import { GlasgowCalculator } from "./glasgow/GlasgowCalculator";
import { CalculatorSourceRenderer } from "@/components/content-renderers/calculator/CalculatorSourceRenderer";
import {
  COCKCROFT_EMPTY_VALUES,
  COCKCROFT_IDENTITY,
  cockcroftCopyText,
  computeCockcroft,
} from "@/lib/calculators/cockcroft-gault";
import {
  GLASGOW_DEFAULT_SELECTION,
  GLASGOW_IDENTITY,
  glasgowCopyText,
  interpretGlasgow,
} from "@/lib/calculators/glasgow";
import { resolveCalculatorDetailMode } from "@/lib/calculators/calculator-mappers";
import {
  PUQE_RESOURCES,
  PUQE_VARIABLES,
  PUQE_VERSION_LABEL,
  isPuqeSlug,
} from "@/lib/calculators/calculator-ui-config";
import { toggleFavorite } from "@/lib/content-detail/user-content-actions";
import type { CalculatorDockAction } from "./CalculatorBottomDock";
import type {
  CalculatorDetailMode,
  CalculatorSummary,
  CockcroftFormValues,
  GlasgowSelection,
} from "@/types/calculators";
import type { CalculatorRenderData } from "@/types/content-rendering";

type CalculatorDetailPageProps = {
  slug: string;
  calculator?: CalculatorSummary;
  source?: CalculatorRenderData | null;
  mode?: CalculatorDetailMode;
  initialBookmarked?: boolean;
};

export function CalculatorDetailPage({
  slug,
  calculator,
  source,
  mode: modeProp,
  initialBookmarked = false,
}: CalculatorDetailPageProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [toast, setToast] = useState<string | null>(null);
  const [notified, setNotified] = useState(false);
  const [selection, setSelection] = useState<GlasgowSelection>(
    GLASGOW_DEFAULT_SELECTION,
  );
  const [cockcroft, setCockcroft] = useState<CockcroftFormValues>(
    COCKCROFT_EMPTY_VALUES,
  );
  const mode = modeProp ?? resolveCalculatorDetailMode(slug, calculator);
  const glasgow = mode === "glasgow";
  const cockcroftActive = mode === "cockcroft";
  const additiveActive = mode === "additive" && Boolean(source);
  const formulaActive = mode === "formula" && Boolean(source);
  const sourceMode = mode === "source" && Boolean(source);
  const unavailable = mode === "unavailable" && Boolean(source);
  const preparation = mode === "preparation" || mode === "missing";
  const puqe = isPuqeSlug(slug);
  const interpretation = useMemo(
    () => interpretGlasgow(selection),
    [selection],
  );
  const cockcroftResult = useMemo(
    () => computeCockcroft(cockcroft),
    [cockcroft],
  );
  const copyText = glasgow
    ? glasgowCopyText(interpretation)
    : cockcroftActive
      ? cockcroftCopyText(cockcroft, cockcroftResult)
      : (calculator?.name ?? "Calculateur Nabda");

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

  function toggleNotify() {
    const next = !notified;
    setNotified(next);
    showToast(next ? "Alerte programmée" : "Alerte retirée");
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

  async function shareCalculator() {
    const title = source?.title ?? calculator?.name ?? "Calculateur Nabda";
    const url = window.location.href;
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
      await navigator.clipboard.writeText(copyText);
      showToast("Résultat copié");
    } catch {
      showToast("Copie indisponible");
    }
  }

  const headerTitle = glasgow
    ? GLASGOW_IDENTITY.headerTitle
    : cockcroftActive
      ? COCKCROFT_IDENTITY.headerTitle
      : (source?.title ?? calculator?.shortName ?? calculator?.name ?? "Calculateur");

  const dockActions: CalculatorDockAction[] = glasgow
    ? [
        {
          id: "reset",
          label: "Réinit.",
          icon: "reset",
          onClick: resetGlasgow,
        },
        {
          id: "save",
          label: bookmarked ? "Enregistré" : "Enregistrer",
          icon: bookmarked ? "bookmark-check" : "bookmark",
          active: bookmarked,
          onClick: toggleBookmark,
        },
        {
          id: "cat",
          label: "CAT",
          icon: "cat",
          href: "/cat/coma-glasgow-inferieur-8",
        },
        {
          id: "share",
          label: "Partager",
          icon: "share",
          onClick: shareCalculator,
        },
      ]
    : cockcroftActive
      ? [
          {
            id: "reset",
            label: "Réinit.",
            icon: "reset",
            onClick: resetCockcroft,
          },
          {
            id: "save",
            label: bookmarked ? "Enregistré" : "Enregistrer",
            icon: bookmarked ? "bookmark-check" : "bookmark",
            active: bookmarked,
            onClick: toggleBookmark,
          },
          {
            id: "cat",
            label: "CAT",
            icon: "cat",
            href: "/cat/insuffisance-renale",
          },
          {
            id: "share",
            label: "Partager",
            icon: "share",
            onClick: shareCalculator,
          },
        ]
      : sourceMode || additiveActive || formulaActive || unavailable
      ? [
          {
            id: "save",
            label: bookmarked ? "Enregistré" : "Enregistrer",
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
    <div className="min-h-dvh bg-background text-on-surface">
      <div className="relative mx-auto min-h-dvh w-full max-w-[390px]">
        <CalculatorDetailHeader
          title={headerTitle}
          backHref="/calculators"
          bookmarked={bookmarked}
          onToggleBookmark={toggleBookmark}
          onShare={shareCalculator}
        />
        <main
          className={
            preparation && !sourceMode
              ? "px-4 pt-[calc(64px+env(safe-area-inset-top,0px))] pb-[calc(32px+env(safe-area-inset-bottom,0px))]"
              : "px-4 pt-[calc(64px+env(safe-area-inset-top,0px))] pb-[calc(128px+env(safe-area-inset-bottom,0px))]"
          }
        >
          <div className="flex flex-col gap-4 pt-3">
            {calculator && (glasgow || cockcroftActive) ? (
              <CalculatorIdentity
                calculator={calculator}
                eyebrow={glasgow ? GLASGOW_IDENTITY.eyebrow : COCKCROFT_IDENTITY.eyebrow}
                title={glasgow ? GLASGOW_IDENTITY.title : COCKCROFT_IDENTITY.title}
                subtitle={
                  glasgow
                    ? GLASGOW_IDENTITY.subtitle
                    : COCKCROFT_IDENTITY.subtitle
                }
              />
            ) : null}

            {glasgow && calculator ? (
              <GlasgowCalculator
                selection={selection}
                onChange={setSelection}
                onReset={resetGlasgow}
              />
            ) : null}

            {cockcroftActive && calculator ? (
              <CockcroftCalculator
                values={cockcroft}
                onChange={setCockcroft}
                onReset={resetCockcroft}
                onCopy={copyCockcroftResult}
              />
            ) : null}

            {additiveActive && source ? (
              <AdditivePointsCalculator data={source} />
            ) : null}

            {formulaActive && source ? (
              <GeneratedFormulaCalculator data={source} />
            ) : null}

            {unavailable && source ? (
              <aside
                role="status"
                className="rounded-xl bg-surface-container-low px-3.5 py-3"
              >
                <p className="text-label-md">
                  Calculateur temporairement indisponible
                </p>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  La logique source n&apos;a pas pu être compilée en moteur typé
                  sûr. Aucun résultat fictif n&apos;est affiché.
                </p>
                <div className="mt-3">
                  <CalculatorSourceRenderer
                    data={source}
                    linkMode="public"
                    showIdentity={false}
                    enginePending={false}
                  />
                </div>
              </aside>
            ) : null}

            {sourceMode && source ? (
              <CalculatorSourceRenderer
                data={source}
                linkMode="public"
                showIdentity={false}
                enginePending={false}
              />
            ) : null}

            {preparation && !sourceMode ? (
              <CalculatorPreparationState
                calculator={calculator}
                missing={mode === "missing"}
                versionLabel={puqe ? PUQE_VERSION_LABEL : undefined}
                statusLabel="En préparation"
                noticeTitle={
                  mode === "missing"
                    ? "Calculateur introuvable"
                    : "Calculateur en cours d'homologation"
                }
                noticeBody={
                  mode === "missing"
                    ? "Cet outil n'est pas encore disponible. Structure en préparation."
                    : "Algorithme et pondérations en phase de relecture médicale. Saisie désactivée."
                }
                variablesTitle={
                  puqe ? "Variables cliniques du score (3)" : undefined
                }
                variables={puqe ? PUQE_VARIABLES : []}
                resources={puqe ? PUQE_RESOURCES : []}
                notified={notified}
                onNotify={toggleNotify}
              />
            ) : null}
          </div>
        </main>
        <CalculatorBottomDock
          actions={dockActions}
          meta={
            glasgow || cockcroftActive
              ? "Aide au calcul · interprétation clinique"
              : undefined
          }
        />
        {toast ? (
          <p
            role="status"
            aria-live="polite"
            className={
              preparation
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
