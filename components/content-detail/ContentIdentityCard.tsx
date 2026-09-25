import { StatusChip } from "./StatusChip";
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
    <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <p className="text-label-sm uppercase tracking-[0.04em] text-on-surface-variant">
        {eyebrow}
      </p>
      <h1 className="mt-1 text-headline-md">{protocol.title}</h1>
      {protocol.subtitle ? (
        <p className="mt-2 text-body-md text-on-surface-variant">
          {protocol.subtitle}
        </p>
      ) : null}
      {protocol.summary ? (
        <p className="mt-3 text-body-sm text-on-surface-variant">
          {protocol.summary}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {protocol.categories.map((category) => (
          <StatusChip key={category} label={category} variant="outline" />
        ))}
        <StatusChip label={publication} />
        {visibility ? <StatusChip label={visibility} variant="soft" /> : null}
      </div>
    </section>
  );
}
