import { SectionHeader } from "@/components/home/cards/SectionHeader";
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
    <section>
      <SectionHeader title="Nouveautés cliniques" />
      <div className="flex flex-col gap-2">
        {updates.map((update) => (
          <UpdateCard key={update.id} update={update} />
        ))}
      </div>
    </section>
  );
}
