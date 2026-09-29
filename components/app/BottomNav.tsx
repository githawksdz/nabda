"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DoctorNavIcon } from "@/components/app/DoctorNavIcon";
import {
  MOBILE_BOTTOM_NAV,
  isDoctorNavActive,
  isMobileBottomNavEntry,
  isModuleNavActive,
} from "@/lib/navigation/doctor-nav";
import { cn } from "@/lib/utils";

type BottomNavProps = {
  modulesOpen?: boolean;
  onOpenModules?: () => void;
  onNavigate?: () => void;
  /** Optimistic path from the shell so the chip moves on pointer down. */
  activePath?: string;
};

const itemShellClass =
  "motion-color flex min-h-11 min-w-0 w-full flex-col items-center justify-center gap-0 rounded-xl px-0 py-0.5";

function BottomNavItemContent({
  icon,
  label,
  active,
}: {
  icon: Parameters<typeof DoctorNavIcon>[0]["name"];
  label: string;
  active: boolean;
}) {
  return (
    <>
      <DoctorNavIcon
        name={icon}
        className="size-5 shrink-0"
        strokeWidth={active ? 2.25 : 1.75}
      />
      <span
        className={cn(
          "max-w-full truncate text-center text-[10px] leading-[11px] tracking-tight",
          active ? "font-medium text-on-surface" : "font-normal text-on-surface-variant",
        )}
      >
        {label}
      </span>
    </>
  );
}

export function BottomNav({
  modulesOpen = false,
  onOpenModules,
  onNavigate,
  activePath,
}: BottomNavProps) {
  const pathname = usePathname();
  const [pressedHref, setPressedHref] = useState<string | null>(null);
  const visualPath = pressedHref ?? activePath ?? pathname;

  useEffect(() => {
    if (!pressedHref) return;
    if (pathname === pressedHref || activePath === pressedHref) {
      setPressedHref(null);
    }
  }, [pathname, activePath, pressedHref]);

  return (
    <nav
      data-bottom-nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-[var(--z-nav)] overflow-x-hidden bg-surface/90 pb-safe shadow-[var(--shadow-subtle)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid h-[var(--layout-nav-height)] w-full max-w-[100vw] grid-cols-5 items-center gap-0 px-0">
        {MOBILE_BOTTOM_NAV.map((item) => {
          if (!isMobileBottomNavEntry(item)) {
            const active = (modulesOpen && !pressedHref) || isModuleNavActive(visualPath);
            return (
              <button
                key={item.id}
                type="button"
                onClick={onOpenModules}
                aria-haspopup="dialog"
                aria-expanded={modulesOpen}
                aria-controls="doctor-modules"
                className={cn(
                  itemShellClass,
                  active
                    ? "bg-surface-container text-on-surface"
                    : "text-on-surface-variant",
                )}
              >
                <BottomNavItemContent
                  icon={item.icon}
                  label={item.label}
                  active={active}
                />
              </button>
            );
          }

          const active = isDoctorNavActive(visualPath, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onPointerDown={() => {
                onNavigate?.();
                if (!isDoctorNavActive(visualPath, item.href)) {
                  setPressedHref(item.href);
                }
              }}
              className={cn(
                itemShellClass,
                active
                  ? "bg-surface-container text-on-surface"
                  : "text-on-surface-variant",
              )}
            >
              <BottomNavItemContent
                icon={item.icon}
                label={item.label}
                active={active}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
