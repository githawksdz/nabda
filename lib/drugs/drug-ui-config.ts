import type {
  DrugCategorySlug,
  DrugClassTile,
  DrugDetail,
  DrugFilterChip,
  DrugStructureRow,
  DrugSummary,
  DrugTab,
  DrugTabItem,
  LinkedDrugResource,
} from "@/types/drugs";
import {
  DRUG_DETAIL_STATUS_LABELS,
  DRUG_INDEX_STATUS_LABELS,
} from "@/lib/drugs/status-labels";

// Demo placeholder only — replace with validated source data before production.
// Do not treat seed_placeholder content as medically validated.

export const DRUG_SAFETY_BANNER_TITLE = "Avertissement clinique";

export const DRUG_SAFETY_NOTE =
  "Données médicamenteuses à vérifier selon les sources validées et le contexte patient. Aucune adaptation posologique automatisée.";

export const DRUG_PRUDENCE_FOOTER =
  "Référentiel de consultation. Ne constitue pas une prescription et ne remplace pas les sources validées.";

export const DRUG_IDENTITY = {
  title: "Médicaments",
  subtitle: "Référentiel thérapeutique & pharmacologie",
} as const;

const CHIP_CATEGORY_SLUGS: DrugCategorySlug[] = [
  "all",
  "antibiotiques",
  "antalgiques",
  "cardio",
  "urgences",
  "grossesse",
  "pediatrie",
  "rein",
];

/* MOCK_DRUGS moved to lib/demo-fixtures/drugs.ts */

export const DRUG_CLASS_TILES: DrugClassTile[] = [
  { slug: "antibiotiques", label: "Antibiotiques", iconName: "pill" },
  { slug: "antalgiques", label: "Antalgiques", iconName: "thermometer" },
  { slug: "anticoagulants", label: "Anticoagulants", iconName: "syringe" },
  { slug: "cardio", label: "Cardio", iconName: "heart-pulse" },
  { slug: "diabete", label: "Diabète", iconName: "flask" },
  { slug: "grossesse", label: "Grossesse", iconName: "baby" },
];

function isVisibleDrug(item: DrugSummary) {
  return item.status !== "hidden" && item.visibility !== "admin_only";
}

/** Catalog size comes from Supabase at runtime; chip count is filled by the index when needed. */
export const DRUG_CATALOG_COUNT = 0;

export const DRUG_FILTER_CHIPS: DrugFilterChip[] = [
  { id: "all", label: "Tous" },
  { id: "antibiotiques", label: "Antibiotiques" },
  { id: "antalgiques", label: "Antalgiques" },
  { id: "cardio", label: "Cardio" },
  { id: "urgences", label: "Urgences" },
  { id: "grossesse", label: "Grossesse" },
  { id: "pediatrie", label: "Pédiatrie" },
  { id: "rein", label: "Rein" },
];

export function filterChipsForDrugCatalog(
  drugs: DrugSummary[],
): DrugFilterChip[] {
  const visible = drugs.filter(isVisibleDrug);
  return DRUG_FILTER_CHIPS.map((chip) => {
    if (chip.id === "all") {
      return { ...chip, count: visible.length };
    }
    const count = visible.filter((item) =>
      item.categorySlugs.includes(chip.id),
    ).length;
    return { ...chip, count: count > 0 ? count : undefined };
  });
}

export function parseDrugCategory(
  value?: string | null,
): DrugCategorySlug {
  if (value && CHIP_CATEGORY_SLUGS.includes(value as DrugCategorySlug)) {
    return value as DrugCategorySlug;
  }
  const classSlugs = DRUG_CLASS_TILES.map((tile) => tile.slug);
  if (value && classSlugs.includes(value as DrugCategorySlug)) {
    return value as DrugCategorySlug;
  }
  return "all";
}

export function matchesDrugQuery(item: DrugSummary, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [
    item.genericName,
    item.className,
    item.shortClassName,
    item.slug,
    item.atcCode,
    ...(item.brandNames ?? []),
    ...item.searchTerms,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(needle);
}

export function filterDrugs(
  items: DrugSummary[],
  query: string,
  category: DrugCategorySlug,
) {
  return items
    .filter(isVisibleDrug)
    .filter((item) => {
      const matchesCategory =
        category === "all" || item.categorySlugs.includes(category);
      return matchesCategory && matchesDrugQuery(item, query);
    })
    .sort((a, b) =>
      a.genericName.localeCompare(b.genericName, "fr", { sensitivity: "base" }),
    );
}

export function frequentDrugs(items: DrugSummary[]) {
  const preferred = ["amoxicilline", "paracetamol", "furosemide", "enoxaparine"];
  return items
    .filter((item) => item.frequentlyConsulted)
    .sort((a, b) => preferred.indexOf(a.slug) - preferred.indexOf(b.slug));
}

export function getDrugBySlug(_slug?: string): DrugSummary | undefined {
  void _slug;
  return undefined;
}

export const DRUG_TABS: DrugTabItem[] = [
  { id: "apercu", label: "Aperçu" },
  { id: "securite", label: "Sécurité" },
  { id: "formes", label: "Formes" },
  { id: "sources", label: "Sources" },
];

export const DRUG_POSOLOGY_TITLE = "Posologies";

export const DRUG_POSOLOGY_LEAD =
  "Posologies non disponibles dans cette version";

export const DRUG_POSOLOGY_BODY =
  "Les informations de dose, durée et adaptation seront publiées après revue pharmacologique.";

export const DRUG_POSOLOGY_COMBINED =
  "Posologies non disponibles dans cette version. Les informations de dose, durée et adaptation seront publiées après revue pharmacologique.";

export const DRUG_SUMMARY_COPY =
  "Fiche structurée pour consultation rapide. Les indications, posologies et adaptations seront affichées après validation pharmacologique.";

export const DRUG_SAFETY_TAB_NOTE =
  "Données de sécurité à confirmer selon les sources validées. Ne dispense pas du contrôle des allergies, interactions et du contexte patient.";

export const DRUG_PREGNANCY_PLACEHOLDER =
  "Statut grossesse/allaitement à valider avant affichage.";

export const DRUG_RENAL_HEPATIC_PLACEHOLDER =
  "Adaptation rénale/hépatique non disponible dans cette version.";

export const DRUG_INTERACTION_PLACEHOLDER =
  "Aucun moteur d'interactions automatisé. Les associations sont à vérifier selon les sources validées.";

export const DRUG_FORM_STRUCTURE: DrugStructureRow[] = [
  { id: "forms", label: "Formes disponibles", status: "à compléter" },
  { id: "brands", label: "Marques / génériques", status: "à compléter" },
  { id: "routes", label: "Voies d'administration", status: "à vérifier" },
];

export const DRUG_SAFETY_PREVIEWS = [
  { id: "ci", title: "Contre-indications", statusLabel: DRUG_DETAIL_STATUS_LABELS.toVerify },
  { id: "allergies", title: "Allergies", statusLabel: DRUG_DETAIL_STATUS_LABELS.sources },
  {
    id: "grossesse",
    title: "Grossesse / allaitement",
    statusLabel: DRUG_DETAIL_STATUS_LABELS.toVerify,
  },
  { id: "rein", title: "Rein / foie", statusLabel: DRUG_INDEX_STATUS_LABELS.needsRevision },
  { id: "interactions", title: "Interactions", statusLabel: DRUG_DETAIL_STATUS_LABELS.toVerify },
];

const GENERIC_CONTRAINDICATIONS = [
  {
    id: "a-completer",
    label: "Données à compléter après revue pharmacologique",
    severity: "info" as const,
    sourceStatus: "placeholder" as const,
  },
];

const GENERIC_WARNINGS = [
  {
    id: "allergie",
    label: "Vérifier le terrain allergique",
    severity: "caution" as const,
    sourceStatus: "to_verify" as const,
  },
  {
    id: "renal",
    label: "Vérifier la fonction rénale selon contexte",
    severity: "caution" as const,
    sourceStatus: "to_verify" as const,
  },
  {
    id: "interactions",
    label: "Interactions à vérifier dans une version future",
    severity: "info" as const,
    sourceStatus: "placeholder" as const,
  },
];

export function buildPlaceholderDrugDetail(summary: DrugSummary): DrugDetail {
  return {
    ...summary,
    subtitle: summary.shortClassName
      ? `${summary.shortClassName} · ${summary.className}`
      : summary.className,
    classChip: summary.className.split("·")[0]?.trim(),
    safetyNote: DRUG_SAFETY_TAB_NOTE,
    summary: DRUG_SUMMARY_COPY,
    formsStatus: "Formes disponibles — à compléter",
    posologyStatus: DRUG_POSOLOGY_LEAD,
    posologyBody: DRUG_POSOLOGY_BODY,
    formStructure: DRUG_FORM_STRUCTURE,
    safetyPreviews: DRUG_SAFETY_PREVIEWS,
    contraindications: GENERIC_CONTRAINDICATIONS,
    warnings: GENERIC_WARNINGS,
    pregnancyLactationStatus: DRUG_PREGNANCY_PLACEHOLDER,
    renalHepaticStatus: DRUG_RENAL_HEPATIC_PLACEHOLDER,
    linkedProtocols: [],
    linkedCalculators: [
      {
        label: "Cockcroft-Gault",
        subtitle: "Clairance créatinine",
        href: "/calculators/cockcroft-gault",
        status: "À vérifier",
      },
    ],
    references: [
      {
        label: "Sources à consolider après revue pharmacologique",
        sourceStatus: "placeholder",
      },
    ],
  };
}

/** Demo-mode clinical details live in lib/demo-fixtures/drugs.ts */
export function getDrugDetailBySlug(_slug?: string): null {
  void _slug;
  return null;
}


export function resolveDrugTab(tab?: string): DrugTab {
  if (tab === "securite" || tab === "formes" || tab === "sources") {
    return tab;
  }
  return "apercu";
}

export function drugDetailHref(slug: string, tab?: DrugTab): string {
  if (!tab || tab === "apercu") {
    return `/drugs/${slug}`;
  }
  return `/drugs/${slug}?tab=${tab}`;
}

export function firstDrugQueryValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export const DRUG_PREPARATION_HEADER = "Fiche en préparation";
export const DRUG_MISSING_HEADER = "Médicament non répertorié";
export const DRUG_UNAVAILABLE_BODY =
  "Cette fiche n’est pas encore disponible dans le référentiel Nabda.";
export const DRUG_INDEXATION_NOTE =
  "Vous pouvez demander son indexation pour aider l’équipe éditoriale à prioriser les prochaines fiches.";
export const DRUG_ALTERNATIVES_TITLE = "Alternatives disponibles";
export const DRUG_ALTERNATIVES_NOTE =
  "Molécules de la même classe déjà listées. Ne pas interpréter comme équivalence thérapeutique.";
export const DRUG_STATUS_PREPARATION = "En préparation";
export const DRUG_STATUS_UNINDEXED = "Non indexé";

export function humanizeDrugSlug(slug: string): string {
  const cleaned = slug.trim().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
  if (!cleaned) {
    return "Molécule";
  }
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function getDrugAlternatives(_slug?: string): LinkedDrugResource[] {
  void _slug;
  return [
    {
      label: "Répertoire des molécules",
      subtitle: "Voir les fiches déjà listées",
      href: "/drugs",
    },
  ];
}
