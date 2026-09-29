"use client";

import type { CSSProperties, ComponentType, SVGProps } from "react";
import {
  AccidentAndEmergency,
  Allergies,
  Ambulance,
  Bladder,
  BloodDrop,
  Diabetes,
  Doctor,
  Elderly,
  EndotrachealTube,
  EarNoseThroat,
  Eye,
  GeneralSurgery,
  Health,
  Heart,
  Intestine,
  Joints,
  Kidneys,
  Lungs,
  Medicines,
  MentalHealth,
  Neurology,
  Nutrition,
  Pediatrics,
  PhysicalTherapy,
  Pregnant,
  Ribbon,
  Stethoscope,
  SyringeVaccine,
  Tissue,
  Ventilator,
  Virus,
} from "healthicons-react/outline";
import { specialtyConfig } from "@/lib/ui/content-card-config";
import { cn } from "@/lib/utils";

type HealthIcon = ComponentType<SVGProps<SVGSVGElement>>;

const CATEGORY_ICONS: Record<string, HealthIcon> = {
  cardiologie: Heart,
  pneumologie: Lungs,
  neurologie: Neurology,
  endocrinologie: Diabetes,
  endocrino_diabetologie: Diabetes,
  urgences: Ambulance,
  reanimation: Ventilator,
  gastro_enterologie: Intestine,
  infectiologie: Virus,
  pediatrie: Pediatrics,
  nephrologie: Kidneys,
  gyneco_obstetrique: Pregnant,
  obstetrique: Pregnant,
  hematologie: BloodDrop,
  dermatologie: Tissue,
  oncologie: Ribbon,
  rhumatologie: Joints,
  ophtalmologie: Eye,
  psychiatrie: MentalHealth,
  geriatrie: Elderly,
  allergologie: Allergies,
  orl: EarNoseThroat,
  urologie: Bladder,
  chirurgie: GeneralSurgery,
  anesthesie: EndotrachealTube,
  medicaments: Medicines,
  scores: Stethoscope,
  medecine_generale: Doctor,
  prevention_suivi: SyringeVaccine,
  reeducation: PhysicalTherapy,
  dietetique: Nutrition,
  cardio: Heart,
  antibiotiques: Medicines,
  antalgiques: AccidentAndEmergency,
  anticoagulants: BloodDrop,
  diabete: Diabetes,
  grossesse: Pregnant,
  rein: Kidneys,
};

type CategoryIconProps = {
  slug?: string | null;
  className?: string;
};

export function CategoryIcon({ slug, className }: CategoryIconProps) {
  const Icon = (slug && CATEGORY_ICONS[slug]) || Health;
  return <Icon className={className} aria-hidden />;
}

type CategoryWatermarkProps = {
  slug?: string | null;
  className?: string;
};

export function CategoryWatermark({ slug, className }: CategoryWatermarkProps) {
  const accent =
    specialtyConfig(slug)?.accent ?? "var(--specialty-neutral)";

  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-0 overflow-hidden", className)}
      style={{ color: accent } satisfies CSSProperties}
    >
      <span
        className="pointer-events-none absolute block"
        style={{
          top: "50%",
          right: 0,
          height: "165%",
          width: "auto",
          aspectRatio: "1 / 1",
          transform: "translate(22%, -50%) rotate(-16deg)",
          opacity: 0.14,
          mixBlendMode: "multiply",
        }}
      >
        <CategoryIcon slug={slug} className="block size-full max-h-none max-w-none" />
      </span>
    </span>
  );
}
