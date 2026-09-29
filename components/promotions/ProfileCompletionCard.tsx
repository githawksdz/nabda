import { Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";
import type {
  ProfileCompletionCardData,
  ProfileStep,
} from "@/lib/promotions/types";
import { cn } from "@/lib/utils";

type ProfileCompletionCardProps = {
  data: ProfileCompletionCardData;
  onDefer?: () => void;
  className?: string;
};

function isVerificationFlow(data: ProfileCompletionCardData): boolean {
  return (
    data.verificationStatus !== "not_applicable" &&
    data.verificationStatus !== "verified"
  );
}

function remainingCount(data: ProfileCompletionCardData): number {
  return data.remainingSteps.length + (data.currentStep ? 1 : 0);
}

function headline(data: ProfileCompletionCardData): string {
  const remaining = remainingCount(data);
  if (isVerificationFlow(data)) {
    return remaining === 1
      ? "Votre vérification est presque terminée"
      : "Plus que quelques étapes pour vérifier votre profil";
  }
  if (data.completionPercent === 0) {
    return "Complétez votre profil";
  }
  if (remaining <= 1) {
    return "Votre profil est presque prêt";
  }
  return "Votre profil est presque prêt";
}

function unlockCopy(data: ProfileCompletionCardData): string {
  if (data.unlockBenefit === "drug_dosage") {
    return "Finalisez votre vérification pour accéder aux posologies réservées.";
  }
  if (isVerificationFlow(data)) {
    return "Cette vérification confirme votre statut professionnel avant l’accès aux contenus réservés.";
  }
  if (data.unlockBenefit === "offline_pack") {
    return "Finalisez votre profil pour préparer vos packs hors-ligne.";
  }
  return "Finalisez votre profil pour personnaliser vos contenus et votre page d’accueil.";
}

function ctaLabel(data: ProfileCompletionCardData): string {
  if (isVerificationFlow(data)) {
    return "Continuer la vérification";
  }
  if (data.completionPercent === 0) {
    return `Commencer · ${data.estimatedMinutes} min`;
  }
  if (remainingCount(data) <= 1) {
    return "Terminer mon profil";
  }
  return `Continuer · ${data.estimatedMinutes} min`;
}

function visibleChecklistSteps(data: ProfileCompletionCardData): ProfileStep[] {
  const upcoming = [
    ...(data.currentStep ? [data.currentStep] : []),
    ...data.remainingSteps,
  ];
  const remainingSlots = Math.max(0, 4 - upcoming.length);
  const completedTail = data.completedSteps.slice(-remainingSlots);
  return [...completedTail, ...upcoming].slice(0, 4);
}

function StepIcon({ step }: { step: ProfileStep }) {
  if (step.status === "completed") {
    return (
      <Check
        className="mt-0.5 size-4 shrink-0 text-[var(--promo-progress)]"
        strokeWidth={2.25}
        aria-hidden
      />
    );
  }
  if (step.status === "action_required") {
    return (
      <span
        className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--status-warning)]"
        aria-hidden
      />
    );
  }
  return (
    <Circle
      className={cn(
        "mt-0.5 size-4 shrink-0",
        step.status === "current"
          ? "text-[var(--status-info)]"
          : "text-border-default",
      )}
      strokeWidth={1.75}
      aria-hidden
    />
  );
}

export function ProfileCompletionCard({
  data,
  onDefer,
  className,
}: ProfileCompletionCardProps) {
  const totalSteps =
    data.completedSteps.length +
    data.remainingSteps.length +
    (data.currentStep ? 1 : 0);
  const completedCount = data.completedSteps.length;
  const checklist = visibleChecklistSteps(data);

  return (
    <Surface
      as="article"
      variant="elevated"
      className={cn(
        "promo-profile-card flex flex-col gap-2.5 p-4 ring-1 ring-foreground/10",
        className,
      )}
      aria-labelledby="profile-completion-title"
    >
      <header className="flex flex-col gap-1">
        <p className="text-label-sm text-text-secondary">Profil</p>
        <h2 id="profile-completion-title" className="text-headline-md text-balance">
          {headline(data)}
        </h2>
        <p className="text-body-sm text-text-secondary">
          {completedCount} étapes sur {totalSteps} terminées
          {data.estimatedMinutes > 0
            ? ` · environ ${data.estimatedMinutes} min`
            : null}
        </p>
      </header>

      <ul className="flex flex-col gap-1" aria-label="Étapes du profil">
        {checklist.map((step) => (
          <li
            key={step.id}
            className={cn(
              "flex items-start gap-2 py-0.5 text-body-sm",
              step.status === "completed" && "text-text-secondary",
              step.status === "current" && "font-semibold text-text-primary",
              step.status === "remaining" && "text-text-secondary",
              step.status === "action_required" &&
                "font-medium text-[var(--status-warning)]",
            )}
          >
            <StepIcon step={step} />
            <span className="min-w-0 text-pretty">
              {step.message ?? step.label}
            </span>
          </li>
        ))}
      </ul>

      <progress
        className="promo-profile-progress"
        value={data.completionPercent}
        max={100}
        aria-label={`Profil complété à ${data.completionPercent} %`}
      />

      <p className="max-w-[36rem] text-body-sm text-pretty text-text-secondary">
        {unlockCopy(data)}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button href={data.continueHref}>{ctaLabel(data)}</Button>
        {onDefer ? (
          <Button variant="ghost" onClick={onDefer}>
            Plus tard
          </Button>
        ) : null}
      </div>
    </Surface>
  );
}
