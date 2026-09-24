"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, GitBranch, House, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/home", label: "Accueil", icon: House },
  { href: "/search", label: "Recherche", icon: Search },
  { href: "/cat", label: "CAT", icon: GitBranch },
  { href: "/favorites", label: "Favoris", icon: Bookmark },
  { href: "/profile", label: "Profil", icon: User },
] as const;

type BottomNavProps = {
  variant?: "pill" | "text";
  frameClassName?: string;
};

export function BottomNav({
  variant = "pill",
  frameClassName = "max-w-[430px]",
}: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className={cn(
        "fixed bottom-0 left-1/2 z-50 w-full -translate-x-1/2 bg-surface/90 pb-safe shadow-[0_-1px_8px_rgba(0,0,0,0.03)] backdrop-blur-xl",
        frameClassName,
      )}
    >
      <div className="flex h-16 items-center justify-around px-1">
        {ITEMS.map((item) => {
          const active =
            item.href === "/home"
              ? pathname === "/home"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
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
                <Icon className="size-5" strokeWidth={active ? 2 : 1.75} />
              </span>
              <span
                className={cn(
                  "text-label-sm",
                  active && variant === "text" && "font-semibold text-primary",
                  active && variant === "pill" && "font-semibold text-primary",
                  active && variant !== "pill" && variant !== "text" && "font-semibold text-on-surface",
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
