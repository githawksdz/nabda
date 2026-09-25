import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SurfaceVariant =
  | "default"
  | "muted"
  | "elevated"
  | "interactive"
  | "inverse"
  | "warning"
  | "danger"
  | "offline";

type SurfaceProps = HTMLAttributes<HTMLElement> & {
  variant?: SurfaceVariant;
  as?: "section" | "article" | "div" | "aside";
};

const VARIANT: Record<SurfaceVariant, string> = {
  default: "bg-surface-muted",
  muted: "bg-surface-muted",
  elevated: "bg-surface-elevated shadow-[var(--shadow-card)]",
  interactive:
    "motion-surface bg-surface-elevated shadow-[var(--shadow-card)] hover:bg-surface-muted",
  inverse: "surface-inverse bg-surface-inverse text-text-inverse",
  warning: "bg-status-warning-container text-status-warning",
  danger: "bg-status-danger-container text-status-danger",
  offline: "bg-status-offline-container text-status-offline",
};

export function Surface({
  variant = "elevated",
  as: Tag = "section",
  className,
  ...props
}: SurfaceProps) {
  return (
    <Tag
      className={cn(
        "rounded-[var(--radius-card)] p-4",
        VARIANT[variant],
        className,
      )}
      {...props}
    />
  );
}
