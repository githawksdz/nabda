// Demo-mode fixture only. Do not import from production runtime providers.

import type {
  HomeMode,
  HomeUpdate,
  HomeUser,
  OfflinePackMetric,
  RecommendationRow,
  ScoreShortcut,
} from "@/types/home";
import type { CalculatorType } from "@/types/calculators";

function demoScoreShortcut(
  id: string,
  slug: string,
  fields: {
    title: string;
    subtitle: string;
    href: string;
    icon: string;
    actionLabel?: string;
    catalogType?: CalculatorType;
  },
): ScoreShortcut {
  return {
    id,
    slug,
    contentType: "calculator",
    catalogType: fields.catalogType ?? "score",
    title: fields.title,
    subtitle: fields.subtitle,
    href: fields.href,
    icon: fields.icon,
    ...(fields.actionLabel ? { actionLabel: fields.actionLabel } : {}),
  };
}

export const incompleteUser: HomeUser = {
  id: "demo-incomplete",
  displayName: "",
  initials: "ND",
  plan: "freemium",
  profileStatus: "incomplete",
};

export const freemiumUser: HomeUser = {
  id: "demo-freemium",
  fullName: "Anes Bentoumi",
  displayName: "Anes",
  initials: "AB",
  professionLabel: "Interne en médecine",
  plan: "freemium",
  profileStatus: "complete",
};

export const proUser: HomeUser = {
  id: "demo-pro",
  fullName: "Anes Bentoumi",
  displayName: "Dr. Anes B.",
  initials: "AB",
  professionLabel: "Résident",
  specialtyLabel: "Urgences / Réa",
  plan: "pro",
  profileStatus: "complete",
  verified: true,
};

export const starterRecommendations: RecommendationRow[] = [
  {
    id: "starter-cat",
    title: "Découvrir les CAT",
    specialty: "Arbres décisionnels d'urgence et protocoles clairs",
    typeLabel: "",
    href: "/cat",
    icon: "git-branch",
  },
  {
    id: "starter-scores",
    title: "Explorer les scores",
    specialty: "Glasgow, Cockcroft-Gault, Wells en un tap",
    typeLabel: "",
    href: "/calculators",
    icon: "calculator",
  },
  {
    id: "starter-drugs",
    title: "Consulter la base médicaments",
    specialty: "Fiches thérapeutiques et classes médicamenteuses",
    typeLabel: "",
    href: "/drugs",
    icon: "pill",
  },
];

export const incompleteUpdates: HomeUpdate[] = [
  {
    id: "update-douleur",
    label: "Nouveau",
    title: "Douleur thoracique",
    meta: "Urgences · CAT",
    href: "/cat/douleur-thoracique",
  },
  {
    id: "update-fievre",
    label: "Mis à jour",
    title: "Fièvre chez l'enfant",
    meta: "Pédiatrie · Protocole",
    href: "/protocols/fievre-enfant",
  },
];

export const featuredPourVous: HomeUpdate = {
  id: "featured-douleur",
  label: "Nouveau",
  title: "Nouvelle CAT : douleur thoracique",
  description:
    "Prise en charge diagnostique initiale et stratification du risque selon ESC 2024. Protocole troponine ultrasensible hs-cTn.",
  meta: "Urgences · CAT",
  footer: "< 2 min de lecture · Publié",
  href: "/cat/douleur-thoracique",
};

export const usefulScores: ScoreShortcut[] = [
  demoScoreShortcut("glasgow", "glasgow", {
    title: "Glasgow",
    subtitle: "Coma & Conscience",
    href: "/calculators/glasgow",
    icon: "brain",
  }),
  demoScoreShortcut("cockcroft", "cockcroft-gault", {
    title: "Cockcroft",
    subtitle: "Clairance rénale",
    href: "/calculators/cockcroft-gault",
    icon: "droplets",
    catalogType: "formula",
  }),
  demoScoreShortcut("wells", "wells-ep", {
    title: "Wells EP",
    subtitle: "Probabilité embolie",
    href: "/calculators/wells-ep",
    icon: "wind",
  }),
  demoScoreShortcut("curb65", "curb-65", {
    title: "CURB-65",
    subtitle: "Pneumopathie aiguë",
    href: "/calculators/curb-65",
    icon: "wind",
  }),
];

export const gardeRecommendations: RecommendationRow[] = [
  {
    id: "reco-atb",
    title: "Antibiothérapie probabiliste",
    specialty: "Infectiologie",
    typeLabel: "Reco SPILF",
    href: "/protocols/antibiotherapie-probabiliste",
    icon: "syringe",
  },
  {
    id: "reco-ecg",
    title: "ECG en urgence : anomalies critiques",
    specialty: "Cardiologie",
    typeLabel: "Guide rapide",
    href: "/protocols/ecg-urgence",
    icon: "heart-pulse",
  },
  {
    id: "reco-fievre",
    title: "Fièvre inexpliquée de l'adulte",
    specialty: "Médecine interne",
    typeLabel: "CAT",
    href: "/cat/fievre-inexpliquee",
    icon: "thermometer",
  },
];

export const clinicalWatchFeatured: HomeUpdate = {
  id: "watch-hsa",
  label: "Mise à jour majeure",
  title: "Céphalées brutales et suspicion d'HSA",
  description:
    "Intégration du score d'Ottawa et fenêtre de sensibilité scanographique à 6h. Conduite actualisée.",
  timeLabel: "Aujourd'hui · 07:30",
  footer: "Publié · Lecture 3 min",
  href: "/cat/cephalees-brutales-hsa",
};

export const clinicalWatchSecondary: HomeUpdate = {
  id: "watch-toxico",
  category: "Toxicologie",
  title: "Intoxication médicamenteuse aiguë : conduite actualisée",
  href: "/protocols/intoxication-medicamenteuse",
};

export const frequentScores: ScoreShortcut[] = [
  demoScoreShortcut("sofa", "sofa", {
    title: "SOFA / qSOFA",
    subtitle: "Évaluation du sepsis",
    href: "/calculators/sofa",
    icon: "activity",
    actionLabel: "Ouvrir le calcul →",
  }),
  demoScoreShortcut("gcs", "glasgow", {
    title: "Glasgow (GCS)",
    subtitle: "Évaluation neurologique",
    href: "/calculators/glasgow",
    icon: "brain",
    actionLabel: "Ouvrir le calcul →",
  }),
  demoScoreShortcut("chadsvasc", "cha2ds2-vasc", {
    title: "CHA₂DS₂-VASc",
    subtitle: "Risque thromboembolique",
    href: "/calculators/cha2ds2-vasc",
    icon: "heart-pulse",
    actionLabel: "Ouvrir le calcul →",
  }),
  demoScoreShortcut("nihss", "nihss", {
    title: "Score NIHSS",
    subtitle: "AVC ischémique aigu",
    href: "/calculators/nihss",
    icon: "brain",
    actionLabel: "Ouvrir le calcul →",
  }),
];

export const proAdvancedTools = [
  {
    id: "perfusion",
    title: "Calculateur de perfusion & dilution IV",
    subtitle: "Noradrénaline, Dobutamine, Seringues autopulsées",
    href: "/calculators/perfusion-iv",
    icon: "droplets" as const,
    cta: "Lancer",
  },
  {
    id: "interactions",
    title: "Interactions médicamenteuses multi-lignes",
    subtitle: "Contre-indications, QT long, cytochrome P450",
    href: "/search?type=drugs",
    icon: "pill" as const,
    cta: "Vérifier",
  },
];

export const offlinePackMetrics: OfflinePackMetric[] = [
  { id: "cat", value: "42", label: "Arbres CAT" },
  { id: "calc", value: "18", label: "Scores" },
  { id: "doses", value: "—", label: "Médicaments" },
];

export function mockUserForMode(mode: HomeMode): HomeUser {
  if (mode === "pro-practitioner") {
    return proUser;
  }
  if (mode === "freemium-complete") {
    return freemiumUser;
  }
  return incompleteUser;
}
