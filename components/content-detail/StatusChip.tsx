import { cn } from "@/lib/utils";

type StatusChipProps = {
  label: string;
  variant?: "soft" | "dark" | "outline" | "warning";
  className?: string;
};

export function StatusChip({
  label,
  variant = "soft",
  className,
}: StatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-label-sm",
        variant === "soft" && "bg-surface-container-high text-on-surface-variant",
        variant === "dark" && "bg-primary text-on-primary",
        variant === "outline" && "bg-surface-container-low text-secondary",
        variant === "warning" && "bg-error-container text-error",
        className,
      )}
    >
      {label}
    </span>
  );
}
