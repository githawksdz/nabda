"use client";

import { useControls } from "react-zoom-pan-pinch";
import { CatFlowchartEdgeLayer } from "./CatFlowchartEdgeLayer";
import { CatFlowchartNodeView } from "./CatFlowchartNode";
import type { CatFlowchartMap } from "@/types/cat-flowchart";

type CatFlowchartBoardProps = {
  map: CatFlowchartMap;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClear: () => void;
};

export function CatFlowchartBoard({
  map,
  selectedId,
  onSelect,
  onClear,
}: CatFlowchartBoardProps) {
  const { zoomToElement } = useControls();

  return (
    <div
      role="presentation"
      onClick={onClear}
      className="relative"
      style={{
        width: map.canvas.boardWidth,
        height: map.canvas.boardHeight,
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        backgroundColor: "#ffffff",
      }}
    >
      <CatFlowchartEdgeLayer map={map} />
      {map.nodes.map((node) => (
        <CatFlowchartNodeView
          key={node.id}
          node={node}
          selected={selectedId === node.id}
          onSelect={onSelect}
          onFocus={(id) => {
            void zoomToElement(id, { maxScale: 1.25, animationTime: 220 });
          }}
        />
      ))}
    </div>
  );
}
