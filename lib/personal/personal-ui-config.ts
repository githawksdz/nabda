/** Personal area UI copy, chips, and labels. */
import type { PersonalFilterChip } from "@/types/personal";

export const FAVORITES_COPY = {
  title: "Favoris",
  subtitle: "Vos références sauvegardées",
  emptyTitle: "Votre classeur est vide",
  emptyDescription:
    "Enregistrez une CAT, un score, une recommandation ou une fiche médicament pour les retrouver ici.",
  emptyAction: "Explorer Nabda",
  emptyHref: "/search",
  historyLinkLabel: "Voir l’historique",
  historyLinkHref: "/history",
  historyLinkHint: "Reprendre vos consultations récentes",
} as const;

export const HISTORY_COPY = {
  title: "Historique",
  subtitle: "Reprendre vos consultations",
  privacyNote: "L’historique est privé et visible uniquement par vous.",
  emptyTitle: "Aucune consultation récente",
  emptyDescription: "Les contenus ouverts récemment apparaîtront ici.",
  emptyAction: "Explorer Nabda",
  emptyHref: "/search",
  clearLabel: "Effacer l’historique",
  clearConfirm: "Effacer l’historique de consultation ?",
  clearCancel: "Annuler",
  clearError: "Impossible d’effacer l’historique pour le moment. Réessayez.",
  retentionHint:
    "Les consultations récentes restent visibles ici pour reprendre un contenu. Aucun résultat clinique n’est inventé.",
} as const;

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

export const FAVORITE_FILTER_CHIPS: PersonalFilterChip[] = [
  { id: "all", label: "Tous" },
  { id: "cat", label: "CAT" },
  { id: "protocol", label: "Recommandations" },
  { id: "calculator", label: "Scores" },
  { id: "drug", label: "Médicaments" },
];

export const HISTORY_FILTER_CHIPS: PersonalFilterChip[] = [
  { id: "all", label: "Tous" },
  { id: "calculator", label: "Scores" },
  { id: "cat", label: "CAT" },
  { id: "drug", label: "Médicaments" },
  { id: "protocol", label: "Recommandations" },
];

export const HISTORY_GROUP_TITLES = {
  today: "Aujourd’hui",
  week: "Cette semaine",
  older: "Plus ancien",
} as const;
