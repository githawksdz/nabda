import type {
  CatDetail,
  CatDetailViewMode,
  CatTab,
  ProtocolDetail,
  ProtocolSection,
  ProtocolViewMode,
  SectionNavItem,
} from "@/types/content-detail";

/** Interface labels and href helpers only — no medical detail payloads. */

export function firstQueryValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function resolveProtocolViewMode(input: {
  detail?: ProtocolDetail;
  section?: string;
  state?: string;
}): ProtocolViewMode {
  if (!input.detail) {
    return "missing";
  }
  if (input.state === "preparation" || !input.detail.protocol.has_full_recommendation) {
    return "preparation";
  }
  if (
    input.section &&
    input.detail.sections.some((section) => section.slug === input.section)
  ) {
    return "section";
  }
  return "overview";
}

export function getSectionNavItems(detail: ProtocolDetail): SectionNavItem[] {
  return [
    { slug: null, label: "Points clés" },
    ...detail.sections.map((section) => ({
      slug: section.slug,
      label: section.nav_label,
    })),
  ];
}

export function protocolHref(
  slug: string,
  query?: { section?: string; state?: string },
): string {
  const params = new URLSearchParams();
  if (query?.section) {
    params.set("section", query.section);
  }
  if (query?.state) {
    params.set("state", query.state);
  }
  const qs = params.toString();
  return qs ? `/protocols/${slug}?${qs}` : `/protocols/${slug}`;
}

export function findSection(
  detail: ProtocolDetail,
  slug: string | undefined,
): ProtocolSection | undefined {
  if (!slug) {
    return undefined;
  }
  return detail.sections.find((section) => section.slug === slug);
}

export function adjacentSections(
  detail: ProtocolDetail,
  slug: string,
): { previous?: ProtocolSection; next?: ProtocolSection } {
  const index = detail.sections.findIndex((section) => section.slug === slug);
  if (index < 0) {
    return {};
  }
  return {
    previous: detail.sections[index - 1],
    next: detail.sections[index + 1],
  };
}

export function readingTrackerLabel(
  detail: ProtocolDetail,
  section: ProtocolSection,
): string {
  const shortTitle =
    detail.protocol.short_title ?? detail.protocol.title.split(" et ")[0];
  const minutes = section.reading_time_minutes ?? 2;
  if (section.slug === "sources") {
    return `${shortTitle} · Sources · à consolider`;
  }
  return `${shortTitle} · Section ${section.order} sur ${detail.article.section_count} · ${minutes} min`;
}

export const CARD_SECTIONS_TITLE = "Parcours séquentiel";
export const KEY_POINTS_TITLE = "Points clés";
export const LINKED_CONTENT_TITLE = "Outils et contenus liés";
export const REVIEW_PANEL_TITLE = "Statut éditorial";
export const PREPARATION_TITLE = "Protocole intégral en préparation";
export const PREPARATION_SUBTITLE =
  "Le résumé existe déjà. La version complète sera publiée après relecture.";

export const CAT_TABS: { id: CatTab; label: string }[] = [
  { id: "carte", label: "Carte" },
  { id: "etapes", label: "Étapes" },
  { id: "notes", label: "Notes" },
  { id: "sources", label: "Sources" },
];

export const CAT_LINKED_TOOLS_TITLE = "Outils décisionnels liés";
export const CAT_RED_FLAGS_TITLE = "Signaux d’alerte";
export const CAT_MAP_PREPARATION_TITLE = "Carte CAT en préparation";
export const CAT_MAP_PREPARATION_SUBTITLE =
  "La fiche existe déjà. La carte décisionnelle sera ajoutée après validation.";
export const CAT_CARTE_PLACEHOLDER_TITLE = "Carte interactive à intégrer";
export const CAT_CARTE_PLACEHOLDER_SUBTITLE =
  "Le canevas zoomable sera ajouté dans l’étape suivante.";

export function catHref(
  slug: string,
  query?: { tab?: CatTab; state?: string },
): string {
  const params = new URLSearchParams();
  if (query?.tab) {
    params.set("tab", query.tab);
  }
  if (query?.state) {
    params.set("state", query.state);
  }
  const qs = params.toString();
  return qs ? `/cat/${slug}?${qs}` : `/cat/${slug}`;
}

export function resolveCatTab(tab?: string): CatTab {
  if (tab === "carte" || tab === "etapes" || tab === "notes" || tab === "sources") {
    return tab;
  }
  return "carte";
}

export function resolveCatDetailMode(input: {
  detail?: CatDetail;
  state?: string;
}): CatDetailViewMode {
  if (!input.detail) {
    return "missing";
  }
  if (input.state === "preparation") {
    return "preparation";
  }
  return "tabs";
}
