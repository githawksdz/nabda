import fs from "node:fs";
import path from "node:path";

import type { ImportClient } from "@/lib/nabda-db/import-client";
import { SOURCE_PAYLOAD_IMPORTED_FROM } from "@/lib/nabda-db/source-payload-constants";
import type { NabdaDbPresentation } from "@/lib/nabda-db/source-types";

export const ENTITY_LINKS_TABLE = "source_payload_entity_links";

export type IdentityRow = {
  slug: string;
  source_id: string | null;
  has_source_payload?: boolean;
  source_payload_types?: string[];
};

export type PayloadBundleRow = {
  entity_slug: string;
  source_id: string;
};

export type DrugMatchStrategy =
  | "exact_slug"
  | "presentation_index"
  | "slug_prefix"
  | "unmatched";

export type DrugMatchResult = {
  payload_entity_slug: string;
  payload_source_id: string;
  identity_slug: string;
  identity_source_id: string;
  strategy: DrugMatchStrategy;
  confidence: "exact" | "presentation_index" | "slug_prefix" | "inferred";
  relationship: "presentation_monograph" | "primary_monograph";
  ambiguous: boolean;
  source_trace: Record<string, unknown>;
};

export type AlignmentAuditReport = {
  generated_at: string;
  protocols: {
    identities_with_payload: number;
    identities_without_payload: number;
    payloads_without_identity: number;
    identity_slugs_without_payload: string[];
    payload_slugs_without_identity: string[];
  };
  cats: {
    identities_with_payload: number;
    identities_without_payload: number;
    payloads_without_identity: number;
    orphan_payload_slugs: string[];
    orphan_notes: string[];
  };
  drugs: {
    identities_total: number;
    payload_bundles_total: number;
    by_entity_slug_exact: number;
    by_presentation_index: number;
    by_slug_prefix: number;
    unmatched_payloads: number;
    identities_with_any_payload: number;
    identities_without_payload: number;
    ambiguous_matches: number;
    unmatched_payload_slugs_sample: string[];
  };
  calculators: {
    identities_with_payload: number;
    identities_without_payload: number;
    payloads_without_identity: number;
  };
  drug_matching_strategies_tested: DrugMatchStrategy[];
  cat_orphan_strategy: "protocol_only";
};

export type AlignmentFixPlan = {
  generated_at: string;
  dry_run: boolean;
  safe_to_apply: boolean;
  blocked_reasons: string[];
  mapping_rows_planned: number;
  drug_identity_flags_planned: number;
  cat_identity_flags_planned: number;
  protocol_identity_flags_planned: number;
  calculator_identity_flags_planned: number;
  cat_identities_to_create: number;
  payload_orphans_remaining: number;
  ambiguous_drug_matches: number;
  drug_matches: DrugMatchResult[];
  cat_orphan_strategy: "protocol_only";
  cat_orphan_slugs: string[];
};

async function fetchAll<T>(
  client: ImportClient,
  table: string,
  columns: string,
  filters?: Record<string, string>,
): Promise<T[]> {
  const pageSize = 1000;
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    let query = client.from(table).select(columns).range(from, from + pageSize - 1);
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
    }
    const { data, error } = await query;
    if (error) {
      throw new Error(`${table} select failed: ${error.message}`);
    }
    const batch = (data ?? []) as T[];
    rows.push(...batch);
    if (batch.length < pageSize) {
      break;
    }
  }
  return rows;
}

export function loadPresentationIndex(root: string): Map<string, string> {
  const filePath = path.join(root, "nabda_db", "drugs", "presentations.json");
  if (!fs.existsSync(filePath)) {
    return new Map();
  }
  const presentations = JSON.parse(
    fs.readFileSync(filePath, "utf8"),
  ) as NabdaDbPresentation[];
  return new Map(presentations.map((row) => [row.id, row.substance_id]));
}

export function matchDrugBundle(
  bundle: PayloadBundleRow,
  identitiesBySlug: Map<string, IdentityRow>,
  identitiesBySourceId: Map<string, IdentityRow>,
  presentationIndex: Map<string, string>,
  identitySlugsByLength: string[],
): DrugMatchResult | null {
  if (identitiesBySlug.has(bundle.entity_slug)) {
    const identity = identitiesBySlug.get(bundle.entity_slug)!;
    if (!identity.source_id) {
      return null;
    }
    return {
      payload_entity_slug: bundle.entity_slug,
      payload_source_id: bundle.source_id,
      identity_slug: identity.slug,
      identity_source_id: identity.source_id,
      strategy: "exact_slug",
      confidence: "exact",
      relationship: "presentation_monograph",
      ambiguous: false,
      source_trace: { match: "entity_slug_exact" },
    };
  }

  const substanceId = presentationIndex.get(bundle.source_id);
  if (substanceId && identitiesBySourceId.has(substanceId)) {
    const identity = identitiesBySourceId.get(substanceId)!;
    return {
      payload_entity_slug: bundle.entity_slug,
      payload_source_id: bundle.source_id,
      identity_slug: identity.slug,
      identity_source_id: substanceId,
      strategy: "presentation_index",
      confidence: "presentation_index",
      relationship: "presentation_monograph",
      ambiguous: false,
      source_trace: {
        match: "presentation_index",
        presentation_id: bundle.source_id,
        substance_id: substanceId,
      },
    };
  }

  const prefixMatches: string[] = [];
  for (const slug of identitySlugsByLength) {
    if (bundle.entity_slug === slug || bundle.entity_slug.startsWith(`${slug}-`)) {
      prefixMatches.push(slug);
      break;
    }
  }

  if (prefixMatches.length === 1) {
    const identity = identitiesBySlug.get(prefixMatches[0])!;
    if (!identity.source_id) {
      return null;
    }
    return {
      payload_entity_slug: bundle.entity_slug,
      payload_source_id: bundle.source_id,
      identity_slug: identity.slug,
      identity_source_id: identity.source_id,
      strategy: "slug_prefix",
      confidence: "slug_prefix",
      relationship: "presentation_monograph",
      ambiguous: false,
      source_trace: { match: "slug_prefix", matched_slug: identity.slug },
    };
  }

  return null;
}

export function buildDrugMatches(
  bundles: PayloadBundleRow[],
  drugIdentities: IdentityRow[],
  presentationIndex: Map<string, string>,
): DrugMatchResult[] {
  const identitiesBySlug = new Map(drugIdentities.map((row) => [row.slug, row]));
  const identitiesBySourceId = new Map(
    drugIdentities
      .filter((row) => row.source_id)
      .map((row) => [row.source_id as string, row] as const),
  );
  const identitySlugsByLength = [...identitiesBySlug.keys()].sort(
    (a, b) => b.length - a.length,
  );

  const matches: DrugMatchResult[] = [];
  for (const bundle of bundles) {
    const match = matchDrugBundle(
      bundle,
      identitiesBySlug,
      identitiesBySourceId,
      presentationIndex,
      identitySlugsByLength,
    );
    if (match) {
      matches.push(match);
    }
  }

  const primaryByIdentity = new Map<string, DrugMatchResult>();
  for (const match of [...matches].sort((a, b) =>
    a.payload_entity_slug.localeCompare(b.payload_entity_slug, "fr"),
  )) {
    if (!primaryByIdentity.has(match.identity_slug)) {
      primaryByIdentity.set(match.identity_slug, {
        ...match,
        relationship: "primary_monograph",
        source_trace: { ...match.source_trace, primary: true },
      });
    }
  }

  const primaryMatches = [...primaryByIdentity.values()];
  const presentationOnly = matches.filter(
    (match) => match.relationship === "presentation_monograph",
  );
  return [...presentationOnly, ...primaryMatches];
}

export function mappingRowFromDrugMatch(match: DrugMatchResult): Record<string, unknown> {
  return {
    identity_table: "drugs",
    identity_slug: match.identity_slug,
    identity_source_id: match.identity_source_id,
    payload_table: "source_drug_sections",
    payload_entity_slug: match.payload_entity_slug,
    payload_source_id: match.payload_source_id,
    relationship: match.relationship,
    confidence: match.confidence,
    imported_from: SOURCE_PAYLOAD_IMPORTED_FROM,
    source_trace: match.source_trace,
  };
}

export async function loadAlignmentData(client: ImportClient): Promise<{
  protocols: IdentityRow[];
  cats: IdentityRow[];
  drugs: IdentityRow[];
  calculators: IdentityRow[];
  protocolBundles: PayloadBundleRow[];
  catBundles: PayloadBundleRow[];
  drugBundles: PayloadBundleRow[];
  calculatorBundles: PayloadBundleRow[];
}> {
  const [protocols, cats, drugs, calculators, protocolBundles, catBundles, drugBundles, calculatorBundles] =
    await Promise.all([
      fetchAll<IdentityRow>(client, "protocols", "slug,source_id,has_source_payload,source_payload_types", {
        imported_from: SOURCE_PAYLOAD_IMPORTED_FROM,
      }),
      fetchAll<IdentityRow>(client, "cat_maps", "slug,source_id,has_source_payload,source_payload_types", {
        imported_from: SOURCE_PAYLOAD_IMPORTED_FROM,
      }),
      fetchAll<IdentityRow>(client, "drugs", "slug,source_id,has_source_payload,source_payload_types", {
        imported_from: SOURCE_PAYLOAD_IMPORTED_FROM,
      }),
      fetchAll<IdentityRow>(
        client,
        "calculators",
        "slug,source_id,has_source_payload,source_payload_types",
        { imported_from: SOURCE_PAYLOAD_IMPORTED_FROM },
      ),
      fetchAll<PayloadBundleRow>(
        client,
        "source_protocol_sections",
        "entity_slug,source_id",
        { entity_type: "protocol_bundle", imported_from: SOURCE_PAYLOAD_IMPORTED_FROM },
      ),
      fetchAll<PayloadBundleRow>(client, "source_cat_steps", "entity_slug,source_id", {
        entity_type: "cat_bundle",
        imported_from: SOURCE_PAYLOAD_IMPORTED_FROM,
      }),
      fetchAll<PayloadBundleRow>(client, "source_drug_sections", "entity_slug,source_id", {
        entity_type: "drug_bundle",
        imported_from: SOURCE_PAYLOAD_IMPORTED_FROM,
      }),
      fetchAll<PayloadBundleRow>(
        client,
        "source_calculator_profiles",
        "entity_slug,source_id",
        { imported_from: SOURCE_PAYLOAD_IMPORTED_FROM },
      ),
    ]);

  return {
    protocols,
    cats,
    drugs,
    calculators,
    protocolBundles,
    catBundles,
    drugBundles,
    calculatorBundles,
  };
}

const CAT_ORPHAN_NOTES: Record<string, string> = {
  "reeducation-fonctionnelle-": "Rééducation fonctionnelle guide — protocol-only, not a CAT map",
  "dietetique-": "Diététique guide — protocol-only, not a CAT map",
  "maladies-rares": "Article/guide content — protocol-only",
  "liste-des-guides-ald-en-cancerologie": "ALD guide list — protocol-only",
};

function catOrphanNote(slug: string): string {
  for (const [prefix, note] of Object.entries(CAT_ORPHAN_NOTES)) {
    if (slug.startsWith(prefix) || slug === prefix.replace(/-$/, "")) {
      return note;
    }
  }
  return "No matching cat_maps identity — protocol-only";
}

export async function auditSourcePayloadAlignment(
  client: ImportClient,
  root: string,
): Promise<AlignmentAuditReport> {
  const data = await loadAlignmentData(client);
  const presentationIndex = loadPresentationIndex(root);
  const drugMatches = buildDrugMatches(data.drugBundles, data.drugs, presentationIndex);

  const protocolPayloadSlugs = new Set(data.protocolBundles.map((row) => row.entity_slug));
  const protocolIdentitySlugs = new Set(data.protocols.map((row) => row.slug));
  const protocolIdentitySourceIds = new Set(
    data.protocols.filter((row) => row.source_id).map((row) => row.source_id as string),
  );

  const catPayloadSlugs = new Set(data.catBundles.map((row) => row.entity_slug));
  const catIdentitySourceIds = new Set(
    data.cats.filter((row) => row.source_id).map((row) => row.source_id as string),
  );
  const catOrphanBundles = data.catBundles.filter(
    (row) => !catIdentitySourceIds.has(row.source_id),
  );

  const calcPayloadSlugs = new Set(data.calculatorBundles.map((row) => row.entity_slug));
  const calcIdentitySlugs = new Set(data.calculators.map((row) => row.slug));
  const calcIdentitySourceIds = new Set(
    data.calculators.filter((row) => row.source_id).map((row) => row.source_id as string),
  );

  const drugMatchByStrategy = {
    exact_slug: 0,
    presentation_index: 0,
    slug_prefix: 0,
    unmatched: 0,
  };
  const matchedPayloadSlugs = new Set(
    drugMatches
      .filter((match) => match.relationship === "presentation_monograph")
      .map((match) => match.payload_entity_slug),
  );
  for (const bundle of data.drugBundles) {
    if (matchedPayloadSlugs.has(bundle.entity_slug)) {
      const match = drugMatches.find(
        (row) =>
          row.payload_entity_slug === bundle.entity_slug &&
          row.relationship === "presentation_monograph",
      );
      if (match) {
        drugMatchByStrategy[match.strategy] += 1;
      }
    } else {
      drugMatchByStrategy.unmatched += 1;
    }
  }

  const identitiesWithDrugPayload = new Set(drugMatches.map((match) => match.identity_slug));

  return {
    generated_at: new Date().toISOString(),
    protocols: {
      identities_with_payload: data.protocols.filter((row) => protocolPayloadSlugs.has(row.slug)).length,
      identities_without_payload: data.protocols.filter((row) => !protocolPayloadSlugs.has(row.slug)).length,
      payloads_without_identity: data.protocolBundles.filter(
        (row) => !protocolIdentitySlugs.has(row.entity_slug) && !protocolIdentitySourceIds.has(row.source_id),
      ).length,
      identity_slugs_without_payload: data.protocols
        .filter((row) => !protocolPayloadSlugs.has(row.slug))
        .map((row) => row.slug)
        .slice(0, 50),
      payload_slugs_without_identity: data.protocolBundles
        .filter(
          (row) =>
            !protocolIdentitySlugs.has(row.entity_slug) &&
            !protocolIdentitySourceIds.has(row.source_id),
        )
        .map((row) => row.entity_slug)
        .slice(0, 50),
    },
    cats: {
      identities_with_payload: data.cats.filter((row) => catPayloadSlugs.has(row.slug)).length,
      identities_without_payload: data.cats.filter((row) => !catPayloadSlugs.has(row.slug)).length,
      payloads_without_identity: catOrphanBundles.length,
      orphan_payload_slugs: catOrphanBundles.map((row) => row.entity_slug),
      orphan_notes: catOrphanBundles.map((row) => catOrphanNote(row.entity_slug)),
    },
    drugs: {
      identities_total: data.drugs.length,
      payload_bundles_total: data.drugBundles.length,
      by_entity_slug_exact: drugMatchByStrategy.exact_slug,
      by_presentation_index: drugMatchByStrategy.presentation_index,
      by_slug_prefix: drugMatchByStrategy.slug_prefix,
      unmatched_payloads: drugMatchByStrategy.unmatched,
      identities_with_any_payload: identitiesWithDrugPayload.size,
      identities_without_payload: data.drugs.length - identitiesWithDrugPayload.size,
      ambiguous_matches: drugMatches.filter((match) => match.ambiguous).length,
      unmatched_payload_slugs_sample: data.drugBundles
        .filter((row) => !matchedPayloadSlugs.has(row.entity_slug))
        .map((row) => row.entity_slug)
        .slice(0, 50),
    },
    calculators: {
      identities_with_payload: data.calculators.filter((row) => calcPayloadSlugs.has(row.slug)).length,
      identities_without_payload: data.calculators.filter((row) => !calcPayloadSlugs.has(row.slug)).length,
      payloads_without_identity: data.calculatorBundles.filter(
        (row) => !calcIdentitySlugs.has(row.entity_slug) && !calcIdentitySourceIds.has(row.source_id),
      ).length,
    },
    drug_matching_strategies_tested: [
      "exact_slug",
      "presentation_index",
      "slug_prefix",
      "unmatched",
    ],
    cat_orphan_strategy: "protocol_only",
  };
}

export function buildAlignmentFixPlan(
  audit: AlignmentAuditReport,
  drugMatches: DrugMatchResult[],
  dryRun: boolean,
): AlignmentFixPlan {
  const presentationMatches = drugMatches.filter(
    (match) => match.relationship === "presentation_monograph",
  );
  const primaryMatches = drugMatches.filter((match) => match.relationship === "primary_monograph");
  const ambiguous = drugMatches.filter((match) => match.ambiguous).length;
  const blocked_reasons: string[] = [];

  if (ambiguous > 0) {
    blocked_reasons.push(`ambiguous_drug_matches=${ambiguous}`);
  }

  const drugIdentitySlugs = new Set([
    ...presentationMatches.map((match) => match.identity_slug),
    ...primaryMatches.map((match) => match.identity_slug),
  ]);

  return {
    generated_at: new Date().toISOString(),
    dry_run: dryRun,
    safe_to_apply: blocked_reasons.length === 0,
    blocked_reasons,
    mapping_rows_planned: presentationMatches.length + primaryMatches.length,
    drug_identity_flags_planned: drugIdentitySlugs.size,
    cat_identity_flags_planned: audit.cats.identities_with_payload,
    protocol_identity_flags_planned: audit.protocols.identities_with_payload,
    calculator_identity_flags_planned: audit.calculators.identities_with_payload,
    cat_identities_to_create: 0,
    payload_orphans_remaining:
      audit.drugs.unmatched_payloads + audit.cats.payloads_without_identity,
    ambiguous_drug_matches: ambiguous,
    drug_matches: drugMatches,
    cat_orphan_strategy: "protocol_only",
    cat_orphan_slugs: audit.cats.orphan_payload_slugs,
  };
}

export const DRUG_SOURCE_PAYLOAD_TYPES = [
  "drug_sections",
  "drug_tables",
  "drug_monograph",
] as const;
