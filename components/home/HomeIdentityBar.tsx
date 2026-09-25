import { CircleHelp, GraduationCap, Shield, ShieldCheck } from "lucide-react";
import { StatusChip } from "@/components/home/cards/StatusChip";
import { cn } from "@/lib/utils";
import type { HomeMode, HomeUser } from "@/types/home";

type HomeIdentityBarProps = {
  user: HomeUser;
  mode: HomeMode;
};

export function HomeIdentityBar({ user, mode }: HomeIdentityBarProps) {
  const incomplete = mode === "incomplete";
  const pro = mode === "pro-practitioner";
  const greeting = incomplete
    ? "Bonjour 👋"
    : pro
      ? user.displayName
      : `Bonjour, ${user.displayName}`;
  const subtitle = incomplete
    ? "Non renseigné"
    : pro
      ? [user.professionLabel, user.specialtyLabel].filter(Boolean).join(" · ")
      : user.professionLabel;

  return (
    <section className="flex items-start justify-between gap-3 pt-2">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative shrink-0">
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-full text-label-md",
              pro
                ? "bg-primary-container text-on-primary-container"
                : "bg-surface-container-high text-secondary",
            )}
          >
            {user.initials}
          </div>
          <span
            className={cn(
              "absolute right-0 bottom-0 size-2.5 rounded-full ring-2 ring-background",
              pro ? "bg-primary" : "bg-on-surface-variant",
            )}
          />
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-headline-sm">
            {greeting}
            {pro && user.verified ? (
              <ShieldCheck className="size-4 text-on-surface" strokeWidth={1.75} />
            ) : null}
          </p>
          {incomplete ? (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-1 text-label-sm text-on-surface-variant">
              {subtitle}
              <CircleHelp className="size-3.5" strokeWidth={1.75} />
            </span>
          ) : (
            <p className="mt-0.5 flex items-center gap-1 text-body-sm text-on-surface-variant">
              {!pro ? (
                <GraduationCap className="size-3.5" strokeWidth={1.75} />
              ) : null}
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {pro ? (
          <StatusChip variant="dark">
            <Shield className="size-3" strokeWidth={2} />
            PRO
          </StatusChip>
        ) : (
          <StatusChip variant="outline">Freemium</StatusChip>
        )}
      </div>
    </section>
  );
}
