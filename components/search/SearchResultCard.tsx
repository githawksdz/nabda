import {
  DiscoveryListItem,
  DiscoveryListRow,
} from "@/components/discovery/DiscoveryListRow";
import {
  SearchResultTypeIcon,
  searchResultMeta,
} from "./search-type-display";
import type { SearchResult } from "@/types/search";

type SearchResultCardProps = {
  result: SearchResult;
};

export function SearchResultCard({ result }: SearchResultCardProps) {
  const { typeLabel, subtitle, description } = searchResultMeta(result);

  return (
    <DiscoveryListRow
      href={result.href}
      title={result.title}
      typeLabel={typeLabel}
      subtitle={subtitle}
      description={description}
      statusLabel={result.statusLabel}
      icon={<SearchResultTypeIcon type={result.type} />}
    />
  );
}

type SearchResultListProps = {
  results: SearchResult[];
};

export function SearchResultList({ results }: SearchResultListProps) {
  return (
    <>
      {results.map((result) => (
        <DiscoveryListItem key={result.id}>
          <SearchResultCard result={result} />
        </DiscoveryListItem>
      ))}
    </>
  );
}
