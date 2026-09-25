import {
  Baby,
  Droplets,
  FlaskConical,
  HeartPulse,
  Pill,
  Syringe,
  Thermometer,
  Wind,
} from "lucide-react";
import { DiscoveryListRow } from "@/components/discovery/DiscoveryListRow";
import { accessLabelToTone } from "@/lib/ui/access-status-display";
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
    <DiscoveryListRow
      href={drug.href}
      title={drug.genericName}
      typeLabel="Médicament"
      subtitle={drug.className}
      statusLabel={statusLabel}
      statusTone={accessLabelToTone(statusLabel)}
      icon={<DrugIcon name={drug.iconName} className="size-4 text-text-primary" />}
    />
  );
}
