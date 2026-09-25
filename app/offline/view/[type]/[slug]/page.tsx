import { notFound } from "next/navigation";
import { OfflineContentView } from "@/components/offline/OfflineContentView";
import type { OfflineContentType } from "@/lib/offline/types";

export const dynamic = "force-dynamic";

const TYPES = new Set<OfflineContentType>(["protocol", "cat", "drug", "calculator"]);

type OfflineViewProps = {
  params: Promise<{ type: string; slug: string }>;
};

export default async function OfflineViewPage({ params }: OfflineViewProps) {
  const { type, slug } = await params;
  if (!TYPES.has(type as OfflineContentType) || !slug) {
    notFound();
  }
  return <OfflineContentView contentType={type as OfflineContentType} slug={slug} />;
}
