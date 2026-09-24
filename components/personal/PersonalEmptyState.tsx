import Link from "next/link";
import { Bookmark, History } from "lucide-react";

type PersonalEmptyStateProps = {
  title: string;
  description: string;
  actionLabel: string;
  href?: string;
  onAction?: () => void;
  icon?: "bookmark" | "history";
};

export function PersonalEmptyState({
  title,
  description,
  actionLabel,
  href,
  onAction,
  icon = "bookmark",
}: PersonalEmptyStateProps) {
  const Icon = icon === "history" ? History : Bookmark;
  const actionClassName =
    "mt-5 inline-flex h-11 items-center rounded-lg bg-primary px-4 text-label-md text-on-primary";

  return (
    <section className="rounded-xl bg-surface-container-low px-4 py-8 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-container">
        <Icon className="size-5 text-on-surface-variant" strokeWidth={1.75} />
      </span>
      <h2 className="mt-3 text-headline-sm">{title}</h2>
      <p className="mt-2 text-body-sm text-on-surface-variant">{description}</p>
      {onAction ? (
        <button type="button" onClick={onAction} className={actionClassName}>
          {actionLabel}
        </button>
      ) : href ? (
        <Link href={href} className={actionClassName}>
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
