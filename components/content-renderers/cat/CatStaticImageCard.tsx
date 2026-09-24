"use client";

import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { catImageAnchorId } from "@/lib/content-rendering/cat";
import type { CatRenderMedia } from "@/types/content-rendering-cat";

type CatStaticImageCardProps = {
  images: CatRenderMedia[];
  imagemapStripped: boolean;
  zoomable?: boolean;
  compact?: boolean;
};

function ImageFrame({
  image,
  zoomable,
  compact,
}: {
  image: CatRenderMedia;
  zoomable: boolean;
  compact: boolean;
}) {
  if (!image.available || !image.href) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-xl bg-surface-container-low px-3 py-8 text-center text-body-sm text-on-surface-variant">
        Schéma source indisponible pour cette fiche.
      </div>
    );
  }

  const img = (
    // Static flowchart only. No imagemap, no clickable zones.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.href}
      alt="Schéma clinique non interactif"
      draggable={false}
      className="pointer-events-none block h-auto w-full select-none"
    />
  );

  if (!zoomable) {
    return <div className="overflow-hidden rounded-xl bg-surface-container-low">{img}</div>;
  }

  return (
    <div
      className="overflow-hidden rounded-xl bg-surface-container-low"
      style={{ height: compact ? 220 : 320, touchAction: "none" }}
    >
      <TransformWrapper
        minScale={1}
        maxScale={4}
        initialScale={1}
        limitToBounds
        centerOnInit
        doubleClick={{ disabled: true }}
        wheel={{ step: 0.08 }}
        pinch={{ step: 5 }}
        panning={{ velocityDisabled: true }}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%", overflow: "hidden" }}
          contentStyle={{ width: "100%", height: "100%" }}
        >
          {img}
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

export function CatStaticImageCard({
  images,
  imagemapStripped,
  zoomable = false,
  compact = false,
}: CatStaticImageCardProps) {
  const visible = images.length > 0 ? images : [];

  return (
    <section
      id={catImageAnchorId()}
      className="scroll-mt-[calc(64px+56px+env(safe-area-inset-top,0px))]"
    >
      <article className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm">
        <p className="text-label-md">Schéma (non cliquable)</p>
        <p className="mt-1 text-label-sm text-on-surface-variant">
          Illustration source conservée. Pas de carte interactive ni de zones cliquables.
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {visible.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center rounded-xl bg-surface-container-low px-3 py-8 text-center text-body-sm text-on-surface-variant">
              Aucun schéma source n&apos;est disponible pour cette fiche.
            </div>
          ) : (
            visible.map((image) => (
              <ImageFrame
                key={image.filename}
                image={image}
                zoomable={zoomable}
                compact={compact}
              />
            ))
          )}
        </div>
        {imagemapStripped ? (
          <p className="mt-3 text-label-sm text-on-surface-variant">
            Les zones cliquables d&apos;origine ont été désactivées.
          </p>
        ) : null}
        {zoomable ? (
          <p className="mt-2 text-center text-[10px] text-on-surface-variant">
            Pincez pour zoomer · glissez pour parcourir
          </p>
        ) : null}
      </article>
    </section>
  );
}
