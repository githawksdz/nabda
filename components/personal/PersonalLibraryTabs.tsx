"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/favorites", label: "Favoris" },
  { href: "/history", label: "Récents" },
] as const;

export function PersonalLibraryTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Bibliothèque personnelle" className="flex gap-2">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-full px-3.5 text-label-md",
              active
                ? "bg-primary font-semibold text-on-primary"
                : "bg-surface-container-low text-on-surface-variant",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
