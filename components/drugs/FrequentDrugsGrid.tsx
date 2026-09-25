import Link from "next/link";
import { DrugIcon } from "./DrugListRow";
import { drugIndexStatusLabel } from "@/lib/drugs/status-labels";
import type { DrugSummary } from "@/types/drugs";

type FrequentDrugsGridProps = {
  drugs: DrugSummary[];
};

export function FrequentDrugsGrid({ drugs }: FrequentDrugsGridProps) {
  if (drugs.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-headline-sm">Consultés souvent</h2>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {drugs.map((drug) => (
          <Link
            key={drug.id}
            href={drug.href}
            className="flex min-h-[132px] flex-col rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm motion-surface active:bg-surface-container"
          >
            <span className="flex items-start justify-between gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-surface-container-low">
                <DrugIcon
                  name={drug.iconName}
                  className="size-4 text-on-surface"
                />
              </span>
              <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
                {drug.shortClassName ?? drug.className}
              </span>
            </span>
            <span className="mt-auto pt-3">
              <span className="block text-body-md font-medium">
                {drug.genericName}
              </span>
              <span className="mt-1.5 block text-label-sm text-on-surface-variant">
                {drugIndexStatusLabel(drug)}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
