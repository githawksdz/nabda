"use client";

import Link from "next/link";
import { ChevronRight, History } from "lucide-react";
import { HomeIcon } from "@/components/home/home-icons";
import type { RecentConsultation } from "@/types/search";

type RecentConsultationsProps = {
  items: RecentConsultation[];
  cleared: boolean;
  onClear: () => void;
};

export function RecentConsultations({
  items,
  cleared,
  onClear,
}: RecentConsultationsProps) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <History className="size-4 text-on-surface-variant" strokeWidth={1.75} />
          <h2 className="text-headline-sm">Récemment consultés</h2>
        </div>
        {!cleared ? (
          <button
            type="button"
            onClick={onClear}
            className="text-label-md text-on-surface-variant"
          >
            Effacer
          </button>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
        {cleared ? (
          <p className="px-4 py-4 text-body-sm text-on-surface-variant">
            Historique effacé avec succès
          </p>
        ) : (
          items.map((item, index) => (
            <div key={item.id}>
              <Link
                href={item.href}
                className="flex items-center gap-3 p-4 hover:bg-surface-container-low"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-low">
                  <HomeIcon name={item.icon} className="size-5 text-on-surface" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-body-md font-medium">{item.title}</span>
                  <span className="mt-0.5 block text-body-sm text-on-surface-variant">
                    {item.meta}
                  </span>
                </span>
                <ChevronRight className="size-4 text-on-surface-variant" />
              </Link>
              {index < items.length - 1 ? (
                <div className="ml-14 h-px bg-surface-variant" />
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
