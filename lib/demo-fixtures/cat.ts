// Demo-mode fixture only. Do not import from production runtime providers.

import type {
  CatCard,
  CatContext,
  CatUpcomingTree,
  CatUpdate,
} from "@/types/cat";

export const PINNED_CATS: CatCard[] = [
  {
    id: "pinned-thorax",
    slug: "douleur-thoracique",
    title: "Douleur thoracique aiguë",
    categoryLabel: "Urgences",
    specialtyLabel: "Cardio",
    timeLabel: "2 min",
    meta: "Urgences · Cardio · 2 min",
    statusLabel: "Mis à jour",
    iconName: "git-branch",
    href: "/cat/douleur-thoracique",
  },
  {
    id: "pinned-dra",
    slug: "detresse-respiratoire-aigue-adulte",
    title: "Détresse respiratoire adulte",
    categoryLabel: "Pneumo",
    specialtyLabel: "Urgences",
    timeLabel: "3 min",
    meta: "Pneumo · Urgences · 3 min",
    statusLabel: "Prioritaire",
    iconName: "wind",
    href: "/cat/detresse-respiratoire-aigue-adulte",
    urgency: "priority",
  },
  {
    id: "pinned-fievre",
    slug: "fievre-enfant",
    title: "Fièvre chez l'enfant",
    categoryLabel: "Pédiatrie",
    specialtyLabel: "Urgences",
    timeLabel: "2 min",
    meta: "Pédiatrie · Urgences · 2 min",
    // Design placeholder: replace with verified source/review metadata before production.
    statusLabel: "Révision requise",
    iconName: "thermometer",
    href: "/cat/fievre-enfant",
  },
];

export const LATEST_CAT_UPDATES: CatUpdate[] = [
  {
    id: "update-hsa",
    slug: "cephalees-brutales-hsa",
    title: "Céphalées brutales et suspicion d'HSA",
    meta: "Urgences · Neuro · il y a 3j",
    statusLabel: "Mise à jour majeure",
    href: "/cat/cephalees-brutales-hsa",
  },
  {
    id: "update-abdomen",
    slug: "douleur-abdominale-adulte",
    title: "Douleur abdominale de l'adulte",
    meta: "Chirurgie viscérale · Urgences · il y a 1 sem",
    statusLabel: "Nouveau",
    href: "/cat/douleur-abdominale-adulte",
  },
  {
    id: "update-intox",
    slug: "intoxication-medicamenteuse-aigue",
    title: "Intoxication médicamenteuse aiguë",
    meta: "Toxicologie · Réanimation · v2.4",
    statusLabel: "Actualisé",
    href: "/cat/intoxication-medicamenteuse-aigue",
  },
];

export const CAT_CONTEXTS: CatContext[] = [
  {
    slug: "urgences",
    label: "Urgences",
    count: 18,
    iconName: "siren",
    href: "/cat?category=urgences",
  },
  {
    slug: "cardiologie",
    label: "Cardiologie",
    count: 8,
    iconName: "heart-pulse",
    href: "/cat?category=cardiologie",
  },
  {
    slug: "pediatrie",
    label: "Pédiatrie",
    count: 6,
    iconName: "thermometer",
    href: "/cat?category=pediatrie",
  },
  {
    slug: "pneumologie",
    label: "Pneumologie",
    count: 4,
    iconName: "wind",
    href: "/cat?category=pneumologie",
  },
  {
    slug: "neurologie",
    label: "Neurologie",
    count: 4,
    iconName: "brain",
    href: "/cat?category=neurologie",
  },
  {
    slug: "infectiologie",
    label: "Infectiologie",
    count: 5,
    iconName: "bug",
    href: "/cat?category=infectiologie",
  },
];

export const EMERGENCY_CATS: CatCard[] = [
  {
    id: "em-acr",
    slug: "arret-cardio-respiratoire",
    title: "Arrêt cardio-respiratoire (ACR)",
    categoryLabel: "Réanimation · Sauvetage",
    timeLabel: "1 min",
    statusLabel: "Urgence vitale",
    // Design placeholder: replace with verified source/review metadata before production.
    sourceLabel: "HAS / ERC",
    iconName: "heart-pulse",
    urgency: "vital",
    href: "/cat/arret-cardio-respiratoire",
    subFilter: "redflags",
  },
  {
    id: "em-sca",
    slug: "douleur-thoracique",
    title: "Douleur thoracique : Tri SCA ST+ / non ST+",
    categoryLabel: "Cardiologie · Urgences",
    timeLabel: "2 min",
    // Design placeholder: replace with verified source/review metadata before production.
    statusLabel: "ESC 2024",
    sourceLabel: "SFMU",
    iconName: "heart-pulse",
    href: "/cat/douleur-thoracique",
    subFilter: "sauv",
  },
  {
    id: "em-oap",
    slug: "detresse-respiratoire-aigue-oap",
    title: "Détresse respiratoire aiguë & OAP",
    categoryLabel: "Pneumologie · Urgences",
    timeLabel: "2 min",
    statusLabel: "Mise à jour",
    // Design placeholder: replace with verified source/review metadata before production.
    sourceLabel: "SRLF",
    iconName: "wind",
    href: "/cat/detresse-respiratoire-aigue-oap",
    subFilter: "redflags",
  },
  {
    id: "em-sepsis",
    slug: "choc-septique-antibiotherapie-precoce",
    title: "Choc septique & antibiothérapie précoce",
    categoryLabel: "Infectieux · Réanimation",
    timeLabel: "3 min",
    statusLabel: "Survie sepsis",
    // Design placeholder: replace with verified source/review metadata before production.
    sourceLabel: "HAS",
    iconName: "bug",
    href: "/cat/choc-septique-antibiotherapie-precoce",
    subFilter: "sauv",
  },
  {
    id: "em-coma",
    slug: "coma-glasgow-inferieur-8",
    title: "Coma & score de Glasgow < 8",
    categoryLabel: "Neurologie · Déchocage",
    timeLabel: "2 min",
    statusLabel: "Alerte VAS",
    // Design placeholder: replace with verified source/review metadata before production.
    sourceLabel: "SFAR",
    iconName: "brain",
    urgency: "vital",
    href: "/cat/coma-glasgow-inferieur-8",
    subFilter: "redflags",
  },
  {
    id: "em-hdh",
    slug: "hemorragie-digestive-haute-massive",
    title: "Hémorragie digestive haute massive",
    categoryLabel: "Hépato-gastro · Urgences",
    timeLabel: "3 min",
    statusLabel: "Transfusion massive",
    // Design placeholder: replace with verified source/review metadata before production.
    sourceLabel: "SNFGE",
    iconName: "droplets",
    href: "/cat/hemorragie-digestive-haute-massive",
    subFilter: "sauv",
  },
];

export const UPCOMING_TREES: CatUpcomingTree[] = [
  { id: "toxidermies", label: "Toxidermies aiguës", iconName: "git-branch" },
  { id: "eruptions", label: "Éruptions fébriles", iconName: "thermometer" },
  { id: "erysipele", label: "Érysipèle & dermo-hypodermites", iconName: "bug" },
];

