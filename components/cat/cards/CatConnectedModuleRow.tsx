import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CatIcon } from "../cat-icons";
import type { CatConnectedModule } from "@/types/cat";

type CatConnectedModuleRowProps = {
  module: CatConnectedModule;
};

export function CatConnectedModuleRow({ module }: CatConnectedModuleRowProps) {
  return (
    <Link
      href={module.href}
      className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-3.5 shadow-sm"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-low">
        <CatIcon name={module.iconName} className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body-md font-medium">{module.title}</span>
        <span className="mt-0.5 block text-body-sm text-on-surface-variant">
          {module.subtitle}
        </span>
      </span>
      <ChevronRight className="size-4 text-outline" strokeWidth={1.75} />
    </Link>
  );
}
