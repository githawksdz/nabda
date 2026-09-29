"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { ProPromoAura } from "@/components/promotions/ProPromoAura";
import { cn } from "@/lib/utils";

type ProCtaButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export function ProCtaButton({ href, children, className }: ProCtaButtonProps) {
  return (
    <span className={cn("promo-cta", className)}>
      <span aria-hidden>
        <ProPromoAura accent="indigo" className="promo-cta__aura" />
        <ProPromoAura accent="teal" className="promo-cta__aura promo-cta__aura--secondary" />
        <span className="promo-cta__glow" />
      </span>
      <span className="promo-cta__frame">
        <Button
          href={href}
          className="promo-cta__button bg-white text-[var(--promo-coupon-ink)] hover:bg-white/95"
        >
          {children}
        </Button>
      </span>
    </span>
  );
}
