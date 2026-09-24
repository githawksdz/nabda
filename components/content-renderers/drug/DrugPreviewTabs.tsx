"use client";

import { cn } from "@/lib/utils";
import type { NabdaDrugDetailTab } from "@/types/nabda-drug-sections";

type DrugPreviewTabsProps = {
  tabs: NabdaDrugDetailTab[];
  value: NabdaDrugDetailTab;
  counts: Record<string, number>;
  onChange: (tab: NabdaDrugDetailTab) => void;
};

export function DrugPreviewTabs({
  tabs,
  value,
  counts,
  onChange,
}: DrugPreviewTabsProps) {
  return (
    <nav
      aria-label="Onglets monographie"
      className="preview-chip-nav sticky top-[calc(64px+env(safe-area-inset-top,0px))] z-40 -mx-4 bg-background/90 px-4 py-2 backdrop-blur-xl"
    >
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const active = tab === value;
          const count = counts[tab] ?? 0;
          return (
            <button
              key={tab}
              type="button"
              aria-current={active ? "page" : "false"}
              onClick={() => onChange(tab)}
              className={cn(
                "flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-label-md",
                active
                  ? "bg-primary font-semibold text-on-primary shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant",
                count === 0 && !active && "opacity-40",
              )}
            >
              {tab}
              {count > 0 ? (
                <span
                  className={cn(
                    "flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-[13px]",
                    active
                      ? "bg-on-primary text-primary"
                      : "bg-surface-container-high text-on-surface",
                  )}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
