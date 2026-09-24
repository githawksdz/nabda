import { SectionHeader } from "@/components/home/cards/SectionHeader";
import { UpdateCard } from "@/components/home/cards/UpdateCard";
import type { HomeUpdate } from "@/types/home";

type ClinicalWatchSectionProps = {
  featured: HomeUpdate;
  secondary: HomeUpdate;
};

export function ClinicalWatchSection({
  featured,
  secondary,
}: ClinicalWatchSectionProps) {
  return (
    <section>
      <SectionHeader title="Votre veille clinique" meta="Tout voir →" href="/cat" />
      <div className="flex flex-col gap-2">
        <UpdateCard update={featured} variant="featured" />
        <UpdateCard update={secondary} variant="compact" />
      </div>
    </section>
  );
}
