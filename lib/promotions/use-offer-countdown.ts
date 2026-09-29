"use client";

import { useEffect, useState } from "react";
import {
  formatOfferCountdown,
  isOfferExpired,
  msUntilNextCountdownTick,
  type OfferCountdownState,
} from "@/lib/promotions/countdown";

type UseOfferCountdownOptions = {
  endsAt: string;
  timeZone?: string;
  onExpired?: () => void;
};

export function useOfferCountdown({
  endsAt,
  timeZone,
  onExpired,
}: UseOfferCountdownOptions): OfferCountdownState {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      const next = Date.now();
      setNowMs(next);
      if (isOfferExpired(endsAt, next)) {
        onExpired?.();
        return;
      }
      timeoutId = setTimeout(tick, msUntilNextCountdownTick(next));
    };

    tick();
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [endsAt, onExpired]);

  return formatOfferCountdown(endsAt, nowMs, timeZone);
}
