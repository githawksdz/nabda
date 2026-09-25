import { StatusBadge } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";
import { accessLabelToTone } from "@/lib/ui/access-status-display";
import {
  doctorPublicationLabel,
  doctorVisibilityLabel,
} from "@/lib/content-detail/doctor-facing-status";
import type { Protocol } from "@/types/content-detail";

type ContentIdentityCardProps = {
  protocol: Protocol;
  eyebrow?: string;
};

export function ContentIdentityCard({
  protocol,
  eyebrow = "Protocole",
}: ContentIdentityCardProps) {
  const visibility = doctorVisibilityLabel(protocol.visibility);
  const publication = doctorPublicationLabel(protocol.status);

  return (
    <Surface variant="elevated" className="flex flex-col gap-2">
      <p className="text-label-sm text-text-secondary">{eyebrow}</p>
      <h1 className="text-headline-md text-text-primary [overflow-wrap:anywhere]">
        {protocol.title}
      </h1>
      {protocol.subtitle ? (
        <p className="text-body-md text-text-secondary [overflow-wrap:anywhere]">
          {protocol.subtitle}
        </p>
      ) : null}
      {protocol.summary ? (
        <p className="text-body-sm text-text-secondary [overflow-wrap:anywhere]">
          {protocol.summary}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {protocol.categories.map((category) => (
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
