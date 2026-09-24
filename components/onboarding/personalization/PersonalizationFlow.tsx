"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  completeOnboarding,
  skipOnboarding,
  updateProfession,
  updateUsageMode,
  updateUserInterests,
} from "@/features/onboarding/api";
import type { PersonalizationPageData, PersonalizationStep } from "@/features/onboarding/types";
import { cn } from "@/lib/utils";
import {
  CLINICAL_CONSENT_TEXT,
  PROFESSION_LABELS,
  PROFESSIONS,
  USAGE_MODE_LABELS,
  USAGE_MODES,
  type Profession,
  type UsageMode,
} from "@/types/database";
import { MobileShell } from "@/components/layout/MobileShell";
import { SoftMessage } from "@/components/onboarding/SoftMessage";

const STEPS: PersonalizationStep[] = [
  "profession",
  "interests",
  "usage",
  "consent",
];

const SAVE_ERROR = "Enregistrement impossible pour le moment. Réessayez.";

type PersonalizationFlowProps = {
  initial: PersonalizationPageData;
};

type PersistResult = { ok: boolean; message?: string };

export function PersonalizationFlow({ initial }: PersonalizationFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<PersonalizationStep>("profession");
  const [profession, setProfession] = useState<Profession | null>(
    initial.profession,
  );
  const [interestIds, setInterestIds] = useState<string[]>(
    initial.selectedInterestIds,
  );
  const [usageMode, setUsageMode] = useState<UsageMode | null>(
    initial.usageMode,
  );
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const stepIndex = STEPS.indexOf(step);
  const consentReady = Boolean(profession && usageMode && accepted);

  function selectedInterestLabels() {
    return initial.interests
      .filter((interest) => interestIds.includes(interest.id))
      .map((interest) => interest.label);
  }

  function goHome() {
    router.push("/home");
    router.refresh();
  }

  function toggleInterest(id: string) {
    setInterestIds((current) => {
      if (current.includes(id)) {
        return current.filter((value) => value !== id);
      }
      if (current.length >= 5) {
        return current;
      }
      return [...current, id];
    });
    setError(null);
  }

  async function persist(action: () => Promise<PersistResult>) {
    try {
      const result = await action();
      if (!result.ok) {
        setError(result.message ?? SAVE_ERROR);
        setPending(false);
        return false;
      }
      return true;
    } catch {
      setError(SAVE_ERROR);
      setPending(false);
      return false;
    }
  }

  async function onSkip() {
    setPending(true);
    setError(null);
    const saved = await persist(skipOnboarding);
    if (!saved) {
      return;
    }
    setPending(false);
    goHome();
  }

  async function onContinue() {
    setError(null);
    setPending(true);

    if (step === "profession") {
      if (!profession) {
        setPending(false);
        setError("Choisissez une profession.");
        return;
      }
      const saved = await persist(() => updateProfession(profession));
      if (!saved) {
        return;
      }
      setPending(false);
      setStep("interests");
      return;
    }

    if (step === "interests") {
      if (initial.interests.length > 0 && interestIds.length === 0) {
        setPending(false);
        setError("Choisissez au moins un intérêt.");
        return;
      }
      if (interestIds.length > 0) {
        const saved = await persist(() => updateUserInterests(interestIds));
        if (!saved) {
          return;
        }
      }
      setPending(false);
      setStep("usage");
      return;
    }

    if (step === "usage") {
      if (!usageMode) {
        setPending(false);
        setError("Choisissez un mode d’usage.");
        return;
      }
      const saved = await persist(() => updateUsageMode(usageMode));
      if (!saved) {
        return;
      }
      setPending(false);
      setStep("consent");
      return;
    }

    if (!profession || !usageMode) {
      setPending(false);
      setError("Complétez votre profil avant d’accéder à Nabda.");
      return;
    }

    if (!accepted) {
      setPending(false);
      setError("Le consentement clinique est requis.");
      return;
    }

    const saved = await persist(() =>
      completeOnboarding({
        profession,
        usageMode,
        interestIds,
        accepted: true,
      }),
    );
    if (!saved) {
      return;
    }
    setPending(false);
    goHome();
  }

  return (
    <MobileShell>
      <header className="flex h-12 shrink-0 items-center justify-between">
        <span className="text-[15px] font-semibold tracking-tight">Nabda</span>
        {step !== "consent" ? (
          <button
            type="button"
            onClick={onSkip}
            disabled={pending}
            className="text-[14px] text-on-surface-variant disabled:opacity-60"
          >
            Passer
          </button>
        ) : (
          <span className="text-[14px] text-on-surface-variant">
            {stepIndex + 1}/{STEPS.length}
          </span>
        )}
      </header>

      <div className="flex gap-1.5 py-3">
        {STEPS.map((item, index) => (
          <span
            key={item}
            className={cn(
              "h-1 flex-1 rounded-full",
              index <= stepIndex ? "bg-primary" : "bg-surface-variant",
            )}
          />
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto no-scrollbar">
        {step === "profession" ? (
          <section className="flex flex-col gap-4">
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight">
                Votre profession
              </h1>
              <p className="mt-1 text-[14px] text-on-surface-variant">
                Pour adapter les contenus à votre pratique.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {PROFESSIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setProfession(value)}
                  className={cn(
                    "h-12 rounded-lg px-4 text-left text-[15px]",
                    profession === value
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface",
                  )}
                >
                  {PROFESSION_LABELS[value]}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {step === "interests" ? (
          <section className="flex flex-col gap-4">
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight">
                Vos intérêts
              </h1>
              <p className="mt-1 text-[14px] text-on-surface-variant">
                Jusqu’à 5 domaines, chargés depuis Nabda.
              </p>
            </div>
            {initial.interests.length === 0 ? (
              <SoftMessage type="warning">
                Aucun intérêt n’est disponible pour le moment.
              </SoftMessage>
            ) : (
              <div className="flex flex-wrap gap-2">
                {initial.interests.map((interest) => {
                  const selected = interestIds.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.id)}
                      className={cn(
                        "rounded-full px-3 py-2 text-[13px]",
                        selected
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-low text-on-surface",
                      )}
                    >
                      {interest.label}
                    </button>
                  );
                })}
              </div>
            )}
            <p className="text-[12px] text-on-surface-variant">
              {interestIds.length}/5 sélectionnés
            </p>
          </section>
        ) : null}

        {step === "usage" ? (
          <section className="flex flex-col gap-4">
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight">
                Mode d’usage
              </h1>
              <p className="mt-1 text-[14px] text-on-surface-variant">
                Comment allez-vous utiliser Nabda le plus souvent ?
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {USAGE_MODES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setUsageMode(value)}
                  className={cn(
                    "h-12 rounded-lg px-4 text-left text-[15px]",
                    usageMode === value
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface",
                  )}
                >
                  {USAGE_MODE_LABELS[value]}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {step === "consent" ? (
          <section className="flex flex-col gap-4">
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight">
                Récapitulatif
              </h1>
              <p className="mt-1 text-[14px] text-on-surface-variant">
                Vérifiez votre profil avant d’accéder à Nabda.
              </p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-4 text-[14px]">
              <p>
                <span className="text-on-surface-variant">Nom</span>
                <br />
                {initial.fullName ?? "—"}
              </p>
              <p className="mt-3">
                <span className="text-on-surface-variant">Profession</span>
                <br />
                {profession ? PROFESSION_LABELS[profession] : "—"}
              </p>
              <p className="mt-3">
                <span className="text-on-surface-variant">Intérêts</span>
                <br />
                {selectedInterestLabels().join(", ") || "—"}
              </p>
              <p className="mt-3">
                <span className="text-on-surface-variant">Usage</span>
                <br />
                {usageMode ? USAGE_MODE_LABELS[usageMode] : "—"}
              </p>
            </div>
            <label className="flex items-start gap-3 rounded-xl bg-surface-container-low p-4 text-[13px] leading-snug">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => {
                  setAccepted(event.target.checked);
                  setError(null);
                }}
                className="mt-0.5 size-4 accent-primary"
              />
              <span>{CLINICAL_CONSENT_TEXT}</span>
            </label>
          </section>
        ) : null}

        {error ? (
          <div className="mt-4">
            <SoftMessage type="error">{error}</SoftMessage>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 pt-3 pb-2">
        <button
          type="button"
          onClick={onContinue}
          disabled={pending || (step === "consent" && !consentReady)}
          className="h-[54px] w-full rounded-lg bg-primary text-[16px] font-medium text-on-primary disabled:opacity-60"
        >
          {pending
            ? "Enregistrement..."
            : step === "consent"
              ? "Accéder à Nabda"
              : "Continuer"}
        </button>
      </div>
    </MobileShell>
  );
}
