import {
  DiscoveryListItem,
  DiscoveryListRow,
} from "@/components/discovery/DiscoveryListRow";
import { hasVisited } from "@/lib/ui/content-list-state";
import {
  SearchResultTypeIcon,
  searchResultMeta,
} from "./search-type-display";
import type { SearchResult } from "@/types/search";

type SearchResultCardProps = {
  result: SearchResult;
  visitedKeys?: string[];
};

function searchContentType(type: SearchResult["type"]) {
  if (type === "drug") return "drug" as const;
  if (type === "calculator") return "calculator" as const;
  return "protocol" as const;
}

export function SearchResultCard({
  result,
  visitedKeys = [],
}: SearchResultCardProps) {
  const { typeLabel, description } = searchResultMeta(result);

  return (
    <DiscoveryListRow
      href={result.href}
      title={result.title}
      contentType={searchContentType(result.type)}
      typeLabel={typeLabel}
      description={description}
      specialties={[result.category]}
      accessTier={result.statusLabel === "Pro" ? "pro" : "free"}
      isNew={result.isNew}
      visited={hasVisited(visitedKeys, result.type, result.slug)}
      statusLabel={result.statusLabel}
      icon={<SearchResultTypeIcon type={result.type} />}
    />
  );
}

type SearchResultListProps = {
  results: SearchResult[];
  visitedKeys?: string[];
};

export function SearchResultList({
  results,
  visitedKeys = [],
}: SearchResultListProps) {
  return (
    <>
      {results.map((result) => (
        <DiscoveryListItem key={result.id}>
          <SearchResultCard result={result} visitedKeys={visitedKeys} />
        </DiscoveryListItem>
      ))}
    </>
  );
}
