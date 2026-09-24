import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type StatusChipProps = {
  children: ReactNode;
  variant?: "soft" | "dark" | "outline";
  className?: string;
};

export function StatusChip({
  children,
  variant = "soft",
  className,
}: StatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-label-sm",
        variant === "soft" && "bg-surface-container-high text-on-surface-variant",
        variant === "dark" && "bg-primary text-on-primary",
        variant === "outline" && "bg-surface-container-low text-secondary",
        className,
      )}
    >
      {children}
    </span>
  );
}
