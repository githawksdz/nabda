"use client";

import { useEffect, useRef, useState } from "react";
import { TOAST_DWELL_MS, toastExitMs } from "@/lib/ui/feedback-timing";

export type ToastNotice = {
  id: number;
  message: string;
  tone: "status" | "alert";
};

type StatusToastProps = {
  notice: ToastNotice | null;
  onDismiss: () => void;
};

export function StatusToast({ notice, onDismiss }: StatusToastProps) {
  const onDismissRef = useRef(onDismiss);
  const [phase, setPhase] = useState<"from" | "open" | "exit">("from");
  const [renderedId, setRenderedId] = useState<number | null>(null);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  if (notice && notice.id !== renderedId) {
    setRenderedId(notice.id);
    setPhase("from");
  }

  useEffect(() => {
    if (!notice) {
      return;
    }
    let exitTimer = 0;
    let removeTimer = 0;
    const frame = window.requestAnimationFrame(() => {
      setPhase("open");
      exitTimer = window.setTimeout(() => setPhase("exit"), TOAST_DWELL_MS);
      removeTimer = window.setTimeout(() => {
        onDismissRef.current();
      }, TOAST_DWELL_MS + toastExitMs());
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, [notice]);

  if (!notice) {
    return null;
  }

  const alert = notice.tone === "alert";

  return (
    <p
      role={alert ? "alert" : "status"}
      aria-live={alert ? "assertive" : "polite"}
      data-phase={phase === "open" ? "open" : "closed"}
      className="status-toast pointer-events-none fixed bottom-[calc(var(--layout-dock-height)+env(safe-area-inset-bottom,0px)+0.75rem)] left-1/2 z-[var(--z-toast)] w-[min(var(--layout-reading),calc(100%-32px))] rounded-xl bg-primary px-4 py-3 text-center text-label-md text-on-primary shadow-sm lg:left-[calc(50%+(var(--layout-sidebar)/2))]"
    >
      {notice.message}
    </p>
  );
}
