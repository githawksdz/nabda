import Link from "next/link";
import {
  Calculator,
  ChevronRight,
  FileText,
  GitBranch,
  Pill,
} from "lucide-react";
import type { ReactNode } from "react";
import type { PersonalEntityType } from "@/types/personal";

const ENTITY_ICONS = {
  cat: GitBranch,
  protocol: FileText,
  calculator: Calculator,
  drug: Pill,
} as const;

type PersonalContentCardProps = {
  href: string;
  title: string;
  subtitle: string;
  kindLabel: string;
  entityType: PersonalEntityType;
  statusLabel?: string;
  meta?: string;
  compact?: boolean;
  trailing?: ReactNode;
  accessory?: ReactNode;
};

export function PersonalContentCard({
  href,
  title,
  subtitle,
  kindLabel,
  entityType,
  statusLabel,
  meta,
  compact = false,
  trailing,
  accessory,
}: PersonalContentCardProps) {
  const Icon = ENTITY_ICONS[entityType];

  return (
    <Link
      href={href}
      className="motion-surface flex items-center gap-3 rounded-xl bg-surface-container-lowest p-3.5 shadow-sm active:bg-surface-container"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-low">
        <Icon className="size-5 text-on-surface" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body-md font-medium">{title}</span>
        <span className="mt-0.5 block text-body-sm text-on-surface-variant">
          {kindLabel}
          {subtitle ? ` — ${subtitle}` : ""}
        </span>
        {!compact && statusLabel ? (
          <span className="mt-1.5 inline-flex rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
            {statusLabel}
          </span>
        ) : null}
        {compact && meta ? (
          <span className="mt-1 block text-label-sm text-on-surface-variant">
            {meta}
          </span>
        ) : null}
        {accessory}
      </span>
      {trailing ?? (
        <ChevronRight
          className="size-4 shrink-0 text-outline"
          strokeWidth={1.75}
        />
      )}
    </Link>
  );
}
