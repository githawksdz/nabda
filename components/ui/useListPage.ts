"use client";

import { useState } from "react";
import { LIST_PAGE_SIZE } from "@/lib/ui/list-pagination";

/**
 * Page index that returns to 1 when the result set identity changes.
 * `setPage` scrolls the list anchor into view after a user page change.
 * Changing the page size also returns to page 1.
 */
export function useListPage(resetKey: string, anchorId?: string) {
  const [pageSize, setPageSizeState] = useState(LIST_PAGE_SIZE);
  const [state, setState] = useState({ key: resetKey, page: 1 });
  const page = state.key === resetKey ? state.page : 1;

  if (state.key !== resetKey) {
    setState({ key: resetKey, page: 1 });
  }

  function scrollToAnchor() {
    if (!anchorId || typeof document === "undefined") return;
    requestAnimationFrame(() => {
      document.getElementById(anchorId)?.scrollIntoView({ block: "start" });
    });
  }

  function setPage(next: number) {
    setState({ key: resetKey, page: next });
    scrollToAnchor();
  }

  function setPageSize(next: number) {
    setPageSizeState(next);
    setState({ key: resetKey, page: 1 });
    scrollToAnchor();
  }

  return { page, setPage, pageSize, setPageSize };
}
