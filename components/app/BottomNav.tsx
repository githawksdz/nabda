"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DoctorNavIcon } from "@/components/app/DoctorNavIcon";
import { PRIMARY_NAV, isDoctorNavActive } from "@/lib/navigation/doctor-nav";
import { cn } from "@/lib/utils";

type BottomNavProps = {
  variant?: "pill" | "text";
};

export function BottomNav({ variant = "pill" }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-50 bg-surface/90 pb-safe shadow-[0_-1px_8px_rgba(0,0,0,0.03)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex h-16 w-full max-w-[42rem] items-center justify-around px-1">
        {PRIMARY_NAV.map((item) => {
          const active = isDoctorNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="flex min-h-11 min-w-12 flex-col items-center justify-center gap-0.5 px-3 text-on-surface-variant"
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full",
                  variant === "pill" && active && "bg-secondary-container text-primary",
                )}
              >
                <DoctorNavIcon
                  name={item.icon}
                  strokeWidth={active ? 2 : 1.75}
                />
              </span>
              <span
                className={cn(
                  "text-label-sm",
                  active && "font-semibold text-primary",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
