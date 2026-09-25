import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import type { HomeMode, HomeUser } from "@/types/home";

type HomeIdentityBarProps = {
  user: HomeUser;
  mode: HomeMode;
  signedIn?: boolean;
};

export function HomeIdentityBar({
  user,
  mode,
  signedIn = false,
}: HomeIdentityBarProps) {
  const incomplete = mode === "incomplete";
  const pro = mode === "pro-practitioner";
  const named = Boolean(user.displayName?.trim());
  const greeting = !named
    ? "Bonjour"
    : pro
      ? user.displayName
      : `Bonjour, ${user.displayName}`;
  const subtitle = [user.professionLabel, user.specialtyLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/profile"
          aria-label="Profil"
          className="relative shrink-0 rounded-full"
        >
          <span
            className={cn(
              "flex size-11 items-center justify-center rounded-full text-label-md",
              pro
                ? "bg-surface-inverse text-text-inverse"
                : "bg-surface-container-high text-text-secondary",
            )}
          >
            {user.initials}
          </span>
        </Link>
        <div className="min-w-0">
          <p className="flex min-w-0 items-center gap-1.5 text-headline-sm">
            <span className="truncate">{greeting}</span>
            {pro && user.verified ? (
              <ShieldCheck
                className="size-4 shrink-0 text-text-primary"
                strokeWidth={1.75}
                role="img"
                aria-label="Compte vérifié"
              />
            ) : null}
          </p>
          {subtitle ? (
            <p className="mt-0.5 truncate text-body-sm text-text-secondary">
              {subtitle}
            </p>
          ) : incomplete ? (
            <p className="mt-0.5 text-body-sm text-text-secondary">
              {signedIn ? "Profil à compléter" : "Espace clinique Nabda"}
            </p>
          ) : null}
        </div>
      </div>
      <StatusBadge tone={pro ? "pro" : "free"} className="shrink-0">
        {pro ? "Pro" : "Gratuit"}
      </StatusBadge>
    </section>
  );
}
