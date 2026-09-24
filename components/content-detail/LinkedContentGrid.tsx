import Link from "next/link";
import { Calculator, ChevronRight, FileText, GitBranch, Pill } from "lucide-react";
import type { LinkedContentItem, LinkedContentType } from "@/types/content-detail";
import { LINKED_CONTENT_TITLE } from "@/lib/content-detail/content-detail-ui-config";

type LinkedContentGridProps = {
  items: LinkedContentItem[];
  title?: string;
};

function LinkedContentIcon({ type }: { type: LinkedContentType }) {
  const className = "size-4 text-on-surface";
  if (type === "cat") {
    return <GitBranch className={className} strokeWidth={1.75} />;
  }
  if (type === "calculator") {
    return <Calculator className={className} strokeWidth={1.75} />;
  }
  if (type === "drug") {
    return <Pill className={className} strokeWidth={1.75} />;
  }
  return <FileText className={className} strokeWidth={1.75} />;
}

export function LinkedContentGrid({
  items,
  title = LINKED_CONTENT_TITLE,
}: LinkedContentGridProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-3 text-headline-sm">{title}</h2>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-3.5 shadow-sm"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-low">
              <LinkedContentIcon type={item.type} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-body-md font-medium">{item.title}</span>
              {item.subtitle ? (
                <span className="mt-0.5 block text-body-sm text-on-surface-variant">
                  {item.subtitle}
                </span>
              ) : null}
            </span>
            <ChevronRight className="size-4 shrink-0 text-outline" strokeWidth={1.75} />
          </Link>
        ))}
      </div>
    </section>
  );
}
