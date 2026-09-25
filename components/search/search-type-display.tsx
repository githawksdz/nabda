import { HomeIcon } from "@/components/home/home-icons";
import { searchResultTypeLabel } from "@/lib/ui/access-status-display";
import type { SearchResult, SearchResultType } from "@/types/search";

const TYPE_ICON: Record<SearchResultType, string> = {
  cat: "git-branch",
  protocol: "file",
  recommendation: "file",
  drug: "pill",
  calculator: "calculator",
};

export function SearchResultTypeIcon({
  type,
  className = "size-4",
}: {
  type: SearchResultType;
  className?: string;
}) {
  return <HomeIcon name={TYPE_ICON[type] ?? "file"} className={className} />;
}

export function searchResultMeta(result: SearchResult): {
  typeLabel: string;
  subtitle?: string;
  description?: string;
} {
  const typeLabel = result.extraLabel ?? searchResultTypeLabel(result.type);
  const subtitle =
    result.category && result.category !== typeLabel ? result.category : undefined;
  const description =
    result.description ??
    (result.footer && result.footer !== subtitle ? result.footer : undefined);

  return { typeLabel, subtitle, description };
}
