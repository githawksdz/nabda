import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusChip } from "@/components/content-detail/StatusChip";
import type { CatStep } from "@/types/content-detail";

type CatStepsViewProps = {
  steps: CatStep[];
};

export function CatStepsView({ steps }: CatStepsViewProps) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-headline-sm">Lecture linéaire</h2>
        <p className="text-label-sm text-on-surface-variant">
          {steps.length} étapes
        </p>
      </div>
      <ol className="flex flex-col gap-2">
        {steps.map((step) => (
          <li
            key={step.id}
            className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-label-md text-on-primary">
                {step.order}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-body-md font-medium">{step.title}</h3>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  {step.description}
                </p>
                {step.chips && step.chips.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {step.chips.map((chip) => (
                      <StatusChip key={chip} label={chip} variant="outline" />
                    ))}
                  </div>
                ) : null}
                {step.branchNote ? (
                  <p className="mt-2 rounded-lg bg-error-container/60 px-2.5 py-2 text-label-sm">
                    {step.branchNote}
                  </p>
                ) : null}
                {step.linkedTool ? (
                  <Link
                    href={step.linkedTool.href}
                    className="mt-2 inline-flex items-center gap-1 text-label-md"
                  >
                    {step.linkedTool.title}
                    <ChevronRight className="size-3.5" strokeWidth={1.75} />
                  </Link>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
