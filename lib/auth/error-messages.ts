const FALLBACK = "Une erreur est survenue. Réessayez.";

export function mapAuthError(error: unknown): string {
  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "";
  const normalized = message.toLowerCase();

  if (
    normalized.includes("user already registered") ||
    normalized.includes("already registered") ||
    normalized.includes("already exists")
  ) {
    return "Cette adresse est déjà utilisée. Essayez de vous connecter.";
  }

  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid credentials")
  ) {
    return "Email ou mot de passe incorrect.";
  }

  if (
    normalized.includes("email not confirmed") ||
    normalized.includes("not confirmed")
  ) {
    return "Veuillez confirmer votre email avant de vous connecter.";
  }

  if (normalized.includes("weak password") || normalized.includes("password should")) {
    return "Choisissez un mot de passe plus sécurisé.";
  }

  if (
    normalized.includes("rate limit") ||
    normalized.includes("too many requests") ||
    normalized.includes("over_request_rate")
  ) {
    return "Trop de tentatives. Réessayez dans quelques minutes.";
  }

  if (
    normalized.includes("failed to fetch") ||
    normalized.includes("network") ||
    normalized.includes("fetch")
  ) {
    return "Connexion impossible pour le moment. Réessayez.";
  }

  if (
    normalized.includes("provider is not enabled") ||
    normalized.includes("unsupported provider") ||
    normalized.includes("oauth")
  ) {
    return "Connexion Google indisponible pour le moment.";
  }

  if (normalized.includes("supabase environment")) {
    return "Connexion impossible pour le moment. Réessayez.";
  }

  return FALLBACK;
}

export const AUTH_INFO = {
  confirmEmail: "Vérifiez votre email pour confirmer votre compte.",
  resetSent: "Si un compte existe, un lien sera envoyé.",
  googleUnavailable: "Connexion Google indisponible pour le moment.",
} as const;
