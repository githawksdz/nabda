import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Route-level pill navigation. Links use aria-current; they are not in-page tabs.
 */
type PillNavProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function PillNav({ label, children, className }: PillNavProps) {
  return (
    <nav aria-label={label} className={cn("flex gap-2", className)}>
      {children}
    </nav>
  );
}

type PillNavLinkProps = {
  href: string;
  current?: boolean;
  children: ReactNode;
  className?: string;
};

export function PillNavLink({
  href,
  current = false,
  children,
  className,
}: PillNavLinkProps) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "motion-color inline-flex h-8 min-h-8 shrink-0 items-center rounded-full px-2.5 text-[10px] leading-3 font-medium",
        current
          ? "bg-action-primary text-text-inverse"
          : "bg-surface-muted text-text-secondary",
        className,
      )}
    >
      {children}
    </Link>
  );
}
