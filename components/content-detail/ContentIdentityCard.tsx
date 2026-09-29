import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ContentCard,
} from "@/components/ui/ContentCard";
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
    <ContentCard>
      <CardHeader>
        <p className="text-label-sm text-muted-foreground">{eyebrow}</p>
        <CardTitle className="text-clinical-title [overflow-wrap:anywhere]">
          {protocol.title}
        </CardTitle>
        {protocol.subtitle ? (
          <CardDescription className="text-body-md [overflow-wrap:anywhere]">
            {protocol.subtitle}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {protocol.summary ? (
          <p className="text-body-sm text-muted-foreground [overflow-wrap:anywhere]">
            {protocol.summary}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
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
      </CardContent>
    </ContentCard>
  );
}
