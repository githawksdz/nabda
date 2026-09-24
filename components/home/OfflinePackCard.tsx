import Link from "next/link";
import { ChevronRight, ShieldCheck, WifiOff } from "lucide-react";
import type { OfflinePackMetric } from "@/types/home";

type OfflinePackCardProps = {
  metrics: OfflinePackMetric[];
};

export function OfflinePackCard({ metrics }: OfflinePackCardProps) {
  return (
    <section className="rounded-2xl bg-primary-container p-4 text-on-primary-container">
      <div className="flex items-start justify-between gap-3">
        <p className="text-label-sm text-on-primary-container/80">
          Sync il y a 12 min · Prêt hors-ligne
        </p>
        <WifiOff className="size-5 shrink-0" strokeWidth={1.75} />
      </div>
      <h2 className="mt-3 text-headline-sm">Pack Garde Urgences & Réa</h2>
      <p className="mt-1 text-body-sm text-on-primary-container/75">
        Version certifiée v3.8 (Protocole Local CHU & SFMU)
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {metrics.map((metric) => (
          <div key={metric.id}>
            <p className="text-data-metric">{metric.value}</p>
            <p className="text-label-sm text-on-primary-container/70">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
      <Link
        href="/offline"
        className="mt-4 flex items-center justify-between border-t border-white/10 pt-3"
      >
        <span className="flex items-center gap-2 text-label-md">
          <ShieldCheck className="size-4" strokeWidth={1.75} />
          Vérifier le stockage hors-ligne (142 Mo)
        </span>
        <ChevronRight className="size-4" />
      </Link>
    </section>
  );
}
