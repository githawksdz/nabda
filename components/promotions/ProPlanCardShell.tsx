"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ProPlanCardShellProps = {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
};

export function ProPlanCardShell({
  children,
  className,
  labelledBy,
}: ProPlanCardShellProps) {
  return (
    <article
      className={cn("promo-pro-plan-card group w-full", className)}
      aria-labelledby={labelledBy}
    >
      <div className="promo-pro-plan-card__beam" aria-hidden>
        <div className="promo-pro-plan-card__beam-inner" />
      </div>
      <div className="promo-pro-plan-card__surface">{children}</div>
    </article>
  );
}

export function ProPlanSparkleIcon() {
  return (
    <span className="promo-pro-plan-card__icon" aria-hidden>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6 text-emerald-400"
      >
        <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
        <path d="M20 2v4" />
        <path d="M22 4h-4" />
        <circle cx="4" cy="20" r="2" />
      </svg>
    </span>
  );
}
