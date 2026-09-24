import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  meta?: string;
  href?: string;
  icon?: ReactNode;
};

export function SectionHeader({ title, meta, href, icon }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="text-headline-sm">{title}</h2>
      {href && meta ? (
        <Link
          href={href}
          className="shrink-0 text-label-md text-on-surface-variant"
        >
          {meta}
        </Link>
      ) : meta ? (
        <span className={cn("shrink-0 text-label-md text-on-surface-variant")}>
          {meta}
        </span>
      ) : icon ? (
        <span className="text-on-surface-variant">{icon}</span>
      ) : null}
    </div>
  );
}
