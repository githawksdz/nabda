"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CLINICAL_FEED_SORTS,
  sortClinicalFeed,
  type ClinicalFeedItem,
  type ClinicalFeedSortId,
} from "@/lib/home/clinical-feed";
import { HOME_CHROME } from "@/lib/home/home-ui-config";

type HomeClinicalSectionProps = {
  items: ClinicalFeedItem[];
};

export function HomeClinicalSection({ items }: HomeClinicalSectionProps) {
  const [sort, setSort] = useState<ClinicalFeedSortId>("trending");
  const visible = sortClinicalFeed(items, sort);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-headline-sm">{HOME_CHROME.clinicalTitle}</h2>
        <label className="flex flex-col items-end gap-1">
          <span className="text-label-sm text-text-secondary">
            {HOME_CHROME.clinicalPrompt}
          </span>
          <span className="relative">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as ClinicalFeedSortId)}
              className="h-8 appearance-none rounded-full bg-surface-muted pe-8 ps-3 text-label-md text-text-primary"
            >
              {CLINICAL_FEED_SORTS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute end-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-muted"
              strokeWidth={1.75}
              aria-hidden
            />
          </span>
        </label>
      </div>
      <div className="mt-3">
        {visible.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {visible.map((item) => (
              <li key={item.id}>
                <ClinicalProtocolRow item={item} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            compact
            headingLevel="p"
            title={HOME_CHROME.clinicalEmptyTitle}
            description={HOME_CHROME.clinicalEmptyBody}
          />
        )}
      </div>
    </section>
  );
}

function ClinicalProtocolRow({ item }: { item: ClinicalFeedItem }) {
  return (
    <Link
      href={item.href}
      className="flex min-h-11 min-w-0 items-center gap-3 rounded-[var(--radius-card)] bg-surface-muted px-3.5 py-3 hover:bg-surface-container"
    >
      <span className="min-w-0 flex-1">
        <span className="text-label-sm text-text-secondary">{item.kindLabel}</span>
        <span className="mt-1 block truncate text-body-md font-medium">{item.title}</span>
        {item.categoryLabel ? (
          <span className="mt-0.5 block truncate text-body-sm text-text-secondary">
            {item.categoryLabel}
          </span>
        ) : null}
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-text-muted"
        strokeWidth={1.75}
        aria-hidden
      />
    </Link>
  );
}
