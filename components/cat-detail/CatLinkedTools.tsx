import { LinkedContentGrid } from "@/components/content-detail/LinkedContentGrid";
import { CAT_LINKED_TOOLS_TITLE } from "@/lib/content-detail/content-detail-ui-config";
import type { LinkedContentItem } from "@/types/content-detail";

type CatLinkedToolsProps = {
  items: LinkedContentItem[];
};

export function CatLinkedTools({ items }: CatLinkedToolsProps) {
  return <LinkedContentGrid items={items} title={CAT_LINKED_TOOLS_TITLE} />;
}
