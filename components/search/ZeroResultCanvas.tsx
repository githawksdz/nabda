"use client";

import { Search } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SEARCH_EMPTY_HELP, SEARCH_EMPTY_TITLE } from "@/lib/search/search-outcome";

type ZeroResultCanvasProps = {
  query: string;
  onClear: () => void;
};

export function ZeroResultCanvas({ query: _query, onClear }: ZeroResultCanvasProps) {
  void _query;
  return (
    <EmptyState
      headingLevel="h2"
      title={SEARCH_EMPTY_TITLE}
      description={SEARCH_EMPTY_HELP}
      icon={<Search className="size-5" strokeWidth={1.75} aria-hidden />}
      actionLabel="Effacer la recherche"
      onAction={onClear}
    />
  );
}
