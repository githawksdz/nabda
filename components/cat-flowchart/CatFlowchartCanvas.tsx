"use client";

import { useEffect, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { CatFlowchartBoard } from "./CatFlowchartBoard";
import { CatFlowchartMiniMap } from "./CatFlowchartMiniMap";
import { CatFlowchartToolbar } from "./CatFlowchartToolbar";
import { CatSelectedNodeCard } from "./CatSelectedNodeCard";
import { useCatFlowchart } from "./useCatFlowchart";
import type { CatFlowchartMap } from "@/types/cat-flowchart";

function CanvasLegend() {
  return (
    <div className="flowchart-ui pointer-events-none absolute bottom-8 left-2.5 z-30 rounded-xl bg-surface/90 px-2.5 py-2 shadow-sm backdrop-blur-md">
      <ul className="space-y-1 text-[10px] leading-tight text-on-surface-variant">
        <li className="flex items-center gap-1.5">
          <span className="size-2 rotate-45 border border-outline-variant" />
          Décision
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-1.5 w-2.5 rounded-sm bg-on-surface/40" />
          Action
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-1.5 w-2.5 rounded-sm bg-error/60" />
          Urgence
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-px w-3 border-t border-dashed border-outline" />
          Boucle
        </li>
      </ul>
    </div>
  );
}

type CatFlowchartCanvasProps = {
  map?: CatFlowchartMap;
};

export function CatFlowchartCanvas({ map: mapProp }: CatFlowchartCanvasProps) {
  const map = mapProp;
  const { selectedId, selected, selectNode, clearSelection } = useCatFlowchart(
    map ?? undefined,
  );
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({
    width: 358,
    height: map?.canvas.viewportHeight ?? 420,
  });

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(() => {
      setViewport({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    });
    observer.observe(element);
    setViewport({
      width: element.clientWidth,
      height: element.clientHeight,
    });
    return () => observer.disconnect();
  }, []);

  if (!map) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={viewportRef}
        className="relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm"
        style={{
          height: map.canvas.viewportHeight,
          touchAction: "none",
        }}
      >
        <TransformWrapper
          minScale={map.canvas.minZoom}
          maxScale={map.canvas.maxZoom}
          initialScale={map.canvas.initialZoom}
          initialPositionX={8}
          initialPositionY={56}
          limitToBounds
          centerZoomedOut
          doubleClick={{ disabled: true }}
          wheel={{ step: 0.07 }}
          pinch={{ step: 5 }}
          panning={{
            velocityDisabled: true,
            excluded: ["flowchart-ui"],
          }}
        >
          <CatFlowchartToolbar />
          <TransformComponent
            wrapperStyle={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
            }}
            contentStyle={{
              width: map.canvas.boardWidth,
              height: map.canvas.boardHeight,
            }}
          >
            <CatFlowchartBoard
              map={map}
              selectedId={selectedId}
              onSelect={selectNode}
              onClear={clearSelection}
            />
          </TransformComponent>
          <CanvasLegend />
          <CatFlowchartMiniMap
            map={map}
            viewportWidth={viewport.width}
            viewportHeight={viewport.height}
          />
          <p className="flowchart-ui pointer-events-none absolute bottom-2 left-1/2 z-30 w-[min(280px,calc(100%-96px))] -translate-x-1/2 text-center text-[10px] text-on-surface-variant">
            Pincez pour zoomer · glissez pour naviguer
          </p>
        </TransformWrapper>
      </div>
      {selected ? <CatSelectedNodeCard node={selected} /> : null}
    </div>
  );
}
