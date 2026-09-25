import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CatUpdate } from "@/types/cat";

type CatUpdateRowProps = {
  update: CatUpdate;
};

export function CatUpdateRow({ update }: CatUpdateRowProps) {
  return (
    <Link
      href={update.href}
      className="flex items-center gap-3 p-4 hover:bg-surface-container-low"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-body-md font-medium">{update.title}</span>
        <span className="mt-0.5 block text-body-sm text-on-surface-variant">
          {update.meta}
        </span>
      </span>
      {update.statusLabel ? (
        <span className="shrink-0 rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
          {update.statusLabel}
        </span>
      ) : null}
      <ChevronRight className="size-5 shrink-0 text-outline" strokeWidth={1.75} />
    </Link>
  );
}
