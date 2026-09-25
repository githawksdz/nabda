export type AuthMode = "login" | "register" | null;

export type SoftMessageType = "info" | "success" | "warning" | "error";

export type WelcomeSlideId = "reflex" | "find" | "control";

export type WelcomeSlideData = {
  id: WelcomeSlideId;
  title: string;
  subtitle: string;
};

export const WELCOME_SLIDES: WelcomeSlideData[] = [
  {
    id: "reflex",
    title: "Votre réflexe clinique.",
    subtitle:
      "CAT, médicaments, scores et recommandations en un seul espace.",
  },
  {
    id: "find",
    title: "Retrouver vite.",
    subtitle: "Pensé pour la garde, le stage et la consultation.",
  },
  {
    id: "control",
    title: "Gardez le contrôle.",
    subtitle: "Une aide claire, sans remplacer le jugement clinique.",
  },
];

export const SOFT_MESSAGES = {
  invalidEmail: "Adresse email invalide.",
  addPassword: "Ajoutez votre mot de passe.",
  passwordTooShort: "Utilisez au moins 8 caractères.",
  emailTaken: "Cette adresse est déjà utilisée. Essayez de vous connecter.",
  invalidCredentials: "Email ou mot de passe incorrect.",
  loginUnavailable: "Connexion impossible pour le moment. Réessayez.",
  resetSent: "Si un compte existe, un lien sera envoyé.",
} as const;
