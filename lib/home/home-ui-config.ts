import type { HomeMode, HomeUser, SearchChip } from "@/types/home";

/** Home shell UI copy and navigation chips — not clinical content. */

/** Preview override if plan is not set: /home?preview=incomplete|freemium|pro */
export const HOME_MODE_OVERRIDE: HomeMode | null = null;

export const insightHookCopy = {
  label: "À retenir aujourd'hui",
  body: "Le score de Glasgow est accessible directement dans vos raccourcis sans connexion réseau.",
};

export const proInsightHookCopy =
  "3 nouveautés publiées ce mois-ci correspondent à vos centres d'intérêt (Urgences & Soins Intensifs).";

export const profileCompletion = {
  percent: 60,
  meta: "1 étape restante · 2 min",
  title: "Complétez votre profil",
  subtitle:
    "Débloquez votre cadeau de bienvenue et personnalisez vos protocoles.",
};

export const incompleteSearchChips: SearchChip[] = [
  { id: "cat", label: "CAT", href: "/cat" },
  { id: "drugs", label: "Médicaments", href: "/drugs" },
  { id: "scores", label: "Scores", href: "/calculators" },
  { id: "doses", label: "Pédiatrie", href: "/drugs" },
];

export const freemiumSearchChips: SearchChip[] = [
  { id: "cat", label: "CAT", href: "/cat", active: true },
  { id: "scores", label: "Scores", href: "/calculators" },
  { id: "posologies", label: "Posologies", href: "/drugs" },
  { id: "protocols", label: "Protocoles", href: "/protocols" },
];

const incompleteUser: HomeUser = {
  id: "home-incomplete",
  displayName: "",
  initials: "ND",
  plan: "freemium",
  profileStatus: "incomplete",
};

const freemiumUser: HomeUser = {
  id: "home-freemium",
  fullName: "",
  displayName: "",
  initials: "ND",
  professionLabel: "",
  plan: "freemium",
  profileStatus: "complete",
};

const proUser: HomeUser = {
  id: "home-pro",
  fullName: "",
  displayName: "",
  initials: "ND",
  professionLabel: "",
  specialtyLabel: "",
  plan: "pro",
  profileStatus: "complete",
  verified: true,
};

/** Template user shape for home shell when profile fields are missing. */
export function userTemplateForMode(mode: HomeMode): HomeUser {
  if (mode === "pro-practitioner") {
    return proUser;
  }
  if (mode === "freemium-complete") {
    return freemiumUser;
  }
  return incompleteUser;
}
