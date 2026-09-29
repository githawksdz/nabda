export const LIST_PAGE_SIZE = 10;

export const LIST_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export type ListPageSize = (typeof LIST_PAGE_SIZE_OPTIONS)[number];

export function isListPageSize(value: number): value is ListPageSize {
  return (LIST_PAGE_SIZE_OPTIONS as readonly number[]).includes(value);
}

export type PageSlice<T> = {
  items: T[];
  page: number;
  pageCount: number;
  total: number;
};

export function slicePage<T>(
  items: readonly T[],
  page: number,
  pageSize = LIST_PAGE_SIZE,
): PageSlice<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = clampPage(page, pageCount);
  const start = (current - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: current,
    pageCount,
    total,
  };
}

type GroupedList<T> = {
  results: readonly T[];
};

export function sliceGroupedPage<TGroup extends GroupedList<TItem>, TItem>(
  groups: readonly TGroup[],
  page: number,
  pageSize = LIST_PAGE_SIZE,
): {
  groups: TGroup[];
  page: number;
  pageCount: number;
  total: number;
} {
  const flat: Array<{ groupIndex: number; item: TItem }> = [];
  groups.forEach((group, groupIndex) => {
    for (const item of group.results) {
      flat.push({ groupIndex, item });
    }
  });

  const sliced = slicePage(flat, page, pageSize);
  const buckets = new Map<number, TItem[]>();
  const order: number[] = [];

  for (const entry of sliced.items) {
    const bucket = buckets.get(entry.groupIndex);
    if (!bucket) {
      order.push(entry.groupIndex);
      buckets.set(entry.groupIndex, [entry.item]);
    } else {
      bucket.push(entry.item);
    }
  }

  return {
    groups: order.map((index) => ({
      ...groups[index],
      results: buckets.get(index) ?? [],
    })),
    page: sliced.page,
    pageCount: sliced.pageCount,
    total: sliced.total,
  };
}

export type PageToken = number | "gap";

/** Window of page numbers with gaps, capped so the control stays compact. */
export function pageTokens(page: number, pageCount: number): PageToken[] {
  if (pageCount <= 1) return [];

  const wanted = new Set<number>([1, pageCount, page - 1, page, page + 1]);
  if (page <= 3) {
    wanted.add(2);
    wanted.add(3);
  }
  if (page >= pageCount - 2) {
    wanted.add(pageCount - 1);
    wanted.add(pageCount - 2);
  }

  const sorted = [...wanted]
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((a, b) => a - b);

  const tokens: PageToken[] = [];
  for (const value of sorted) {
    const previous = tokens[tokens.length - 1];
    if (typeof previous === "number" && value - previous > 1) {
      tokens.push("gap");
    }
    tokens.push(value);
  }
  return tokens;
}

export function pageRange(page: number, total: number, pageSize = LIST_PAGE_SIZE) {
  if (total <= 0) {
    return { from: 0, to: 0 };
  }
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return { from, to };
}

function clampPage(page: number, pageCount: number) {
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(1, Math.trunc(page)), pageCount);
}
