import type {
  CatCard,
  CatConnectedModule,
  CatEmergencyFilter,
  CatFilterChip,
  CatUpcomingTree,
} from "@/types/cat";

/** Interface labels and chips only — counts come from catalog data at runtime. */

export const CAT_IDENTITY = {
  title: "Conduites à tenir",
  subtitle: "Des cartes cliniques pour agir vite sans perdre le raisonnement.",
};

export function catIdentityCountLabel(catalogCount: number): string {
  if (catalogCount <= 0) {
    return "Référentiel CAT";
  }
  if (catalogCount === 1) {
    return "1 CAT disponible";
  }
  return `${catalogCount} CAT disponibles`;
}

export const GENERAL_FILTER_CHIPS: CatFilterChip[] = [
  { id: "all", label: "Tous" },
  { id: "urgences", label: "Urgences" },
  { id: "cardiologie", label: "Cardio" },
  { id: "pediatrie", label: "Pédiatrie" },
  { id: "infectiologie", label: "Infectieux" },
  { id: "pneumologie", label: "Pneumo" },
  { id: "neurologie", label: "Neuro" },
  { id: "digestif", label: "Digestif" },
];

export const URGENCES_FILTER_CHIPS: CatFilterChip[] = [
  { id: "all", label: "Tous" },
  { id: "urgences", label: "Urgences" },
  { id: "cardiologie", label: "Cardio" },
  { id: "pediatrie", label: "Pédiatrie" },
  { id: "infectiologie", label: "Infectieux" },
  { id: "pneumologie", label: "Pneumo" },
];

export const PREPARATION_FILTER_CHIPS: CatFilterChip[] = [
  { id: "all", label: "Tous" },
  { id: "dermatologie", label: "Dermatologie" },
  { id: "urgences", label: "Urgences" },
  { id: "cardiologie", label: "Cardiologie" },
  { id: "pediatrie", label: "Pédiatrie" },
  { id: "neurologie", label: "Neurologie" },
];

/**
 * Derive chip counts from the listed catalog.
 * Specialty category counts are omitted when rows have no specialty metadata
 * (cat_maps identity rows do not currently expose category_slug).
 */
export function generalFilterChipsForCatalog(
  catalog: CatCard[],
): CatFilterChip[] {
  const total = catalog.length;
  const urgent = catalog.filter(
    (card) => card.urgency === "urgent" || card.urgency === "vital",
  ).length;

  return GENERAL_FILTER_CHIPS.map((chip) => {
    if (chip.id === "all") {
      return { ...chip, count: total > 0 ? total : undefined };
    }
    if (chip.id === "urgences") {
      return { ...chip, count: urgent > 0 ? urgent : undefined };
    }
    return chip;
  });
}

export function urgencesFilterChipsForCatalog(
  catalog: CatCard[],
): CatFilterChip[] {
  const urgent = catalog.filter(
    (card) => card.urgency === "urgent" || card.urgency === "vital",
  ).length;
  const total = catalog.length;

  return URGENCES_FILTER_CHIPS.map((chip) => {
    if (chip.id === "all") {
      return { ...chip, count: total > 0 ? total : undefined };
    }
    if (chip.id === "urgences") {
      return { ...chip, count: urgent > 0 ? urgent : undefined };
    }
    return chip;
  });
}

export const OFFLINE_CALLOUT = {
  title: "Pack garde hors-ligne",
  body: "CAT critiques disponibles sans connexion internet en sous-sol ou box de déchocage.",
  meta: "Espace local configurable",
  actionLabel: "Gérer le stockage",
  href: "/offline",
};

export const EMERGENCY_SUB_FILTERS: CatEmergencyFilter[] = [
  { id: "all", label: "Tous réflexes" },
  { id: "redflags", label: "Déchocage immédiat (Red Flags)", alert: true },
  { id: "sauv", label: "Tri 1-2 SAUV" },
  { id: "ped", label: "Pédiatrie urgence" },
];

export const URGENCY_BANNER = {
  title: "Mode Garde & Déchocage",
  // Design placeholder: replace with verified source/review metadata before production.
  chip: "SFMU 2024",
  description:
    "Protocoles décisionnels stabilisés SRLF / SFMU. Disponibles à 100% hors-ligne pour la prise en charge immédiate.",
};

export const PREPARATION_PANEL = {
  // Design placeholder: replace with verified source/review metadata before production.
  milestone: "Phase de relecture SFD · T2 2025",
  title: "CAT Dermatologie en préparation",
  subtitle:
    "Cette spécialité est actuellement en cours d'élaboration par le comité scientifique Nabda. Les protocoles décisionnels majeurs arrivent très prochainement.",
};

export const UPCOMING_TREES: CatUpcomingTree[] = [
  { id: "toxidermies", label: "Toxidermies aiguës", iconName: "git-branch" },
  { id: "eruptions", label: "Éruptions fébriles", iconName: "thermometer" },
  { id: "erysipele", label: "Érysipèle & dermo-hypodermites", iconName: "bug" },
];

export const CONNECTED_MODULES: CatConnectedModule[] = [
  {
    id: "urgences",
    title: "Arbres d'urgence & déchocage",
    subtitle: "Protocoles critiques actifs",
    iconName: "siren",
    href: "/cat?category=urgences",
  },
  {
    id: "atb",
    title: "Base posologique antibiotiques",
    subtitle: "Adaptations rénales & cutanées",
    iconName: "pill",
    href: "/drugs?category=antibiotiques",
  },
  {
    id: "scores",
    title: "Calculateur de scores dermatologiques",
    subtitle: "SCORTEN, PASI, Braden",
    iconName: "calculator",
    href: "/calculators?category=dermatologie",
  },
];

export const SAFETY_FOOTNOTE =
  "Relecture par pairs selon recommandations HAS / SFD";

export const COMMITTEE_FOOTNOTE =
  "Mis à jour quotidiennement par le comité médical Nabda";
