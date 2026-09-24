// Demo-mode fixture only. Do not import from production runtime providers.

import type {
  CatFlowchartAnchor,
  CatFlowchartEdge,
  CatFlowchartMap,
  CatFlowchartNode,
} from "@/types/cat-flowchart";

// Demo placeholder only — replace with validated source data before production.
// Approved design mock for /cat/douleur-thoracique. Not a clinical decision tree.

const DETAIL_HREF = "/cat/douleur-thoracique?tab=etapes";

export const FLOWCHART_CANVAS = {
  viewportHeight: 500,
  boardWidth: 900,
  boardHeight: 760,
  minZoom: 0.45,
  maxZoom: 1.8,
  initialZoom: 0.78,
} as const;

function node(
  partial: Omit<CatFlowchartNode, "detailHref"> & { detailHref?: string },
): CatFlowchartNode {
  return {
    detailHref: DETAIL_HREF,
    ...partial,
  };
}

const nodes: CatFlowchartNode[] = [
  node({
    id: "start",
    type: "start",
    title: "Douleur thoracique aiguë",
    subtitle: "Entrée CAT",
    description:
      "Point d'entrée de la carte. Référence visuelle, pas un diagnostic automatique.",
    x: 36,
    y: 28,
    width: 228,
    height: 48,
  }),
  node({
    id: "instability",
    type: "decision",
    title: "Instabilité vitale ?",
    description:
      "Repérer une instabilité. Orientation urgente selon le protocole local.",
    x: 48,
    y: 118,
    width: 204,
    height: 68,
  }),
  node({
    id: "shock",
    type: "emergency",
    title: "Déchocage immédiat",
    chips: ["Monitorage", "O₂", "Appel senior"],
    description:
      "Filière urgente selon l'organisation locale. À confirmer selon le contexte clinique.",
    x: 28,
    y: 260,
    width: 232,
    height: 86,
  }),
  node({
    id: "ecg",
    type: "action",
    title: "ECG < 10 min",
    description:
      "Examen initial à confirmer selon le contexte clinique et le protocole local.",
    x: 340,
    y: 118,
    width: 176,
    height: 56,
    toolHref: "/protocols/guide-ecg",
    toolLabel: "Ouvrir guide ECG",
  }),
  node({
    id: "st",
    type: "decision",
    title: "ST+ ou équivalent ?",
    description:
      "Lecture ECG selon expertise locale. Aucune décision automatique.",
    x: 328,
    y: 230,
    width: 200,
    height: 68,
  }),
  node({
    id: "reperfusion",
    type: "emergency",
    title: "Filière reperfusion",
    description:
      "Orientation de filière selon protocole local et avis spécialisé.",
    x: 292,
    y: 368,
    width: 208,
    height: 72,
  }),
  node({
    id: "tropo",
    type: "action",
    title: "Troponine H0/H1",
    description:
      "Cinétique selon le protocole local. Aucune posologie indiquée ici.",
    x: 600,
    y: 230,
    width: 180,
    height: 56,
    toolHref: "/calculators/troponine-hs",
    toolLabel: "Ouvrir cinétique hs-cTn",
  }),
  node({
    id: "avis",
    type: "action",
    title: "Avis cardio / surveillance",
    description:
      "Avis spécialisé selon signes de gravité et organisation du site.",
    x: 588,
    y: 360,
    width: 204,
    height: 64,
    toolHref: "/calculators/heart",
    toolLabel: "Ouvrir score HEART",
  }),
  node({
    id: "risque",
    type: "decision",
    title: "Risque clinique ?",
    description:
      "Stratification clinique à croiser avec les scores liés et le protocole local.",
    x: 588,
    y: 484,
    width: 204,
    height: 68,
    toolHref: "/calculators/heart",
    toolLabel: "Ouvrir score HEART",
  }),
  node({
    id: "surv",
    type: "action",
    title: "Surveillance + imagerie selon contexte",
    description:
      "Surveillance et imagerie selon le contexte. Détail à confirmer localement.",
    x: 320,
    y: 628,
    width: 236,
    height: 64,
  }),
  node({
    id: "sortie",
    type: "outcome",
    title: "Sortie sécurisée + consignes",
    description:
      "Sortie seulement selon protocole local et consignes de surveillance.",
    x: 680,
    y: 636,
    width: 196,
    height: 56,
  }),
  node({
    id: "cluster",
    type: "cluster",
    title: "Diagnostics à ne pas manquer",
    description:
      "Diagnostics différentiels à garder en tête. Référence visuelle, pas une liste exhaustive.",
    x: 620,
    y: 20,
    width: 252,
    height: 176,
  }),
  node({
    id: "dd-ep",
    type: "action",
    title: "EP",
    description:
      "À évoquer selon le contexte. Score de Wells lié, à confirmer localement.",
    x: 640,
    y: 68,
    width: 100,
    height: 32,
    toolHref: "/calculators/wells-ep",
    toolLabel: "Ouvrir score Wells",
  }),
  node({
    id: "dd-dissection",
    type: "action",
    title: "Dissection",
    description:
      "À évoquer selon le contexte clinique. Avis spécialisé selon signes de gravité.",
    x: 752,
    y: 68,
    width: 100,
    height: 32,
  }),
  node({
    id: "dd-pericardite",
    type: "action",
    title: "Péricardite",
    description:
      "À évoquer selon le contexte. Référence visuelle, structure en préparation.",
    x: 640,
    y: 112,
    width: 100,
    height: 32,
  }),
  node({
    id: "dd-pno",
    type: "action",
    title: "Pneumothorax",
    description:
      "À évoquer selon le contexte clinique et l'examen local.",
    x: 752,
    y: 112,
    width: 100,
    height: 32,
  }),
];

const edges: CatFlowchartEdge[] = [
  {
    id: "e-start-instability",
    from: "start",
    to: "instability",
    relationship: "visual_flow",
  },
  {
    id: "e-instability-shock",
    from: "instability",
    to: "shock",
    label: "Oui",
    relationship: "branch",
    variant: "emergency",
  },
  {
    id: "e-instability-ecg",
    from: "instability",
    to: "ecg",
    label: "Non",
    relationship: "branch",
    fromAnchor: "right",
    toAnchor: "left",
  },
  {
    id: "e-shock-ecg",
    from: "shock",
    to: "ecg",
    label: "Puis ECG",
    relationship: "loop",
    variant: "dashed",
    fromAnchor: "right",
    toAnchor: "bottom",
  },
  {
    id: "e-ecg-st",
    from: "ecg",
    to: "st",
    relationship: "visual_flow",
  },
  {
    id: "e-st-reperfusion",
    from: "st",
    to: "reperfusion",
    label: "ST+",
    relationship: "branch",
    variant: "emergency",
  },
  {
    id: "e-st-tropo",
    from: "st",
    to: "tropo",
    label: "Non ST+",
    relationship: "branch",
    fromAnchor: "right",
    toAnchor: "left",
  },
  {
    id: "e-tropo-avis",
    from: "tropo",
    to: "avis",
    relationship: "visual_flow",
  },
  {
    id: "e-avis-risque",
    from: "avis",
    to: "risque",
    relationship: "visual_flow",
  },
  {
    id: "e-risque-surv",
    from: "risque",
    to: "surv",
    label: "Oui",
    relationship: "branch",
    fromAnchor: "left",
    toAnchor: "top",
  },
  {
    id: "e-risque-sortie",
    from: "risque",
    to: "sortie",
    label: "Non",
    relationship: "branch",
  },
  {
    id: "e-surv-tropo",
    from: "surv",
    to: "tropo",
    label: "Rééval.",
    relationship: "loop",
    variant: "dashed",
    fromAnchor: "right",
    toAnchor: "bottom",
  },
  {
    id: "e-cluster-ecg",
    from: "cluster",
    to: "ecg",
    label: "DD",
    relationship: "reference_link",
    variant: "muted",
    fromAnchor: "left",
    toAnchor: "right",
  },
];

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
  const c1y = a.y + (fromAnchor === "bottom" || fromAnchor === "top" ? dy * 0.45 : dy * 0.15);
  const c2x = b.x - dx * 0.05;
  const c2y = b.y - (toAnchor === "top" || toAnchor === "bottom" ? dy * 0.45 : dy * 0.15);
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

export const MOCK_FLOWCHART_SLUG = "douleur-thoracique";

export function getThoraxFlowchart(): CatFlowchartMap {
  const byId = new Map(nodes.map((item) => [item.id, item]));
  return {
    slug: "douleur-thoracique",
    title: "Douleur thoracique aiguë",
    canvas: { ...FLOWCHART_CANVAS },
    nodes,
    edges: edges.map((edge) => {
      const from = byId.get(edge.from);
      const to = byId.get(edge.to);
      if (!from || !to) {
        return edge;
      }
      return {
        ...edge,
        path: buildEdgePath(from, to, edge.fromAnchor, edge.toAnchor),
      };
    }),
  };
}

export function getMockFlowchartForSlug(slug: string): CatFlowchartMap | null {
  if (slug === MOCK_FLOWCHART_SLUG || slug === `${MOCK_FLOWCHART_SLUG}-cat`) {
    return getThoraxFlowchart();
  }
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
