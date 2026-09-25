/**
 * CAT rendering mappers. Source wording is preserved.
 * Steps are only regrouped for mobile display — never paraphrased, never turned into a graph.
 */

import { detectSamu15 } from "@/lib/nabda-db/html/content-flags";
import { sourceIdToSlug } from "@/lib/nabda-db/slugs";
import {
  extractLinkedChips,
  rewriteNabdaHref,
} from "@/lib/content-rendering/protocol";
import { catSourceMediaHref } from "@/lib/content-rendering/render-state";
import type { NabdaCatStep } from "@/types/nabda-cat-steps";
import type {
  CatRenderEtapesGroup,
  CatRenderGroup,
  CatRenderMedia,
  CatRenderChip,
  CatRenderMode,
  CatRenderSource,
  CatRenderShiftGroup,
  CatRenderStats,
} from "@/types/content-rendering-cat";

export const ETAPES_PREVIEW_GROUP_ORDER: CatRenderEtapesGroup[] = [
  "Entrée",
  "Gravité",
  "Diagnostic",
  "Examens",
  "Prise en charge",
  "Traitements",
  "Surveillance",
  "Orientation",
  "Outils",
  "Sources",
];

export const SHIFT_PREVIEW_GROUP_ORDER: CatRenderShiftGroup[] = [
  "Urgent maintenant",
  "À vérifier",
  "À faire",
  "À surveiller",
  "Liens utiles",
  "Contexte",
];

export const CAT_STICKY_CHIPS: Array<{
  id: string;
  label: string;
  etapesId: string;
  gardeId: string;
  gardeLabel?: string;
}> = [
  { id: "tout", label: "Tout", etapesId: "tout", gardeId: "tout" },
  {
    id: "gravite",
    label: "Gravité",
    etapesId: "gravite",
    gardeId: "urgent-maintenant",
    gardeLabel: "Urgent maintenant",
  },
  {
    id: "diagnostic",
    label: "Diagnostic",
    etapesId: "diagnostic",
    gardeId: "a-verifier",
    gardeLabel: "À vérifier",
  },
  {
    id: "prise-en-charge",
    label: "Prise en charge",
    etapesId: "prise-en-charge",
    gardeId: "a-faire",
    gardeLabel: "À faire",
  },
  {
    id: "surveillance",
    label: "Surveillance",
    etapesId: "surveillance",
    gardeId: "a-surveiller",
    gardeLabel: "À surveiller",
  },
  {
    id: "sources",
    label: "Sources",
    etapesId: "sources",
    gardeId: "contexte",
    gardeLabel: "Contexte",
  },
  { id: "image", label: "Schéma", etapesId: "image", gardeId: "image" },
];

/** Garde chips: one jump target per shift group (no duplicate mappings). */
export const CAT_GARDE_STICKY_CHIPS: Array<{
  id: string;
  label: string;
  targetId: string;
}> = [
  { id: "tout", label: "Tout", targetId: "tout" },
  { id: "urgent-maintenant", label: "Urgent", targetId: "urgent-maintenant" },
  { id: "a-verifier", label: "À vérifier", targetId: "a-verifier" },
  { id: "a-faire", label: "À faire", targetId: "a-faire" },
  { id: "a-surveiller", label: "Surveillance", targetId: "a-surveiller" },
  { id: "liens-utiles", label: "Liens", targetId: "liens-utiles" },
  { id: "contexte", label: "Contexte", targetId: "contexte" },
  { id: "image", label: "Schéma", targetId: "image" },
];

export function catGroupAnchorId(groupId: string): string {
  return `cat-group-${groupId}`;
}

export function catImageAnchorId(): string {
  return "cat-static-image";
}

export function slugifyCatGroup(label: string): string {
  return label
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function flowchartFilename(sourcePath: string): string {
  const normalized = sourcePath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  return parts[parts.length - 1] ?? sourcePath;
}

export function etapesGroupForStep(step: NabdaCatStep): CatRenderEtapesGroup {
  switch (step.kind) {
    case "entry":
      return "Entrée";
    case "red_flag":
    case "severity_check":
      return "Gravité";
    case "diagnostic_check":
      return "Diagnostic";
    case "workup":
      return "Examens";
    case "treatment":
    case "medication":
      return "Traitements";
    case "monitoring":
      return "Surveillance";
    case "orientation":
      return "Orientation";
    case "calculator":
      return "Outils";
    case "source":
      return "Sources";
    default:
      return "Prise en charge";
  }
}

export function shiftGroupForStep(step: NabdaCatStep): CatRenderShiftGroup {
  if (
    step.priority === "critical" ||
    step.priority === "urgent" ||
    step.display === "alert_step" ||
    step.kind === "red_flag" ||
    step.kind === "severity_check"
  ) {
    return "Urgent maintenant";
  }
  if (step.kind === "diagnostic_check" || step.kind === "workup") {
    return "À vérifier";
  }
  if (step.kind === "monitoring") {
    return "À surveiller";
  }
  if (step.kind === "calculator" || step.containsCalculatorMention) {
    return "Liens utiles";
  }
  if (
    step.priority === "background" ||
    step.kind === "entry" ||
    step.kind === "source"
  ) {
    return "Contexte";
  }
  return "À faire";
}

function sortSteps(steps: NabdaCatStep[]): NabdaCatStep[] {
  return [...steps].sort((a, b) => {
    const priorityRank = (value: NabdaCatStep["priority"]) => {
      if (value === "critical") return 0;
      if (value === "urgent") return 1;
      if (value === "normal") return 2;
      return 3;
    };
    const byPriority = priorityRank(a.priority) - priorityRank(b.priority);
    if (byPriority !== 0) return byPriority;
    return (a.sourceOrder ?? a.order) - (b.sourceOrder ?? b.order);
  });
}

export function buildCatPreviewGroups(
  steps: NabdaCatStep[],
  mode: CatRenderMode,
): CatRenderGroup[] {
  if (mode === "image") {
    return [];
  }
  if (mode === "garde") {
    const buckets = new Map<CatRenderShiftGroup, NabdaCatStep[]>();
    for (const label of SHIFT_PREVIEW_GROUP_ORDER) {
      buckets.set(label, []);
    }
    for (const step of steps) {
      buckets.get(shiftGroupForStep(step))?.push(step);
    }
    return SHIFT_PREVIEW_GROUP_ORDER.map((label) => ({
      id: slugifyCatGroup(label),
      label,
      steps: sortSteps(buckets.get(label) ?? []),
      collapsedByDefault: label === "Contexte",
    })).filter((group) => group.steps.length > 0);
  }

  const buckets = new Map<CatRenderEtapesGroup, NabdaCatStep[]>();
  for (const label of ETAPES_PREVIEW_GROUP_ORDER) {
    buckets.set(label, []);
  }
  for (const step of steps) {
    buckets.get(etapesGroupForStep(step))?.push(step);
  }
  return ETAPES_PREVIEW_GROUP_ORDER.map((label) => ({
    id: slugifyCatGroup(label),
    label,
    steps: [...(buckets.get(label) ?? [])].sort(
      (a, b) => (a.sourceOrder ?? a.order) - (b.sourceOrder ?? b.order),
    ),
  })).filter((group) => group.steps.length > 0);
}

export function mapFlowchartImages(
  sourcePaths: string[],
  availableFiles: Set<string>,
  keepInternalQuery: boolean,
  linkMode: "public" | "internal" = "internal",
  slug?: string,
): CatRenderMedia[] {
  return sourcePaths.map((sourcePath) => {
    const filename = flowchartFilename(sourcePath);
    const available = availableFiles.has(filename);
    return {
      sourcePath,
      filename,
      available,
      href: available
        ? catSourceMediaHref(filename, linkMode === "public", keepInternalQuery, slug)
        : "",
    };
  });
}

export function collectCatLinkedTools(
  steps: NabdaCatStep[],
  keepInternalQuery: boolean,
  linkMode: "public" | "internal" = "internal",
): CatRenderChip[] {
  const suffix = keepInternalQuery && linkMode === "internal" ? "?preview=internal" : "";
  const chips: CatRenderChip[] = [];
  const seen = new Set<string>();

  const push = (chip: CatRenderChip) => {
    if (seen.has(chip.id)) return;
    seen.add(chip.id);
    chips.push(chip);
  };

  for (const step of steps) {
    for (const sourceId of step.linkedSourceIds ?? []) {
      const kind: CatRenderChip["kind"] = sourceId.startsWith("g.")
        ? "cat"
        : sourceId.startsWith("calc.")
          ? "calculator"
          : "drug";
      push({
        id: sourceId,
        label: sourceIdToSlug(sourceId) || sourceId,
        href: rewriteNabdaHref(sourceId, suffix, "cat", linkMode),
        kind,
      });
    }
    for (const chip of extractLinkedChips(step.html, suffix, "cat", linkMode)) {
      push({
        id: chip.id,
        label: chip.label,
        href: rewriteNabdaHref(chip.id, suffix, "cat", linkMode),
        kind:
          chip.kind === "protocol"
            ? "cat"
            : chip.kind,
      });
    }
  }
  return chips;
}

export function collectCatPreviewStats(
  steps: NabdaCatStep[],
  images: CatRenderMedia[],
  imagemapStripped: boolean,
  skippedSectionTitles: string[],
): CatRenderStats {
  return {
    stepCount: steps.length,
    doseCount: steps.filter((step) => step.containsDose).length,
    emergencyCount: steps.filter((step) => step.containsEmergencySignal).length,
    calculatorCount: steps.filter(
      (step) => step.containsCalculatorMention || step.kind === "calculator",
    ).length,
    drugCount: steps.filter((step) => step.containsDrugMention).length,
    tableCount: steps.filter((step) => step.containsTable).length,
    unresolvedTitleCount: steps.filter((step) =>
      step.warnings.includes("unresolved_step_pattern"),
    ).length,
    samu15Count: steps.filter((step) => detectSamu15(step.text)).length,
    tooManySteps: steps.length > 24,
    skippedSectionCount: skippedSectionTitles.length,
    skippedSectionTitles,
    pngAvailableCount: images.filter((image) => image.available).length,
    pngMissingCount: images.filter((image) => !image.available).length,
    imagemapStripped,
    hasInteractiveGraph: false,
  };
}

export function extractionStatusCopy(
  mode: CatRenderSource["extractionMode"],
): string {
  if (mode === "itemcom" || mode === "ordered_list") {
    return "Étapes linéaires disponibles. Le schéma interactif n'est pas activé.";
  }
  return "Pas d'étapes linéaires extraites pour cette fiche.";
}

export function priorityLabel(priority: NabdaCatStep["priority"]): string {
  switch (priority) {
    case "critical":
      return "Critique";
    case "urgent":
      return "Urgent";
    case "background":
      return "Contexte";
    default:
      return "Normal";
  }
}
