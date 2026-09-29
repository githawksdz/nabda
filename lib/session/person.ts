import type { Profession, Profile } from "@/types/database";

const DOCTOR_PROFESSIONS = new Set<Profession>([
  "intern",
  "resident",
  "generalist",
  "specialist",
  "dentist",
]);

const NAME_LOCALE = "fr-FR";

export type ShellPerson = {
  displayName: string;
  initials: string;
  avatarUrl: string | null;
  isDoctor: boolean;
};

function nameTokens(name: string) {
  return name.trim().split(/\s+/).filter(Boolean);
}

export function capitalizeNamePart(part: string) {
  return part
    .split(/([-'])/)
    .map((chunk) => {
      if (chunk === "-" || chunk === "'") {
        return chunk;
      }
      if (!chunk) {
        return chunk;
      }
      const lower = chunk.toLocaleLowerCase(NAME_LOCALE);
      return lower.charAt(0).toLocaleUpperCase(NAME_LOCALE) + lower.slice(1);
    })
    .join("");
}

export function firstNameFromFullName(name: string | null | undefined) {
  if (!name?.trim()) {
    return "";
  }
  return capitalizeNamePart(nameTokens(name)[0] ?? "");
}

export function lastNameFromFullName(name: string | null | undefined) {
  if (!name?.trim()) {
    return "";
  }
  const tokens = nameTokens(name);
  if (tokens.length < 2) {
    return "";
  }
  return tokens.slice(1).map(capitalizeNamePart).join(" ");
}

export function initialsFromName(name: string | null | undefined, fallback = "ND") {
  if (!name?.trim()) {
    return fallback;
  }
  const letters = nameTokens(name)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase(NAME_LOCALE) ?? "");
  return letters.join("") || fallback;
}

/** Top-bar name: first-name initial, point, then last name — e.g. "A. Bentoumi". */
export function formatShellDisplayName(name: string | null | undefined) {
  const given = firstNameFromFullName(name);
  const family = lastNameFromFullName(name);
  if (!given) {
    return family;
  }
  if (!family) {
    return given;
  }
  return `${given.charAt(0).toLocaleUpperCase(NAME_LOCALE)}. ${family}`;
}

export function usesDoctorTitle(profession: Profession | null | undefined) {
  return Boolean(profession && DOCTOR_PROFESSIONS.has(profession));
}

export function displayNameWithTitle(
  name: string | null | undefined,
  profession: Profession | null | undefined,
) {
  const first = firstNameFromFullName(name);
  if (!first) {
    return "";
  }
  return usesDoctorTitle(profession) ? `Dr. ${first}` : first;
}

export function shellPersonFromProfile(profile: Profile | null): ShellPerson | null {
  if (!profile) {
    return null;
  }
  return {
    displayName: formatShellDisplayName(profile.full_name),
    initials: initialsFromName(profile.full_name),
    avatarUrl: profile.avatar_url,
    isDoctor: usesDoctorTitle(profile.profession),
  };
}
