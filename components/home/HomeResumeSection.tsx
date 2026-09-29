import { EmptyState } from "@/components/ui/EmptyState";
import { ListRow } from "@/components/ui/ListRow";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { categoryLabel } from "@/lib/content-detail/content-detail-mappers";
import { HOME_CHROME } from "@/lib/home/home-ui-config";
import { ENTITY_TYPE_LABELS } from "@/lib/personal/personal-mappers";
import type { HistoryItem } from "@/types/personal";

type HomeResumeSectionProps = {
  item: HistoryItem | null;
};

export function HomeResumeSection({ item }: HomeResumeSectionProps) {
  return (
    <section>
      <h2 className="text-headline-sm">{HOME_CHROME.resumeTitle}</h2>
      <div className="mt-3">
        {item ? (
          <ResumeCard item={item} />
        ) : (
          <EmptyState
            compact
            headingLevel="p"
            title={HOME_CHROME.resumeEmptyTitle}
            description={HOME_CHROME.resumeEmptyBody}
          />
        )}
      </div>
    </section>
  );
}

function ResumeCard({ item }: { item: HistoryItem }) {
  const kindLabel = item.kindLabel ?? ENTITY_TYPE_LABELS[item.entityType];
  const category = item.categorySlug ? categoryLabel(item.categorySlug) : null;

  return (
    <ListRow
      href={item.href}
      title={item.title}
      description={category ?? undefined}
      badge={<StatusBadge tone="muted">{kindLabel}</StatusBadge>}
      className="rounded-[var(--radius)] bg-card"
    />
  );
}
