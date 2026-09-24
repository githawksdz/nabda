"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useState } from "react";
import type { MedicationSearchResult } from "@/types/search";

type MedicationResultCardProps = {
  result: MedicationSearchResult;
};

export function MedicationResultCard({ result }: MedicationResultCardProps) {
  const [saved, setSaved] = useState(false);

  return (
    <article className="space-y-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-headline-sm">{result.title}</h3>
          {result.statusChip ? (
            <span className="mt-1 inline-flex rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
              {result.statusChip}
            </span>
          ) : null}
          {result.warningChip ? (
            <span className="mt-1 inline-flex rounded-full bg-error-container px-2 py-0.5 text-label-sm text-error">
              {result.warningChip}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="Favoris"
          onClick={() => setSaved((value) => !value)}
          className="flex size-10 items-center justify-center rounded-full text-on-surface-variant"
        >
          <Bookmark
            className="size-4"
            strokeWidth={1.75}
            fill={saved ? "currentColor" : "none"}
          />
        </button>
      </div>
      <p className="text-body-sm text-on-surface-variant">{result.subtitle}</p>
      <div className="rounded-xl bg-surface-container-low p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-label-md">{result.infoLabel}</p>
          {result.infoMeta ? (
            <p className="text-label-sm text-on-surface-variant">{result.infoMeta}</p>
          ) : null}
        </div>
        {/* TODO: Keep this block free of exact doses until pharmacist review. */}
        <p className="mt-1 text-body-sm text-on-surface-variant">{result.infoText}</p>
      </div>
      <div className="flex items-center justify-between gap-2">
        {result.footerText ? (
          <p className="text-label-sm text-on-surface-variant">{result.footerText}</p>
        ) : (
          <span />
        )}
        <div className="flex gap-1.5">
          {result.actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={
                action.variant === "secondary"
                  ? "inline-flex min-h-10 items-center rounded-lg bg-surface-container px-3 text-label-md"
                  : "inline-flex min-h-10 items-center rounded-lg bg-primary px-3 text-label-md text-on-primary"
              }
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
