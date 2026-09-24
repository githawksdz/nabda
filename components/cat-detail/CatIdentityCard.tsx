import { StatusChip } from "@/components/content-detail/StatusChip";
import {
  localAdaptationLabel,
  publicationStatusLabel,
  reviewStatusLabel,
  visibilityLabel,
} from "@/lib/content-detail/status-labels";
import type { CatMap } from "@/types/content-detail";

type CatIdentityCardProps = {
  map: CatMap;
};

export function CatIdentityCard({ map }: CatIdentityCardProps) {
  return (
    <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <p className="text-label-sm uppercase tracking-[0.04em] text-on-surface-variant">
        CAT
      </p>
      <h1 className="mt-1 text-headline-md">{map.title}</h1>
      {map.subtitle ? (
        <p className="mt-2 text-body-md text-on-surface-variant">{map.subtitle}</p>
      ) : null}
      {map.summary ? (
        <p className="mt-3 text-body-sm text-on-surface-variant">{map.summary}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {map.categories.map((category) => (
          <StatusChip key={category} label={category} variant="outline" />
        ))}
        <StatusChip label={publicationStatusLabel(map.status)} />
        <StatusChip label={reviewStatusLabel(map.review_status, map.status)} />
        {map.local_adaptation_status ? (
          <StatusChip label={localAdaptationLabel(map.local_adaptation_status)} />
        ) : null}
        <StatusChip label={visibilityLabel(map.visibility)} />
      </div>
    </section>
  );
}
