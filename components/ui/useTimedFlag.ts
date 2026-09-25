"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useTimedFlag(durationMs: number) {
  const [active, setActive] = useState(false);
  const timer = useRef(0);

  useEffect(() => {
    return () => window.clearTimeout(timer.current);
  }, []);

  const start = useCallback(() => {
    window.clearTimeout(timer.current);
    setActive(true);
    timer.current = window.setTimeout(() => setActive(false), durationMs);
  }, [durationMs]);

  return { active, start };
}

export function useNotice() {
  const [notice, setNotice] = useState<{
    id: number;
    message: string;
    tone: "status" | "alert";
  } | null>(null);
  const idRef = useRef(0);

  const showToast = useCallback(
    (message: string, tone: "status" | "alert" = "status") => {
      idRef.current += 1;
      setNotice({ id: idRef.current, message, tone });
    },
    [],
  );

  const dismissToast = useCallback(() => setNotice(null), []);

  return { notice, showToast, dismissToast };
}
