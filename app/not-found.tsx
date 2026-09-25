import Link from "next/link";

export default function NotFound() {
  return (
    <div className="layout-gutter layout-workspace mx-auto flex min-h-dvh w-full flex-col justify-center gap-4 bg-background pb-[calc(24px+env(safe-area-inset-bottom,0px))] pt-[calc(24px+env(safe-area-inset-top,0px))] text-on-surface">
      <h1 className="text-headline-md">Page introuvable</h1>
      <p className="text-body-md text-on-surface-variant">
        Cette adresse n’existe pas dans Nabda.
      </p>
      <Link
        href="/home"
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-label-md text-on-primary"
      >
        Retour à l’accueil
      </Link>
    </div>
  );
}
