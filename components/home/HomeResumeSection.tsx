import Link from "next/link";
import {
  Calculator,
  ChevronRight,
  FileText,
  GitBranch,
  Pill,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";
import { ENTITY_TYPE_LABELS } from "@/lib/personal/personal-mappers";
import type { HistoryItem } from "@/types/personal";

const ENTITY_ICONS = {
  cat: GitBranch,
  protocol: FileText,
  calculator: Calculator,
  drug: Pill,
} as const;

type HomeResumeSectionProps = {
  item: HistoryItem | null;
};

export function HomeResumeSection({ item }: HomeResumeSectionProps) {
  return (
    <section>
      <h2 className="text-headline-sm">Reprendre</h2>
      <p className="mt-1 text-body-sm text-text-secondary">
        Continuez là où vous vous êtes arrêté.
      </p>
      <div className="mt-3">
        {item ? (
          <ResumeRow item={item} />
        ) : (
          <EmptyState
            compact
            headingLevel="p"
            title="Aucun contenu récent"
            description="Les fiches que vous consultez apparaîtront ici."
            actionLabel="Recherche"
            actionHref="/search"
          />
        )}
      </div>
    </section>
  );
}

function ResumeRow({ item }: { item: HistoryItem }) {
  const Icon = ENTITY_ICONS[item.entityType];
  const kindLabel = item.kindLabel ?? ENTITY_TYPE_LABELS[item.entityType];

  return (
    <Link href={item.href} className="block min-w-0">
      <Surface
        as="div"
        variant="elevated"
        className="flex items-center gap-3 p-3.5 hover:bg-surface-muted"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-surface-muted text-text-primary">
          <Icon className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <StatusBadge tone="muted">{kindLabel}</StatusBadge>
          <span className="mt-1.5 block truncate text-body-md font-medium">
            {item.title}
          </span>
          {item.subtitle ? (
            <span className="mt-0.5 block truncate text-body-sm text-text-secondary">
              {item.subtitle}
            </span>
          ) : null}
        </span>
        <ChevronRight
          className="size-4 shrink-0 text-text-muted"
          strokeWidth={1.75}
          aria-hidden
        />
      </Surface>
    </Link>
  );
}
