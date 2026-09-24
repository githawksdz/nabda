import { SectionHeader } from "@/components/home/cards/SectionHeader";
import { ToolRow } from "@/components/home/cards/ToolRow";
import type { ToolRow as ToolRowType } from "@/types/home";

type ProAdvancedToolsProps = {
  tools: ToolRowType[];
};

export function ProAdvancedTools({ tools }: ProAdvancedToolsProps) {
  return (
    <section>
      <SectionHeader title="Outils avancés Pro" meta="Usage continu" />
      <div className="flex flex-col gap-2">
        {tools.map((tool) => (
          <ToolRow key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}
