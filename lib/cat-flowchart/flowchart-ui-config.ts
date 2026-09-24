import type {
  CatFlowchartAnchor,
  CatFlowchartMap,
  CatFlowchartNode,
} from "@/types/cat-flowchart";

// Flowchart canvas geometry helpers for production UI.
// Demo thorax map lives in lib/demo-fixtures/flowchart.ts.

export const FLOWCHART_CANVAS = {
  viewportHeight: 500,
  boardWidth: 900,
  boardHeight: 760,
  minZoom: 0.45,
  maxZoom: 1.8,
  initialZoom: 0.78,
} as const;

export function getNodeAnchor(
  item: CatFlowchartNode,
  side: CatFlowchartAnchor = "bottom",
): { x: number; y: number } {
  const cx = item.x + item.width / 2;
  const cy = item.y + item.height / 2;
  if (side === "top") {
    return { x: cx, y: item.y };
  }
  if (side === "right") {
    return { x: item.x + item.width, y: cy };
  }
  if (side === "left") {
    return { x: item.x, y: cy };
  }
  if (side === "center") {
    return { x: cx, y: cy };
  }
  return { x: cx, y: item.y + item.height };
}

export function buildEdgePath(
  from: CatFlowchartNode,
  to: CatFlowchartNode,
  fromAnchor: CatFlowchartAnchor = "bottom",
  toAnchor: CatFlowchartAnchor = "top",
): string {
  const a = getNodeAnchor(from, fromAnchor);
  const b = getNodeAnchor(to, toAnchor);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const c1x = a.x + dx * 0.05;
  const c1y =
    a.y +
    (fromAnchor === "bottom" || fromAnchor === "top" ? dy * 0.45 : dy * 0.15);
  const c2x = b.x - dx * 0.05;
  const c2y =
    b.y -
    (toAnchor === "top" || toAnchor === "bottom" ? dy * 0.45 : dy * 0.15);
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

export function getEdgeLabelPoint(
  from: CatFlowchartNode,
  to: CatFlowchartNode,
  fromAnchor: CatFlowchartAnchor = "bottom",
  toAnchor: CatFlowchartAnchor = "top",
): { x: number; y: number } {
  const a = getNodeAnchor(from, fromAnchor);
  const b = getNodeAnchor(to, toAnchor);
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2 - 8,
  };
}

/** Demo maps: use getFlowchartDemoFixtures() from lib/demo-fixtures/load. */
export function getMockFlowchartForSlug(_slug?: string): null {
  void _slug;
  return null;
}

export function getThoraxFlowchart(): null {
  return null;
}

export function findFlowchartNode(
  map: CatFlowchartMap,
  id: string | null,
): CatFlowchartNode | undefined {
  if (!id) {
    return undefined;
  }
  return map.nodes.find((item) => item.id === id);
}
