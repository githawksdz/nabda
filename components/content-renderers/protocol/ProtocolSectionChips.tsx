"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { groupAnchorId } from "@/lib/content-rendering/protocol";
import type { ProtocolRenderGroup } from "@/types/content-rendering-protocol";

type ProtocolSectionChipsProps = {
  groups: ProtocolRenderGroup[];
  activeId: string | null;
  onActiveId: (id: string) => void;
};

export function ProtocolSectionChips({
  groups,
  activeId,
  onActiveId,
}: ProtocolSectionChipsProps) {
  useEffect(() => {
    if (typeof CSS !== "undefined" && CSS.supports("scroll-target-group: auto")) {
      const syncAria = () => {
        const current = document.querySelector("nav[data-preview-chips] a:target-current");
        document.querySelectorAll("nav[data-preview-chips] a").forEach((link) => {
          const isCurrent = link === current;
          link.setAttribute("aria-current", isCurrent ? "true" : "false");
          link.classList.toggle("is-current", isCurrent);
          if (isCurrent) {
            const href = link.getAttribute("href");
            if (href?.startsWith("#")) {
              onActiveId(href.slice(1).replace(/^group-/, ""));
            }
          }
        });
      };
      syncAria();
      document.addEventListener("scrollend", syncAria);
      return () => document.removeEventListener("scrollend", syncAria);
    }

    const sections = groups
      .map((group) => document.getElementById(groupAnchorId(group.id)))
      .filter((node): node is HTMLElement => Boolean(node));
    if (sections.length === 0) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = visible?.target.getAttribute("id")?.replace(/^group-/, "");
        if (id) {
          onActiveId(id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [groups, onActiveId]);

  return (
    <nav
      data-preview-chips=""
      aria-label="Groupes de sections"
      className="preview-chip-nav sticky top-[calc(64px+env(safe-area-inset-top,0px))] z-40 -mx-4 bg-background/90 px-4 py-2 backdrop-blur-xl"
    >
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {groups.map((group) => {
          const href = `#${groupAnchorId(group.id)}`;
          const isActive = activeId === group.id;
          return (
            <a
              key={group.id}
              href={href}
              aria-current={isActive ? "true" : "false"}
              onClick={(event) => {
                const target = document.getElementById(groupAnchorId(group.id));
                if (!target) {
                  return;
                }
                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                onActiveId(group.id);
              }}
              className={cn(
                "flex min-h-11 shrink-0 items-center rounded-full px-3.5 text-label-md",
                isActive
                  ? "is-current bg-primary font-semibold text-on-primary shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant",
              )}
            >
              {group.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
