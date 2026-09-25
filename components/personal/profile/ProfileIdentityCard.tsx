import { Surface } from "@/components/ui/Surface";
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
    <Surface variant="elevated" className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-action-primary text-label-md text-text-inverse">
          {profile.initials}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-headline-sm text-text-primary [overflow-wrap:anywhere]">
            {name}
          </h2>
          {details.length > 0 ? (
            <p className="mt-1 text-body-sm text-text-secondary [overflow-wrap:anywhere]">
              {details.join(" · ")}
            </p>
          ) : (
            <p className="mt-1 text-body-sm text-text-secondary">
              Profil clinique à compléter
            </p>
          )}
          {place ? (
            <p className="mt-0.5 text-label-sm text-text-secondary">{place}</p>
          ) : null}
        </div>
      </div>
      <div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-surface-container-high"
          role="progressbar"
          aria-valuenow={profile.completionPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Profil complété à ${profile.completionPercent} pour cent`}
        >
          <div
            className="h-full rounded-full bg-action-primary"
            style={{ width: `${profile.completionPercent}%` }}
          />
        </div>
        <p className="mt-2 text-label-sm text-text-secondary">
          Profil complété à {profile.completionPercent}%
        </p>
      </div>
    </Surface>
  );
}
