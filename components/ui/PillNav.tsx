import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Route-level pill navigation. Favoris/Récents and similar links stay
 * as links with aria-current — they are not in-page tabs.
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
        "motion-color inline-flex min-h-[var(--size-touch)] shrink-0 items-center rounded-full px-3.5 text-label-md",
        current
          ? "bg-action-primary font-semibold text-text-inverse"
          : "bg-surface-muted text-text-secondary",
        className,
      )}
    >
      {children}
    </Link>
  );
}
