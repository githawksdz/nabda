import Link from "next/link";
import { cn } from "@/lib/utils";
import { CAT_TABS, catHref } from "@/lib/content-detail/content-detail-ui-config";
import type { CatTab } from "@/types/content-detail";

type CatSegmentedTabsProps = {
  slug: string;
  active: CatTab;
};

export function CatSegmentedTabs({ slug, active }: CatSegmentedTabsProps) {
  return (
    <nav
      aria-label="Vues de la CAT"
      className="flex rounded-full bg-surface-container-low p-1"
    >
      {CAT_TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={catHref(slug, { tab: tab.id })}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "motion-color flex min-h-11 flex-1 items-center justify-center rounded-full px-2 text-label-sm",
              isActive
                ? "bg-action-primary font-semibold text-text-inverse"
                : "text-text-secondary",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
