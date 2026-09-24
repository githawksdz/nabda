import {
  identityImportDefaults,
  mapLocaleStatus,
  type DrugIdentity,
  type NabdaDbAtc,
  type NabdaDbMonograph,
  type NabdaDbPresentation,
  type NabdaDbProduct,
  type NabdaDbSubstance,
} from "@/lib/nabda-db/source-types";
import { sourceIdToSlug } from "@/lib/nabda-db/slugs";
import {
  mapAtcCodeToCategory,
  mapAtcCodeToTags,
  mapGuidelineTaxonomy,
  UNCATEGORIZED,
} from "@/lib/nabda-db/taxonomy";

const BRAND_SAMPLE_LIMIT = 8;
const STRENGTH_SAMPLE_LIMIT = 12;

function uniqueTrimmed(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

function hasSection(monograph: NabdaDbMonograph | null | undefined, key: string): boolean {
  const html = monograph?.sections?.[key];
  return Boolean(html && html.trim());
}

export type DrugMapperInput = {
  substance: NabdaDbSubstance;
  presentations?: NabdaDbPresentation[];
  products?: NabdaDbProduct[];
  monograph?: NabdaDbMonograph | null;
  atc?: NabdaDbAtc | null;
};

/**
 * DCI-first identity. Strength labels are marketed presentation strengths,
 * never posology. Monograph clinical sections stay locked flags only.
 */
export function mapDrugIdentity(input: DrugMapperInput): DrugIdentity {
  const { substance, presentations = [], products = [], monograph, atc } = input;
  const forSubstance = presentations.filter(
    (row) => row.substance_id === substance.id,
  );
  const presentationIds = new Set(forSubstance.map((row) => row.id));
  const forProducts = products.filter(
    (row) =>
      row.substance_id === substance.id ||
      (row.presentation_id && presentationIds.has(row.presentation_id)),
  );
  const dzProducts = forProducts.filter(
    (row) => row.availability_dz === "registered",
  );

  const strengthLabels = uniqueTrimmed([
    ...forSubstance.flatMap((row) => row.dose_tokens ?? []),
    ...forProducts.map((row) => row.dosage),
  ]).slice(0, STRENGTH_SAMPLE_LIMIT);

  const brandNames = uniqueTrimmed([
    ...forSubstance.flatMap((row) => row.local_names ?? []),
    ...forProducts.map((row) => row.name),
  ]).slice(0, BRAND_SAMPLE_LIMIT);

  const forms = uniqueTrimmed([
    ...forSubstance.map((row) => row.forme),
    ...forProducts.map((row) => row.forme),
  ]);

  const atcCode = atc?.code ?? substance.atc_id ?? null;
  const classSlug = mapAtcCodeToCategory(atcCode);
  const catTags = (substance.cat_ids ?? []).flatMap((id) => {
    const mapped = mapGuidelineTaxonomy(id);
    return mapped.unmapped ? [] : mapped.tag_slugs;
  });

  const dciName = substance.inns[0] ?? substance.label;

  return {
    ...identityImportDefaults(),
    source_id: substance.id,
    source_prefix: "s",
    source_slug: sourceIdToSlug(substance.id),
    slug: sourceIdToSlug(substance.id),
    display_name: substance.label,
    dci_name: dciName,
    class_slug: classSlug,
    class_label: atc?.name ?? classSlug,
    presentation_count: forSubstance.length,
    product_count_dz: dzProducts.length,
    forms,
    strength_labels: strengthLabels,
    brand_names_sample: brandNames,
    has_monograph_html: Boolean(monograph && Object.keys(monograph.sections ?? {}).length),
    has_posology_html: hasSection(monograph, "posologie"),
    has_interaction_html: hasSection(monograph, "interactions"),
    has_pregnancy_html: hasSection(monograph, "grossesse"),
    availability_dz: substance.availability_dz ?? null,
    local_adaptation_status: mapLocaleStatus(monograph?.locale_status),
    source_trace: {
      pack: "nabda_db",
      substance_id: substance.id,
      kind: substance.kind ?? null,
      atc_id: substance.atc_id ?? null,
      class_uncategorized: classSlug === UNCATEGORIZED,
      extra_tags: uniqueTrimmed([...mapAtcCodeToTags(atcCode), ...catTags]),
      strength_labels_are_not_posology: true,
      monograph_clinical_sections_locked: true,
      posology_not_mapped: true,
      interactions_not_mapped: true,
      pregnancy_not_mapped: true,
      vidal_molecule_ids: substance.sources?.vidal_molecule_ids ?? null,
    },
  };
}
