import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/shadcn/item";
import { cn } from "@/lib/utils";

type ListGroupProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function ListGroup({ title, children, className }: ListGroupProps) {
  return (
    <section className="flex flex-col gap-2">
      {title ? <h3 className="text-headline-sm">{title}</h3> : null}
      <ItemGroup
        className={cn(
          "gap-0 overflow-hidden rounded-[var(--radius)] bg-card",
          className,
        )}
      >
        {children}
      </ItemGroup>
    </section>
  );
}

type ListRowProps = {
  title: string;
  description?: string;
  badge?: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  media?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

export function ListRow({
  title,
  description,
  badge,
  href,
  onClick,
  disabled,
  media,
  trailing,
  className,
}: ListRowProps) {
  const showChevron = Boolean(href || onClick) && !trailing;
  const body = (
    <>
      {media ? <ItemMedia variant="icon">{media}</ItemMedia> : null}
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        {description ? <ItemDescription>{description}</ItemDescription> : null}
      </ItemContent>
      <ItemActions>
        {badge}
        {trailing}
        {showChevron ? (
          <ChevronRight
            className="size-4 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden
          />
        ) : null}
      </ItemActions>
    </>
  );
  const rowClass = cn("min-h-[var(--size-touch)] rounded-none", className);

  if (href) {
    return (
      <Item asChild className={rowClass}>
        <Link href={href}>{body}</Link>
      </Item>
    );
  }

  if (onClick) {
    return (
      <Item asChild className={rowClass}>
        <button type="button" onClick={onClick} disabled={disabled}>
          {body}
        </button>
      </Item>
    );
  }

  return <Item className={rowClass}>{body}</Item>;
}

export { ItemSeparator };
