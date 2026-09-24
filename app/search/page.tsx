import { Suspense } from "react";
import { SearchPage } from "@/components/search/SearchPage";

type SearchRouteProps = {
  searchParams: Promise<{ q?: string; type?: string }>;
};

export default async function SearchRoute({ searchParams }: SearchRouteProps) {
  const { q, type } = await searchParams;

  return (
    <Suspense>
      <SearchPage initialQuery={q ?? ""} initialFilter={type} />
    </Suspense>
  );
}
