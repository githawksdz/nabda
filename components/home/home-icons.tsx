import {
  Activity,
  BadgeCheck,
  Brain,
  Calculator,
  Droplets,
  FileText,
  FlaskConical,
  GitBranch,
  HeartPulse,
  Pill,
  Syringe,
  Thermometer,
  Wind,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "git-branch": GitBranch,
  calculator: Calculator,
  pill: Pill,
  brain: Brain,
  droplets: Droplets,
  wind: Wind,
  syringe: Syringe,
  "heart-pulse": HeartPulse,
  thermometer: Thermometer,
  activity: Activity,
  file: FileText,
  "badge-check": BadgeCheck,
  flask: FlaskConical,
};

type HomeIconProps = {
  name: string;
  className?: string;
};

export function HomeIcon({ name, className }: HomeIconProps) {
  const Icon = ICONS[name] ?? FileText;
  return <Icon className={className} strokeWidth={1.75} />;
}
