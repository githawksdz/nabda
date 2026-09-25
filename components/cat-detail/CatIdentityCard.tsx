import { StatusBadge } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";
import { accessLabelToTone } from "@/lib/ui/access-status-display";
import {
  doctorPublicationLabel,
  doctorVisibilityLabel,
} from "@/lib/content-detail/doctor-facing-status";
import type { CatMap } from "@/types/content-detail";

type CatIdentityCardProps = {
  map: CatMap;
};

export function CatIdentityCard({ map }: CatIdentityCardProps) {
  const publication = doctorPublicationLabel(map.status);
  const visibility = doctorVisibilityLabel(map.visibility);

  return (
    <Surface variant="elevated" className="flex flex-col gap-2">
      <p className="text-label-sm text-text-secondary">CAT</p>
      <h1 className="text-headline-md text-text-primary [overflow-wrap:anywhere]">
        {map.title}
      </h1>
      {map.subtitle ? (
        <p className="text-body-md text-text-secondary [overflow-wrap:anywhere]">
          {map.subtitle}
        </p>
      ) : null}
      {map.summary ? (
        <p className="text-body-sm text-text-secondary [overflow-wrap:anywhere]">
          {map.summary}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {map.categories.map((category) => (
          <StatusBadge key={category} tone="outline">
            {category}
          </StatusBadge>
        ))}
        {publication ? (
          <StatusBadge tone={accessLabelToTone(publication)}>{publication}</StatusBadge>
        ) : null}
        {visibility ? (
          <StatusBadge tone={accessLabelToTone(visibility)}>{visibility}</StatusBadge>
        ) : null}
      </div>
    </Surface>
  );
}
