import Link from "next/link";
import { cn } from "@/lib/utils";
import { DRUG_TABS, drugDetailHref } from "@/lib/drugs/drug-ui-config";
import type { DrugTab } from "@/types/drugs";

type DrugTabsProps = {
  slug: string;
  active: DrugTab;
};

export function DrugTabs({ slug, active }: DrugTabsProps) {
  return (
    <nav
      aria-label="Sections de la fiche médicament"
      className="sticky top-[calc(64px+env(safe-area-inset-top,0px))] z-40 -mx-4 bg-surface/90 px-4 py-2 backdrop-blur-xl"
    >
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {DRUG_TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <Link
              key={tab.id}
              href={drugDetailHref(slug, tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-8 shrink-0 items-center rounded-full px-3.5 text-label-md",
                isActive
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
