import type { ProPainPointId, ProPainPointVariant } from "@/lib/promotions/types";

const PRO_ONBOARDING_HREF = "/pro";

export const PRO_PAIN_POINT_VARIANTS: Record<ProPainPointId, ProPainPointVariant> = {
  offline: {
    id: "offline",
    eyebrow: "Pendant une garde",
    headline: "Pas de réseau au mauvais moment.",
    description:
      "Vos protocoles et scores restent ouverts, même sans internet.",
    benefits: [
      "Lire un protocole hors connexion",
      "Garder un score sous la main",
    ],
    accent: "teal",
    onboardingHref: PRO_ONBOARDING_HREF,
  },
  shift_preparation: {
    id: "shift_preparation",
    eyebrow: "Garde",
    headline: "Préparez votre garde avant qu’elle commence.",
    description:
      "Emportez les protocoles et scores dont vous aurez besoin ce soir.",
    benefits: [
      "Préparer les fiches avant d’y aller",
      "Les rouvrir même sans réseau",
    ],
    accent: "indigo",
    onboardingHref: PRO_ONBOARDING_HREF,
  },
  calculators: {
    id: "calculators",
    eyebrow: "Scores",
    headline: "Vos scores essentiels, toujours prêts.",
    description: "Un score déjà ouvert reste utilisable si le réseau lâche.",
    benefits: [
      "Ouvrir un score hors connexion",
      "Le retrouver pendant la garde",
    ],
    accent: "blue",
    onboardingHref: PRO_ONBOARDING_HREF,
  },
  clinical_access: {
    id: "clinical_access",
    eyebrow: "Références",
    headline: "Allez plus loin dans vos références cliniques.",
    description:
      "Accédez aux protocoles et outils réservés, en ligne et hors ligne.",
    benefits: [
      "Protocoles plus complets",
      "Les mêmes outils hors connexion",
    ],
    accent: "indigo",
    onboardingHref: PRO_ONBOARDING_HREF,
  },
  default: {
    id: "default",
    eyebrow: "Nabda Pro",
    headline: "Vos outils de garde, même sans réseau.",
    description:
      "Gardez protocoles, médicaments et scores sous la main, même hors connexion.",
    benefits: [
      "Lire un protocole sans internet",
      "Utiliser un score pendant la garde",
    ],
    accent: "teal",
    onboardingHref: PRO_ONBOARDING_HREF,
  },
};

export type PainPointSelectionContext = {
  offlineManager?: boolean;
  calculatorIndex?: boolean;
  attemptedProAction?: boolean;
};

export function selectPainPointVariant(
  context: PainPointSelectionContext,
): ProPainPointVariant {
  if (context.offlineManager) {
    return PRO_PAIN_POINT_VARIANTS.offline;
  }
  if (context.attemptedProAction) {
    return PRO_PAIN_POINT_VARIANTS.clinical_access;
  }
  if (context.calculatorIndex) {
    return PRO_PAIN_POINT_VARIANTS.calculators;
  }
  return PRO_PAIN_POINT_VARIANTS.default;
}

/** Session-stable key for client caches (no randomness). */
export function painPointSessionStorageKey(userId: string | null): string {
  return `nabda:pain-point:${userId ?? "anonymous"}`;
}
