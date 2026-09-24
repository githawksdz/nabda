import { ChevronDown } from "lucide-react";
import { CatStepRenderer } from "@/components/content-renderers/cat/CatStepRenderer";
import { catGroupAnchorId } from "@/lib/content-rendering/cat";
import type { CatRenderGroup } from "@/types/content-rendering-cat";
import type { ContentLinkMode } from "@/types/content-rendering";

type CatShiftGroupsProps = {
  groups: CatRenderGroup[];
  keepInternalQuery?: boolean;
  linkMode?: ContentLinkMode;
};

export function CatShiftGroups({
  groups,
  keepInternalQuery = false,
  linkMode = "internal",
}: CatShiftGroupsProps) {
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => {
        const body = (
          <CatStepRenderer
            steps={group.steps}
            keepInternalQuery={keepInternalQuery}
            linkMode={linkMode}
            defaultOpen={!group.collapsedByDefault}
          />
        );
        return (
          <section
            key={group.id}
            id={catGroupAnchorId(group.id)}
            className="scroll-mt-[calc(64px+56px+env(safe-area-inset-top,0px))]"
          >
            {group.collapsedByDefault ? (
              <details className="group">
                <summary className="mb-3 flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
                  <h2 className="text-headline-sm">{group.label}</h2>
                  <ChevronDown className="size-4 text-outline group-open:rotate-180" />
                </summary>
                {body}
              </details>
            ) : (
              <>
                <h2 className="mb-3 text-headline-sm">{group.label}</h2>
                {body}
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}
