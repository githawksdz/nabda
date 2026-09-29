import { redirect } from "next/navigation";

type PreviewRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function CatPreviewRedirect({ params }: PreviewRouteProps) {
  const { slug } = await params;
  redirect(`/internal/protocol-preview/${slug.replace(/-cat$/, "")}`);
}
