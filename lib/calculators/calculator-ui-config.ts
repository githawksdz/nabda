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

export const CALCULATOR_FILTER_CHIPS: CalculatorFilterChip[] = [
  { id: "all", label: "Tous" },
  { id: "urgences", label: "Urgences" },
  { id: "cardiologie", label: "Cardiologie" },
  { id: "pneumologie", label: "Pneumologie" },
  { id: "neurologie", label: "Neurologie" },
  { id: "reanimation", label: "Réanimation" },
  { id: "obstetrique", label: "Obstétrique" },
  { id: "biologie", label: "Biologie" },
];

export const CALCULATOR_CONTEXTS: CalculatorContext[] = [
  { slug: "urgences", label: "Urgences", iconName: "siren" },
  { slug: "cardiologie", label: "Cardio", iconName: "heart-pulse" },
  { slug: "pneumologie", label: "Pneumo", iconName: "wind" },
  { slug: "neurologie", label: "Neuro", iconName: "brain" },
  { slug: "reanimation", label: "Réa", iconName: "activity" },
  { slug: "biologie", label: "Biologie", iconName: "flask" },
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

export function parseCalculatorCategorySlug(
  value?: string | null,
): CalculatorCategorySlug | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase() as CalculatorCategorySlug;
  if (normalized === "all") return undefined;
  if (CATEGORY_SLUGS.includes(normalized)) {
    return normalized;
  }
  return undefined;
}

export function filterChipsForCatalog(
  calculators: CalculatorSummary[],
): CalculatorFilterChip[] {
  const indexed = calculators.filter(isIndexedCalculator);
  return CALCULATOR_FILTER_CHIPS.map((chip) => {
    if (chip.id === "all") {
      return { ...chip, count: indexed.length };
    }
    const count = indexed.filter((item) =>
      item.categorySlugs.includes(chip.id),
    ).length;
    return {
      ...chip,
      count: count > 0 ? count : undefined,
    };
  });
}

export function contextsForCatalog(
  calculators: CalculatorSummary[],
): CalculatorContext[] {
  const indexed = calculators.filter(isIndexedCalculator);
  return CALCULATOR_CONTEXTS.map((context) => {
    const count = indexed.filter((item) =>
      item.categorySlugs.includes(context.slug),
    ).length;
    return {
      ...context,
      count: count > 0 ? count : undefined,
    };
  });
}

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

export function getCalculatorBySlug(_slug?: string): null {
  void _slug;
  return null;
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
