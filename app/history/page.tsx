import type { Metadata } from "next";
import { HistoryPage } from "@/components/personal/history/HistoryPage";
import { getHistoryItems } from "@/lib/personal/personal-api";
import { isEmptyPreview } from "@/lib/personal/personal-mappers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Récents · Nabda",
  description: "Reprendre vos consultations",
};

type HistoryRouteProps = {
  searchParams: Promise<{ preview?: string }>;
};

export default async function HistoryRoute({
  searchParams,
}: HistoryRouteProps) {
  const { preview } = await searchParams;

  if (isEmptyPreview(preview)) {
    return <HistoryPage items={[]} source="empty" />;
  }

  const { items, source } = await getHistoryItems();
  return <HistoryPage items={items} source={source} />;
}
