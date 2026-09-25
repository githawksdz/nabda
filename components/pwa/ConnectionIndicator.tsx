"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

export function ConnectionIndicator() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-2 py-1 text-label-sm text-on-surface-variant"
      aria-live="polite"
    >
      {online ? <Wifi className="size-3.5" strokeWidth={1.75} /> : <WifiOff className="size-3.5" strokeWidth={1.75} />}
      {online ? "En ligne" : "Hors-ligne"}
    </span>
  );
}
