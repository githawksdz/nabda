import {
  HOME_MODE_OVERRIDE,
  userTemplateForMode,
} from "@/lib/home/home-ui-config";
import { PROFESSION_LABELS, type Profile } from "@/types/database";
import type { HomeMode, HomeUser } from "@/types/home";

function initialsFromName(name: string | null | undefined, fallback: string) {
  if (!name?.trim()) {
    return fallback;
  }
  const parts = name.trim().split(/\s+/);
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || fallback;
}

function firstName(name: string | null | undefined) {
  if (!name?.trim()) {
    return "";
  }
  return name.trim().split(/\s+/)[0] ?? "";
}

export function parseHomePreview(value: string | undefined): HomeMode | null {
  if (value === "incomplete") {
    return "incomplete";
  }
  if (value === "freemium" || value === "freemium-complete") {
    return "freemium-complete";
  }
  if (value === "pro" || value === "pro-practitioner") {
    return "pro-practitioner";
  }
  return null;
}

export function resolveHomeMode(
  profile: Profile | null,
  preview?: string,
  planSlug?: string | null,
): HomeMode {
  const fromPreview = parseHomePreview(preview);
  if (fromPreview === "incomplete") {
    return "incomplete";
  }

  if (HOME_MODE_OVERRIDE) {
    return HOME_MODE_OVERRIDE;
  }

  if (!profile || profile.profile_status === "incomplete" || !profile.onboarding_completed) {
    return "incomplete";
  }

  const slug = planSlug ?? "freemium";
  if (slug === "pro_yearly" || slug.startsWith("pro")) {
    return "pro-practitioner";
  }

  return "freemium-complete";
}

export function resolveHomeUser(profile: Profile | null, mode: HomeMode): HomeUser {
  const mock = userTemplateForMode(mode);
  if (!profile) {
    return mock;
  }

  const name = profile.full_name?.trim() || mock.fullName || "";
  const displayName =
    mode === "pro-practitioner"
      ? name
        ? `Dr. ${firstName(name)} ${name.split(/\s+/).slice(1).map((part) => `${part[0]}.`).join(" ")}`.trim()
        : mock.displayName
      : firstName(name) || mock.displayName;

  return {
    ...mock,
    id: profile.id,
    fullName: name || mock.fullName,
    displayName,
    initials: initialsFromName(name, mock.initials),
    professionLabel:
      profile.profession ? PROFESSION_LABELS[profile.profession] : mock.professionLabel,
    profileStatus: profile.profile_status,
    plan: mode === "pro-practitioner" ? "pro" : "freemium",
  };
}
