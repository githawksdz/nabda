import { Avatar, AvatarFallback } from "@/components/shadcn/avatar";
import {
  CardContent,
  CardHeader,
  CardTitle,
  ContentCard,
} from "@/components/ui/ContentCard";
import { displayProfileName } from "@/lib/personal/profile-completion";
import type { UserProfileSummary } from "@/types/personal";

type ProfileIdentityCardProps = {
  profile: UserProfileSummary;
};

export function ProfileIdentityCard({ profile }: ProfileIdentityCardProps) {
  const name = displayProfileName(profile);
  const details = [
    profile.profession,
    profile.specialtyInterests.slice(0, 2).join(" · ") || undefined,
  ].filter(Boolean);
  const place = [profile.institution, profile.region].filter(Boolean).join(" · ");

  return (
    <ContentCard>
      <CardHeader className="flex flex-row items-start gap-3">
        <Avatar className="size-14">
          <AvatarFallback className="bg-primary text-label-md text-primary-foreground">
            {profile.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <CardTitle className="[overflow-wrap:anywhere]">{name}</CardTitle>
          <p className="mt-1 text-body-sm text-muted-foreground [overflow-wrap:anywhere]">
            {details.length > 0 ? details.join(" · ") : "Profil clinique à compléter"}
          </p>
          {place ? (
            <p className="mt-0.5 text-label-sm text-muted-foreground">{place}</p>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={profile.completionPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Profil complété à ${profile.completionPercent} pour cent`}
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${profile.completionPercent}%` }}
          />
        </div>
        <p className="mt-2 text-label-sm text-muted-foreground">
          Profil complété à {profile.completionPercent}%
        </p>
      </CardContent>
    </ContentCard>
  );
}
