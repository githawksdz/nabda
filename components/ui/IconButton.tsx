import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
};

export function IconButton({
  label,
  children,
  className,
  disabled,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      disabled={disabled}
      className={cn(
        "motion-press inline-flex min-h-[var(--size-icon-button)] min-w-[var(--size-icon-button)] items-center justify-center rounded-full text-text-primary",
        "hover:bg-surface-muted active:bg-surface-container",
        disabled &&
          "cursor-not-allowed text-text-disabled hover:bg-transparent",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
