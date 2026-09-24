import type { Metadata } from "next";
import { ProfilePage } from "@/components/personal/profile/ProfilePage";
import { getProfileSummary } from "@/lib/personal/personal-api";
import { applyProfilePreview } from "@/lib/personal/personal-mappers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profil · Nabda",
  description: "Paramètres et profil clinique",
};

type ProfileRouteProps = {
  searchParams: Promise<{ preview?: string; complete?: string }>;
};

export default async function ProfileRoute({
  searchParams,
}: ProfileRouteProps) {
  const { preview, complete } = await searchParams;
  const { profile, personalization, source } = await getProfileSummary();

  return (
    <ProfilePage
      profile={applyProfilePreview(profile, preview)}
      personalization={personalization}
      completeRequested={complete === "1"}
      source={source}
    />
  );
}
