"use client";

import { Check, Diamond } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CatFlowchartNode, CatNodeType } from "@/types/cat-flowchart";

type CatFlowchartNodeProps = {
  node: CatFlowchartNode;
  selected: boolean;
  onSelect: (id: string) => void;
  onFocus: (id: string) => void;
};

function NodeBadge({ type }: { type: CatNodeType }) {
  if (type === "decision") {
    return <Diamond className="size-3 shrink-0" strokeWidth={1.75} />;
  }
  if (type === "outcome") {
    return <Check className="size-3 shrink-0" strokeWidth={1.75} />;
  }
  if (type === "emergency") {
    return (
      <span className="rounded-full bg-error/15 px-1.5 py-px text-[9px] font-medium tracking-wide text-error uppercase">
        Urgence
      </span>
    );
  }
  return null;
}

export function CatFlowchartNodeView({
  node,
  selected,
  onSelect,
  onFocus,
}: CatFlowchartNodeProps) {
  const compact = node.height <= 36 || node.width <= 110;
  const cluster = node.type === "cluster";

  return (
    <button
      id={node.id}
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelect(node.id);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onFocus(node.id);
      }}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
      }}
      className={cn(
        "absolute flex flex-col items-center justify-center px-2.5 text-center",
        node.type === "start" &&
          "rounded-full bg-primary text-on-primary shadow-sm",
        node.type === "decision" &&
          "rounded-xl border border-outline-variant/70 bg-surface-container-lowest",
        node.type === "action" &&
          "rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm",
        node.type === "emergency" &&
          "rounded-xl bg-error-container/80 text-on-surface",
        node.type === "outcome" &&
          "rounded-xl bg-surface-container-low text-on-surface",
        node.type === "loop" &&
          "rounded-xl border border-dashed border-outline-variant/70 bg-surface-container-lowest",
        cluster
          ? "z-[5] items-start justify-start rounded-2xl border border-dashed border-outline-variant/70 bg-surface-container-low/70 px-3 py-2.5"
          : "z-10",
        selected && "z-20 ring-2 ring-primary shadow-md",
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center gap-1",
          cluster && "w-full justify-start",
        )}
      >
        <NodeBadge type={node.type} />
        <span
          className={cn(
            compact ? "text-[11px] leading-tight font-medium" : "text-label-md",
            node.type === "start" && "text-label-md text-on-primary",
          )}
        >
          {node.title}
        </span>
      </span>
      {node.subtitle ? (
        <span className="mt-0.5 text-[10px] leading-tight text-on-primary/80">
          {node.subtitle}
        </span>
      ) : null}
      {node.chips && node.chips.length > 0 ? (
        <span className="mt-1.5 flex flex-wrap justify-center gap-1">
          {node.chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-surface-container-lowest/80 px-1.5 py-px text-[9px] leading-tight"
            >
              {chip}
            </span>
          ))}
        </span>
      ) : null}
    </button>
  );
}
