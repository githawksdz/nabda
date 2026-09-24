import type { Json } from "@/types/content";
import { UNCATEGORIZED } from "@/lib/nabda-db/taxonomy";
import {
  IMPORTED_FROM_NABDA_DB,
  toDbLocalAdaptationStatus,
  type CalculatorIdentity,
  type CatIdentity,
  type DrugIdentity,
  type ProtocolIdentity,
} from "@/lib/nabda-db/source-types";
import type { LoadedIdentities } from "@/lib/nabda-db/load-identities";

/** Categories seeded in 0006 + 0011. Keep in sync with those migrations. */
export const IMPLEMENTED_CONTENT_CATEGORIES = [
  "urgences",
  "cardiologie",
  "pediatrie",
  "infectiologie",
  "pneumologie",
  "neurologie",
  "gyneco_obstetrique",
  "endocrinologie",
  "endocrino_diabetologie",
  "medicaments",
  "scores",
  "gastro_enterologie",
  "nephrologie",
  "dermatologie",
  "psychiatrie",
  "reanimation",
  "hematologie",
  "rhumatologie",
  "oncologie",
  "geriatrie",
  "chirurgie",
  "medecine_generale",
  "prevention_suivi",
  "allergologie",
  "anesthesie",
  "dietetique",
  "reeducation",
  "ophtalmologie",
  "urologie",
  "uncategorized",
] as const;

export const SEED_PROTOCOL_SLUGS = [
  "douleur-thoracique",
  "fievre-enfant",
  "antibiotherapie-probabiliste",
  "cephalees-brutales-hsa",
  "intoxication-medicamenteuse",
] as const;

export const SEED_CAT_SLUGS = [
  "douleur-thoracique-cat",
  "fievre-enfant-cat",
  "cephalees-brutales-hsa-cat",
] as const;

export const SEED_CALCULATOR_SLUGS = [
  "glasgow",
  "cockcroft-gault",
  "wells-ep",
  "curb-65",
  "sofa-qsofa",
  "chads-vasc",
  "nihss",
] as const;

export const SEED_DRUG_SLUGS = [
  "paracetamol",
  "amoxicilline",
  "ibuprofene",
  "ceftriaxone",
  "metformine",
  "salbutamol",
  "omeprazole",
  "enoxaparine",
] as const;

const IDENTITY_SUMMARY =
  "Identité importée depuis nabda_db. Payload clinique verrouillé.";

const LOCKED_FORMULA_JSON = {
  version: "identity_import_v1",
  engine: null,
  executable: false,
  note: "Identity only. Do not execute equation_logic_text.",
} as const;

const EMPTY_CAT_MAP_JSON = {
  version: "identity_import_v1",
  nodes: [],
  edges: [],
  note: "Identity only. Flowchart graph not extracted.",
} as const;

export type ImportAction = "insert" | "update_identity" | "skip_protected" | "skip_duplicate";

export type PlannedRow = {
  table: "protocols" | "cat_maps" | "calculators" | "drugs" | "protocol_links";
  action: ImportAction;
  source_id: string;
  slug: string;
  intended_category_slug?: string | null;
  db_category_slug?: string | null;
  conflict?: string | null;
  payload: Record<string, unknown>;
};

export type ExistingContentRow = {
  id: string;
  slug: string;
  source_id: string | null;
  status: string | null;
  review_status: string | null;
  visibility: string | null;
  map_json?: unknown;
  formula_json?: unknown;
};

export type ExistingLinkRow = {
  id: string;
  source_id: string | null;
  protocol_id: string;
  relationship: string;
  target_slug: string | null;
};

export type DeferredLink = {
  source_from_id: string;
  source_to_id: string;
  from_type: string;
  to_type: string;
  relation_type: string;
  reason: string;
};

export type ImportPlan = {
  generated_at: string;
  imported_from: typeof IMPORTED_FROM_NABDA_DB;
  dry_run: boolean;
  live_db: "not_connected" | "seed_catalog_only" | "connected";
  counts: Record<string, number>;
  planned_actions: Record<string, Record<ImportAction, number>>;
  duplicates: Array<{ table: string; key: string; values: string[] }>;
  conflicts: Array<{ table: string; source_id: string; slug: string; reason: string }>;
  unmapped_taxonomy: LoadedIdentities["unmapped"] & {
    categories_not_in_seed: Array<{ slug: string; protocol_or_calc_count: number }>;
    fallback: string;
  };
  schema_blockers: string[];
  taxonomy_blockers: string[];
  deferred_links: {
    reason: string;
    count: number;
    by_type: Record<string, number>;
    samples: DeferredLink[];
  };
  safety: Record<string, boolean | string>;
  samples: {
    protocols: PlannedRow[];
    cat_maps: PlannedRow[];
    drugs: PlannedRow[];
    calculators: PlannedRow[];
    protocol_links: PlannedRow[];
  };
  rows: {
    protocols: PlannedRow[];
    cat_maps: PlannedRow[];
    drugs: PlannedRow[];
    calculators: PlannedRow[];
    protocol_links: PlannedRow[];
  };
};

const implementedCategories = new Set<string>(IMPLEMENTED_CONTENT_CATEGORIES);

export function resolveDbCategory(
  intended: string | null | undefined,
  fallback: string | null = null,
): string | null {
  if (intended && implementedCategories.has(intended)) {
    return intended;
  }
  if (fallback && implementedCategories.has(fallback)) {
    return fallback;
  }
  return null;
}

export function resolveCalculatorDbCategory(
  intended: string | null | undefined,
): string | null {
  if (intended && intended !== UNCATEGORIZED) {
    return resolveDbCategory(intended, "scores");
  }
  return resolveDbCategory("scores", "scores");
}

function asJson(value: Record<string, unknown>): Json {
  return value as Json;
}

function emptyActionCounts(): Record<ImportAction, number> {
  return {
    insert: 0,
    update_identity: 0,
    skip_protected: 0,
    skip_duplicate: 0,
  };
}

function tallyAction(
  counts: Record<string, Record<ImportAction, number>>,
  table: PlannedRow["table"],
  action: ImportAction,
) {
  if (!counts[table]) {
    counts[table] = emptyActionCounts();
  }
  counts[table][action] += 1;
}

function isProtectedStatus(status?: string | null, reviewStatus?: string | null): boolean {
  const publication = status ?? "";
  const review = reviewStatus ?? "";
  return (
    publication === "published" ||
    publication === "validated" ||
    publication === "approved" ||
    review === "validated" ||
    review === "medical_reviewed"
  );
}

function isPlaceholderStatus(status?: string | null, reviewStatus?: string | null): boolean {
  const publication = status ?? "";
  const review = reviewStatus ?? "";
  return (
    publication === "seed_placeholder" ||
    publication === "imported" ||
    publication === "cleaned" ||
    publication === "draft" ||
    publication === "editorial_placeholder" ||
    review === "editorial_placeholder" ||
    review === "unreviewed"
  );
}

export function preserveReviewStatus(existing?: string | null): string {
  if (!existing || existing === "unreviewed") {
    return "unreviewed";
  }
  return existing;
}

function findExisting(
  sourceId: string,
  slug: string,
  bySourceId: Map<string, ExistingContentRow>,
  bySlug: Map<string, ExistingContentRow>,
): ExistingContentRow | undefined {
  return bySourceId.get(sourceId) ?? bySlug.get(slug);
}

function decideAction(existing: ExistingContentRow | undefined): {
  action: ImportAction;
  conflict: string | null;
} {
  if (!existing) {
    return { action: "insert", conflict: null };
  }
  if (isProtectedStatus(existing.status, existing.review_status)) {
    return {
      action: "skip_protected",
      conflict: `existing ${existing.status}/${existing.review_status} on slug ${existing.slug}`,
    };
  }
  if (isPlaceholderStatus(existing.status, existing.review_status)) {
    return { action: "update_identity", conflict: null };
  }
  return {
    action: "skip_protected",
    conflict: `existing ${existing.status}/${existing.review_status} is not a placeholder`,
  };
}

function resolveImportSlug(
  desired: string,
  sourceId: string,
  bySourceId: Map<string, ExistingContentRow>,
  bySlug: Map<string, ExistingContentRow>,
  claimed: Set<string>,
): { slug: string; conflict: string | null } {
  const existingBySource = bySourceId.get(sourceId);
  if (existingBySource) {
    return { slug: existingBySource.slug, conflict: null };
  }
  const existingBySlug = bySlug.get(desired);
  if (existingBySlug && existingBySlug.source_id && existingBySlug.source_id !== sourceId) {
    const fallback = `${desired}-nabda-db`;
    return {
      slug: claimed.has(fallback) || bySlug.has(fallback) ? `${desired}-${sourceId}` : fallback,
      conflict: `slug ${desired} owned by source_id ${existingBySlug.source_id}`,
    };
  }
  if (claimed.has(desired) && !existingBySlug) {
    return {
      slug: `${desired}-nabda-db`,
      conflict: `duplicate planned slug ${desired}`,
    };
  }
  return { slug: desired, conflict: null };
}

function indexExisting(rows: ExistingContentRow[]) {
  const bySourceId = new Map<string, ExistingContentRow>();
  const bySlug = new Map<string, ExistingContentRow>();
  for (const row of rows) {
    if (row.source_id) {
      bySourceId.set(row.source_id, row);
    }
    bySlug.set(row.slug, row);
  }
  return { bySourceId, bySlug };
}

function seedCatalogAsExisting(
  slugs: readonly string[],
  tableHint: string,
): ExistingContentRow[] {
  return slugs.map((slug) => ({
    id: `seed:${tableHint}:${slug}`,
    slug,
    source_id: null,
    status: "seed_placeholder",
    review_status: "editorial_placeholder",
    visibility: "public_free",
  }));
}

export function protocolPayload(identity: ProtocolIdentity, slug: string): Record<string, unknown> {
  const dbCategory = resolveDbCategory(identity.category_slug, UNCATEGORIZED);
  return {
    slug,
    title: identity.title,
    short_title: identity.title,
    summary: IDENTITY_SUMMARY,
    category_slug: dbCategory,
    content_type: identity.has_flowchart_image ? "protocol" : "recommendation",
    status: "imported",
    review_status: "unreviewed",
    visibility: "admin_only",
    is_featured: false,
    published_at: null,
    source_note: "nabda_db identity import. Clinical body locked.",
    source_id: identity.source_id,
    source_prefix: identity.source_prefix,
    source_slug: identity.source_slug,
    imported_from: IMPORTED_FROM_NABDA_DB,
    imported_at: new Date().toISOString(),
    local_adaptation_status: toDbLocalAdaptationStatus(identity.local_adaptation_status),
    clinical_payload_status: "locked",
    source_trace: asJson({
      ...identity.source_trace,
      intended_category_slug: identity.category_slug,
      db_category_slug: dbCategory,
      has_body_html: identity.has_body_html,
      has_flowchart_image: identity.has_flowchart_image,
      source_count: identity.source_count,
      linked_drug_count: identity.linked_drug_ids.length,
      linked_calc_count: identity.linked_calc_ids.length,
      linked_protocol_count: identity.linked_protocol_ids.length,
      body_html_not_imported: true,
      mapper_local_adaptation_status: identity.local_adaptation_status,
    }),
  };
}

export function catPayload(
  identity: CatIdentity,
  slug: string,
  protocolId: string | null,
): Record<string, unknown> {
  return {
    protocol_id: protocolId,
    slug,
    title: identity.title,
    summary: IDENTITY_SUMMARY,
    status: "imported",
    review_status: "unreviewed",
    visibility: "admin_only",
    map_json: EMPTY_CAT_MAP_JSON,
    is_featured: false,
    published_at: null,
    source_note: "nabda_db CAT identity. Graph not extracted.",
    source_id: identity.source_id,
    source_prefix: identity.source_prefix,
    source_slug: identity.source_slug,
    imported_from: IMPORTED_FROM_NABDA_DB,
    imported_at: new Date().toISOString(),
    local_adaptation_status: toDbLocalAdaptationStatus(identity.local_adaptation_status),
    clinical_payload_status: "locked",
    source_trace: asJson({
      ...identity.source_trace,
      protocol_source_id: identity.protocol_source_id,
      has_flowchart_image: true,
      flowchart_media_count: identity.flowchart_media_count,
      cat_blocks_not_created: true,
      cat_edges_not_created: true,
    }),
  };
}

export function drugPayload(identity: DrugIdentity, slug: string): Record<string, unknown> {
  const summary = [
    `${identity.presentation_count} présentations`,
    `${identity.product_count_dz} produits DZ`,
    "monographie verrouillée",
  ].join(" · ");
  return {
    slug,
    dci: identity.dci_name,
    display_name: identity.display_name,
    therapeutic_class: identity.class_label,
    summary,
    status: "imported",
    review_status: "unreviewed",
    visibility: "admin_only",
    is_featured: false,
    source_note: "nabda_db DCI identity. Strength labels are availability metadata, not posology.",
    source_id: identity.source_id,
    source_prefix: identity.source_prefix,
    source_slug: identity.source_slug,
    imported_from: IMPORTED_FROM_NABDA_DB,
    imported_at: new Date().toISOString(),
    local_adaptation_status: toDbLocalAdaptationStatus(identity.local_adaptation_status),
    clinical_payload_status: "locked",
    source_trace: asJson({
      ...identity.source_trace,
      class_slug: identity.class_slug,
      forms: identity.forms,
      strength_labels: identity.strength_labels,
      brand_names_sample: identity.brand_names_sample,
      presentation_count: identity.presentation_count,
      product_count_dz: identity.product_count_dz,
      has_monograph_html: identity.has_monograph_html,
      has_posology_html: identity.has_posology_html,
      has_interaction_html: identity.has_interaction_html,
      has_pregnancy_html: identity.has_pregnancy_html,
      posology_not_imported: true,
      interactions_not_imported: true,
      pregnancy_not_imported: true,
    }),
  };
}

export function calculatorPayload(
  identity: CalculatorIdentity,
  slug: string,
): Record<string, unknown> {
  const dbCategory = resolveCalculatorDbCategory(identity.category_slug);
  const title = identity.title_fr_candidate || identity.title_en || identity.slug;
  return {
    slug,
    title,
    short_title: title,
    description: identity.description_fr_candidate || identity.description_en || IDENTITY_SUMMARY,
    category_slug: dbCategory,
    status: "imported",
    review_status: "unreviewed",
    visibility: "admin_only",
    formula_json: {
      ...LOCKED_FORMULA_JSON,
      has_formula_html: identity.has_formula_html,
      has_equation_logic_text: identity.has_equation_logic_text,
      input_count: identity.input_count,
      input_types: identity.input_types,
      risk_classification: identity.risk_classification,
      is_runnable_source: identity.is_runnable_source,
      dosing_or_high_risk_not_enabled: identity.risk_classification === "dosing_or_high_risk",
    },
    is_featured: false,
    usage_context: identity.risk_classification,
    source_id: identity.source_id,
    source_prefix: identity.source_prefix,
    source_slug: identity.source_slug,
    imported_from: IMPORTED_FROM_NABDA_DB,
    imported_at: new Date().toISOString(),
    local_adaptation_status: toDbLocalAdaptationStatus(identity.local_adaptation_status),
    clinical_payload_status: "locked",
    source_trace: asJson({
      ...identity.source_trace,
      intended_category_slug: identity.category_slug,
      db_category_slug: dbCategory,
      language: identity.language,
      calc_type: identity.calc_type,
      specialty_slugs: identity.specialty_slugs,
      tag_slugs: identity.tag_slugs,
      equation_logic_not_executed: true,
      formula_json_not_executable: true,
    }),
  };
}

function linkSourceId(
  protocolSourceId: string,
  relationship: string,
  targetSourceId: string,
): string {
  return `link:${protocolSourceId}:${relationship}:${targetSourceId}`;
}

function protocolLinkPayload(args: {
  protocolId: string | null;
  protocolSourceId: string;
  targetType: "protocol" | "cat" | "drug" | "calculator";
  targetId: string | null;
  targetSlug: string;
  label: string;
  relationship: "related" | "primary_cat" | "linked_drug" | "linked_calculator";
  orderIndex: number;
  targetSourceId: string;
}): Record<string, unknown> {
  const sourceId = linkSourceId(args.protocolSourceId, args.relationship, args.targetSourceId);
  return {
    protocol_id: args.protocolId,
    target_type: args.targetType,
    target_id: args.targetId,
    target_slug: args.targetSlug,
    label: args.label,
    relationship: args.relationship,
    order_index: args.orderIndex,
    source_id: sourceId,
    source_prefix: "g",
    source_slug: args.protocolSourceId,
    imported_from: IMPORTED_FROM_NABDA_DB,
    imported_at: new Date().toISOString(),
    local_adaptation_status: "pending",
    clinical_payload_status: "locked",
    source_trace: asJson({
      protocol_source_id: args.protocolSourceId,
      target_source_id: args.targetSourceId,
      identity_link_only: true,
    }),
  };
}

function uniqueSlugDuplicates(
  rows: Array<{ slug: string; source_id: string }>,
  table: string,
): Array<{ table: string; key: string; values: string[] }> {
  const bySlug = new Map<string, string[]>();
  for (const row of rows) {
    const list = bySlug.get(row.slug) ?? [];
    list.push(row.source_id);
    bySlug.set(row.slug, list);
  }
  const duplicates: Array<{ table: string; key: string; values: string[] }> = [];
  for (const [slug, ids] of bySlug) {
    if (ids.length > 1) {
      duplicates.push({ table, key: `slug:${slug}`, values: ids });
    }
  }
  return duplicates;
}

export function buildImportPlan(
  loaded: LoadedIdentities,
  options?: {
    existing?: {
      protocols?: ExistingContentRow[];
      cat_maps?: ExistingContentRow[];
      calculators?: ExistingContentRow[];
      drugs?: ExistingContentRow[];
      protocol_links?: ExistingLinkRow[];
    };
    liveDb?: ImportPlan["live_db"];
    dryRun?: boolean;
  },
): ImportPlan {
  const liveDb = options?.liveDb ?? "seed_catalog_only";
  const existingProtocols = indexExisting(
    options?.existing?.protocols ?? seedCatalogAsExisting(SEED_PROTOCOL_SLUGS, "protocols"),
  );
  const existingCats = indexExisting(
    options?.existing?.cat_maps ?? seedCatalogAsExisting(SEED_CAT_SLUGS, "cat_maps"),
  );
  const existingCalcs = indexExisting(
    options?.existing?.calculators ??
      seedCatalogAsExisting(SEED_CALCULATOR_SLUGS, "calculators"),
  );
  const existingDrugs = indexExisting(
    options?.existing?.drugs ?? seedCatalogAsExisting(SEED_DRUG_SLUGS, "drugs"),
  );
  const existingLinksBySource = new Map(
    (options?.existing?.protocol_links ?? [])
      .filter((row) => row.source_id)
      .map((row) => [row.source_id as string, row] as const),
  );

  const claimedProtocolSlugs = new Set<string>();
  const claimedCatSlugs = new Set<string>();
  const claimedCalcSlugs = new Set<string>();
  const claimedDrugSlugs = new Set<string>();
  const plannedActions: Record<string, Record<ImportAction, number>> = {};
  const conflicts: ImportPlan["conflicts"] = [];
  const categoryUse: Record<string, number> = {};

  const protocolRows: PlannedRow[] = [];
  const protocolBySource = new Map<string, PlannedRow>();
  for (const identity of loaded.protocols) {
    const resolved = resolveImportSlug(
      identity.slug,
      identity.source_id,
      existingProtocols.bySourceId,
      existingProtocols.bySlug,
      claimedProtocolSlugs,
    );
    claimedProtocolSlugs.add(resolved.slug);
    const existing = findExisting(
      identity.source_id,
      resolved.slug,
      existingProtocols.bySourceId,
      existingProtocols.bySlug,
    );
    const decided = decideAction(existing);
    const row: PlannedRow = {
      table: "protocols",
      action: decided.action,
      source_id: identity.source_id,
      slug: resolved.slug,
      intended_category_slug: identity.category_slug,
      db_category_slug: resolveDbCategory(identity.category_slug, UNCATEGORIZED),
      conflict: resolved.conflict || decided.conflict,
      payload: protocolPayload(identity, resolved.slug),
    };
    if (existing && decided.action === "update_identity") {
      row.payload.review_status = preserveReviewStatus(existing.review_status);
    }
    if (row.conflict && decided.action !== "insert") {
      conflicts.push({
        table: "protocols",
        source_id: identity.source_id,
        slug: resolved.slug,
        reason: row.conflict,
      });
    } else if (resolved.conflict) {
      conflicts.push({
        table: "protocols",
        source_id: identity.source_id,
        slug: resolved.slug,
        reason: resolved.conflict,
      });
    }
    if (identity.category_slug) {
      categoryUse[identity.category_slug] = (categoryUse[identity.category_slug] ?? 0) + 1;
    }
    protocolRows.push(row);
    protocolBySource.set(identity.source_id, row);
    tallyAction(plannedActions, "protocols", row.action);
  }

  const catRows: PlannedRow[] = [];
  const catBySource = new Map<string, PlannedRow>();
  for (const identity of loaded.cats) {
    const resolved = resolveImportSlug(
      identity.slug,
      identity.source_id,
      existingCats.bySourceId,
      existingCats.bySlug,
      claimedCatSlugs,
    );
    claimedCatSlugs.add(resolved.slug);
    const existing = findExisting(
      identity.source_id,
      resolved.slug,
      existingCats.bySourceId,
      existingCats.bySlug,
    );
    const decided = decideAction(existing);
    const protocol = protocolBySource.get(identity.protocol_source_id);
    const row: PlannedRow = {
      table: "cat_maps",
      action: decided.action,
      source_id: identity.source_id,
      slug: resolved.slug,
      conflict: resolved.conflict || decided.conflict,
      payload: catPayload(identity, resolved.slug, null),
    };
    row.payload._protocol_source_id = identity.protocol_source_id;
    row.payload._protocol_plan_slug = protocol?.slug ?? null;
    if (existing && decided.action === "update_identity") {
      row.payload.review_status = preserveReviewStatus(existing.review_status);
      if (existing.map_json && typeof existing.map_json === "object") {
        const map = existing.map_json as { nodes?: unknown[] };
        if (Array.isArray(map.nodes) && map.nodes.length > 0) {
          row.action = "skip_protected";
          row.conflict = "existing cat map_json has nodes; graph not overwritten";
        }
      }
    }
    if (row.conflict) {
      conflicts.push({
        table: "cat_maps",
        source_id: identity.source_id,
        slug: resolved.slug,
        reason: row.conflict,
      });
    }
    catRows.push(row);
    catBySource.set(identity.source_id, row);
    tallyAction(plannedActions, "cat_maps", row.action);
  }

  const drugRows: PlannedRow[] = [];
  const drugBySource = new Map<string, PlannedRow>();
  for (const identity of loaded.drugs) {
    const resolved = resolveImportSlug(
      identity.slug,
      identity.source_id,
      existingDrugs.bySourceId,
      existingDrugs.bySlug,
      claimedDrugSlugs,
    );
    claimedDrugSlugs.add(resolved.slug);
    const existing = findExisting(
      identity.source_id,
      resolved.slug,
      existingDrugs.bySourceId,
      existingDrugs.bySlug,
    );
    const decided = decideAction(existing);
    const row: PlannedRow = {
      table: "drugs",
      action: decided.action,
      source_id: identity.source_id,
      slug: resolved.slug,
      intended_category_slug: identity.class_slug,
      db_category_slug: identity.class_slug,
      conflict: resolved.conflict || decided.conflict,
      payload: drugPayload(identity, resolved.slug),
    };
    if (existing && decided.action === "update_identity") {
      row.payload.review_status = preserveReviewStatus(existing.review_status);
    }
    if (row.conflict) {
      conflicts.push({
        table: "drugs",
        source_id: identity.source_id,
        slug: resolved.slug,
        reason: row.conflict,
      });
    }
    drugRows.push(row);
    drugBySource.set(identity.source_id, row);
    tallyAction(plannedActions, "drugs", row.action);
  }

  const calcRows: PlannedRow[] = [];
  const calcBySource = new Map<string, PlannedRow>();
  for (const identity of loaded.calculators) {
    const resolved = resolveImportSlug(
      identity.slug,
      identity.source_id,
      existingCalcs.bySourceId,
      existingCalcs.bySlug,
      claimedCalcSlugs,
    );
    claimedCalcSlugs.add(resolved.slug);
    const existing = findExisting(
      identity.source_id,
      resolved.slug,
      existingCalcs.bySourceId,
      existingCalcs.bySlug,
    );
    const decided = decideAction(existing);
    const row: PlannedRow = {
      table: "calculators",
      action: decided.action,
      source_id: identity.source_id,
      slug: resolved.slug,
      intended_category_slug: identity.category_slug,
      db_category_slug: resolveCalculatorDbCategory(identity.category_slug),
      conflict: resolved.conflict || decided.conflict,
      payload: calculatorPayload(identity, resolved.slug),
    };
    if (existing && decided.action === "update_identity") {
      row.payload.review_status = preserveReviewStatus(existing.review_status);
    }
    if (identity.category_slug) {
      categoryUse[identity.category_slug] = (categoryUse[identity.category_slug] ?? 0) + 1;
    }
    if (row.conflict) {
      conflicts.push({
        table: "calculators",
        source_id: identity.source_id,
        slug: resolved.slug,
        reason: row.conflict,
      });
    }
    calcRows.push(row);
    calcBySource.set(identity.source_id, row);
    tallyAction(plannedActions, "calculators", row.action);
  }

  const protocolLinks: PlannedRow[] = [];
  const linkKey = new Set<string>();
  const pushLink = (row: PlannedRow) => {
    if (linkKey.has(row.source_id)) {
      return;
    }
    linkKey.add(row.source_id);
    if (existingLinksBySource.has(row.source_id)) {
      row.action = "update_identity";
    }
    protocolLinks.push(row);
    tallyAction(plannedActions, "protocol_links", row.action);
  };

  for (const protocol of loaded.protocols) {
    const plannedProtocol = protocolBySource.get(protocol.source_id);
    if (!plannedProtocol || plannedProtocol.action === "skip_protected") {
      continue;
    }
    let order = 0;
    const cat = catBySource.get(protocol.source_id);
    if (cat && cat.action !== "skip_protected") {
      pushLink({
        table: "protocol_links",
        action: "insert",
        source_id: linkSourceId(protocol.source_id, "primary_cat", protocol.source_id),
        slug: cat.slug,
        payload: protocolLinkPayload({
          protocolId: null,
          protocolSourceId: protocol.source_id,
          targetType: "cat",
          targetId: null,
          targetSlug: cat.slug,
          label: cat.payload.title as string,
          relationship: "primary_cat",
          orderIndex: order++,
          targetSourceId: protocol.source_id,
        }),
      });
    }
    for (const relatedId of protocol.linked_protocol_ids) {
      const related = protocolBySource.get(relatedId);
      if (!related) {
        continue;
      }
      pushLink({
        table: "protocol_links",
        action: "insert",
        source_id: linkSourceId(protocol.source_id, "related", relatedId),
        slug: related.slug,
        payload: protocolLinkPayload({
          protocolId: null,
          protocolSourceId: protocol.source_id,
          targetType: "protocol",
          targetId: null,
          targetSlug: related.slug,
          label: related.payload.title as string,
          relationship: "related",
          orderIndex: order++,
          targetSourceId: relatedId,
        }),
      });
    }
    for (const drugId of protocol.linked_drug_ids) {
      const drug = drugBySource.get(drugId);
      if (!drug) {
        continue;
      }
      pushLink({
        table: "protocol_links",
        action: "insert",
        source_id: linkSourceId(protocol.source_id, "linked_drug", drugId),
        slug: drug.slug,
        payload: protocolLinkPayload({
          protocolId: null,
          protocolSourceId: protocol.source_id,
          targetType: "drug",
          targetId: null,
          targetSlug: drug.slug,
          label: drug.payload.display_name as string,
          relationship: "linked_drug",
          orderIndex: order++,
          targetSourceId: drugId,
        }),
      });
    }
    for (const calcId of protocol.linked_calc_ids) {
      const calc = calcBySource.get(calcId);
      if (!calc) {
        continue;
      }
      pushLink({
        table: "protocol_links",
        action: "insert",
        source_id: linkSourceId(protocol.source_id, "linked_calculator", calcId),
        slug: calc.slug,
        payload: protocolLinkPayload({
          protocolId: null,
          protocolSourceId: protocol.source_id,
          targetType: "calculator",
          targetId: null,
          targetSlug: calc.slug,
          label: calc.payload.title as string,
          relationship: "linked_calculator",
          orderIndex: order++,
          targetSourceId: calcId,
        }),
      });
    }
  }

  const deferredByType: Record<string, number> = {};
  const deferredSamples: DeferredLink[] = [];
  let deferredCount = 0;
  for (const link of loaded.links) {
    const typeKey = `${link.from_type}->${link.to_type}:${link.relation_type}`;
    const fromProtocol = link.from_type === "cat" || link.from_type === "g";
    const toSupported =
      link.to_type === "cat" ||
      link.to_type === "g" ||
      link.to_type === "substance" ||
      link.to_type === "s" ||
      link.to_type === "calc" ||
      link.to_type === "calculator";
    if (fromProtocol && toSupported) {
      continue;
    }
    deferredCount += 1;
    deferredByType[typeKey] = (deferredByType[typeKey] ?? 0) + 1;
    if (deferredSamples.length < 12) {
      deferredSamples.push({
        source_from_id: link.source_from_id,
        source_to_id: link.source_to_id,
        from_type: link.from_type,
        to_type: link.to_type,
        relation_type: link.relation_type,
        reason: "protocol_links only accepts protocol-origin navigation edges",
      });
    }
  }

  const categoriesNotInSeed = Object.entries(categoryUse)
    .filter(([slug]) => !implementedCategories.has(slug) && slug !== UNCATEGORIZED)
    .map(([slug, protocol_or_calc_count]) => ({ slug, protocol_or_calc_count }))
    .sort((a, b) => b.protocol_or_calc_count - a.protocol_or_calc_count);

  const taxonomyBlockers = [
    ...categoriesNotInSeed.map(
      (row) =>
        `category ${row.slug} is not in content_categories seed (${row.protocol_or_calc_count} rows will store intended slug in source_trace and null/scores FK)`,
    ),
  ];
  if (loaded.unmapped.drugs_uncategorized_atc_count > 0) {
    taxonomyBlockers.push(
      `${loaded.unmapped.drugs_uncategorized_atc_count} drugs have no ATC class mapping (therapeutic_class still stored as text)`,
    );
  }

  const duplicates = [
    ...uniqueSlugDuplicates(
      protocolRows.map((row) => ({ slug: row.slug, source_id: row.source_id })),
      "protocols",
    ),
    ...uniqueSlugDuplicates(
      catRows.map((row) => ({ slug: row.slug, source_id: row.source_id })),
      "cat_maps",
    ),
    ...uniqueSlugDuplicates(
      drugRows.map((row) => ({ slug: row.slug, source_id: row.source_id })),
      "drugs",
    ),
    ...uniqueSlugDuplicates(
      calcRows.map((row) => ({ slug: row.slug, source_id: row.source_id })),
      "calculators",
    ),
  ];

  const schemaBlockers = [
    "content_tags table is not implemented; tag_slugs stay in source_trace",
    "search_documents table is not implemented; search_text generated columns cover identity strings",
    "cat_blocks/cat_edges are not written in this pass",
    "protocol_sections/protocol_references are not written in this pass",
    "drug posology/interactions/pregnancy child tables are not written in this pass",
    "calculator formula_json.engine stays null; equation_logic_text is not executed",
    "protocol_links has no unique(source_id); importer matches source_id before insert",
  ];

  return {
    generated_at: new Date().toISOString(),
    imported_from: IMPORTED_FROM_NABDA_DB,
    dry_run: options?.dryRun !== false,
    live_db: liveDb,
    counts: {
      protocols: protocolRows.length,
      cat_maps: catRows.length,
      drugs: drugRows.length,
      calculators: calcRows.length,
      protocol_links_safe: protocolLinks.length,
      links_source_rows: loaded.links_source_rows,
      links_mapped: loaded.links.length,
      presentations_indexed: loaded.presentations_indexed,
      products_indexed: loaded.products_indexed,
      deferred_links: deferredCount,
    },
    planned_actions: plannedActions,
    duplicates,
    conflicts: conflicts.slice(0, 200),
    unmapped_taxonomy: {
      ...loaded.unmapped,
      categories_not_in_seed: categoriesNotInSeed,
      fallback: UNCATEGORIZED,
    },
    schema_blockers: schemaBlockers,
    taxonomy_blockers: taxonomyBlockers,
    deferred_links: {
      reason:
        "Non-protocol-origin edges (presentation, calc↔calc, substance→cat reverse, etc.) stay in JSON until dedicated link tables exist.",
      count: deferredCount,
      by_type: deferredByType,
      samples: deferredSamples,
    },
    safety: {
      supabase_writes: false,
      body_html_imported: false,
      posology_imported: false,
      interactions_imported: false,
      pregnancy_imported: false,
      calculator_js_executed: false,
      cat_graph_extracted: false,
      validated_labels: false,
      rows_made_public: false,
      locale_adapted_means: "mechanically_adapted → DB in_progress",
      strength_labels_are_not_posology: true,
    },
    samples: {
      protocols: protocolRows.filter((row) =>
        ["g.asthme-aigu-grave", "g.dietetique-hypercholesterolemie"].includes(row.source_id),
      ),
      cat_maps: catRows.filter((row) => row.source_id === "g.asthme-aigu-grave"),
      drugs: drugRows.filter((row) =>
        ["s.amoxicilline", "s.abacavir"].includes(row.source_id),
      ),
      calculators: calcRows.filter((row) =>
        [
          "calc.glasgow-coma-scale-score-gcs",
          "calc.tpa-tissue-plasminogen-activator-dosing-stroke-calculator",
        ].includes(row.source_id),
      ),
      protocol_links: protocolLinks.filter(
        (row) => row.payload.source_slug === "g.asthme-aigu-grave",
      ).slice(0, 8),
    },
    rows: {
      protocols: protocolRows,
      cat_maps: catRows,
      drugs: drugRows,
      calculators: calcRows,
      protocol_links: protocolLinks,
    },
  };
}

export function compactImportPlan(plan: ImportPlan) {
  const compactRow = (row: PlannedRow) => ({
    table: row.table,
    action: row.action,
    source_id: row.source_id,
    slug: row.slug,
    intended_category_slug: row.intended_category_slug ?? null,
    db_category_slug: row.db_category_slug ?? null,
    conflict: row.conflict ?? null,
  });
  return {
    ...plan,
    rows: {
      protocols: plan.rows.protocols.map(compactRow),
      cat_maps: plan.rows.cat_maps.map(compactRow),
      drugs: plan.rows.drugs.map(compactRow),
      calculators: plan.rows.calculators.map(compactRow),
      protocol_links: plan.rows.protocol_links.map(compactRow),
    },
  };
}

export function identityUpdatePatch(payload: Record<string, unknown>): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (key.startsWith("_")) {
      continue;
    }
    if (key === "slug") {
      continue;
    }
    patch[key] = value;
  }
  if ("visibility" in payload) {
    patch.visibility = "admin_only";
  }
  if ("clinical_payload_status" in payload) {
    patch.clinical_payload_status = "locked";
  }
  if ("status" in payload) {
    patch.status = payload.status ?? "imported";
  }
  return patch;
}
