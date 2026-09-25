import { Bookmark, History } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

type PersonalEmptyStateProps = {
  title: string;
  description: string;
  actionLabel: string;
  href?: string;
  onAction?: () => void;
  icon?: "bookmark" | "history";
};

export function PersonalEmptyState({
  title,
  description,
  actionLabel,
  href,
  onAction,
  icon = "bookmark",
}: PersonalEmptyStateProps) {
  const Icon = icon === "history" ? History : Bookmark;

  return (
    <EmptyState
      title={title}
      description={description}
      icon={<Icon className="size-5" strokeWidth={1.75} />}
      actionLabel={actionLabel}
      actionHref={href}
      onAction={onAction}
    />
  );
}
