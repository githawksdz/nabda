import { ProfileCompletionCard as PromotionalProfileCompletionCard } from "@/components/promotions/ProfileCompletionCard";
import { buildProfileCompletionCardData } from "@/lib/promotions/profile-completion-data";
import type { UserProfileSummary } from "@/types/personal";

type ProfileCompletionCardProps = {
  profile: UserProfileSummary;
  onDefer: () => void;
};

export function ProfileCompletionCard({
  profile,
  onDefer,
}: ProfileCompletionCardProps) {
  const data = buildProfileCompletionCardData(profile);
  if (!data) {
    return null;
  }

  return <PromotionalProfileCompletionCard data={data} onDefer={onDefer} />;
}
