"use client";

import { useCallback, useState } from "react";
import { findFlowchartNode } from "@/lib/cat-flowchart/flowchart-ui-config";
import type { CatFlowchartMap, CatFlowchartNode } from "@/types/cat-flowchart";

export function useCatFlowchart(map?: CatFlowchartMap) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectNode = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
  }, []);

  const selected: CatFlowchartNode | undefined = map
    ? findFlowchartNode(map, selectedId)
    : undefined;

  return {
    map,
    selectedId,
    selected,
    selectNode,
    clearSelection,
  };
}
