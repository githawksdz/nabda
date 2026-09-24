import type {
  ExploreModule,
  FilterChip,
  FrequentSearchChip,
  PivotSuggestion,
} from "@/types/search";

/** Search UI chips — not clinical content fixtures. */
export const INITIAL_FILTERS: FilterChip[] = [
  { id: "all", label: "Tous" },
  { id: "cat", label: "CAT" },
  { id: "protocols", label: "Recommandations" },
  { id: "drugs", label: "Médicaments" },
  { id: "calculators", label: "Scores" },
  { id: "interactions", label: "Interactions" },
];

export const ZERO_FILTERS: FilterChip[] = [
  { id: "all", label: "Tous" },
  { id: "protocols", label: "Recommandations" },
  { id: "drugs", label: "Médicaments DCI" },
  { id: "calculators", label: "Scores cliniques" },
  { id: "cat", label: "Arbres décisionnels" },
];

export const GROUPED_FILTERS: FilterChip[] = [
  { id: "all", label: "Tous" },
  { id: "cat", label: "CAT" },
  { id: "protocols", label: "Recommandations" },
  { id: "calculators", label: "Scores" },
  { id: "drugs", label: "Médicaments" },
];

export const DRUG_FILTERS: FilterChip[] = [
  { id: "all", label: "Tous" },
  { id: "drugs", label: "Médicaments" },
  { id: "cat", label: "CAT" },
  { id: "protocols", label: "Recommandations" },
  { id: "calculators", label: "Scores" },
];

export const DRUG_SECONDARY_FILTERS = [
  { id: "routes", label: "Toutes voies" },
  { id: "pediatrie", label: "Pédiatrie" },
  { id: "iv", label: "Injectable IV" },
  { id: "grossesse", label: "Grossesse · à vérifier" },
] as const;

export const FREQUENT_SEARCHES: FrequentSearchChip[] = [
  { id: "douleur", label: "Douleur thoracique", query: "douleur" },
  { id: "glasgow", label: "Glasgow", query: "glasgow" },
  { id: "amox", label: "Amoxicilline", query: "amox", filter: "drugs" },
  { id: "fievre", label: "Fièvre enfant", query: "fievre enfant" },
  { id: "wells", label: "Wells EP", query: "wells" },
  { id: "atb", label: "Antibiothérapie", query: "antibiotherapie" },
  { id: "diabete", label: "Diabète", query: "diabete" },
  { id: "ecg", label: "ECG", query: "ecg" },
];

export const EXPLORE_MODULES: ExploreModule[] = [
  {
    id: "cat",
    title: "Arbres décisionnels (CAT)",
    subtitle: "Conduites à tenir",
    label: "CAT",
    href: "/cat",
    icon: "git-branch",
    featured: true,
  },
  {
    id: "drugs",
    title: "Médicaments",
    subtitle: "Référentiel thérapeutique",
    href: "/drugs",
    icon: "pill",
  },
  {
    id: "scores",
    title: "Scores",
    subtitle: "Outils d'aide au calcul",
    href: "/calculators",
    icon: "calculator",
  },
  {
    id: "reco",
    title: "Recommandations",
    subtitle: "Synthèses cliniques",
    href: "/protocols",
    icon: "badge-check",
  },
];

export const ZERO_PIVOTS: PivotSuggestion[] = [
  {
    id: "dci",
    title: "Recherche par DCI",
    href: "/search?type=drugs",
    icon: "pill",
  },
  {
    id: "urgences",
    title: "Arbres Urgences",
    href: "/cat?category=urgences",
    icon: "git-branch",
  },
  {
    id: "scores",
    title: "Scores fréquents",
    href: "/calculators",
    icon: "calculator",
  },
  {
    id: "bio",
    title: "Recommandations",
    href: "/protocols",
    icon: "flask",
  },
];
