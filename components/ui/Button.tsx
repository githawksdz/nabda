import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "@/components/ui/LoadingIndicator";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "link";
type ButtonSize = "md" | "compact";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  href?: string;
  children: ReactNode;
};

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-action-primary text-text-inverse hover:bg-action-primary-hover active:bg-black",
  secondary:
    "bg-action-secondary text-text-primary hover:bg-surface-container active:bg-surface-container-high",
  ghost: "bg-transparent text-text-primary hover:bg-surface-muted",
  destructive:
    "bg-status-danger text-text-inverse hover:bg-status-danger/90",
  link: "bg-transparent px-0 text-text-primary underline-offset-2 hover:underline",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  href,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const classes = cn(
    "motion-press inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 text-label-md",
    variant !== "link" && "min-h-[var(--size-touch)]",
    size === "compact" && variant !== "link" && "min-h-[var(--size-control-compact)]",
    VARIANT[variant],
    isDisabled &&
      "cursor-not-allowed bg-action-disabled text-text-disabled hover:bg-action-disabled",
    className,
  );

  const content = (
    <>
      {loading ? <Spinner className="size-3.5" /> : null}
      {children}
    </>
  );

  if (href && !isDisabled) {
    return (
      <Link href={href} className={classes} aria-busy={loading || undefined}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </button>
  );
}
