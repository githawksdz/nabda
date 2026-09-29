import type { ReactNode } from "react";
import { Badge } from "@/components/shadcn/badge";
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

const TONE = {
  default: "neutral",
  muted: "neutral",
  outline: "outline",
  inverse: "default",
  free: "neutral",
  pro: "pro",
  downloaded: "downloaded",
  offline: "offline",
  stale: "stale",
  warning: "warning",
  danger: "danger",
  error: "danger",
  info: "info",
  published: "neutral",
} as const;

export function StatusBadge({
  label,
  children,
  tone = "default",
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant={TONE[tone]}
      className={cn("motion-color h-6 px-2 text-xs font-semibold leading-4", className)}
    >
      {children ?? label}
    </Badge>
  );
}
