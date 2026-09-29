import { cn } from "@/lib/utils";

type ProPromoAuraProps = {
  className?: string;
  accent?: "teal" | "indigo" | "blue" | "coral";
};

const ACCENT_CLASS: Record<NonNullable<ProPromoAuraProps["accent"]>, string> = {
  teal: "promo-pro-aura--teal",
  indigo: "promo-pro-aura--indigo",
  blue: "promo-pro-aura--blue",
  coral: "promo-pro-aura--coral",
};

export function ProPromoAura({ className, accent = "teal" }: ProPromoAuraProps) {
  return (
    <div
      className={cn("promo-pro-aura", ACCENT_CLASS[accent], className)}
      aria-hidden
    />
  );
}
