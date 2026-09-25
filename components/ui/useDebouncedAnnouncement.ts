"use client";

import { useEffect, useState } from "react";

/** Debounces screen-reader text only. Visible results must not use this delay. */
export const CALCULATOR_ANNOUNCEMENT_MS = 500;

export function useDebouncedAnnouncement(
  text: string,
  delayMs = CALCULATOR_ANNOUNCEMENT_MS,
): string {
  const [announced, setAnnounced] = useState("");

  useEffect(() => {
    const next = text.trim();
    const timer = window.setTimeout(() => setAnnounced(next), next ? delayMs : 0);
    return () => window.clearTimeout(timer);
  }, [text, delayMs]);

  return announced;
}
