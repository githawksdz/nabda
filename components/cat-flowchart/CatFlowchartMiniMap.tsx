"use client";

import { useState } from "react";
import { useTransformEffect } from "react-zoom-pan-pinch";
import type { CatFlowchartMap, CatFlowchartTransform } from "@/types/cat-flowchart";

type CatFlowchartMiniMapProps = {
  map: CatFlowchartMap;
  viewportWidth: number;
  viewportHeight: number;
};

export function CatFlowchartMiniMap({
  map,
  viewportWidth,
  viewportHeight,
}: CatFlowchartMiniMapProps) {
  const [transform, setTransform] = useState<CatFlowchartTransform>({
    scale: map.canvas.initialZoom,
    positionX: 0,
    positionY: 0,
  });

  useTransformEffect(({ state }) => {
    setTransform({
      scale: state.scale,
      positionX: state.positionX,
      positionY: state.positionY,
    });
  });

  const width = 92;
  const height = Math.round((width * map.canvas.boardHeight) / map.canvas.boardWidth);
  const sx = width / map.canvas.boardWidth;
  const sy = height / map.canvas.boardHeight;
  const viewLeft = -transform.positionX / transform.scale;
  const viewTop = -transform.positionY / transform.scale;
  const viewW = viewportWidth / transform.scale;
  const viewH = viewportHeight / transform.scale;

  return (
    <div
      aria-hidden="true"
      className="flowchart-ui pointer-events-none absolute right-2.5 bottom-8 z-30 overflow-hidden rounded-lg border border-outline-variant/40 bg-surface/90 shadow-sm"
      style={{ width, height }}
    >
      <svg width={width} height={height} className="block">
        <rect width={width} height={height} className="fill-surface-container-low" />
        {map.nodes.map((node) => (
          <rect
            key={node.id}
            x={node.x * sx}
            y={node.y * sy}
            width={Math.max(3, node.width * sx)}
            height={Math.max(2, node.height * sy)}
            rx={1.5}
            className={
              node.type === "emergency"
                ? "fill-error/50"
                : node.type === "start"
                  ? "fill-primary"
                  : "fill-on-surface/35"
            }
          />
        ))}
        <rect
          x={viewLeft * sx}
          y={viewTop * sy}
          width={viewW * sx}
          height={viewH * sy}
          fill="none"
          stroke="#000000"
          strokeWidth={1}
          opacity={0.7}
        />
      </svg>
    </div>
  );
}
