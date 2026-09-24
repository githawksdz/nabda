import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProfileListItem } from "@/types/personal";

type ProfileSectionListProps = {
  title?: string;
  items: ProfileListItem[];
  framed?: boolean;
};

export function ProfileSectionList({
  title,
  items,
  framed = true,
}: ProfileSectionListProps) {
  return (
    <section>
      {title ? <h3 className="mb-2 text-headline-sm">{title}</h3> : null}
      <div
        className={cn(
          framed && "overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm",
        )}
      >
        {items.map((item, index) => (
          <div key={item.id}>
            <ProfileSectionRow item={item} />
            {index < items.length - 1 ? (
              <div className="ml-4 h-px bg-surface-variant" />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProfileSectionRow({ item }: { item: ProfileListItem }) {
  const content = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block text-body-md">{item.label}</span>
        {item.value ? (
          <span className="mt-0.5 block text-body-sm text-on-surface-variant">
            {item.value}
          </span>
        ) : null}
      </span>
      {item.badge ? (
        <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
          {item.badge}
        </span>
      ) : null}
      {item.href || item.onClick ? (
        <ChevronRight
          className="size-4 shrink-0 text-outline"
          strokeWidth={1.75}
        />
      ) : null}
    </>
  );

  const className =
    "flex w-full items-center gap-3 px-4 py-3.5 text-left disabled:opacity-50";

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    );
  }

  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        disabled={item.disabled}
        className={className}
      >
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
