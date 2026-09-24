import Link from "next/link";
import { CatIcon } from "./cat-icons";
import { CatUpdateRow } from "./cards/CatUpdateRow";
import type { CatUpdate } from "@/types/cat";

type CatLatestSectionProps = {
  updates: CatUpdate[];
};

export function CatLatestSection({ updates }: CatLatestSectionProps) {
  if (updates.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CatIcon name="refresh" className="size-4 text-on-surface-variant" />
          <h2 className="text-headline-sm">Nouveautés CAT</h2>
        </div>
        <Link href="/cat" className="text-label-md text-on-surface-variant">
          Tout voir
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
        {updates.map((update, index) => (
          <div key={update.id}>
            <CatUpdateRow update={update} />
            {index < updates.length - 1 ? (
              <div className="ml-4 h-px bg-surface-variant" />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
