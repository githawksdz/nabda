import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusTone =
  | "default"
  | "muted"
  | "outline"
  | "inverse"
  | "free"
  | "pro"
  | "downloaded"
  | "offline"
  | "stale"
  | "warning"
  | "danger"
  | "error"
  | "info"
  | "published";

type StatusBadgeProps = {
  label?: string;
  children?: ReactNode;
  tone?: StatusTone;
  className?: string;
};

const TONE: Record<StatusTone, string> = {
  default: "bg-surface-container-high text-text-secondary",
  muted: "bg-surface-container-high text-text-secondary",
  outline: "bg-surface-muted text-text-muted",
  inverse: "bg-action-primary text-text-inverse",
  free: "bg-surface-muted text-text-muted",
  pro: "bg-status-premium text-status-premium-on",
  downloaded: "bg-status-downloaded-container text-status-downloaded",
  offline: "bg-status-offline-container text-status-offline",
  stale: "bg-status-stale-container text-status-stale",
  warning: "bg-status-warning-container text-status-warning",
  danger: "bg-status-danger-container text-status-danger",
  error: "bg-status-error-container text-status-error",
  info: "bg-status-info-container text-status-info",
  published: "bg-surface-container-high text-text-secondary",
};

export function StatusBadge({
  label,
  children,
  tone = "default",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "motion-color inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-label-sm",
        TONE[tone],
        className,
      )}
    >
      {children ?? label}
    </span>
  );
}
