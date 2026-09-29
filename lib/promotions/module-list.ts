import type { ReactNode } from "react";

const DEFAULT_INSERT_AFTER = 3;

/**
 * Inserts a single promotional node after the first N real content items.
 * Intended for module/index lists — not detail pages or calculator forms.
 */
export function interleaveModulePromotion<T>(
  items: T[],
  renderItem: (item: T, index: number) => ReactNode,
  promotion: ReactNode | null,
  insertAfter = DEFAULT_INSERT_AFTER,
): ReactNode[] {
  if (!promotion || items.length === 0) {
    return items.map((item, index) => renderItem(item, index));
  }

  const out: ReactNode[] = [];
  const slot = Math.min(insertAfter, items.length);

  items.forEach((item, index) => {
    out.push(renderItem(item, index));
    if (index + 1 === slot) {
      out.push(promotion);
    }
  });

  return out;
}
