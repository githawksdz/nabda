import { CAT_IDENTITY, catIdentityCountLabel } from "@/lib/cat/cat-ui-config";

type CatModuleIdentityProps = {
  catalogCount?: number;
};

export function CatModuleIdentity({ catalogCount = 0 }: CatModuleIdentityProps) {
  return (
    <section className="flex flex-col gap-2">
      <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary-container px-2.5 py-1 text-label-sm text-on-secondary-container">
        <span className="size-1.5 animate-pulse rounded-full bg-primary" />
        {catIdentityCountLabel(catalogCount)}
      </p>
      <h2 className="text-headline-lg">{CAT_IDENTITY.title}</h2>
      <p className="text-body-md text-on-surface-variant">
        {CAT_IDENTITY.subtitle}
      </p>
    </section>
  );
}
