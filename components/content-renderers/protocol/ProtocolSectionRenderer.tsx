import { ChevronDown } from "lucide-react";
import { ProtocolSectionCard } from "@/components/content-renderers/protocol/ProtocolSectionCard";
import { groupAnchorId } from "@/lib/content-rendering/protocol";
import { cn } from "@/lib/utils";
import type { ProtocolRenderGroup } from "@/types/content-rendering-protocol";
import type { ContentLinkMode } from "@/types/content-rendering";

type ProtocolSectionRendererProps = {
  groups: ProtocolRenderGroup[];
  keepInternalQuery?: boolean;
  linkMode?: ContentLinkMode;
  activeGroupId?: string | null;
};

export function ProtocolSectionRenderer({
  groups,
  keepInternalQuery = false,
  linkMode = "internal",
  activeGroupId = null,
}: ProtocolSectionRendererProps) {
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => {
        const body = (
          <div className="flex flex-col gap-3">
            {group.sections.map((section, index) => (
              <ProtocolSectionCard
                key={section.id}
                section={section}
                keepInternalQuery={keepInternalQuery}
                linkMode={linkMode}
                defaultOpen={!group.collapsedByDefault && index < 2}
              />
            ))}
          </div>
        );

        return (
          <section
            key={group.id}
            id={groupAnchorId(group.id)}
            className={cn(
              "scroll-mt-[calc(64px+56px+env(safe-area-inset-top,0px))]",
              activeGroupId && group.id !== activeGroupId ? "lg:hidden" : undefined,
            )}
          >
            {group.collapsedByDefault ? (
              <details className="group">
                <summary className="mb-3 flex min-h-11 cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
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
