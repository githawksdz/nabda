import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";
import type { PlanPresentation } from "@/types/personal";

type PlanCardProps = {
  plan: PlanPresentation;
};

export function PlanCard({ plan }: PlanCardProps) {
  const badge =
    plan.variant === "pro"
      ? { label: "Pro", tone: "pro" as const }
      : plan.variant === "pending"
        ? { label: "En cours", tone: "stale" as const }
        : { label: "Gratuit", tone: "free" as const };

  return (
    <Surface variant="elevated" className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-headline-sm text-text-primary">{plan.title}</h2>
          <p className="mt-1 text-body-sm text-text-secondary">{plan.statusLabel}</p>
        </div>
        <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
      </div>
      <p className="text-body-sm text-text-secondary">{plan.body}</p>
      {plan.actionHref && plan.actionLabel ? (
        <Button href={plan.actionHref} variant="secondary">
          {plan.actionLabel}
        </Button>
      ) : null}
    </Surface>
  );
}
