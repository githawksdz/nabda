import Link from "next/link";
import { ChevronRight, FileText, GitBranch } from "lucide-react";
import { GLASGOW_LINKED_RESOURCES } from "@/lib/calculators/glasgow";

export function GlasgowLinkedProtocolCard() {
  return (
    <section>
      <h2 className="text-headline-sm">Conduite à tenir associée</h2>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Consulter la CAT liée selon le contexte clinique.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {GLASGOW_LINKED_RESOURCES.map((resource) => (
          <Link
            key={resource.id}
            href={resource.href ?? "/calculators"}
            className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-3.5 shadow-sm motion-surface active:bg-surface-container"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-low">
              {resource.kind === "cat" ? (
                <GitBranch className="size-4 text-on-surface" strokeWidth={1.75} />
              ) : (
                <FileText className="size-4 text-on-surface" strokeWidth={1.75} />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-body-md font-medium">
                {resource.title}
              </span>
              {resource.subtitle ? (
                <span className="mt-0.5 block text-body-sm text-on-surface-variant">
                  {resource.subtitle}
                </span>
              ) : null}
            </span>
            <ChevronRight
              className="size-4 shrink-0 text-outline"
              strokeWidth={1.75}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
