import { CatIcon } from "./cat-icons";
import { CatContextCard } from "./cards/CatContextCard";
import type { CatContext } from "@/types/cat";

type CatContextGridProps = {
  contexts: CatContext[];
};

export function CatContextGrid({ contexts }: CatContextGridProps) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CatIcon name="grid" className="size-4 text-on-surface-variant" />
          <h2 className="text-headline-sm">Explorer par contexte</h2>
        </div>
        <span className="text-label-sm text-on-surface-variant">6 pôles</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {contexts.map((context) => (
          <CatContextCard key={context.slug} context={context} />
        ))}
      </div>
    </section>
  );
}
