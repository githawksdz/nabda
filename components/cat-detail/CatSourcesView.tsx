import type { CatDetail } from "@/types/content-detail";

type CatSourcesViewProps = {
  detail: CatDetail;
};

export function CatSourcesView({ detail }: CatSourcesViewProps) {
  if (detail.references.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl bg-surface-container-low p-4">
      <h2 className="text-headline-sm">Références</h2>
      <ul className="mt-3 space-y-3">
        {detail.references.map((reference) => (
          <li key={reference.id}>
            <p className="text-body-md font-medium">{reference.title}</p>
            {reference.note ? (
              <p className="mt-1 text-body-sm text-on-surface-variant">
                {reference.note}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
