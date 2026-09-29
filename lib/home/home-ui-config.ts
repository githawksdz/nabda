import type { HomeMode, HomeUser } from "@/types/home";

/** Home shell chrome. Campaign sentences live in the home campaign catalog. */

/** Preview override if plan is not set: /home?preview=incomplete|freemium|pro */
export const HOME_MODE_OVERRIDE: HomeMode | null = null;

export const HOME_CHROME = {
  greeting: "Salut",
  resumeTitle: "Reprendre",
  resumeEmptyTitle: "Aucun protocole récent",
  resumeEmptyBody: "Les protocoles que vous ouvrez apparaîtront ici.",
  clinicalTitle: "Protocoles cliniques",
  clinicalPrompt: "Afficher par",
  clinicalEmptyTitle: "Aucun protocole à afficher",
  clinicalEmptyBody: "Les protocoles publiés apparaîtront ici.",
  profileProgressLabel: "Profil",
  feedUnavailable:
    "Les contenus récents n’ont pas pu être chargés. Réessayez dans un instant.",
} as const;

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
