import type {
  ExploreModule,
  FilterChip,
  FrequentSearchChip,
  PivotSuggestion,
} from "@/types/search";

/** Search UI chips — not clinical content fixtures. */
export const SEARCH_TYPE_FILTERS: FilterChip[] = [
  { id: "all", label: "Tous" },
  { id: "cat", label: "CAT" },
  { id: "protocols", label: "Protocoles" },
  { id: "drugs", label: "Médicaments" },
  { id: "calculators", label: "Scores" },
];

export const INITIAL_FILTERS = SEARCH_TYPE_FILTERS;
export const ZERO_FILTERS = SEARCH_TYPE_FILTERS;
export const GROUPED_FILTERS = SEARCH_TYPE_FILTERS;
export const DRUG_FILTERS = SEARCH_TYPE_FILTERS;

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
    title: "Protocoles",
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
    title: "Protocoles",
    href: "/protocols",
    icon: "flask",
  },
];
