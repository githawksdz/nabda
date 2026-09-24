import {
  FLOWCHART_CANVAS,
} from "@/lib/cat-flowchart/flowchart-ui-config";
import { getFlowchartDemoFixtures } from "@/lib/demo-fixtures/load";
import {
  categoryLabel,
  overlayLinkedContentTitles,
  PLACEHOLDER_REFERENCES,
  PLACEHOLDER_TIMELINE,
  type LinkedCatalogs,
} from "@/lib/content-detail/content-detail-mappers";
import {
  DEFAULT_STATUS_LABELS,
  safeSourceNote,
  sanitizeReviewStatus,
} from "@/lib/content-detail/status-labels";
import {
  canRenderClinicalDetails,
  overlaySafeText,
} from "@/lib/content-source/readiness";
import type {
  CatBlockRow,
  CatEdgeRow,
  CatMap as DbCatMap,
  Protocol as DbProtocol,
} from "@/types/content";
import type {
  CatDetail,
  CatMap,
  CatStep,
  LinkedContentItem,
} from "@/types/content-detail";
import type {
  CatFlowchartEdge,
  CatFlowchartMap,
  CatFlowchartNode,
  CatNodeType,
} from "@/types/cat-flowchart";

const NODE_TYPES = new Set<CatNodeType>([
  "start",
  "decision",
  "action",
  "emergency",
  "outcome",
  "cluster",
  "loop",
]);

export function normalizeCatRouteSlug(slug: string): string {
  return slug.endsWith("-cat") ? slug.slice(0, -4) : slug;
}

export function catLookupSlugs(routeSlug: string): string[] {
  const normalized = normalizeCatRouteSlug(routeSlug);
  return [...new Set([routeSlug, normalized, `${normalized}-cat`])];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isRenderableNode(value: unknown): value is CatFlowchartNode {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.id === "string" &&
    typeof value.type === "string" &&
    NODE_TYPES.has(value.type as CatNodeType) &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.x === "number" &&
    typeof value.y === "number" &&
    typeof value.width === "number" &&
    typeof value.height === "number"
  );
}

function isRenderableEdge(value: unknown): value is CatFlowchartEdge {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.id === "string" &&
    typeof value.from === "string" &&
    typeof value.to === "string" &&
    (value.relationship === undefined || typeof value.relationship === "string")
  );
}

export function parseCatFlowchartFromMapJson(
  mapJson: unknown,
  slug: string,
  title: string,
): CatFlowchartMap | null {
  if (!isRecord(mapJson)) {
    return null;
  }

  const rawNodes = Array.isArray(mapJson.nodes)
    ? mapJson.nodes
    : Array.isArray(mapJson.blocks)
      ? mapJson.blocks
      : [];
  const rawEdges = Array.isArray(mapJson.edges) ? mapJson.edges : [];

  if (rawNodes.length === 0) {
    return null;
  }

  if (!rawNodes.every(isRenderableNode) || !rawEdges.every(isRenderableEdge)) {
    return null;
  }

  const canvas = isRecord(mapJson.canvas) ? mapJson.canvas : {};

  return {
    slug,
    title: typeof mapJson.title === "string" ? mapJson.title : title,
    canvas: {
      viewportHeight:
        typeof canvas.viewportHeight === "number"
          ? canvas.viewportHeight
          : FLOWCHART_CANVAS.viewportHeight,
      boardWidth:
        typeof canvas.boardWidth === "number"
          ? canvas.boardWidth
          : FLOWCHART_CANVAS.boardWidth,
      boardHeight:
        typeof canvas.boardHeight === "number"
          ? canvas.boardHeight
          : FLOWCHART_CANVAS.boardHeight,
      minZoom:
        typeof canvas.minZoom === "number" ? canvas.minZoom : FLOWCHART_CANVAS.minZoom,
      maxZoom:
        typeof canvas.maxZoom === "number" ? canvas.maxZoom : FLOWCHART_CANVAS.maxZoom,
      initialZoom:
        typeof canvas.initialZoom === "number"
          ? canvas.initialZoom
          : FLOWCHART_CANVAS.initialZoom,
    },
    nodes: rawNodes,
    edges: rawEdges.map((edge) => ({
      ...edge,
      relationship: edge.relationship ?? "visual_flow",
    })),
  };
}

export function resolveCatFlowchart(
  routeSlug: string,
  mapJson: unknown,
  title: string,
  graph?: { blocks: CatBlockRow[]; edges: CatEdgeRow[] },
): CatFlowchartMap | null {
  // DB graph/map_json must be passed only when canRenderClinicalDetails is true.
  const fromBlocks = flowchartFromCatBlocks(
    routeSlug,
    title,
    graph?.blocks ?? [],
    graph?.edges ?? [],
  );
  if (fromBlocks) {
    return fromBlocks;
  }
  const fromDb = parseCatFlowchartFromMapJson(mapJson, routeSlug, title);
  if (fromDb && fromDb.nodes.length > 0) {
    return fromDb;
  }
  return (
    getFlowchartDemoFixtures()?.getMockFlowchartForSlug(
      normalizeCatRouteSlug(routeSlug),
    ) ?? null
  );
}

function toNumber(value: number | string | null | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapBlockType(blockType: string): CatNodeType {
  if (blockType === "title") {
    return "start";
  }
  if (blockType === "clinical_gate") {
    return "decision";
  }
  if (blockType === "red_flag" || blockType === "urgent_action") {
    return "emergency";
  }
  if (
    blockType === "usual_scenario" ||
    blockType === "context" ||
    blockType === "clinical_note"
  ) {
    return "outcome";
  }
  if (
    blockType === "reference" ||
    blockType === "table_reference" ||
    blockType === "calculator_reference" ||
    blockType === "drug_reference" ||
    blockType === "level_marker" ||
    blockType === "image" ||
    blockType === "unknown"
  ) {
    return "cluster";
  }
  return "action";
}

function mapEdgeRelationship(
  relationship: string,
): CatFlowchartEdge["relationship"] {
  if (
    relationship === "branch" ||
    relationship === "convergence" ||
    relationship === "loop" ||
    relationship === "reference_link"
  ) {
    return relationship;
  }
  return "visual_flow";
}

function edgePath(path: CatEdgeRow["path"]): string | undefined {
  if (typeof path === "string" && path.trim()) {
    return path;
  }
  if (isRecord(path) && typeof path.d === "string") {
    return path.d;
  }
  return undefined;
}

export function flowchartFromCatBlocks(
  routeSlug: string,
  title: string,
  blocks: CatBlockRow[],
  edges: CatEdgeRow[],
): CatFlowchartMap | null {
  if (blocks.length === 0) {
    return null;
  }

  const detailHref = `/cat/${normalizeCatRouteSlug(routeSlug)}?tab=etapes`;
  const nodes: CatFlowchartNode[] = [...blocks]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((block) => ({
      id: block.block_key || block.id,
      type: mapBlockType(block.block_type),
      title: block.title || "Étape",
      description:
        block.text ||
        "Bloc éditorial placeholder. Carte de référence, pas un diagnostic.",
      x: toNumber(block.x, 0),
      y: toNumber(block.y, 0),
      width: toNumber(block.width, 220),
      height: toNumber(block.height, 90),
      detailHref,
      chips: block.flags,
    }));

  const nodeIds = new Set(nodes.map((node) => node.id));
  const idByUuid = new Map(
    blocks.map((block) => [block.id, block.block_key || block.id]),
  );

  const mappedEdges: CatFlowchartEdge[] = [...edges]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .flatMap((edge) => {
      const from = idByUuid.get(edge.from_block_id);
      const to = idByUuid.get(edge.to_block_id);
      if (!from || !to || !nodeIds.has(from) || !nodeIds.has(to)) {
        return [];
      }
      return [
        {
          id: edge.id,
          from,
          to,
          label: edge.label ?? undefined,
          relationship: mapEdgeRelationship(edge.relationship),
          variant:
            edge.relationship === "uncertain" ||
            edge.confidence === "editorial_uncertain"
              ? "muted"
              : edge.relationship === "loop"
                ? "dashed"
                : "default",
          path: edgePath(edge.path),
        },
      ];
    });

  return {
    slug: normalizeCatRouteSlug(routeSlug),
    title,
    canvas: { ...FLOWCHART_CANVAS },
    nodes,
    edges: mappedEdges,
  };
}

function preparationStep(id: string): CatStep {
  return {
    id: `${id}-step-prep`,
    order: 1,
    title: "Structure en préparation",
    description:
      "Les étapes décisionnelles seront ajoutées après relecture. Adapter selon le protocole local.",
    chips: ["Éditorial"],
  };
}

export function deriveLinkedContentForCat(input: {
  catId: string;
  fallbackTools?: LinkedContentItem[];
  fallbackProtocols?: LinkedContentItem[];
  catalogs: LinkedCatalogs;
  protocol?: DbProtocol | null;
}): { tools: LinkedContentItem[]; protocols: LinkedContentItem[] } {
  if (input.fallbackTools && input.fallbackTools.length > 0) {
    return {
      tools: overlayLinkedContentTitles(input.fallbackTools, input.catalogs),
      protocols: overlayLinkedContentTitles(
        input.fallbackProtocols ?? [],
        input.catalogs,
      ),
    };
  }

  // TODO: replace with protocol_links / cat_links once the schema exposes them.
  const tools: LinkedContentItem[] = [];
  const protocols: LinkedContentItem[] = [];

  if (input.protocol) {
    const protocolItem: LinkedContentItem = {
      id: `${input.catId}-protocol`,
      type: "protocol",
      title: input.protocol.short_title || input.protocol.title,
      subtitle: "Recommandation liée · fiche en préparation",
      href: `/protocols/${input.protocol.slug}`,
    };
    tools.push(protocolItem);
    protocols.push(protocolItem);
  }

  for (const slug of ["wells-ep", "glasgow"] as const) {
    const calculator = input.catalogs.calculators.find((item) => item.slug === slug);
    if (!calculator) {
      continue;
    }
    tools.push({
      id: `${input.catId}-calc-${slug}`,
      type: "calculator",
      title: calculator.short_title || calculator.title,
      subtitle: "Outil d'aide · fiche en préparation",
      href: `/calculators/${calculator.slug}`,
    });
  }

  return { tools, protocols };
}

export function overlayCatIdentity(
  mock: CatMap,
  row: DbCatMap,
  protocol: DbProtocol | null,
  canonicalSlug: string,
): CatMap {
  return {
    ...mock,
    id: row.id,
    protocol_id: row.protocol_id,
    slug: canonicalSlug,
    title: row.title,
    short_title: mock.short_title ?? row.title,
    summary:
      overlaySafeText(
        row.summary,
        mock.summary,
        row.review_status,
        row.status,
      ) ?? mock.summary,
    status: row.status,
    review_status: sanitizeReviewStatus(row.review_status, row.status),
    visibility: row.visibility,
    source_note: safeSourceNote(row.source_note, mock.source_note ?? DEFAULT_STATUS_LABELS.sources),
    map_json: row.map_json,
    is_featured: row.is_featured,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    categories: protocol?.category_slug
      ? [...new Set([categoryLabel(protocol.category_slug), ...mock.categories])]
      : mock.categories,
  };
}

export function catDetailFromDbRow(
  row: DbCatMap,
  protocol: DbProtocol | null,
  mock: CatDetail | undefined,
  canonicalSlug: string,
  linked: { tools: LinkedContentItem[]; protocols: LinkedContentItem[] },
  graph?: { blocks: CatBlockRow[]; edges: CatEdgeRow[] },
): CatDetail {
  const allowDbGraph = canRenderClinicalDetails(row.review_status, row.status);
  const flowchart = resolveCatFlowchart(
    canonicalSlug,
    allowDbGraph ? row.map_json : null,
    row.title,
    allowDbGraph ? graph : undefined,
  );

  if (mock) {
    return {
      ...mock,
      map: overlayCatIdentity(mock.map, row, protocol, canonicalSlug),
      linked_tools: linked.tools.length > 0 ? linked.tools : mock.linked_tools,
      linked_protocols:
        linked.protocols.length > 0 ? linked.protocols : mock.linked_protocols,
      flowchart,
    };
  }

  return {
    map: {
      id: row.id,
      protocol_id: row.protocol_id,
      slug: canonicalSlug,
      title: row.title,
      subtitle: "Carte clinique — structure en préparation",
      short_title: row.title,
      summary: overlaySafeText(
        row.summary,
        undefined,
        row.review_status,
        row.status,
      ),
      status: row.status,
      review_status: sanitizeReviewStatus(row.review_status, row.status),
      visibility: row.visibility,
      local_adaptation_status: "to_verify",
      rendering_mode: "static_clinical_map",
      safety_note:
        "Carte de référence. Pas un moteur de diagnostic. Orienter selon le contexte clinique et le protocole local.",
      categories: protocol?.category_slug
        ? [categoryLabel(protocol.category_slug)]
        : ["Urgences"],
      tags: [],
      blocks: [],
      edges: [],
      map_json: row.map_json,
      is_featured: row.is_featured,
      published_at: row.published_at,
      source_note: safeSourceNote(row.source_note),
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    steps: [preparationStep(row.id)],
    red_flags: [],
    linked_tools: linked.tools,
    linked_protocols: linked.protocols,
    references: PLACEHOLDER_REFERENCES.map((item, index) => ({
      ...item,
      id: `${row.id}-ref-${index + 1}`,
    })),
    timeline: PLACEHOLDER_TIMELINE.map((item, index) => ({
      ...item,
      id: `${row.id}-tl-${index + 1}`,
    })),
    flowchart,
  };
}

export function attachMockFlowchart(detail: CatDetail): CatDetail {
  if (detail.flowchart && detail.flowchart.nodes.length > 0) {
    return detail;
  }
  return {
    ...detail,
    flowchart:
      getFlowchartDemoFixtures()?.getMockFlowchartForSlug(
        normalizeCatRouteSlug(detail.map.slug),
      ) ?? undefined,
  };
}
