"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DoctorNavIcon } from "@/components/app/DoctorNavIcon";
import {
  MODULE_NAV,
  SIDEBAR_PRIMARY_NAV,
  isDoctorNavActive,
} from "@/lib/navigation/doctor-nav";
import { cn } from "@/lib/utils";

function NavLinks({ items }: { items: typeof SIDEBAR_PRIMARY_NAV }) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isDoctorNavActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl border-l-2 px-3 text-label-sm",
                active
                  ? "border-primary bg-on-surface/[0.07] text-on-surface"
                  : "border-transparent text-on-surface-variant",
              )}
            >
              <DoctorNavIcon name={item.icon} />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function DesktopSidebar() {
  return (
    <aside
      data-desktop-sidebar
      className="sticky top-0 hidden h-dvh w-[var(--layout-sidebar)] shrink-0 flex-col border-r border-outline-variant bg-surface lg:flex"
    >
      <p className="px-4 pt-5 pb-3 text-headline-sm">Nabda</p>
      <nav aria-label="Navigation principale" className="flex flex-1 flex-col gap-4 overflow-y-auto px-2 pb-6">
        <NavLinks items={SIDEBAR_PRIMARY_NAV} />
        <NavLinks items={MODULE_NAV} />
      </nav>
    </aside>
  );
}
