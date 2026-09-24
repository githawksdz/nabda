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
      aria-label="Sections de la recommandation"
      className="sticky top-[calc(64px+env(safe-area-inset-top,0px))] z-40 -mx-4 bg-surface/90 px-4 py-2 backdrop-blur-xl"
    >
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
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
                "flex h-8 shrink-0 items-center rounded-full px-3.5 text-label-md",
                isActive
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
