"use client";

import { usePathname } from "next/navigation";
import { PillNav, PillNavLink } from "@/components/ui/PillNav";

const TABS = [
  { href: "/favorites", label: "Favoris" },
  { href: "/history", label: "Récents" },
] as const;

export function PersonalLibraryTabs() {
  const pathname = usePathname();

  return (
    <PillNav label="Bibliothèque personnelle">
      {TABS.map((tab) => (
        <PillNavLink
          key={tab.href}
          href={tab.href}
          current={pathname === tab.href}
        >
          {tab.label}
        </PillNavLink>
      ))}
    </PillNav>
  );
}
