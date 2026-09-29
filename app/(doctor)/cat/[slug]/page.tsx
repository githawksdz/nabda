import { redirect } from "next/navigation";

type CatDetailRedirectProps = {
  params: Promise<{ slug: string }>;
};

export default async function CatDetailRedirect({ params }: CatDetailRedirectProps) {
  const { slug } = await params;
  const protocolSlug = slug.replace(/-cat$/, "");
  redirect(`/protocols/${protocolSlug}`);
}
