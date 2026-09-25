import Link from "next/link";
import { ChevronRight, WifiOff } from "lucide-react";

export function OfflinePackCard() {
  return (
    <section className="rounded-2xl bg-primary-container p-4 text-on-primary-container">
      <div className="flex items-start justify-between gap-3">
        <p className="text-label-sm text-on-primary-container/80">Packs hors-ligne</p>
        <WifiOff className="size-5 shrink-0" strokeWidth={1.75} />
      </div>
      <h2 className="mt-3 text-headline-sm">Garde et contenus téléchargés</h2>
      <p className="mt-1 text-body-sm text-on-primary-container/75">
        Téléchargez un pack choisi par l’équipe, ou une fiche publiée. Rien n’est
        mis en cache par défaut.
      </p>
      <Link
        href="/offline"
        className="mt-4 flex items-center justify-between border-t border-white/10 pt-3"
      >
        <span className="text-label-md">Gérer le stockage hors-ligne</span>
        <ChevronRight className="size-4" />
      </Link>
    </section>
  );
}
