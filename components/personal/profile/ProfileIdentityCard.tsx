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
    <section className="rounded-xl bg-surface-container-lowest p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-label-md text-on-primary">
          {profile.initials}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-headline-sm">{name}</h2>
          {details.length > 0 ? (
            <p className="mt-1 text-body-sm text-on-surface-variant">
              {details.join(" · ")}
            </p>
          ) : (
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Profil clinique à compléter
            </p>
          )}
          {place ? (
            <p className="mt-0.5 text-label-sm text-on-surface-variant">{place}</p>
          ) : null}
        </div>
        <span className="text-data-metric">{profile.completionPercent}%</span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-container-high">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${profile.completionPercent}%` }}
        />
      </div>
      <p className="mt-2 text-label-sm text-on-surface-variant">
        Profil complété à {profile.completionPercent}%
      </p>
    </section>
  );
}
