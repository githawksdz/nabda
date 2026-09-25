import { ChevronRight, FileText, GitBranch } from "lucide-react";
import Link from "next/link";
import { COCKCROFT_LINKED_RESOURCES } from "@/lib/calculators/cockcroft-gault";
import { cn } from "@/lib/utils";

export function CockcroftLinkedResources() {
  return (
    <section>
      <h2 className="text-headline-sm">Ressources liées</h2>
      <div className="mt-3 flex flex-col gap-2">
        {COCKCROFT_LINKED_RESOURCES.map((resource) => {
          const inner = (
            <>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-low">
                {resource.kind === "cat" ? (
                  <GitBranch
                    className="size-4 text-on-surface"
                    strokeWidth={1.75}
                  />
                ) : (
                  <FileText
                    className="size-4 text-on-surface"
                    strokeWidth={1.75}
                  />
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
              {resource.disabled ? null : (
                <ChevronRight
                  className="size-4 shrink-0 text-outline"
                  strokeWidth={1.75}
                />
              )}
            </>
          );

          if (resource.disabled || !resource.href) {
            return (
              <div
                key={resource.id}
                className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3.5 text-on-surface-variant"
              >
                {inner}
              </div>
            );
          }

          return (
            <Link
              key={resource.id}
              href={resource.href}
              className={cn(
                "flex items-center gap-3 rounded-xl bg-surface-container-lowest p-3.5 shadow-sm motion-surface active:bg-surface-container",
              )}
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
