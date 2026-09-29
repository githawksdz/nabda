import { HOME_MODE_OVERRIDE, userTemplateForMode } from "@/lib/home/home-ui-config";
import { displayNameWithTitle, initialsFromName } from "@/lib/session/person";
import { PROFESSION_LABELS, USAGE_MODE_LABELS, type Profile } from "@/types/database";
import type { HomeMode, HomeUser } from "@/types/home";

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
  const displayName = displayNameWithTitle(name, profile.profession) || mock.displayName;

  return {
    ...mock,
    id: profile.id,
    fullName: name || mock.fullName,
    displayName,
    initials: initialsFromName(name, mock.initials),
    professionLabel:
      profile.profession ? PROFESSION_LABELS[profile.profession] : mock.professionLabel,
    usageModeLabel: profile.usage_mode
      ? USAGE_MODE_LABELS[profile.usage_mode]
      : undefined,
    profileStatus: profile.profile_status,
    plan: mode === "pro-practitioner" ? "pro" : "freemium",
  };
}
