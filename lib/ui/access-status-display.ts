import type { StatusTone } from "@/components/ui/StatusBadge";
import type { SearchResultType } from "@/types/search";

/** Maps existing French access/status copy to StatusBadge tones — display only. */
export function accessLabelToTone(label: string): StatusTone {
  const normalized = label.trim().toLowerCase();
  if (normalized === "pro" || normalized.includes("pro requis")) {
    return "pro";
  }
  if (
    normalized.includes("hors-ligne") ||
    normalized.includes("hors ligne") ||
    normalized.includes("télécharg")
  ) {
    return "downloaded";
  }
  if (normalized.includes("mise à jour") || normalized.includes("obsolète")) {
    return "stale";
  }
  if (
    normalized.includes("connexion") ||
    normalized.includes("en ligne") ||
    normalized.includes("uniquement en ligne")
  ) {
    return "offline";
  }
  if (normalized.includes("gratuit") || normalized === "publié") {
    return "free";
  }
  if (normalized.includes("erreur") || normalized.includes("impossible")) {
    return "error";
  }
  return "muted";
}

const SEARCH_TYPE_LABELS: Record<SearchResultType, string> = {
  cat: "CAT",
  protocol: "Protocole",
  recommendation: "Protocole",
  drug: "Médicament",
  calculator: "Score",
};

export function searchResultTypeLabel(type: SearchResultType): string {
  return SEARCH_TYPE_LABELS[type] ?? "Contenu";
}

export const SEARCH_FIELD_PLACEHOLDER = "DCI, marque, CAT, protocole, score…";
