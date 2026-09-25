import type { ReactNode } from "react";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";

type StatusChipProps = {
  label?: string;
  children?: ReactNode;
  variant?: "soft" | "dark" | "outline" | "warning";
  className?: string;
};

const VARIANT_TONE: Record<NonNullable<StatusChipProps["variant"]>, StatusTone> =
  {
    soft: "muted",
    dark: "inverse",
    outline: "outline",
    warning: "danger",
  };

/** Compatibility wrapper. New call sites should use StatusBadge. */
export function StatusChip({
  label,
  children,
  variant = "soft",
  className,
}: StatusChipProps) {
  return (
    <StatusBadge
      label={label}
      tone={VARIANT_TONE[variant]}
      className={className}
    >
      {children}
    </StatusBadge>
  );
}
