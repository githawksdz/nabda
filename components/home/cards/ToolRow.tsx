import Link from "next/link";
import { HomeIcon } from "@/components/home/home-icons";
import type { ToolRow as ToolRowType } from "@/types/home";

type ToolRowProps = {
  tool: ToolRowType;
};

export function ToolRow({ tool }: ToolRowProps) {
  return (
    <Link
      href={tool.href}
      className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-4 shadow-sm"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-low">
        <HomeIcon name={tool.icon} className="size-5 text-on-surface" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body-md font-medium">{tool.title}</span>
        <span className="mt-0.5 block text-body-sm text-on-surface-variant">
          {tool.subtitle}
        </span>
      </span>
      <span className="shrink-0 text-label-md">{tool.cta}</span>
    </Link>
  );
}
