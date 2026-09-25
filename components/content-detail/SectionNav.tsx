import Link from "next/link";
import { cn } from "@/lib/utils";
import { protocolHref } from "@/lib/content-detail/content-detail-ui-config";
import type { SectionNavItem } from "@/types/content-detail";

type SectionNavProps = {
  protocolSlug: string;
  items: SectionNavItem[];
  activeSlug: string | null;
};

export function SectionNav({
  protocolSlug,
  items,
  activeSlug,
}: SectionNavProps) {
  return (
    <nav
      aria-label="Sections du protocole"
      className="layout-sticky-under-header sticky z-[var(--z-sticky)] -mx-4 bg-background/90 px-4 py-2 backdrop-blur-xl lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0"
    >
      <div className="flex gap-2 overflow-x-auto no-scrollbar lg:flex-col lg:overflow-visible">
        {items.map((item) => {
          const isActive = item.slug === activeSlug;
          return (
            <Link
              key={item.slug ?? "overview"}
              href={protocolHref(
                protocolSlug,
                item.slug ? { section: item.slug } : undefined,
              )}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "motion-color flex min-h-11 max-w-[16rem] shrink-0 items-center rounded-full px-3.5 text-label-md lg:max-w-none lg:shrink",
                isActive
                  ? "bg-action-primary font-semibold text-text-inverse"
                  : "bg-surface-muted text-text-secondary",
              )}
            >
              <span className="truncate lg:whitespace-normal lg:[overflow-wrap:anywhere]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
