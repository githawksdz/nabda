"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DoctorNavIcon } from "@/components/app/DoctorNavIcon";
import {
  MODULE_NAV,
  PRIMARY_NAV,
  isDoctorNavActive,
} from "@/lib/navigation/doctor-nav";
import { cn } from "@/lib/utils";

function NavLinks({ items }: { items: typeof PRIMARY_NAV }) {
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
                "flex min-h-11 items-center gap-3 border-l-2 px-3 text-body-md",
                active
                  ? "border-primary font-semibold text-primary"
                  : "border-transparent text-on-surface-variant",
              )}
            >
              <DoctorNavIcon
                name={item.icon}
                strokeWidth={active ? 2 : 1.75}
              />
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
    <aside className="sticky top-0 hidden h-dvh w-[var(--layout-sidebar)] shrink-0 flex-col border-r border-outline-variant bg-surface lg:flex">
      <p className="px-4 pt-5 pb-3 text-headline-sm">Nabda</p>
      <nav aria-label="Navigation principale" className="flex flex-1 flex-col gap-4 overflow-y-auto px-2 pb-6">
        <NavLinks items={PRIMARY_NAV} />
        <NavLinks items={MODULE_NAV} />
      </nav>
    </aside>
  );
}
