// Demo-mode fixture only. Do not import from production runtime providers.

import type {
  CalculatorCategorySlug,
  CalculatorContext,
  CalculatorFilterChip,
  CalculatorSummary,
  CalculatorVariablePreview,
  LinkedCalculatorResource,
} from "@/types/calculators";

// Demo placeholder only — replace with validated source data before production.
// UI shell supports future database-backed content.

export const CALCULATOR_SAFETY_NOTE =
  "Outils d'aide au calcul. Résultats à interpréter selon le contexte clinique individuel.";

export const CALCULATOR_PROFESSIONAL_NOTICE =
  "Les calculateurs Nabda sont des aides au calcul. Ils ne remplacent pas le jugement clinique, les protocoles locaux, ni la vérification des sources validées.";

export const CALCULATOR_CATALOG_COUNT = 48;

export const CALCULATOR_FILTER_CHIPS: CalculatorFilterChip[] = [
  { id: "all", label: "Tous", count: CALCULATOR_CATALOG_COUNT },
  { id: "urgences", label: "Urgences" },
  { id: "cardiologie", label: "Cardiologie" },
  { id: "pneumologie", label: "Pneumologie" },
  { id: "neurologie", label: "Neurologie" },
  { id: "reanimation", label: "Réanimation" },
  { id: "obstetrique", label: "Obstétrique" },
  { id: "biologie", label: "Biologie" },
];

export const CALCULATOR_CONTEXTS: CalculatorContext[] = [
  { slug: "urgences", label: "Urgences", count: 18, iconName: "siren" },
  { slug: "cardiologie", label: "Cardio", count: 14, iconName: "heart-pulse" },
  { slug: "pneumologie", label: "Pneumo", count: 9, iconName: "wind" },
  { slug: "neurologie", label: "Neuro", count: 11, iconName: "brain" },
  { slug: "reanimation", label: "Réa", count: 12, iconName: "activity" },
  { slug: "biologie", label: "Biologie", count: 15, iconName: "flask" },
];

export const MOCK_CALCULATORS: CalculatorSummary[] = [
  {
    id: "glasgow",
    slug: "glasgow",
    name: "Glasgow",
    shortName: "GCS",
    type: "score",
    categorySlugs: ["urgences", "neurologie"],
    categoryLabel: "Urgences / Neuro",
    description: "Score neurologique",
    estimatedTime: "~1 min",
    status: "needs_validation",
    reviewStatus: "unreviewed",
    visibility: "public_free",
    href: "/calculators/glasgow",
    iconName: "brain",
    frequentlyUsed: true,
    searchTerms: [
      "glasgow",
      "gcs",
      "coma",
      "conscience",
      "neurologique",
      "neuro",
      "urgences",
    ],
    listTitle: "Glasgow (GCS)",
    listSubtitle: "Score neurologique • Urgences / Neuro",
    frequentTitle: "Glasgow",
    frequentSubtitle: "Score neurologique",
    frequentMeta: "~1 min",
    frequentCategoryLabel: "Neuro",
    listOrder: 1,
  },
  {
    id: "wells-ep",
    slug: "wells-ep",
    name: "Wells EP",
    shortName: "Wells EP",
    type: "risk_score",
    categorySlugs: ["urgences"],
    categoryLabel: "Urgences",
    description: "Probabilité clinique EP",
    estimatedTime: "~2 min",
    status: "needs_validation",
    reviewStatus: "unreviewed",
    visibility: "public_free",
    href: "/calculators/wells-ep",
    iconName: "wind",
    frequentlyUsed: true,
    searchTerms: [
      "wells",
      "ep",
      "embolie",
      "pulmonaire",
      "probabilité",
      "urgences",
    ],
    listTitle: "Wells EP",
    listSubtitle: "Probabilité clinique • Urgences",
    frequentTitle: "Wells EP",
    frequentSubtitle: "Probabilité clinique EP",
    frequentMeta: "~2 min",
    frequentCategoryLabel: "Urgences",
    listOrder: 2,
  },
  {
    id: "curb-65",
    slug: "curb-65",
    name: "CURB-65",
    shortName: "CURB-65",
    type: "score",
    categorySlugs: ["pneumologie", "urgences"],
    categoryLabel: "Pneumo",
    description: "Gravité pneumopathie communautaire",
    estimatedTime: "~2 min",
    status: "needs_validation",
    reviewStatus: "needs_revision",
    visibility: "public_free",
    href: "/calculators/curb-65",
    iconName: "wind",
    searchTerms: [
      "curb",
      "curb-65",
      "pneumopathie",
      "pneumonie",
      "pneumo",
      "gravité",
    ],
    listTitle: "CURB-65",
    listSubtitle: "Gravité pneumopathie communautaire • Pneumo",
    listOrder: 3,
  },
  {
    id: "sofa",
    slug: "sofa",
    name: "SOFA",
    shortName: "SOFA",
    type: "score",
    categorySlugs: ["reanimation", "urgences"],
    categoryLabel: "Réanimation",
    description: "Défaillance multiviscérale",
    estimatedTime: "~3 min",
    status: "needs_validation",
    reviewStatus: "unreviewed",
    visibility: "public_free",
    href: "/calculators/sofa",
    iconName: "activity",
    searchTerms: [
      "sofa",
      "qsofa",
      "sepsis",
      "réanimation",
      "rea",
      "défaillance",
      "multiviscérale",
    ],
    listTitle: "SOFA",
    listSubtitle: "Défaillance multiviscérale • Réanimation",
    listOrder: 4,
  },
  {
    id: "cockcroft-gault",
    slug: "cockcroft-gault",
    name: "Cockcroft-Gault",
    shortName: "Cockcroft",
    type: "formula",
    categorySlugs: ["nephrologie", "biologie"],
    categoryLabel: "Néphrologie",
    description: "Clairance créatinine",
    estimatedTime: "Formule",
    status: "needs_validation",
    reviewStatus: "unreviewed",
    visibility: "public_free",
    href: "/calculators/cockcroft-gault",
    iconName: "droplets",
    frequentlyUsed: true,
    searchTerms: [
      "cockcroft",
      "gault",
      "clairance",
      "créatinine",
      "creatinine",
      "rénale",
      "nephro",
      "biologie",
      "formule",
    ],
    listTitle: "Cockcroft-Gault",
    listSubtitle: "Clairance créatinine • Néphrologie",
    frequentTitle: "Cockcroft",
    frequentSubtitle: "Clairance rénale",
    frequentMeta: "Formule",
    frequentCategoryLabel: "Néphro",
    listOrder: 5,
  },
  {
    id: "cha2ds2-vasc",
    slug: "cha2ds2-vasc",
    name: "CHA₂DS₂-VASc",
    shortName: "CHA₂DS₂-VASc",
    type: "risk_score",
    categorySlugs: ["cardiologie"],
    categoryLabel: "Cardiologie",
    description: "Thromboembolie FA",
    estimatedTime: "Risque",
    status: "needs_validation",
    reviewStatus: "unreviewed",
    visibility: "public_free",
    href: "/calculators/cha2ds2-vasc",
    iconName: "heart-pulse",
    frequentlyUsed: true,
    searchTerms: [
      "cha2ds2",
      "chads",
      "vasc",
      "fa",
      "fibrillation",
      "thromboembolie",
      "cardio",
      "risque",
    ],
    listTitle: "CHA₂DS₂-VASc",
    listSubtitle: "Fibrillation atriale • Cardiologie",
    frequentTitle: "CHA₂DS₂-VASc",
    frequentSubtitle: "Thromboembolie FA",
    frequentMeta: "Risque",
    frequentCategoryLabel: "Cardio",
    listOrder: 6,
  },
  {
    id: "nihss",
    slug: "nihss",
    name: "NIHSS",
    shortName: "NIHSS",
    type: "score",
    categorySlugs: ["neurologie", "urgences"],
    categoryLabel: "Neurologie",
    description: "AVC ischémique aigu",
    estimatedTime: "~5 min",
    status: "draft",
    reviewStatus: "unreviewed",
    visibility: "public_free",
    href: "/calculators/nihss",
    iconName: "brain",
    searchTerms: [
      "nihss",
      "avc",
      "stroke",
      "ischémique",
      "neurologie",
      "neuro",
    ],
    listTitle: "NIHSS",
    listSubtitle: "AVC ischémique aigu • Neurologie",
    listOrder: 7,
  },
  {
    id: "score-puqe",
    slug: "score-puqe",
    name: "Score PUQE",
    shortName: "PUQE",
    type: "score",
    categorySlugs: ["obstetrique"],
    categoryLabel: "Obstétrique",
    description: "Évaluation des nausées et vomissements gravidiques.",
    status: "draft",
    reviewStatus: "unreviewed",
    visibility: "stub",
    href: "/calculators/score-puqe",
    iconName: "activity",
    searchTerms: [
      "puqe",
      "nausées",
      "vomissements",
      "grossesse",
      "obstétrique",
      "gravidiques",
    ],
    listTitle: "Score PUQE",
    listSubtitle: "Nausées et vomissements gravidiques • Obstétrique",
    listOrder: 8,
  },
];

const CATEGORY_SLUGS: CalculatorCategorySlug[] = [
  "all",
  "urgences",
  "cardiologie",
  "pneumologie",
  "neurologie",
  "reanimation",
  "obstetrique",
  "biologie",
  "nephrologie",
];

export function parseCalculatorCategory(
  value?: string | null,
): CalculatorCategorySlug {
  if (value && CATEGORY_SLUGS.includes(value as CalculatorCategorySlug)) {
    return value as CalculatorCategorySlug;
  }
  return "all";
}

export function matchesCalculatorQuery(
  item: CalculatorSummary,
  query: string,
) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [
    item.name,
    item.shortName,
    item.description,
    item.categoryLabel,
    item.listTitle,
    item.listSubtitle,
    item.frequentTitle,
    item.frequentSubtitle,
    item.slug,
    ...item.searchTerms,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(needle);
}

export function isIndexedCalculator(item: CalculatorSummary) {
  return (
    item.status !== "hidden" &&
    item.visibility !== "stub" &&
    item.visibility !== "preview_only"
  );
}

export function filterCalculators(
  items: CalculatorSummary[],
  query: string,
  category: CalculatorCategorySlug,
) {
  const hasQuery = Boolean(query.trim());

  return items
    .filter((item) => item.status !== "hidden")
    .filter((item) => {
      if (item.visibility === "stub" && category === "all" && !hasQuery) {
        return false;
      }
      const matchesCategory =
        category === "all" || item.categorySlugs.includes(category);
      return matchesCategory && matchesCalculatorQuery(item, query);
    })
    .sort((a, b) => (a.listOrder ?? 99) - (b.listOrder ?? 99));
}

export function calculatorStatusLabel(item: CalculatorSummary): string {
  if (
    item.visibility === "stub" ||
    item.visibility === "preview_only" ||
    item.status === "draft"
  ) {
    return "Structure en préparation";
  }
  if (item.reviewStatus === "validated" && item.status !== "needs_validation") {
    return "Validé";
  }
  if (item.reviewStatus === "needs_revision") {
    return "Révision requise";
  }
  return "Structure en préparation";
}

export const INDEXED_CALCULATOR_COUNT = MOCK_CALCULATORS.filter(
  isIndexedCalculator,
).length;

const CALCULATOR_SLUG_ALIASES: Record<string, string> = {
  "clairance-creatinine-cockcroft-gault": "cockcroft-gault",
  puqe: "score-puqe",
  "sofa-qsofa": "sofa",
  "chads-vasc": "cha2ds2-vasc",
};

export const CALCULATOR_DB_SLUGS: Record<string, string[]> = {
  sofa: ["sofa-qsofa"],
  "cha2ds2-vasc": ["chads-vasc"],
  "score-puqe": ["puqe"],
  "cockcroft-gault": ["clairance-creatinine-cockcroft-gault"],
};

export function resolveCalculatorSlug(slug: string): string {
  return CALCULATOR_SLUG_ALIASES[slug] ?? slug;
}

export function calculatorLookupSlugs(slug: string): string[] {
  const canonical = resolveCalculatorSlug(slug);
  const aliases = Object.entries(CALCULATOR_SLUG_ALIASES)
    .filter(([, target]) => target === canonical)
    .map(([alias]) => alias);
  const dbSlugs = CALCULATOR_DB_SLUGS[canonical] ?? [];
  return [...new Set([canonical, slug, ...aliases, ...dbSlugs])];
}

export function getCalculatorBySlug(
  slug: string,
): CalculatorSummary | undefined {
  const resolved = resolveCalculatorSlug(slug);
  return MOCK_CALCULATORS.find((item) => item.slug === resolved);
}

export function isGlasgowSlug(slug: string) {
  return resolveCalculatorSlug(slug) === "glasgow";
}

export function isCockcroftSlug(slug: string) {
  return resolveCalculatorSlug(slug) === "cockcroft-gault";
}

export function isPuqeSlug(slug: string) {
  return resolveCalculatorSlug(slug) === "score-puqe";
}

export function hasActiveCalculatorEngine(slug: string) {
  return isGlasgowSlug(slug) || isCockcroftSlug(slug);
}

export const PUQE_VERSION_LABEL = "v0.9";

export const PUQE_VARIABLES: CalculatorVariablePreview[] = [
  {
    id: "nausea-duration",
    label: "Durée des nausées / 24h",
    points: "1 à 5 pts",
  },
  {
    id: "vomiting-episodes",
    label: "Épisodes de vomissements",
    points: "1 à 5 pts",
  },
  {
    id: "retching",
    label: "Efforts de vomissement à vide",
    points: "1 à 5 pts",
  },
];

export const PUQE_RESOURCES: LinkedCalculatorResource[] = [
  {
    id: "reco-nvg",
    title: "Protocole associé",
    subtitle: "En préparation",
    // Design placeholder: replace with verified reference metadata before production.
    href: "/protocols/nausees-vomissements-grossesse",
    kind: "protocol",
  },
  {
    id: "drug-antiemetics",
    title: "Fiche thérapeutique associée",
    subtitle: "À valider",
    // Design placeholder: replace with verified reference metadata before production.
    href: "/drugs?tag=antiemetiques",
    kind: "protocol",
  },
];
