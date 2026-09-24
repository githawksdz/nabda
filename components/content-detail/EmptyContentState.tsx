import Link from "next/link";
import { FileText } from "lucide-react";

type EmptyContentStateProps = {
  title?: string;
  description?: string;
  href?: string;
  actionLabel?: string;
};

export function EmptyContentState({
  title = "Fiche en préparation",
  description = "Cette recommandation n'est pas encore disponible. La structure sera ajoutée après relecture.",
  href = "/search?type=protocols",
  actionLabel = "Retour aux recommandations",
}: EmptyContentStateProps) {
  return (
    <section className="rounded-2xl bg-surface-container-low px-4 py-8 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-container">
        <FileText className="size-5 text-on-surface-variant" strokeWidth={1.75} />
      </span>
      <h2 className="mt-3 text-headline-sm">{title}</h2>
      <p className="mt-2 text-body-sm text-on-surface-variant">{description}</p>
      <Link
        href={href}
        className="mt-5 inline-flex h-11 items-center rounded-lg bg-primary px-4 text-label-md text-on-primary"
      >
        {actionLabel}
      </Link>
    </section>
  );
}
