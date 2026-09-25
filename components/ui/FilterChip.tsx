import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type FilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  count?: number;
  leading?: ReactNode;
  href?: string;
};

export function FilterChip({
  selected = false,
  count,
  leading,
  href,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: FilterChipProps) {
  const classes = cn(
    "motion-color flex min-h-[var(--size-chip)] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-label-md",
    selected
      ? "bg-action-primary font-semibold text-text-inverse"
      : "bg-surface-muted text-text-secondary hover:bg-surface-container",
    disabled &&
      "cursor-not-allowed bg-action-disabled text-text-disabled hover:bg-action-disabled",
    className,
  );
  const inner = (
    <>
      {leading}
      <span className="max-w-[16rem] truncate">{children}</span>
      {count != null ? (
        <span
          className={cn(
            "motion-color flex min-w-4 items-center justify-center rounded-full px-1 text-label-sm",
            selected
              ? "bg-text-inverse text-action-primary"
              : "bg-surface-container-high text-text-primary",
          )}
        >
          {count}
        </span>
      ) : null}
    </>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        aria-current={selected ? "page" : undefined}
        className={classes}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={type}
      aria-pressed={selected}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {inner}
    </button>
  );
}

type FilterChipRowProps = {
  id?: string;
  label?: string;
  sticky?: boolean;
  edgeFade?: boolean;
  children: ReactNode;
  className?: string;
};

export function FilterChipRow({
  id,
  label = "Filtres",
  sticky = false,
  edgeFade = false,
  children,
  className,
}: FilterChipRowProps) {
  return (
    <div
      id={id}
      role="toolbar"
      aria-label={label}
      className={cn(
        sticky &&
          "layout-sticky-under-header layout-gutter-bleed sticky z-[var(--z-sticky)] bg-background/90 py-2 backdrop-blur-xl",
        edgeFade && "relative",
        className,
      )}
    >
      <div className="relative flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {children}
      </div>
      {edgeFade ? (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-background/95 to-transparent"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background/95 to-transparent"
          />
        </>
      ) : null}
    </div>
  );
}
