import type { Metadata } from "next";
import { Suspense } from "react";
import { HistoryPage } from "@/components/personal/history/HistoryPage";
import { getHistoryItems } from "@/lib/personal/personal-api";
import { isEmptyPreview } from "@/lib/personal/personal-mappers";
import { InstantIndexChrome } from "@/components/app/instant-chromes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Récents · Nabda",
  description: "Reprendre vos consultations",
};

type HistoryRouteProps = {
  searchParams: Promise<{ preview?: string }>;
};

async function HistoryLoader({ searchParams }: HistoryRouteProps) {
  const { preview } = await searchParams;

  if (isEmptyPreview(preview)) {
    return <HistoryPage items={[]} source="empty" />;
  }

  const { items, source } = await getHistoryItems();
  return <HistoryPage items={items} source={source} />;
}

export default function HistoryRoute({ searchParams }: HistoryRouteProps) {
  return (
    <Suspense fallback={<InstantIndexChrome href="/history" />}>
      <HistoryLoader searchParams={searchParams} />
    </Suspense>
  );
}
