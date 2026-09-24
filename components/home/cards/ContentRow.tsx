import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HomeIcon } from "@/components/home/home-icons";
import type { RecommendationRow } from "@/types/home";

type ContentRowProps = {
  row: RecommendationRow;
};

export function ContentRow({ row }: ContentRowProps) {
  return (
    <Link
      href={row.href}
      className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-4 shadow-sm"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-low">
        <HomeIcon name={row.icon} className="size-5 text-on-surface" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body-md font-medium">{row.title}</span>
        <span className="mt-0.5 block text-body-sm text-on-surface-variant">
          {row.specialty}
          {row.typeLabel ? ` · ${row.typeLabel}` : ""}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-on-surface-variant" />
    </Link>
  );
}
