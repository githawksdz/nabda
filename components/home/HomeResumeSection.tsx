import Link from "next/link";
import { PersonalContentCard } from "@/components/personal/PersonalContentCard";
import { ENTITY_TYPE_LABELS } from "@/lib/personal/personal-mappers";
import type { HistoryItem } from "@/types/personal";

type HomeResumeSectionProps = {
  item: HistoryItem | null;
};

export function HomeResumeSection({ item }: HomeResumeSectionProps) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-headline-sm">Reprendre</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Continuez là où vous vous êtes arrêté.
        </p>
      </div>
      {item ? (
        <PersonalContentCard
          href={item.href}
          title={item.title}
          subtitle={item.subtitle}
          kindLabel={item.kindLabel ?? ENTITY_TYPE_LABELS[item.entityType]}
          entityType={item.entityType}
          compact
        />
      ) : (
        <div className="rounded-xl bg-surface-container-low px-4 py-4">
          <p className="text-body-md font-medium">Aucun contenu récent</p>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Les fiches que vous consultez apparaîtront ici.
          </p>
          <Link href="/search" className="mt-2 inline-flex min-h-11 items-center text-label-md">
            Recherche
          </Link>
        </div>
      )}
    </section>
  );
}
