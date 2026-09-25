import { ContentIdentityCard } from "@/components/content-detail/ContentIdentityCard";
import { SectionNav } from "@/components/content-detail/SectionNav";
import { LinkedContentGrid } from "@/components/content-detail/LinkedContentGrid";
import { ProtocolKeyPoints } from "./ProtocolKeyPoints";
import { ProtocolSectionCards } from "./ProtocolSectionCards";
import { getSectionNavItems } from "@/lib/content-detail/content-detail-ui-config";
import type { ProtocolDetail } from "@/types/content-detail";

type ProtocolOverviewProps = {
  detail: ProtocolDetail;
};

function MetricCard({
  value,
  label,
  caption,
}: {
  value: string;
  label: string;
  caption: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <svg
          viewBox="0 0 88 88"
          className="size-20 shrink-0 text-on-surface"
          aria-hidden="true"
        >
          <rect
            x="4"
            y="4"
            width="80"
            height="80"
            rx="16"
            className="fill-surface-container-low"
          />
          <circle
            cx="44"
            cy="44"
            r="26"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.35"
          />
          <circle
            cx="44"
            cy="44"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.55"
          />
          <path
            d="M44 44 L44 22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M44 44 L62 50"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
          <circle cx="44" cy="44" r="3.5" className="fill-primary" />
        </svg>
        <div className="min-w-0">
          <p className="text-data-metric">{value}</p>
          <p className="mt-0.5 text-label-md">{label}</p>
          <p className="mt-1 text-label-sm text-on-surface-variant">{caption}</p>
        </div>
      </div>
    </section>
  );
}

export function ProtocolOverview({ detail }: ProtocolOverviewProps) {
  const navItems = getSectionNavItems(detail);

  return (
    <div className="flex flex-col gap-5">
      <ContentIdentityCard protocol={detail.protocol} />
      {detail.article.metric ? <MetricCard {...detail.article.metric} /> : null}
      {detail.article.intro ? (
        <p className="text-body-sm text-on-surface-variant">{detail.article.intro}</p>
      ) : null}
      <ProtocolKeyPoints points={detail.key_points} />
      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start lg:gap-6">
        <SectionNav
          protocolSlug={detail.protocol.slug}
          items={navItems}
          activeSlug={null}
        />
        <div className="layout-reading flex flex-col gap-5">
          <ProtocolSectionCards
            protocolSlug={detail.protocol.slug}
            sections={detail.sections}
          />
          <LinkedContentGrid items={detail.linked_content} />
          {detail.references.length > 0 ? (
            <section className="rounded-2xl bg-surface-container-low p-4">
              <h2 className="text-headline-sm">Références</h2>
              <ul className="mt-3 space-y-2">
                {detail.references.map((reference) => (
                  <li key={reference.id}>
                    <p className="text-body-md font-medium">{reference.title}</p>
                    {reference.note ? (
                      <p className="mt-1 text-body-sm text-on-surface-variant">
                        {reference.note}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
