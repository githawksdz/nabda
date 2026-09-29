import { HOME_CHROME } from "@/lib/home/home-ui-config";
import type { HomeUser } from "@/types/home";

type HomeIdentityBarProps = {
  user: HomeUser;
};

export function HomeIdentityBar({ user }: HomeIdentityBarProps) {
  const name = user.displayName.trim();
  const greeting = name ? `${HOME_CHROME.greeting}, ${name}` : HOME_CHROME.greeting;

  return (
    <section className="min-w-0 pt-2">
      <h1 className="text-display text-on-surface [overflow-wrap:anywhere]">
        {greeting}
      </h1>
      {user.usageModeLabel ? (
        <p className="mt-1 text-body-md text-text-secondary">{user.usageModeLabel}</p>
      ) : null}
    </section>
  );
}
