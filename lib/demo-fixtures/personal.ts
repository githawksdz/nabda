// Demo-mode fixture only. Do not import from production runtime providers.

import type { FavoriteItem, HistoryItem, UserProfileSummary } from "@/types/personal";
import { withComputedCompletion } from "@/lib/personal/profile-completion";

export function getMockFavoriteItems(now = new Date()): FavoriteItem[] {
  const savedAt = now.toISOString();

  return [
    {
      id: "mock-fav-cat-douleur-thoracique",
      entityType: "cat",
      entitySlug: "douleur-thoracique",
      title: "Douleur thoracique aiguë",
      subtitle: "Arbre décisionnel sauvegardé",
      href: "/cat/douleur-thoracique?tab=carte",
      statusLabel: "En préparation",
      kindLabel: "CAT",
      savedAt,
    },
    {
      id: "mock-fav-calculator-glasgow",
      entityType: "calculator",
      entitySlug: "glasgow",
      title: "Score de Glasgow",
      subtitle: "Aide au calcul neurologique",
      href: "/calculators/glasgow",
      statusLabel: "Calculateur dynamique",
      kindLabel: "Score clinique",
      savedAt,
    },
    {
      id: "mock-fav-drug-amoxicilline",
      entityType: "drug",
      entitySlug: "amoxicilline",
      title: "Amoxicilline",
      subtitle: "Fiche médicament sauvegardée",
      href: "/drugs/amoxicilline",
      statusLabel: "Révision requise",
      kindLabel: "Médicament",
      savedAt,
    },
    {
      id: "mock-fav-protocol-cephalees",
      entityType: "protocol",
      entitySlug: "cephalees-brutales-hsa",
      title: "Céphalées brutales",
      subtitle: "Synthèse clinique sauvegardée",
      href: "/protocols/cephalees-brutales-hsa",
      statusLabel: "Révision médicale requise",
      kindLabel: "Recommandation",
      savedAt,
    },
  ];
}

export function getMockHistoryItems(now = new Date()): HistoryItem[] {
  const today = new Date(now);
  const thisWeek = new Date(now);
  thisWeek.setDate(thisWeek.getDate() - 3);
  const older = new Date(now);
  older.setDate(older.getDate() - 18);

  const laterToday = new Date(today);
  laterToday.setHours(Math.max(8, today.getHours() - 2), 12, 0, 0);

  return [
    {
      id: "mock-hist-glasgow",
      entityType: "calculator",
      entitySlug: "glasgow",
      title: "Score de Glasgow",
      subtitle: "Aide au calcul neurologique",
      href: "/calculators/glasgow",
      viewedAt: today.toISOString(),
      kindLabel: "Score",
    },
    {
      id: "mock-hist-cat-douleur",
      entityType: "cat",
      entitySlug: "douleur-thoracique",
      title: "Douleur thoracique aiguë",
      subtitle: "Arbre décisionnel",
      href: "/cat/douleur-thoracique",
      viewedAt: laterToday.toISOString(),
      kindLabel: "CAT",
    },
    {
      id: "mock-hist-amoxicilline",
      entityType: "drug",
      entitySlug: "amoxicilline",
      title: "Amoxicilline",
      subtitle: "Fiche médicament",
      href: "/drugs/amoxicilline",
      viewedAt: thisWeek.toISOString(),
      kindLabel: "Médicament",
    },
    {
      id: "mock-hist-cockcroft",
      entityType: "calculator",
      entitySlug: "cockcroft-gault",
      title: "Cockcroft-Gault",
      subtitle: "Clairance estimée",
      href: "/calculators/cockcroft-gault",
      viewedAt: new Date(thisWeek.getTime() - 36 * 60 * 60 * 1000).toISOString(),
      kindLabel: "Calculateur",
    },
    {
      id: "mock-hist-cephalees",
      entityType: "protocol",
      entitySlug: "cephalees-brutales-hsa",
      title: "Céphalées brutales",
      subtitle: "Synthèse clinique",
      href: "/protocols/cephalees-brutales-hsa",
      viewedAt: older.toISOString(),
      kindLabel: "Recommandation",
    },
  ];
}

export const MOCK_PERSONAL_CATALOG: Record<
  string,
  { title: string; subtitle: string; statusLabel?: string; kindLabel?: string }
> = {
  "cat:douleur-thoracique": {
    title: "Douleur thoracique aiguë",
    subtitle: "Arbre décisionnel",
    statusLabel: "En préparation",
    kindLabel: "CAT",
  },
  "calculator:glasgow": {
    title: "Score de Glasgow",
    subtitle: "Aide au calcul neurologique",
    statusLabel: "Calculateur dynamique",
    kindLabel: "Score",
  },
  "drug:amoxicilline": {
    title: "Amoxicilline",
    subtitle: "Fiche médicament",
    statusLabel: "Révision requise",
    kindLabel: "Médicament",
  },
  "protocol:cephalees-brutales-hsa": {
    title: "Céphalées brutales",
    subtitle: "Synthèse clinique",
    statusLabel: "Révision médicale requise",
    kindLabel: "Recommandation",
  },
  "calculator:cockcroft-gault": {
    title: "Cockcroft-Gault",
    subtitle: "Clairance estimée",
    statusLabel: "Calculateur dynamique",
    kindLabel: "Calculateur",
  },
};

export const PROFILE_COPY = {
  title: "Profil",
  contextEyebrow: "Mon espace",
  contextSubtitle: "Paramètres & profil clinique",
  completionTitle: "Complétez votre profil",
  completionBody:
    "Personnalisez vos CAT, scores fréquents et contenus prioritaires selon votre pratique.",
  completionPack: "Pack de démarrage disponible",
  completionCta: "Compléter maintenant",
  completionDefer: "Plus tard",
  completionHref: "/profile?complete=1",
  practiceTitle: "Pratique & contexte",
  preferencesTitle: "Préférences d’application",
  accountTitle: "Compte & sécurité",
  unsetValue: "Non renseigné",
  experienceLabel: "Niveau d’expérience",
  regionLabel: "Région",
  institutionLabel: "Structure",
  practiceContextLabel: "Contexte de pratique",
  catUpdatesLabel: "Mises à jour des CAT",
  catUpdatesError:
    "Impossible d’enregistrer cette préférence pour le moment. Réessayez.",
  offlineCacheLabel: "Mise en cache hors-ligne",
  offlineCacheValue: "Pro",
  languageLabel: "Langue du référentiel",
  languageValue: "Français",
  displayLabel: "Affichage",
  displayValue: "Automatique",
  securityLabel: "Sécurité & mot de passe",
  securityHref: "/auth/update-password",
  privacyLabel: "Confidentialité des données",
  privacyNote:
    "Vos informations de compte restent visibles uniquement par vous.",
  supportLabel: "Aide & support",
  supportNote: "L’aide et le support seront ajoutés ici.",
  signOutLabel: "Déconnexion",
  signOutConfirm: "Se déconnecter de Nabda ?",
  signOutCancel: "Annuler",
  signOutError: "Déconnexion impossible pour le moment. Réessayez.",
} as const;

export const PERSONALIZATION_COPY = {
  title: "Personnaliser Nabda",
  subtitle: "Quelques choix suffisent pour adapter l’accueil à votre pratique.",
  stepper: "Étape 2 sur 3 · Personnalisation rapide",
  specialtiesLabel: "Spécialités",
  prioritiesLabel: "Priorités",
  rewardTitle: "Pack de démarrage personnalisé",
  rewardBody:
    "Un raccourci vers vos scores, CAT et fiches fréquentes, sans recherche manuelle.",
  rewardStatus: "Prêt à configurer",
  activate: "Activer mon espace personnalisé",
  activating: "Configuration en cours…",
  saved: "Configuration enregistrée",
  saveError:
    "Impossible d’enregistrer la personnalisation pour le moment. Réessayez.",
  skip: "Passer pour l’instant",
} as const;

const INCOMPLETE_PROFILE: Omit<UserProfileSummary, "completionPercent" | "initials"> & {
  initials?: string;
} = {
  id: "mock-profile-incomplete",
  fullName: undefined,
  profession: undefined,
  specialtyInterests: [],
  usageMode: undefined,
  experienceLevel: undefined,
  institution: undefined,
  region: undefined,
  practiceContext: undefined,
  planSlug: "freemium",
  planStatus: "active",
  onboardingCompleted: false,
  profileCompleted: false,
  catUpdatesEnabled: true,
};

const COMPLETE_PROFILE: Omit<UserProfileSummary, "completionPercent" | "initials"> & {
  initials?: string;
} = {
  id: "mock-profile-complete",
  fullName: "Anes Bentoumi",
  profession: "Interne",
  specialtyInterests: ["Urgences", "Cardiologie"],
  usageMode: "Garde",
  experienceLevel: undefined,
  institution: undefined,
  region: undefined,
  practiceContext: undefined,
  planSlug: "freemium",
  planStatus: "active",
  onboardingCompleted: true,
  profileCompleted: true,
  catUpdatesEnabled: true,
};

const PRO_PROFILE: Omit<UserProfileSummary, "completionPercent" | "initials"> & {
  initials?: string;
} = {
  ...COMPLETE_PROFILE,
  id: "mock-profile-pro",
  planSlug: "pro_yearly",
  planStatus: "active",
};

export function getMockProfileSummary(
  variant: "incomplete" | "complete" | "pro" = "incomplete",
): UserProfileSummary {
  if (variant === "pro") {
    return withComputedCompletion(PRO_PROFILE);
  }
  if (variant === "complete") {
    return withComputedCompletion(COMPLETE_PROFILE);
  }
  return withComputedCompletion(INCOMPLETE_PROFILE);
}
