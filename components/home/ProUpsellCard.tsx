import Link from "next/link";

export function ProUpsellCard() {
  return (
    <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-label-sm text-on-surface-variant">Nabda Pro</p>
          <h2 className="mt-1 text-headline-sm">Débloquez les packs hors ligne</h2>
        </div>
        <span className="text-label-sm text-on-surface-variant">Garde sereine</span>
      </div>
      <p className="mt-2 text-body-sm text-on-surface-variant">
        Consultez l&apos;intégralité des CAT, fiches posologiques et calculateurs sans
        réseau au sous-sol ou bloc opératoire.
      </p>
      <Link
        href="/premium"
        className="mt-4 flex h-11 items-center justify-center rounded-lg bg-primary text-label-md text-on-primary"
      >
        Découvrir Pro
      </Link>
    </section>
  );
}
