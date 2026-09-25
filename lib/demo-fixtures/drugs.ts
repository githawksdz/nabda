// Demo-mode fixture only. Do not import from production runtime providers.

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

export const MOCK_DRUGS: DrugSummary[] = [
  {
    id: "amoxicilline",
    slug: "amoxicilline",
    genericName: "Amoxicilline",
    brandNames: ["Clamoxyl"],
    className: "Pénicilline A · Bêtalactamine",
    shortClassName: "Antibiotique",
    atcCode: "J01CA04",
    categorySlugs: ["antibiotiques", "pediatrie", "urgences"],
    status: "needs_pharmacology_review",
    reviewStatus: "needs_revision",
    visibility: "public_free",
    href: "/drugs/amoxicilline",
    iconName: "pill",
    frequentlyConsulted: true,
    searchTerms: [
      "amoxicilline",
      "amox",
      "clamoxyl",
      "antibiotique",
      "pénicilline",
      "betalactamine",
      "bêtalactamine",
    ],
  },
  {
    id: "paracetamol",
    slug: "paracetamol",
    genericName: "Paracétamol",
    brandNames: ["Doliprane"],
    className: "Analgésique · Antipyrétique",
    shortClassName: "Antalgique",
    atcCode: "N02BE01",
    categorySlugs: ["antalgiques", "pediatrie", "urgences", "grossesse"],
    status: "needs_pharmacology_review",
    reviewStatus: "needs_revision",
    visibility: "public_free",
    href: "/drugs/paracetamol",
    iconName: "thermometer",
    frequentlyConsulted: true,
    searchTerms: [
      "paracetamol",
      "paracétamol",
      "doliprane",
      "antalgique",
      "analgésique",
      "antipyrétique",
      "douleur",
      "fièvre",
    ],
  },
  {
    id: "ceftriaxone",
    slug: "ceftriaxone",
    genericName: "Ceftriaxone",
    className: "Céphalosporine 3G",
    shortClassName: "Antibiotique",
    atcCode: "J01DD04",
    categorySlugs: ["antibiotiques", "urgences"],
    status: "needs_pharmacology_review",
    reviewStatus: "pharmacist_reviewed",
    visibility: "preview_only",
    href: "/drugs/ceftriaxone",
    iconName: "syringe",
    searchTerms: [
      "ceftriaxone",
      "rocephine",
      "céphalosporine",
      "antibiotique",
      "3g",
    ],
  },
  {
    id: "furosemide",
    slug: "furosemide",
    genericName: "Furosémide",
    brandNames: ["Lasilix"],
    className: "Diurétique de l'anse",
    shortClassName: "Diurétique",
    atcCode: "C03CA01",
    categorySlugs: ["cardio", "urgences", "rein"],
    status: "seed_placeholder",
    reviewStatus: "unreviewed",
    visibility: "stub",
    href: "/drugs/furosemide",
    iconName: "droplets",
    frequentlyConsulted: true,
    searchTerms: [
      "furosemide",
      "furosémide",
      "lasilix",
      "diurétique",
      "anse",
      "cardio",
      "rein",
    ],
  },
  {
    id: "enoxaparine",
    slug: "enoxaparine",
    genericName: "Énoxaparine",
    brandNames: ["Lovenox"],
    className: "HBPM · Antithrombotique",
    shortClassName: "Anticoagulant",
    atcCode: "B01AB05",
    categorySlugs: ["anticoagulants", "urgences", "grossesse"],
    status: "seed_placeholder",
    reviewStatus: "unreviewed",
    visibility: "stub",
    href: "/drugs/enoxaparine?state=preparation",
    iconName: "syringe",
    frequentlyConsulted: true,
    searchTerms: [
      "enoxaparine",
      "énoxaparine",
      "lovenox",
      "hbpm",
      "anticoagulant",
      "antithrombotique",
      "héparine",
    ],
  },
  {
    id: "metformine",
    slug: "metformine",
    genericName: "Metformine",
    brandNames: ["Glucophage"],
    className: "Biguanide · Antidiabétique oral",
    shortClassName: "Antidiabétique",
    atcCode: "A10BA02",
    categorySlugs: ["diabete", "rein"],
    status: "needs_pharmacology_review",
    reviewStatus: "unreviewed",
    visibility: "public_free",
    href: "/drugs/metformine",
    iconName: "flask",
    searchTerms: [
      "metformine",
      "glucophage",
      "biguanide",
      "diabète",
      "diabete",
      "antidiabétique",
    ],
  },
  {
    id: "salbutamol",
    slug: "salbutamol",
    genericName: "Salbutamol",
    brandNames: ["Ventoline"],
    className: "Bêta-2 agoniste · Bronchodilatateur",
    shortClassName: "Bronchodilatateur",
    atcCode: "R03AC02",
    categorySlugs: ["urgences", "pediatrie"],
    status: "seed_placeholder",
    reviewStatus: "unreviewed",
    visibility: "stub",
    href: "/drugs/salbutamol",
    iconName: "wind",
    searchTerms: [
      "salbutamol",
      "ventoline",
      "bronchodilatateur",
      "beta-2",
      "bêta-2",
      "asthme",
      "urgences",
    ],
  },
  {
    id: "omeprazole",
    slug: "omeprazole",
    genericName: "Oméprazole",
    brandNames: ["Mopral"],
    className: "Inhibiteur de la pompe à protons",
    shortClassName: "IPP",
    atcCode: "A02BC01",
    categorySlugs: ["urgences"],
    status: "needs_pharmacology_review",
    reviewStatus: "needs_revision",
    visibility: "public_free",
    href: "/drugs/omeprazole",
    iconName: "pill",
    searchTerms: [
      "omeprazole",
      "oméprazole",
      "mopral",
      "ipp",
      "pompe à protons",
      "reflux",
    ],
  },
];

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

export const DRUG_CATALOG_COUNT = MOCK_DRUGS.filter(isVisibleDrug).length;

export const DRUG_FILTER_CHIPS: DrugFilterChip[] = [
  { id: "all", label: "Tous", count: DRUG_CATALOG_COUNT },
  { id: "antibiotiques", label: "Antibiotiques" },
  { id: "antalgiques", label: "Antalgiques" },
  { id: "cardio", label: "Cardio" },
  { id: "urgences", label: "Urgences" },
  { id: "grossesse", label: "Grossesse" },
  { id: "pediatrie", label: "Pédiatrie" },
  { id: "rein", label: "Rein" },
];

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

export function getDrugBySlug(slug: string): DrugSummary | undefined {
  return MOCK_DRUGS.find((item) => item.slug === slug);
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
        label: "Référentiel thérapeutique (exemple)",
        sourceStatus: "placeholder",
      },
    ],
  };
}

const AMOXICILLINE_SUMMARY = MOCK_DRUGS.find((item) => item.slug === "amoxicilline");

const AMOXICILLINE_DETAIL: DrugDetail | undefined = AMOXICILLINE_SUMMARY
  ? {
      ...AMOXICILLINE_SUMMARY,
      subtitle: "Antibiotique · Bêta-lactamine (Pénicilline A)",
      classChip: "Pénicilline A",
      safetyNote: DRUG_SAFETY_TAB_NOTE,
      summary: DRUG_SUMMARY_COPY,
      formsStatus: "Formes disponibles — à compléter",
      posologyStatus: DRUG_POSOLOGY_LEAD,
      posologyBody: DRUG_POSOLOGY_BODY,
      formStructure: DRUG_FORM_STRUCTURE,
      safetyPreviews: DRUG_SAFETY_PREVIEWS,
      contraindications: [
        {
          id: "hypersensibilite",
          label: "Hypersensibilité connue",
          description: "à confirmer selon source",
          severity: "contraindication",
          sourceStatus: "to_verify",
        },
        {
          id: "reaction-severe",
          label: "Antécédent de réaction sévère",
          description: "à confirmer selon source",
          severity: "contraindication",
          sourceStatus: "to_verify",
        },
        {
          id: "a-completer",
          label: "Données à compléter après revue pharmacologique",
          severity: "info",
          sourceStatus: "placeholder",
        },
      ],
      warnings: GENERIC_WARNINGS,
      pregnancyLactationStatus: DRUG_PREGNANCY_PLACEHOLDER,
      renalHepaticStatus: DRUG_RENAL_HEPATIC_PLACEHOLDER,
      linkedProtocols: [
        {
          label: "Angine bactérienne",
          subtitle: "en préparation",
          href: "/protocols/angine-bacterienne",
          status: "En préparation",
        },
        {
          label: "Infection urinaire",
          subtitle: "en préparation",
          href: "/protocols/infection-urinaire",
          status: "En préparation",
        },
        {
          label: "Antibiothérapie probabiliste",
          subtitle: "en préparation",
          href: "/protocols/antibiotherapie-probabiliste",
          status: "En préparation",
        },
      ],
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
          label: "Référentiel thérapeutique (exemple)",
          sourceStatus: "placeholder",
        },
      ],
    }
  : undefined;

export function getDrugDetailBySlug(slug: string): DrugDetail | undefined {
  if (slug === "amoxicilline" && AMOXICILLINE_DETAIL) {
    return AMOXICILLINE_DETAIL;
  }
  const summary = getDrugBySlug(slug);
  return summary ? buildPlaceholderDrugDetail(summary) : undefined;
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

const THERAPEUTIC_CLASS_SLUGS: DrugCategorySlug[] = [
  "antibiotiques",
  "antalgiques",
  "anticoagulants",
  "cardio",
  "diabete",
];

export function humanizeDrugSlug(slug: string): string {
  const cleaned = slug.trim().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
  if (!cleaned) {
    return "Molécule";
  }
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function getDrugAlternatives(slug: string): LinkedDrugResource[] {
  const drug = getDrugBySlug(slug);
  const items: LinkedDrugResource[] = [];

  if (drug) {
    const classKeys = drug.categorySlugs.filter((item) =>
      THERAPEUTIC_CLASS_SLUGS.includes(item),
    );
    MOCK_DRUGS.filter(
      (item) =>
        item.slug !== drug.slug &&
        item.categorySlugs.some((category) => classKeys.includes(category)),
    ).forEach((item) => {
      items.push({
        label: item.genericName,
        subtitle: "molécule de la même classe",
        href: item.href,
        status: "Ne pas interpréter comme équivalence",
      });
    });

    if (classKeys.includes("anticoagulants")) {
      items.push(
        {
          label: "Héparine non fractionnée",
          subtitle: "fiche en préparation",
          href: "/drugs/heparine",
          status: "En préparation",
        },
        {
          label: "Anticoagulants",
          subtitle: "classe thérapeutique",
          href: "/drugs",
        },
        {
          label: "Voir tous les anticoagulants",
          subtitle: "Répertoire",
          href: "/drugs",
        },
      );
    }
  }

  if (items.length === 0) {
    items.push({
      label: "Répertoire des molécules",
      subtitle: "Voir les fiches déjà listées",
      href: "/drugs",
    });
  }

  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.href}:${item.label}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
