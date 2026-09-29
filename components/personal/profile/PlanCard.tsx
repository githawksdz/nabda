import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ContentCard,
} from "@/components/ui/ContentCard";
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
    <ContentCard>
      <CardHeader>
        <CardTitle>{plan.title}</CardTitle>
        <CardDescription>{plan.statusLabel}</CardDescription>
        <CardAction>
          <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-body-sm text-muted-foreground">{plan.body}</p>
      </CardContent>
      {plan.actionHref && plan.actionLabel ? (
        <CardFooter>
          <Button href={plan.actionHref} variant="secondary">
            {plan.actionLabel}
          </Button>
        </CardFooter>
      ) : null}
    </ContentCard>
  );
}
