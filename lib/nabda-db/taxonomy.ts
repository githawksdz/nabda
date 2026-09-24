import taxonomyMap from "@/data/nabda-db-taxonomy-map.json";

export const UNCATEGORIZED = "uncategorized";

type CalcSpecialtyRow = {
  source_value: string;
  nabda_category: string;
  nabda_tags?: string[];
};

type CatTitleRow = {
  source_id: string;
  source_value: string;
  nabda_category: string;
  nabda_tags?: string[];
  unmapped?: boolean;
};

type SynonymRow = {
  a: string;
  b: string;
};

const catTitleRows = taxonomyMap.cat_title_map as CatTitleRow[];
const calcSpecialtyRows = taxonomyMap.calc_specialty_map as CalcSpecialtyRow[];
const proposedTags = new Set(taxonomyMap.proposed_tags as string[]);
const proposedCategories = new Set(
  (taxonomyMap.proposed_categories as { slug: string }[]).map((row) => row.slug),
);
const synonyms = taxonomyMap.synonyms as SynonymRow[];

const catById = new Map(
  catTitleRows.map((row) => [row.source_id, row] as const),
);
const catByTitle = new Map(
  catTitleRows.map((row) => [normalizeLookup(row.source_value), row] as const),
);
const specialtyBySource = new Map(
  calcSpecialtyRows.map((row) => [normalizeLookup(row.source_value), row] as const),
);
const synonymToCategory = new Map<string, string>();
for (const row of synonyms) {
  synonymToCategory.set(normalizeLookup(row.a), row.b);
  if (proposedCategories.has(row.b)) {
    synonymToCategory.set(normalizeLookup(row.b), row.b);
  }
}

/** ATC first letter → Nabda category. Catalog facet only, not a clinical claim. */
const ATC_LETTER_TO_CATEGORY: Record<string, string> = {
  A: "gastro_enterologie",
  B: "hematologie",
  C: "cardiologie",
  D: "dermatologie",
  G: "gyneco_obstetrique",
  H: "endocrinologie",
  J: "infectiologie",
  L: "oncologie",
  M: "rhumatologie",
  N: "neurologie",
  P: "infectiologie",
  R: "pneumologie",
  S: "ophtalmologie",
  V: "medicaments",
};

function normalizeLookup(value: string): string {
  return value.trim().toLowerCase().replace(/_/g, "-");
}

function knownCategory(slug: string): string {
  if (proposedCategories.has(slug) || slug === UNCATEGORIZED) {
    return slug;
  }
  return UNCATEGORIZED;
}

/**
 * Map a source category / guideline id / title to a Nabda category slug.
 * Unknown values become `uncategorized`.
 */
export function mapSourceCategoryToNabdaCategory(sourceValue: string): string {
  const raw = sourceValue.trim();
  if (!raw) {
    return UNCATEGORIZED;
  }
  if (raw.startsWith("g.")) {
    const byId = catById.get(raw);
    if (byId) {
      return knownCategory(byId.nabda_category);
    }
  }
  const key = normalizeLookup(raw);
  const byTitle = catByTitle.get(key);
  if (byTitle) {
    return knownCategory(byTitle.nabda_category);
  }
  const synonym = synonymToCategory.get(key);
  if (synonym) {
    return knownCategory(synonym);
  }
  const specialty = specialtyBySource.get(key);
  if (specialty) {
    return knownCategory(specialty.nabda_category);
  }
  const underscored = raw.trim().toLowerCase().replace(/-/g, "_");
  if (proposedCategories.has(underscored)) {
    return underscored;
  }
  if (proposedCategories.has(raw)) {
    return raw;
  }
  return UNCATEGORIZED;
}

export function mapSourceSpecialtyToNabdaCategory(specialty: string): string {
  const key = normalizeLookup(specialty);
  if (!key) {
    return UNCATEGORIZED;
  }
  const mappedSpecialty = specialtyBySource.get(key);
  if (mappedSpecialty) {
    return knownCategory(mappedSpecialty.nabda_category);
  }
  const synonym = synonymToCategory.get(key);
  if (synonym) {
    return knownCategory(synonym);
  }
  return mapSourceCategoryToNabdaCategory(specialty);
}

export function mapSourceTagsToNabdaTags(sourceTags: string[]): string[] {
  const tags = new Set<string>();
  for (const tag of sourceTags) {
    const trimmed = tag.trim();
    if (!trimmed) {
      continue;
    }
    const underscored = trimmed.toLowerCase().replace(/-/g, "_");
    if (proposedTags.has(underscored)) {
      tags.add(underscored);
      continue;
    }
    if (proposedTags.has(trimmed)) {
      tags.add(trimmed);
      continue;
    }
    const specialty = specialtyBySource.get(normalizeLookup(trimmed));
    if (specialty) {
      for (const mapped of specialty.nabda_tags ?? []) {
        tags.add(mapped);
      }
    }
  }
  return [...tags];
}

export function mapGuidelineTaxonomy(sourceId: string, title?: string): {
  category_slug: string;
  tag_slugs: string[];
  unmapped: boolean;
} {
  const row = catById.get(sourceId) ?? (title ? catByTitle.get(normalizeLookup(title)) : undefined);
  if (!row) {
    return {
      category_slug: UNCATEGORIZED,
      tag_slugs: [],
      unmapped: true,
    };
  }
  return {
    category_slug: knownCategory(row.nabda_category),
    tag_slugs: [...new Set(row.nabda_tags ?? [])],
    unmapped: Boolean(row.unmapped) || row.nabda_category === UNCATEGORIZED,
  };
}

export function mapSpecialtiesToCategoryAndTags(specialties: string[]): {
  category_slug: string;
  tag_slugs: string[];
  unmapped_specialties: string[];
} {
  const unmapped_specialties: string[] = [];
  const tags = new Set<string>();
  let category_slug = UNCATEGORIZED;
  for (const specialty of specialties) {
    const mapped = mapSourceSpecialtyToNabdaCategory(specialty);
    const extraTags = mapSourceTagsToNabdaTags([specialty]);
    extraTags.forEach((tag) => tags.add(tag));
    if (mapped === UNCATEGORIZED) {
      unmapped_specialties.push(specialty);
      continue;
    }
    if (category_slug === UNCATEGORIZED) {
      category_slug = mapped;
    }
    tags.add(mapped);
  }
  return {
    category_slug,
    tag_slugs: [...tags],
    unmapped_specialties,
  };
}

export function mapAtcCodeToCategory(codeOrId?: string | null): string {
  if (!codeOrId) {
    return UNCATEGORIZED;
  }
  const code = codeOrId.replace(/^atc\./i, "").trim().toUpperCase();
  const letter = code.charAt(0);
  return ATC_LETTER_TO_CATEGORY[letter] ?? UNCATEGORIZED;
}

export function mapAtcCodeToTags(codeOrId?: string | null): string[] {
  if (!codeOrId) {
    return [];
  }
  const code = codeOrId.replace(/^atc\./i, "").trim().toUpperCase();
  if (code.startsWith("A10")) return ["diabete"];
  if (code.startsWith("B01")) return ["anticoagulation"];
  if (code.startsWith("J")) return ["antibiotherapie", "infectiologie"];
  if (code.startsWith("R")) return ["dyspnee"];
  return [];
}

export function isUncategorized(slug: string): boolean {
  return slug === UNCATEGORIZED;
}
