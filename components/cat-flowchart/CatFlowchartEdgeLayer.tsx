import { getEdgeLabelPoint } from "@/lib/cat-flowchart/flowchart-ui-config";
import type { CatFlowchartEdge, CatFlowchartMap } from "@/types/cat-flowchart";

type CatFlowchartEdgeLayerProps = {
  map: CatFlowchartMap;
};

function strokeForEdge(edge: CatFlowchartEdge): string {
  if (edge.variant === "emergency") {
    return "#ba1a1a";
  }
  if (edge.variant === "muted") {
    return "#c8c5cb";
  }
  return "#77767b";
}

export function CatFlowchartEdgeLayer({ map }: CatFlowchartEdgeLayerProps) {
  const byId = new Map(map.nodes.map((node) => [node.id, node]));

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
      width={map.canvas.boardWidth}
      height={map.canvas.boardHeight}
    >
      <defs>
        <marker
          id="cat-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#77767b" />
        </marker>
        <marker
          id="cat-arrow-emergency"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ba1a1a" />
        </marker>
        <marker
          id="cat-arrow-muted"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#c8c5cb" />
        </marker>
      </defs>
      {map.edges.map((edge) => {
        const from = byId.get(edge.from);
        const to = byId.get(edge.to);
        if (!from || !to || !edge.path) {
          return null;
        }
        const emergency = edge.variant === "emergency";
        const muted = edge.variant === "muted";
        const dashed = edge.variant === "dashed";
        const label = getEdgeLabelPoint(from, to, edge.fromAnchor, edge.toAnchor);
        return (
          <g key={edge.id}>
            <path
              d={edge.path}
              fill="none"
              stroke={strokeForEdge(edge)}
              strokeWidth={emergency ? 2 : 1.5}
              strokeOpacity={muted ? 0.85 : 0.95}
              strokeDasharray={dashed ? "6 5" : undefined}
              markerEnd={
                emergency
                  ? "url(#cat-arrow-emergency)"
                  : muted
                    ? "url(#cat-arrow-muted)"
                    : "url(#cat-arrow)"
              }
            />
            {edge.label ? (
              <g transform={`translate(${label.x}, ${label.y})`}>
                <rect
                  x={-22}
                  y={-9}
                  width={44}
                  height={16}
                  rx={8}
                  className="fill-surface-container-lowest"
                  stroke={emergency ? "#ba1a1a" : "#c8c5cb"}
                  strokeWidth={0.75}
                />
                <text
                  textAnchor="middle"
                  y={3}
                  fill="#1c1b1d"
                  style={{ fontSize: 9, fontWeight: 500 }}
                >
                  {edge.label}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
