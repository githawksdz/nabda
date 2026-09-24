import Link from "next/link";
import { ChevronRight, FileText, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LinkedDrugResource } from "@/types/drugs";

type DrugLinkedResourcesProps = {
  title: string;
  items: LinkedDrugResource[];
  note?: string;
};

export function DrugLinkedResources({
  title,
  items,
  note,
}: DrugLinkedResourcesProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-headline-sm">{title}</h2>
      {note ? (
        <p className="mt-1 text-body-sm text-on-surface-variant">{note}</p>
      ) : null}
      <div className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl bg-surface-container-lowest p-3.5 shadow-sm active:scale-[0.99]",
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-low">
              {item.href.startsWith("/cat") ? (
                <GitBranch className="size-4 text-on-surface" strokeWidth={1.75} />
              ) : (
                <FileText className="size-4 text-on-surface" strokeWidth={1.75} />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-body-md font-medium">{item.label}</span>
              <span className="mt-0.5 block text-body-sm text-on-surface-variant">
                {item.subtitle ?? item.status ?? "À vérifier"}
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-outline" strokeWidth={1.75} />
          </Link>
        ))}
      </div>
    </section>
  );
}
