import Link from "next/link";
import {
  Baby,
  ChevronRight,
  Droplets,
  FlaskConical,
  HeartPulse,
  Pill,
  Syringe,
  Thermometer,
  Wind,
} from "lucide-react";
import { drugIndexStatusLabel } from "@/lib/drugs/status-labels";
import type { DrugSummary } from "@/types/drugs";

type DrugIconProps = {
  name: string;
  className?: string;
};

export function DrugIcon({ name, className }: DrugIconProps) {
  const props = { className, strokeWidth: 1.75 as const };
  switch (name) {
    case "pill":
      return <Pill {...props} />;
    case "thermometer":
      return <Thermometer {...props} />;
    case "syringe":
      return <Syringe {...props} />;
    case "droplets":
      return <Droplets {...props} />;
    case "flask":
      return <FlaskConical {...props} />;
    case "wind":
      return <Wind {...props} />;
    case "heart-pulse":
      return <HeartPulse {...props} />;
    case "baby":
      return <Baby {...props} />;
    default:
      return <Pill {...props} />;
  }
}

type DrugListRowProps = {
  drug: DrugSummary;
};

export function DrugListRow({ drug }: DrugListRowProps) {
  const statusLabel = drugIndexStatusLabel(drug);

  return (
    <Link
      href={drug.href}
      className="group flex items-center gap-3 rounded-xl bg-surface-container-lowest p-3.5 shadow-sm active:scale-[0.99]"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-low">
        <DrugIcon name={drug.iconName} className="size-5 text-on-surface" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body-md font-medium">{drug.genericName}</span>
        <span className="mt-0.5 block text-body-sm text-on-surface-variant">
          {drug.className}
        </span>
        <span className="mt-1.5 inline-flex rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
          {statusLabel}
        </span>
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-outline transition-transform group-hover:translate-x-0.5"
        strokeWidth={1.75}
      />
    </Link>
  );
}
