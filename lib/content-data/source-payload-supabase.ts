/**
 * Server-only Supabase source-payload loaders.
 * Uses the user/anon RLS client — never the service role on a request path.
 */

import {
  collectCatLinkedTools,
  collectCatPreviewStats,
  flowchartFilename,
  mapFlowchartImages,
} from "@/lib/content-rendering/cat";
import { collectPreviewStats } from "@/lib/content-rendering/protocol";
import {
  collectDrugPreviewStats,
  fallbackSectionFromPreview,
  humanizeDrugSlug,
  rebuildTabGroups,
  resolveDrugPreviewSlug,
} from "@/lib/content-rendering/drug";
import { resolveCalculatorPreviewSlug } from "@/lib/content-rendering/calculator";
import { isSafeMediaFilename } from "@/lib/content-data/source-media-paths";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createRlsClient } from "@/lib/supabase/rls-client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { viewerCanReadSlug, type ParentContentType } from "@/lib/authz/access";
import { SOURCE_PAYLOAD_SELECT } from "@/lib/authz/selects";
import { ENTITY_LINKS_TABLE } from "@/lib/nabda-db/source-payload-alignment";
import {
  SOURCE_PAYLOAD_BUNDLE_ITEM_ID,
  SOURCE_PAYLOAD_IMPORTED_FROM,
  SOURCE_PAYLOAD_TABLES,
} from "@/lib/nabda-db/source-payload-constants";
import type { NabdaProtocolSection } from "@/types/nabda-protocol-sections";
import type { NabdaCatStep } from "@/types/nabda-cat-steps";
import type { NabdaDrugSection } from "@/types/nabda-drug-sections";
import type { NabdaDrugTableCandidate } from "@/types/nabda-drug-tables";
import type { ProtocolRenderSource } from "@/types/content-rendering-protocol";
import type { CatRenderSource } from "@/types/content-rendering-cat";
import type { DrugRenderSource, DrugRenderTable } from "@/types/content-rendering-drug";
import type { CalculatorRenderSource } from "@/types/content-rendering-calculator";
import type { ContentLinkMode } from "@/types/content-rendering-core";

type PayloadDbRow = {
  source_id: string;
  payload_item_id: string;
  entity_type: string;
  sort_order: number;
  payload: Record<string, unknown>;
  warnings: string[];
};

/** Filename allowlist only — disk existence is checked by /content-media/* routes. */
function catMediaFilenameOk(filename: string): boolean {
  return isSafeMediaFilename(filename);
}

export function canLoadSupabaseSourcePayloads(): boolean {
  return isSupabaseConfigured();
}

async function getClient() {
  if (!canLoadSupabaseSourcePayloads()) {
    return null;
  }
  return createRlsClient();
}

async function fetchEntityRows(
  table: string,
  entitySlug: string,
): Promise<PayloadDbRow[]> {
  const supabase = await getClient();
  if (!supabase) {
    return [];
  }
  const client = supabase as unknown as SupabaseClient;
  const { data, error } = await client
    .from(table)
    .select(SOURCE_PAYLOAD_SELECT)
    .eq("entity_slug", entitySlug)
    .eq("imported_from", SOURCE_PAYLOAD_IMPORTED_FROM)
    .order("sort_order", { ascending: true });
  if (error || !data?.length) {
    return [];
  }
  return data as PayloadDbRow[];
}

async function authorizeParent(type: ParentContentType, slug: string): Promise<boolean> {
  return viewerCanReadSlug(type, slug);
}

export async function loadProtocolRenderSourceFromSupabase(
  slug: string,
): Promise<ProtocolRenderSource | null> {
  if (!(await authorizeParent("protocol", slug))) {
    return null;
  }
  const rows = await fetchEntityRows(SOURCE_PAYLOAD_TABLES.protocolSections, slug);
  if (!rows.length) {
    return null;
  }
  const bundle = rows.find((row) => row.payload_item_id === SOURCE_PAYLOAD_BUNDLE_ITEM_ID);
  const sections = rows
    .filter((row) => row.entity_type === "protocol_section")
    .map((row) => row.payload as NabdaProtocolSection);
  if (!sections.length) {
    return null;
  }
  const bundlePayload = bundle?.payload ?? {};
  const protocolWarnings = Array.isArray(bundlePayload.warnings)
    ? (bundlePayload.warnings as string[])
    : [];
  const stats = collectPreviewStats(sections);
  return {
    slug,
    title: String(bundlePayload.protocolTitle ?? slug),
    sourceId: sections[0]?.protocolSourceId ?? "",
    bodyChars: Number(bundlePayload.bodyChars ?? 0),
    protocolWarnings,
    sections,
    tabGroups: (bundlePayload.tabGroups as ProtocolRenderSource["tabGroups"]) ?? {
      Aperçu: [],
      Diagnostic: [],
      "Prise en charge": [],
      Traitements: [],
      Médicaments: [],
      Sources: [],
    },
    shiftGroups: (bundlePayload.shiftGroups as ProtocolRenderSource["shiftGroups"]) ?? {
      Gravité: [],
      "Premières étapes": [],
      Traitements: [],
      "Outils liés": [],
      Sources: [],
    },
    warningItems: [],
    stats,
  };
}

export async function loadCatRenderSourceFromSupabase(
  slug: string,
  keepInternalQuery = false,
  linkMode: ContentLinkMode = "public",
): Promise<CatRenderSource | null> {
  if (!(await authorizeParent("cat", slug))) {
    return null;
  }
  const rows = await fetchEntityRows(SOURCE_PAYLOAD_TABLES.catSteps, slug);
  if (!rows.length) {
    return null;
  }
  const bundle = rows.find((row) => row.payload_item_id === SOURCE_PAYLOAD_BUNDLE_ITEM_ID);
  const steps = rows
    .filter((row) => row.entity_type === "cat_step")
    .map((row) => row.payload as NabdaCatStep);
  if (!steps.length && !bundle) {
    return null;
  }
  const bundlePayload = bundle?.payload ?? {};
  const flowchartImages = Array.isArray(bundlePayload.flowchartImages)
    ? (bundlePayload.flowchartImages as string[])
    : [];
  const mediaFiles = new Set(
    flowchartImages
      .map((sourcePath) => flowchartFilename(sourcePath))
      .filter((filename) => catMediaFilenameOk(filename)),
  );
  const images = mapFlowchartImages(flowchartImages, mediaFiles, keepInternalQuery, linkMode, slug);
  const extraWarnings = Array.isArray(bundlePayload.warnings)
    ? [...(bundlePayload.warnings as string[])]
    : [];
  if (images.some((image) => !image.available)) {
    extraWarnings.push("static_png_missing");
  }
  const hasStaticFlowchartImage = Boolean(bundlePayload.hasStaticFlowchartImage);
  const hasExtractedLinearSteps = Boolean(bundlePayload.hasExtractedLinearSteps ?? steps.length > 0);
  if (hasStaticFlowchartImage && images.length === 0) {
    extraWarnings.push("static_png_missing");
  }

  return {
    slug,
    title: String(bundlePayload.protocolTitle ?? slug),
    sourceId: steps[0]?.protocolSourceId ?? "",
    extractionMode: (bundlePayload.extractionMode as CatRenderSource["extractionMode"]) ?? "none",
    hasStaticFlowchartImage,
    hasExtractedLinearSteps,
    hasInteractiveGraph: false,
    imagemapStripped: Boolean(bundlePayload.imagemapStripped),
    protocolWarnings: [...new Set(extraWarnings)],
    steps,
    images,
    warningItems: [],
    linkedTools: collectCatLinkedTools(steps, keepInternalQuery, linkMode),
    stats: collectCatPreviewStats(
      steps,
      images,
      Boolean(bundlePayload.imagemapStripped),
      [],
    ),
  };
}

async function resolveDrugPayloadEntitySlug(slug: string): Promise<string | null> {
  const resolved = resolveDrugPreviewSlug(slug);
  const directRows = await fetchEntityRows(SOURCE_PAYLOAD_TABLES.drugSections, resolved);
  if (directRows.some((row) => row.entity_type === "drug_section")) {
    return resolved;
  }

  const supabase = await getClient();
  if (!supabase) {
    return null;
  }

  const client = supabase as unknown as SupabaseClient;
  const { data, error } = await client
    .from(ENTITY_LINKS_TABLE)
    .select("payload_entity_slug")
    .eq("identity_table", "drugs")
    .eq("identity_slug", resolved)
    .eq("payload_table", SOURCE_PAYLOAD_TABLES.drugSections)
    .eq("relationship", "primary_monograph")
    .eq("imported_from", SOURCE_PAYLOAD_IMPORTED_FROM)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  const payloadEntitySlug = (data as { payload_entity_slug?: string }).payload_entity_slug;
  if (!payloadEntitySlug) {
    return null;
  }
  return String(payloadEntitySlug);
}

export async function loadDrugRenderSourceFromSupabase(
  slug: string,
): Promise<DrugRenderSource | null> {
  const resolved = resolveDrugPreviewSlug(slug);
  if (!(await authorizeParent("drug", resolved))) {
    return null;
  }
  const payloadEntitySlug = await resolveDrugPayloadEntitySlug(resolved);
  if (!payloadEntitySlug) {
    return null;
  }

  const [sectionRows, tableRows] = await Promise.all([
    fetchEntityRows(SOURCE_PAYLOAD_TABLES.drugSections, payloadEntitySlug),
    fetchEntityRows(SOURCE_PAYLOAD_TABLES.drugTables, payloadEntitySlug),
  ]);
  if (!sectionRows.length) {
    return null;
  }
  const bundle = sectionRows.find((row) => row.payload_item_id === SOURCE_PAYLOAD_BUNDLE_ITEM_ID);
  const sectionPayloads = sectionRows
    .filter((row) => row.entity_type === "drug_section")
    .map((row) => row.payload as NabdaDrugSection);
  if (!sectionPayloads.length) {
    return null;
  }
  const bundlePayload = bundle?.payload ?? {};
  const sourceId =
    String(bundlePayload.drugSourceId ?? sectionRows.find((row) => row.source_id)?.source_id ?? "");

  const sections = sectionPayloads.map((section) =>
    fallbackSectionFromPreview(section, sourceId, payloadEntitySlug),
  );
  const tables: DrugRenderTable[] = tableRows.map((row) => {
    const table = row.payload as NabdaDrugTableCandidate;
    return {
      ...table,
      headers: table.headerTexts,
      rows: table.cellPreview.slice(table.headerTexts.length ? 1 : 0),
      truncated: table.rowCount > (table.cellPreview.length || 0),
    };
  });

  const protocolWarnings = [
    ...(Array.isArray(bundlePayload.warnings) ? (bundlePayload.warnings as string[]) : []),
    "preview_json_html_omitted",
  ];

  return {
    slug: resolved,
    title: humanizeDrugSlug(payloadEntitySlug),
    sourceId,
    localeStatus: (bundlePayload.localeStatus as string | null) ?? null,
    htmlOmitted: Boolean(bundlePayload.htmlOmitted ?? true),
    missingFullHtml: true,
    protocolWarnings: [...new Set(protocolWarnings)],
    missingExpectedKeys: (bundlePayload.missingExpectedKeys as string[]) ?? [],
    skippedJunkKeys: (bundlePayload.skippedJunkKeys as string[]) ?? [],
    sections,
    tables,
    tabGroups: rebuildTabGroups(sections),
    warningItems: [],
    stats: collectDrugPreviewStats(
      sections,
      tables,
      (bundlePayload.missingExpectedKeys as string[]) ?? [],
      true,
    ),
  };
}

export async function loadCalculatorRenderSourceFromSupabase(
  slug: string,
): Promise<CalculatorRenderSource | null> {
  const resolved = resolveCalculatorPreviewSlug(slug);
  if (
    !(await authorizeParent("calculator", resolved)) &&
    !(await authorizeParent("calculator", slug))
  ) {
    return null;
  }
  const rows = await fetchEntityRows(SOURCE_PAYLOAD_TABLES.calculatorProfiles, resolved);
  if (!rows.length) {
    const altRows = await fetchEntityRows(SOURCE_PAYLOAD_TABLES.calculatorProfiles, slug);
    if (!altRows.length) {
      return null;
    }
    rows.push(...altRows);
  }
  const row = rows[0];
  const snapshot = row.payload.renderSnapshot as CalculatorRenderSource | null | undefined;
  if (!snapshot) {
    return null;
  }
  return snapshot;
}
