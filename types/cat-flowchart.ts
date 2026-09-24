export type CatNodeType =
  | "start"
  | "decision"
  | "action"
  | "emergency"
  | "outcome"
  | "cluster"
  | "loop";

export type CatFlowchartEdgeVariant = "default" | "emergency" | "muted" | "dashed";

export type CatFlowchartRelationship =
  | "branch"
  | "visual_flow"
  | "convergence"
  | "loop"
  | "reference_link";

export type CatFlowchartAnchor = "top" | "right" | "bottom" | "left" | "center";

export type CatFlowchartCanvasConfig = {
  viewportHeight: number;
  boardWidth: number;
  boardHeight: number;
  minZoom: number;
  maxZoom: number;
  initialZoom: number;
};

export type CatFlowchartNode = {
  id: string;
  type: CatNodeType;
  title: string;
  subtitle?: string;
  chips?: string[];
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  detailHref: string;
  toolHref?: string;
  toolLabel?: string;
};

export type CatFlowchartEdge = {
  id: string;
  from: string;
  to: string;
  label?: string;
  relationship: CatFlowchartRelationship;
  variant?: CatFlowchartEdgeVariant;
  fromAnchor?: CatFlowchartAnchor;
  toAnchor?: CatFlowchartAnchor;
  path?: string;
};

export type CatFlowchartMap = {
  slug: string;
  title: string;
  canvas: CatFlowchartCanvasConfig;
  nodes: CatFlowchartNode[];
  edges: CatFlowchartEdge[];
};

export type CatFlowchartTransform = {
  scale: number;
  positionX: number;
  positionY: number;
};
