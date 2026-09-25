import {
  Bookmark,
  Calculator,
  Clock,
  GitBranch,
  House,
  Pill,
  Search,
  User,
  WifiOff,
  FileText,
} from "lucide-react";
import type { DoctorNavIcon as DoctorNavIconName } from "@/lib/navigation/doctor-nav";

type DoctorNavIconProps = {
  name: DoctorNavIconName;
  className?: string;
  strokeWidth?: number;
};

export function DoctorNavIcon({
  name,
  className = "size-5",
  strokeWidth = 1.75,
}: DoctorNavIconProps) {
  const props = { className, strokeWidth, "aria-hidden": true as const };
  switch (name) {
    case "home":
      return <House {...props} />;
    case "search":
      return <Search {...props} />;
    case "cat":
      return <GitBranch {...props} />;
    case "favorites":
      return <Bookmark {...props} />;
    case "profile":
      return <User {...props} />;
    case "protocols":
      return <FileText {...props} />;
    case "drugs":
      return <Pill {...props} />;
    case "scores":
      return <Calculator {...props} />;
    case "offline":
      return <WifiOff {...props} />;
    case "recents":
      return <Clock {...props} />;
  }
}
