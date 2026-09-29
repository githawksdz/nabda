import { Suspense } from "react";
import { SearchPage } from "@/components/search/SearchPage";
import { SearchIndexChrome } from "@/components/app/instant-chromes";
import { getVisitedContentKeys } from "@/lib/content-detail/user-content-actions";

async function SearchPageLoader() {
  const visitedKeys = await getVisitedContentKeys();
  return <SearchPage visitedKeys={visitedKeys} />;
}

export default function SearchRoute() {
  return (
    <Suspense fallback={<SearchIndexChrome />}>
      <SearchPageLoader />
    </Suspense>
  );
}
