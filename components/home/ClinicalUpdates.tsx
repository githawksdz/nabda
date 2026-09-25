import { UpdateCard } from "@/components/home/cards/UpdateCard";
import type { HomeUpdate } from "@/types/home";

type ClinicalUpdatesProps = {
  updates: HomeUpdate[];
};

export function ClinicalUpdates({ updates }: ClinicalUpdatesProps) {
  if (updates.length === 0) {
    return null;
  }

  return (
    <section className="layout-reading">
      <h2 className="text-headline-sm">Nouveautés cliniques</h2>
      <ul className="mt-3 flex flex-col gap-1.5">
        {updates.map((update) => (
          <li key={update.id}>
            <UpdateCard update={update} variant="compact" />
          </li>
        ))}
      </ul>
    </section>
  );
}
