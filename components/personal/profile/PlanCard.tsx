import Link from "next/link";
import type { PlanPresentation } from "@/types/personal";

type PlanCardProps = {
  plan: PlanPresentation;
};

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <section className="rounded-xl bg-surface-container-lowest p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-headline-sm">{plan.title}</h2>
          <p className="mt-1 text-label-sm text-on-surface-variant">
            {plan.statusLabel}
          </p>
        </div>
        <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
          {plan.variant === "pro"
            ? "Pro"
            : plan.variant === "pending"
              ? "En cours"
              : "Découverte"}
        </span>
      </div>
      <p className="mt-2 text-body-sm text-on-surface-variant">{plan.body}</p>
      {plan.actionHref && plan.actionLabel ? (
        <Link
          href={plan.actionHref}
          className="mt-4 inline-flex h-10 items-center rounded-lg bg-surface-container-low px-3 text-label-md"
        >
          {plan.actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
