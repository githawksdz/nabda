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
      className="layout-sticky-under-header layout-gutter-bleed sticky z-[var(--z-sticky)] bg-surface/90 py-2 backdrop-blur-xl"
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
                "motion-color flex min-h-11 shrink-0 items-center rounded-full px-3.5 text-label-md",
                isActive
                  ? "bg-action-primary font-semibold text-text-inverse"
                  : "bg-surface-muted text-text-secondary",
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
