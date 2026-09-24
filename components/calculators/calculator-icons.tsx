import {
  Activity,
  Brain,
  Droplets,
  FlaskConical,
  HeartPulse,
  Siren,
  Wind,
} from "lucide-react";

type CalculatorIconProps = {
  name: string;
  className?: string;
};

export function CalculatorIcon({ name, className }: CalculatorIconProps) {
  const props = { className, strokeWidth: 1.75 as const };
  switch (name) {
    case "brain":
      return <Brain {...props} />;
    case "wind":
      return <Wind {...props} />;
    case "droplets":
      return <Droplets {...props} />;
    case "heart-pulse":
      return <HeartPulse {...props} />;
    case "activity":
      return <Activity {...props} />;
    case "siren":
      return <Siren {...props} />;
    case "flask":
      return <FlaskConical {...props} />;
    default:
      return <Activity {...props} />;
  }
}
