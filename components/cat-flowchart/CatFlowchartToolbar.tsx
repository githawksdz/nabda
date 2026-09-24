"use client";

import { useState } from "react";
import { Crosshair, Minus, Plus, Scan } from "lucide-react";
import { useControls, useTransformEffect } from "react-zoom-pan-pinch";

export function CatFlowchartToolbar() {
  const { zoomIn, zoomOut, centerView, fitToView } = useControls();
  const [scale, setScale] = useState(0.78);

  useTransformEffect(({ state }) => {
    setScale((current) =>
      Math.abs(current - state.scale) < 0.005 ? current : state.scale,
    );
  });

  return (
    <div className="flowchart-ui pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between p-2.5">
      <div className="rounded-xl bg-surface/90 px-2.5 py-1.5 shadow-sm backdrop-blur-md">
        <p className="text-label-sm">Carte interactive</p>
        <p className="text-[10px] text-on-surface-variant">
          Zoom {Math.round(scale * 100)}%
        </p>
      </div>
      <div className="pointer-events-auto flex overflow-hidden rounded-xl bg-surface/90 shadow-sm backdrop-blur-md">
        <button
          type="button"
          aria-label="Ajuster à la vue"
          onClick={() => {
            void fitToView({ mode: "contain", animationTime: 220 });
          }}
          className="flex size-8 items-center justify-center text-on-surface-variant"
        >
          <Scan className="size-3.5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          aria-label="Centrer la vue"
          onClick={() => {
            void centerView(undefined, 220);
          }}
          className="flex size-8 items-center justify-center text-on-surface-variant"
        >
          <Crosshair className="size-3.5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          aria-label="Zoom arrière"
          onClick={() => {
            void zoomOut(0.18, 160);
          }}
          className="flex size-8 items-center justify-center text-on-surface-variant"
        >
          <Minus className="size-3.5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          aria-label="Zoom avant"
          onClick={() => {
            void zoomIn(0.18, 160);
          }}
          className="flex size-8 items-center justify-center text-on-surface-variant"
        >
          <Plus className="size-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
