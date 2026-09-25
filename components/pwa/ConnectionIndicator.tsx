"use client";

import { useEffect, useRef, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function ConnectionIndicator() {
  const [online, setOnline] = useState(true);
  const [live, setLive] = useState("");
  const announced = useRef(false);

  useEffect(() => {
    const sync = () => {
      const next = navigator.onLine;
      setOnline(next);
      if (announced.current) {
        setLive(next ? "En ligne" : "Hors-ligne");
      }
      announced.current = true;
    };
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return (
    <>
      <StatusBadge tone={online ? "muted" : "offline"}>
        {online ? (
          <Wifi className="size-3.5" strokeWidth={1.75} aria-hidden />
        ) : (
          <WifiOff className="size-3.5" strokeWidth={1.75} aria-hidden />
        )}
        {online ? "En ligne" : "Hors-ligne"}
      </StatusBadge>
      <span className="sr-only" role="status" aria-live="polite">
        {live}
      </span>
    </>
  );
}
