import { CatStepCard } from "@/components/content-renderers/cat/CatStepCard";
import type { NabdaCatStep } from "@/types/nabda-cat-steps";
import type { ContentLinkMode } from "@/types/content-rendering";

type CatStepRendererProps = {
  steps: NabdaCatStep[];
  keepInternalQuery?: boolean;
  linkMode?: ContentLinkMode;
  defaultOpen?: boolean;
};

export function CatStepRenderer({
  steps,
  keepInternalQuery = false,
  linkMode = "internal",
  defaultOpen = false,
}: CatStepRendererProps) {
  return (
    <div className="flex flex-col gap-3">
      {steps.map((step, index) => (
        <CatStepCard
          key={step.id}
          step={step}
          keepInternalQuery={keepInternalQuery}
          linkMode={linkMode}
          defaultOpen={defaultOpen && index < 2}
        />
      ))}
    </div>
  );
}
