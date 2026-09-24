import { CAT_RED_FLAGS_TITLE } from "@/lib/content-detail/content-detail-ui-config";
import type { CatRedFlag } from "@/types/content-detail";

type CatRedFlagsProps = {
  flags: CatRedFlag[];
};

export function CatRedFlags({ flags }: CatRedFlagsProps) {
  if (flags.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-3 text-headline-sm">{CAT_RED_FLAGS_TITLE}</h2>
      <div className="flex flex-wrap gap-1.5">
        {flags.map((flag) => (
          <span
            key={flag.id}
            className="inline-flex items-center rounded-full bg-error-container px-2.5 py-1 text-label-sm text-error"
          >
            {flag.label}
          </span>
        ))}
      </div>
    </section>
  );
}
