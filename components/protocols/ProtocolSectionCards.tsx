import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  CARD_SECTIONS_TITLE,
  protocolHref,
} from "@/lib/content-detail/content-detail-ui-config";
import type { ProtocolSection } from "@/types/content-detail";

type ProtocolSectionCardsProps = {
  protocolSlug: string;
  sections: ProtocolSection[];
};

export function ProtocolSectionCards({
  protocolSlug,
  sections,
}: ProtocolSectionCardsProps) {
  const cards = sections.filter((section) => section.show_in_cards);

  if (cards.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-3 text-headline-sm">{CARD_SECTIONS_TITLE}</h2>
      <div className="flex flex-col gap-2">
        {cards.map((section) => (
          <Link
            key={section.id}
            href={protocolHref(protocolSlug, { section: section.slug })}
            className="flex items-start gap-3 rounded-xl bg-surface-container-lowest p-3.5 shadow-sm"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-label-md text-on-primary">
              {section.card_index ?? String(section.order).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-body-md font-medium">{section.title}</span>
              {section.summary ? (
                <span className="mt-1 block text-body-sm text-on-surface-variant">
                  {section.summary}
                </span>
              ) : null}
              {section.tags && section.tags.length > 0 ? (
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {section.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              ) : null}
            </span>
            <ChevronRight
              className="mt-1 size-4 shrink-0 text-outline"
              strokeWidth={1.75}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
