import { cn } from "@/lib/utils";
import type { SoftMessageType } from "@/types/onboarding";

type SoftMessageProps = {
  type?: SoftMessageType;
  children: string;
};

const tones: Record<SoftMessageType, string> = {
  info: "bg-surface-container text-on-surface-variant",
  success: "bg-surface-container-low text-on-surface",
  warning: "bg-surface-container-high text-on-surface",
  error: "bg-error-container text-error",
};

const dots: Record<SoftMessageType, string> = {
  info: "bg-on-surface-variant",
  success: "bg-on-surface",
  warning: "bg-secondary",
  error: "bg-error",
};

export function SoftMessage({ type = "info", children }: SoftMessageProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-2 rounded-md px-3 py-2 text-[13px] leading-snug",
        tones[type],
      )}
    >
      <span
        aria-hidden
        className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", dots[type])}
      />
      <p>{children}</p>
    </div>
  );
}
