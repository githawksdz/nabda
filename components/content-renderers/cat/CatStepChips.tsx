"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  CAT_GARDE_STICKY_CHIPS,
  CAT_STICKY_CHIPS,
  catGroupAnchorId,
  catImageAnchorId,
} from "@/lib/content-rendering/cat";
import { scrollElementIntoView, scrollWindowTo } from "@/lib/ui/scroll-behavior";
import type { CatRenderGroup, CatRenderMode } from "@/types/content-rendering-cat";

type CatStepChipsProps = {
  groups: CatRenderGroup[];
  mode: CatRenderMode;
  activeId: string | null;
  hasImage: boolean;
  onActiveId: (id: string) => void;
  onSelectImage: () => void;
  onSelectTout: () => void;
};

const SCROLL_TOP_OFFSET = 120;

export function CatStepChips({
  groups,
  mode,
  activeId,
  hasImage,
  onActiveId,
  onSelectImage,
  onSelectTout,
}: CatStepChipsProps) {
  const groupIds = new Set(groups.map((group) => group.id));
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = [
      ...groups
        .map((group) => document.getElementById(catGroupAnchorId(group.id)))
        .filter((node): node is HTMLElement => Boolean(node)),
      document.getElementById(catImageAnchorId()),
    ].filter((node): node is HTMLElement => Boolean(node));
    if (sections.length === 0) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const raw = visible?.target.getAttribute("id") ?? "";
        if (raw === catImageAnchorId()) {
          onActiveId("image");
          return;
        }
        const id = raw.replace(/^cat-group-/, "");
        if (id) {
          onActiveId(id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [groups, onActiveId]);

  useEffect(() => {
    const active = stripRef.current?.querySelector("[aria-current='true']");
    if (active) {
      scrollElementIntoView(active, { inline: "center", block: "nearest" });
    }
  }, [activeId, mode]);

  const imageScrollTimer = useRef(0);

  useEffect(() => {
    return () => window.clearTimeout(imageScrollTimer.current);
  }, []);

  const chips =
    mode === "garde"
      ? CAT_GARDE_STICKY_CHIPS.map((chip) => ({
          id: chip.id,
          label: chip.label,
          targetId: chip.targetId,
          isImage: chip.id === "image",
          isTout: chip.id === "tout",
        }))
      : CAT_STICKY_CHIPS.map((chip) => ({
          id: chip.id,
          label: chip.label,
          targetId: chip.etapesId,
          isImage: chip.id === "image",
          isTout: chip.id === "tout",
        }));

  return (
    <nav
      data-preview-chips=""
      aria-label="Groupes d'étapes"
      className="preview-chip-nav layout-sticky-under-header sticky z-[var(--z-sticky)] -mx-4 bg-background/90 px-4 py-2 backdrop-blur-xl lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0"
    >
      <div ref={stripRef} className="flex gap-2 overflow-x-auto no-scrollbar lg:flex-col lg:overflow-visible">
        {chips.map((chip) => {
          const exists =
            chip.isTout || (chip.isImage ? hasImage : groupIds.has(chip.targetId));
          const isActive = chip.isTout
            ? activeId === null || activeId === "tout"
            : chip.isImage
              ? activeId === "image" || mode === "image"
              : activeId === chip.targetId;
          return (
            <button
              key={chip.id}
              type="button"
              disabled={!exists}
              aria-current={isActive ? "true" : "false"}
              onClick={() => {
                if (chip.isTout) {
                  onSelectTout();
                  scrollWindowTo({ top: SCROLL_TOP_OFFSET });
                  onActiveId("tout");
                  return;
                }
                if (chip.isImage) {
                  onSelectImage();
                  onActiveId("image");
                  window.clearTimeout(imageScrollTimer.current);
                  imageScrollTimer.current = window.setTimeout(() => {
                    const node = document.getElementById(catImageAnchorId());
                    if (node) {
                      scrollElementIntoView(node, { block: "start" });
                    }
                  }, 50);
                  return;
                }
                const target = document.getElementById(
                  catGroupAnchorId(chip.targetId),
                );
                if (target) {
                  scrollElementIntoView(target, { block: "start" });
                }
                onActiveId(chip.targetId);
              }}
              className={cn(
                "motion-color flex min-h-11 shrink-0 items-center rounded-full px-3.5 text-label-md",
                !exists && "opacity-40",
                isActive
                  ? "is-current bg-primary font-semibold text-on-primary shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant",
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
