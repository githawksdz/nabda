import {
  Bell,
  BellRing,
  Brain,
  Bug,
  Calculator,
  CircleAlert,
  Clock,
  CloudCheck,
  Droplets,
  FilePenLine,
  GitBranch,
  HeartPulse,
  LayoutGrid,
  Lightbulb,
  Mic,
  Pill,
  Pin,
  RefreshCw,
  Search,
  SearchX,
  ShieldCheck,
  Siren,
  SlidersHorizontal,
  Sparkles,
  Thermometer,
  Wind,
  Zap,
} from "lucide-react";

type CatIconProps = {
  name: string;
  className?: string;
};

export function CatIcon({ name, className }: CatIconProps) {
  const props = { className, strokeWidth: 1.75 as const };
  switch (name) {
    case "git-branch":
      return <GitBranch {...props} />;
    case "wind":
      return <Wind {...props} />;
    case "thermometer":
      return <Thermometer {...props} />;
    case "heart-pulse":
      return <HeartPulse {...props} />;
    case "brain":
      return <Brain {...props} />;
    case "droplets":
      return <Droplets {...props} />;
    case "bug":
      return <Bug {...props} />;
    case "siren":
      return <Siren {...props} />;
    case "pill":
      return <Pill {...props} />;
    case "calculator":
      return <Calculator {...props} />;
    case "pin":
      return <Pin {...props} fill="currentColor" />;
    case "refresh":
      return <RefreshCw {...props} />;
    case "grid":
      return <LayoutGrid {...props} />;
    case "cloud":
      return <CloudCheck {...props} />;
    case "clock":
      return <Clock {...props} />;
    case "zap":
      return <Zap {...props} />;
    case "alert":
      return <CircleAlert {...props} />;
    case "search":
      return <Search {...props} />;
    case "search-off":
      return <SearchX {...props} />;
    case "shield":
      return <ShieldCheck {...props} />;
    case "lightbulb":
      return <Lightbulb {...props} />;
    case "bell":
      return <Bell {...props} />;
    case "bell-ring":
      return <BellRing {...props} />;
    case "mic":
      return <Mic {...props} />;
    case "tune":
      return <SlidersHorizontal {...props} />;
    case "file-pen":
      return <FilePenLine {...props} />;
    case "sparkles":
      return <Sparkles {...props} />;
    default:
      return <GitBranch {...props} />;
  }
}
