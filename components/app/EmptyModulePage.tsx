import { AppShell } from "@/components/app/AppShell";
import Link from "next/link";

type EmptyModulePageProps = {
  title: string;
  description: string;
};

export function EmptyModulePage({ title, description }: EmptyModulePageProps) {
  return (
    <AppShell title={title}>
      <div className="pt-2">
        <p className="text-body-md text-on-surface-variant">{description}</p>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          Module en préparation
        </p>
        <Link
          href="/home"
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-4 text-label-md text-on-primary"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </AppShell>
  );
}
