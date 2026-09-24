import Link from "next/link";
import { CatIcon } from "../cat-icons";
import type { CatContext } from "@/types/cat";

type CatContextCardProps = {
  context: CatContext;
};

export function CatContextCard({ context }: CatContextCardProps) {
  return (
    <Link
      href={context.href}
      className="flex h-28 flex-col justify-between rounded-xl bg-surface-container-lowest p-4 shadow-sm active:scale-[0.98]"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-surface-container-low">
        <CatIcon name={context.iconName} className="size-4" />
      </span>
      <span>
        <span className="block text-body-md font-medium">{context.label}</span>
        {context.count != null ? (
          <span className="mt-0.5 block text-body-sm text-on-surface-variant">
            {context.count} CAT
          </span>
        ) : null}
      </span>
    </Link>
  );
}
