import fs from "node:fs";
import path from "node:path";

import { analyzeCalculator } from "@/lib/nabda-db/calcs/calculator-analyzer";
import { mapCalculatorPreviewModel } from "@/lib/content-rendering/calculator";
import type { NabdaDbCalculator } from "@/lib/nabda-db/source-types";
import { detectSourcePrefix } from "@/lib/nabda-db/slugs";
import {
  LARGE_PAYLOAD_BYTES,
  SOURCE_PAYLOAD_BUNDLE_ITEM_ID,
  SOURCE_PAYLOAD_DEFAULTS,
  SOURCE_PAYLOAD_TABLES,
} from "@/lib/nabda-db/source-payload-constants";
import type { NabdaCalculatorAnalysis } from "@/types/nabda-calculator-analysis";
import type { CatStepExtractResult } from "@/types/nabda-cat-steps";
import type { NabdaDrugTableCandidate } from "@/types/nabda-drug-tables";
import type { ProtocolNormalizeResult } from "@/types/nabda-protocol-sections";
import type { DrugSanitizeCandidate } from "@/types/content-rendering-drug";
import type { CalculatorRenderSource } from "@/types/content-rendering-calculator";

export type SourcePayloadRow = {
  table: string;
  source_id: string;
  source_slug: string;
  source_prefix: string | null;
  entity_slug: string;
  entity_type: string;
  payload_item_id: string;
  sort_order: number;
  payload: Record<string, unknown>;
  plain_text: string | null;
  warnings: string[];
  payload_bytes: number;
  missing_plain_text: boolean;
  identity_match: boolean;
};

export type SourcePayloadIdentityMaps = {
  protocolSourceIds: Set<string>;
  protocolSlugs: Set<string>;
  catSourceIds: Set<string>;
  catSlugs: Set<string>;
  drugSourceIds: Set<string>;
  drugSlugs: Set<string>;
  calculatorSourceIds: Set<string>;
  calculatorSlugs: Set<string>;
};

export type SourcePayloadPlan = {
  generated_at: string;
  live_db: "not_connected" | "seed_catalog_only" | "connected";
  counts: {
    protocol_sections: number;
    protocol_bundles: number;
    cat_steps: number;
    cat_bundles: number;
    drug_sections: number;
    drug_bundles: number;
    drug_tables: number;
    calculator_profiles: number;
    total_rows: number;
  };
  payload_size: {
    total_bytes: number;
    largest_rows: Array<{
      table: string;
      source_id: string;
      payload_item_id: string;
      bytes: number;
    }>;
    large_payload_count: number;
  };
  orphans: {
    protocol_source_ids: string[];
    cat_source_ids: string[];
    drug_source_ids: string[];
    calculator_source_ids: string[];
  };
  missing_plain_text: {
    protocol_sections: number;
    cat_steps: number;
    drug_sections: number;
    drug_tables: number;
    calculator_profiles: number;
  };
  planned_actions: Record<string, { insert: number; update: number; skip: number }>;
  safety: {
    supabase_writes: boolean;
    all_admin_only: true;
    all_locked: true;
    all_unreviewed: true;
    no_executable_js: true;
  };
  rows_by_table: Record<string, SourcePayloadRow[]>;
};

type LoadedCandidates = {
  protocols: ProtocolNormalizeResult[];
  cats: CatStepExtractResult[];
  drugs: DrugSanitizeCandidate[];
  drugTables: NabdaDrugTableCandidate[];
  calculators: NabdaCalculatorAnalysis[];
};

function readJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function payloadBytes(payload: Record<string, unknown>): number {
  return Buffer.byteLength(JSON.stringify(payload), "utf8");
}

function baseRow(
  table: string,
  input: {
    source_id: string;
    entity_slug: string;
    entity_type: string;
    payload_item_id: string;
    sort_order: number;
    payload: Record<string, unknown>;
    plain_text: string | null;
    warnings: string[];
    identity_match: boolean;
  },
): SourcePayloadRow {
  const bytes = payloadBytes(input.payload);
  const plain = input.plain_text?.trim() ?? "";
  return {
    table,
    source_id: input.source_id,
    source_slug: input.entity_slug,
    source_prefix: detectSourcePrefix(input.source_id),
    entity_slug: input.entity_slug,
    entity_type: input.entity_type,
    payload_item_id: input.payload_item_id,
    sort_order: input.sort_order,
    payload: input.payload,
    plain_text: plain || null,
    warnings: input.warnings,
    payload_bytes: bytes,
    missing_plain_text: !plain,
    identity_match: input.identity_match,
  };
}

function stripUnsafeCalculatorFields(
  snapshot: CalculatorRenderSource,
): Record<string, unknown> {
  const safe = { ...snapshot };
  delete safe.jsPreview;
  delete safe.formulaHtml;
  return safe as Record<string, unknown>;
}

function loadCalculatorSource(root: string, sourceId: string): NabdaDbCalculator | null {
  const filename = `${sourceId}.json`;
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return null;
  }
  const calcsDir = path.join(root, "nabda_db", "calcs");
  const absolute = path.join(calcsDir, filename);
  const relative = path.relative(calcsDir, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(absolute)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(absolute, "utf8")) as NabdaDbCalculator;
}

function buildCalculatorProfilePayload(
  root: string,
  analysis: NabdaCalculatorAnalysis,
): Record<string, unknown> {
  const source = loadCalculatorSource(root, analysis.sourceId);
  if (!source) {
    return {
      analysis,
      renderSnapshot: null,
      hasEquationLogicText: analysis.hasEquationLogicText,
      logicLanguage: null,
      hasRawJs: analysis.hasRawJs,
    };
  }
  const liveAnalysis = analyzeCalculator(source);
  const snapshot = mapCalculatorPreviewModel({
    source,
    analysis: liveAnalysis,
    warningItems: [],
  });
  return {
    analysis: liveAnalysis,
    renderSnapshot: stripUnsafeCalculatorFields(snapshot),
    hasEquationLogicText: liveAnalysis.hasEquationLogicText,
    logicLanguage: source.logic_language ?? null,
    hasRawJs: liveAnalysis.hasRawJs,
  };
}

export function loadSourcePayloadCandidates(root: string): LoadedCandidates {
  const protocolFile = readJson<{ protocols: ProtocolNormalizeResult[] }>(
    path.join(root, "data", "protocol-section-candidates.json"),
  );
  const catFile = readJson<{ protocols: CatStepExtractResult[] }>(
    path.join(root, "data", "cat-step-candidates.json"),
  );
  const drugFile = readJson<{ drugs: DrugSanitizeCandidate[] }>(
    path.join(root, "data", "drug-section-candidates.json"),
  );
  const tableFile = readJson<{ tables: NabdaDrugTableCandidate[] }>(
    path.join(root, "data", "drug-table-candidates.json"),
  );
  const calcFile = readJson<{ calculators: NabdaCalculatorAnalysis[] }>(
    path.join(root, "data", "calculator-analysis-candidates.json"),
  );

  return {
    protocols: protocolFile?.protocols ?? [],
    cats: catFile?.protocols ?? [],
    drugs: drugFile?.drugs ?? [],
    drugTables: tableFile?.tables ?? [],
    calculators: calcFile?.calculators ?? [],
  };
}

export function emptyIdentityMaps(): SourcePayloadIdentityMaps {
  return {
    protocolSourceIds: new Set(),
    protocolSlugs: new Set(),
    catSourceIds: new Set(),
    catSlugs: new Set(),
    drugSourceIds: new Set(),
    drugSlugs: new Set(),
    calculatorSourceIds: new Set(),
    calculatorSlugs: new Set(),
  };
}

export function identityMapsFromExisting(existing?: {
  protocols: Array<{ source_id: string | null; slug: string }>;
  cat_maps: Array<{ source_id: string | null; slug: string }>;
  drugs: Array<{ source_id: string | null; slug: string }>;
  calculators: Array<{ source_id: string | null; slug: string }>;
}): SourcePayloadIdentityMaps {
  const maps = emptyIdentityMaps();
  if (!existing) {
    return maps;
  }
  for (const row of existing.protocols) {
    if (row.source_id) maps.protocolSourceIds.add(row.source_id);
    maps.protocolSlugs.add(row.slug);
  }
  for (const row of existing.cat_maps) {
    if (row.source_id) maps.catSourceIds.add(row.source_id);
    maps.catSlugs.add(row.slug);
  }
  for (const row of existing.drugs) {
    if (row.source_id) maps.drugSourceIds.add(row.source_id);
    maps.drugSlugs.add(row.slug);
  }
  for (const row of existing.calculators) {
    if (row.source_id) maps.calculatorSourceIds.add(row.source_id);
    maps.calculatorSlugs.add(row.slug);
  }
  return maps;
}

function protocolIdentityMatch(
  maps: SourcePayloadIdentityMaps,
  sourceId: string,
  slug: string,
): boolean {
  return maps.protocolSourceIds.has(sourceId) || maps.protocolSlugs.has(slug);
}

function catIdentityMatch(maps: SourcePayloadIdentityMaps, sourceId: string, slug: string): boolean {
  return maps.catSourceIds.has(sourceId) || maps.catSlugs.has(slug);
}

function drugIdentityMatch(maps: SourcePayloadIdentityMaps, sourceId: string, slug: string): boolean {
  return maps.drugSourceIds.has(sourceId) || maps.drugSlugs.has(slug);
}

function calculatorIdentityMatch(
  maps: SourcePayloadIdentityMaps,
  sourceId: string,
  slug: string,
): boolean {
  return maps.calculatorSourceIds.has(sourceId) || maps.calculatorSlugs.has(slug);
}

export function buildSourcePayloadRows(
  root: string,
  loaded: LoadedCandidates,
  maps: SourcePayloadIdentityMaps,
): SourcePayloadRow[] {
  const rows: SourcePayloadRow[] = [];

  for (const protocol of loaded.protocols) {
    const identityMatch = protocolIdentityMatch(
      maps,
      protocol.protocolSourceId,
      protocol.protocolSlug,
    );
    rows.push(
      baseRow(SOURCE_PAYLOAD_TABLES.protocolSections, {
        source_id: protocol.protocolSourceId,
        entity_slug: protocol.protocolSlug,
        entity_type: "protocol_bundle",
        payload_item_id: SOURCE_PAYLOAD_BUNDLE_ITEM_ID,
        sort_order: -1,
        payload: {
          protocolTitle: protocol.protocolTitle,
          bodyChars: protocol.bodyChars,
          tabGroups: protocol.tabGroups,
          shiftGroups: protocol.shiftGroups,
          warnings: protocol.warnings,
        },
        plain_text: null,
        warnings: protocol.warnings,
        identity_match: identityMatch,
      }),
    );
    for (const section of protocol.sections) {
      rows.push(
        baseRow(SOURCE_PAYLOAD_TABLES.protocolSections, {
          source_id: protocol.protocolSourceId,
          entity_slug: protocol.protocolSlug,
          entity_type: "protocol_section",
          payload_item_id: section.id,
          sort_order: section.order,
          payload: section as unknown as Record<string, unknown>,
          plain_text: section.text,
          warnings: section.warnings,
          identity_match: identityMatch,
        }),
      );
    }
  }

  for (const cat of loaded.cats) {
    const identityMatch = catIdentityMatch(maps, cat.protocolSourceId, cat.protocolSlug);
    rows.push(
      baseRow(SOURCE_PAYLOAD_TABLES.catSteps, {
        source_id: cat.protocolSourceId,
        entity_slug: cat.protocolSlug,
        entity_type: "cat_bundle",
        payload_item_id: SOURCE_PAYLOAD_BUNDLE_ITEM_ID,
        sort_order: -1,
        payload: {
          protocolTitle: cat.protocolTitle,
          hasStaticFlowchartImage: cat.hasStaticFlowchartImage,
          hasExtractedLinearSteps: cat.hasExtractedLinearSteps,
          hasInteractiveGraph: cat.hasInteractiveGraph,
          flowchartImages: cat.flowchartImages,
          imagemapStripped: cat.imagemapStripped,
          extractionMode: cat.extractionMode,
          warnings: cat.warnings,
          tabGroups: cat.tabGroups,
          shiftGroups: cat.shiftGroups,
        },
        plain_text: null,
        warnings: cat.warnings,
        identity_match: identityMatch,
      }),
    );
    for (const step of cat.steps) {
      rows.push(
        baseRow(SOURCE_PAYLOAD_TABLES.catSteps, {
          source_id: cat.protocolSourceId,
          entity_slug: cat.protocolSlug,
          entity_type: "cat_step",
          payload_item_id: step.id,
          sort_order: step.order,
          payload: step as unknown as Record<string, unknown>,
          plain_text: step.text,
          warnings: step.warnings,
          identity_match: identityMatch,
        }),
      );
    }
  }

  for (const drug of loaded.drugs) {
    const identityMatch = drugIdentityMatch(maps, drug.drugSourceId, drug.drugSlug);
    rows.push(
      baseRow(SOURCE_PAYLOAD_TABLES.drugSections, {
        source_id: drug.drugSourceId,
        entity_slug: drug.drugSlug,
        entity_type: "drug_bundle",
        payload_item_id: SOURCE_PAYLOAD_BUNDLE_ITEM_ID,
        sort_order: -1,
        payload: {
          drugSourceId: drug.drugSourceId,
          drugSlug: drug.drugSlug,
          localeStatus: drug.localeStatus,
          warnings: drug.warnings,
          missingExpectedKeys: drug.missingExpectedKeys,
          skippedJunkKeys: drug.skippedJunkKeys,
          tabGroups: drug.tabGroups,
          htmlOmitted: true,
        },
        plain_text: null,
        warnings: drug.warnings,
        identity_match: identityMatch,
      }),
    );
    for (const section of drug.sections) {
      rows.push(
        baseRow(SOURCE_PAYLOAD_TABLES.drugSections, {
          source_id: drug.drugSourceId,
          entity_slug: drug.drugSlug,
          entity_type: "drug_section",
          payload_item_id: section.id,
          sort_order: section.order,
          payload: section as unknown as Record<string, unknown>,
          plain_text: section.textPreview ?? null,
          warnings: section.warnings,
          identity_match: identityMatch,
        }),
      );
    }
  }

  for (const table of loaded.drugTables) {
    const identityMatch = drugIdentityMatch(maps, table.drugSourceId, table.drugSlug);
    rows.push(
      baseRow(SOURCE_PAYLOAD_TABLES.drugTables, {
        source_id: table.drugSourceId,
        entity_slug: table.drugSlug,
        entity_type: "drug_table",
        payload_item_id: table.id,
        sort_order: table.tableIndex,
        payload: table as unknown as Record<string, unknown>,
        plain_text: table.headerTexts.join(" | "),
        warnings: table.warnings,
        identity_match: identityMatch,
      }),
    );
  }

  for (const analysis of loaded.calculators) {
    const identityMatch = calculatorIdentityMatch(maps, analysis.sourceId, analysis.slug);
    const profilePayload = buildCalculatorProfilePayload(root, analysis);
    const plain =
      analysis.titleFrCandidate ||
      analysis.titleEn ||
      analysis.slug.replace(/-/g, " ");
    rows.push(
      baseRow(SOURCE_PAYLOAD_TABLES.calculatorProfiles, {
        source_id: analysis.sourceId,
        entity_slug: analysis.slug,
        entity_type: "calculator_profile",
        payload_item_id: "profile",
        sort_order: 0,
        payload: profilePayload,
        plain_text: plain,
        warnings: analysis.warnings,
        identity_match: identityMatch,
      }),
    );
  }

  return rows;
}

export function buildSourcePayloadPlan(input: {
  root: string;
  loaded: LoadedCandidates;
  maps: SourcePayloadIdentityMaps;
  liveDb: SourcePayloadPlan["live_db"];
  existingRowKeys?: Map<string, Set<string>>;
}): SourcePayloadPlan {
  const rows = buildSourcePayloadRows(input.root, input.loaded, input.maps);
  const rowsByTable: Record<string, SourcePayloadRow[]> = {};
  for (const row of rows) {
    const list = rowsByTable[row.table] ?? [];
    list.push(row);
    rowsByTable[row.table] = list;
  }

  const protocolSections = rows.filter(
    (row) => row.table === SOURCE_PAYLOAD_TABLES.protocolSections && row.entity_type === "protocol_section",
  );
  const protocolBundles = rows.filter(
    (row) => row.table === SOURCE_PAYLOAD_TABLES.protocolSections && row.entity_type === "protocol_bundle",
  );
  const catSteps = rows.filter(
    (row) => row.table === SOURCE_PAYLOAD_TABLES.catSteps && row.entity_type === "cat_step",
  );
  const catBundles = rows.filter(
    (row) => row.table === SOURCE_PAYLOAD_TABLES.catSteps && row.entity_type === "cat_bundle",
  );
  const drugSections = rows.filter(
    (row) => row.table === SOURCE_PAYLOAD_TABLES.drugSections && row.entity_type === "drug_section",
  );
  const drugBundles = rows.filter(
    (row) => row.table === SOURCE_PAYLOAD_TABLES.drugSections && row.entity_type === "drug_bundle",
  );
  const drugTables = rows.filter((row) => row.table === SOURCE_PAYLOAD_TABLES.drugTables);
  const calculatorProfiles = rows.filter(
    (row) => row.table === SOURCE_PAYLOAD_TABLES.calculatorProfiles,
  );

  const largestRows = [...rows]
    .sort((a, b) => b.payload_bytes - a.payload_bytes)
    .slice(0, 20)
    .map((row) => ({
      table: row.table,
      source_id: row.source_id,
      payload_item_id: row.payload_item_id,
      bytes: row.payload_bytes,
    }));

  const totalBytes = rows.reduce((sum, row) => sum + row.payload_bytes, 0);
  const largePayloadCount = rows.filter((row) => row.payload_bytes >= LARGE_PAYLOAD_BYTES).length;

  const orphanProtocol = new Set<string>();
  const orphanCat = new Set<string>();
  const orphanDrug = new Set<string>();
  const orphanCalculator = new Set<string>();

  for (const row of rows) {
    if (row.identity_match) continue;
    if (row.table === SOURCE_PAYLOAD_TABLES.protocolSections) orphanProtocol.add(row.source_id);
    if (row.table === SOURCE_PAYLOAD_TABLES.catSteps) orphanCat.add(row.source_id);
    if (row.table === SOURCE_PAYLOAD_TABLES.drugSections || row.table === SOURCE_PAYLOAD_TABLES.drugTables) {
      orphanDrug.add(row.source_id);
    }
    if (row.table === SOURCE_PAYLOAD_TABLES.calculatorProfiles) orphanCalculator.add(row.source_id);
  }

  const planned_actions: SourcePayloadPlan["planned_actions"] = {};
  for (const [table, tableRows] of Object.entries(rowsByTable)) {
    const existingKeys = input.existingRowKeys?.get(table);
    let insert = 0;
    let update = 0;
    for (const row of tableRows) {
      const key = `${row.source_id}::${row.payload_item_id}`;
      if (existingKeys?.has(key)) {
        update += 1;
      } else {
        insert += 1;
      }
    }
    planned_actions[table] = { insert, update, skip: 0 };
  }

  return {
    generated_at: new Date().toISOString(),
    live_db: input.liveDb,
    counts: {
      protocol_sections: protocolSections.length,
      protocol_bundles: protocolBundles.length,
      cat_steps: catSteps.length,
      cat_bundles: catBundles.length,
      drug_sections: drugSections.length,
      drug_bundles: drugBundles.length,
      drug_tables: drugTables.length,
      calculator_profiles: calculatorProfiles.length,
      total_rows: rows.length,
    },
    payload_size: {
      total_bytes: totalBytes,
      largest_rows: largestRows,
      large_payload_count: largePayloadCount,
    },
    orphans: {
      protocol_source_ids: [...orphanProtocol].sort(),
      cat_source_ids: [...orphanCat].sort(),
      drug_source_ids: [...orphanDrug].sort(),
      calculator_source_ids: [...orphanCalculator].sort(),
    },
    missing_plain_text: {
      protocol_sections: protocolSections.filter((row) => row.missing_plain_text).length,
      cat_steps: catSteps.filter((row) => row.missing_plain_text).length,
      drug_sections: drugSections.filter((row) => row.missing_plain_text).length,
      drug_tables: drugTables.filter((row) => row.missing_plain_text).length,
      calculator_profiles: calculatorProfiles.filter((row) => row.missing_plain_text).length,
    },
    planned_actions,
    safety: {
      supabase_writes: false,
      all_admin_only: true,
      all_locked: true,
      all_unreviewed: true,
      no_executable_js: true,
    },
    rows_by_table: rowsByTable,
  };
}

export function compactSourcePayloadPlan(
  plan: SourcePayloadPlan,
): Omit<SourcePayloadPlan, "rows_by_table"> {
  const compact = { ...plan };
  delete (compact as Partial<SourcePayloadPlan>).rows_by_table;
  return compact as Omit<SourcePayloadPlan, "rows_by_table">;
}

export function rowToDbInsert(row: SourcePayloadRow): Record<string, unknown> {
  return {
    ...SOURCE_PAYLOAD_DEFAULTS,
    source_id: row.source_id,
    source_slug: row.source_slug,
    source_prefix: row.source_prefix,
    entity_slug: row.entity_slug,
    entity_type: row.entity_type,
    payload_item_id: row.payload_item_id,
    sort_order: row.sort_order,
    payload: row.payload,
    plain_text: row.plain_text,
    warnings: row.warnings,
  };
}
