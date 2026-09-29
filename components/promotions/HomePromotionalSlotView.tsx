"use client";

import { useEffect, useState } from "react";
import { ProfileCompletionCard } from "@/components/promotions/ProfileCompletionCard";
import { ProPainPointCard } from "@/components/promotions/ProPainPointCard";
import type { HomePromotionalSlot } from "@/lib/promotions/resolve-home-promotion";

const DISMISS_KEY = "nabda:home-promo-dismissed";

type HomePromotionalSlotViewProps = {
  slot: HomePromotionalSlot;
};

export function HomePromotionalSlotView({ slot }: HomePromotionalSlotViewProps) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (slot?.kind !== "profile") {
      return;
    }
    try {
      if (sessionStorage.getItem(`${DISMISS_KEY}:profile`)) {
        setHidden(true);
      }
    } catch {
      setHidden(false);
    }
  }, [slot]);

  if (!slot) {
    return null;
  }

  if (slot.kind === "profile") {
    if (hidden) {
      return null;
    }

    function dismissProfile() {
      try {
        sessionStorage.setItem(`${DISMISS_KEY}:profile`, "1");
      } catch {
        /* private mode */
      }
      setHidden(true);
    }

    return (
      <ProfileCompletionCard data={slot.data} onDefer={dismissProfile} />
    );
  }

  if (slot.kind === "pain-point") {
    return <ProPainPointCard variant={slot.variant} />;
  }

  return null;
}
