import { PromotionalCardsPreviewPage } from "@/components/internal/promotional-cards/PromotionalCardsPreviewPage";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ focus?: string }>;
};

export default async function DevPromotionalCardsPage({
  searchParams,
}: PageProps) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { focus } = await searchParams;

  return (
    <main className="min-h-dvh bg-background px-4 pb-16">
      <PromotionalCardsPreviewPage focus={focus} />
    </main>
  );
}
