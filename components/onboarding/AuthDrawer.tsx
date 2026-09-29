import { useState } from "react";
import { AppDrawer } from "@/components/ui/AppDrawer";
import type { AuthMode } from "@/types/onboarding";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

const SNAP_POINTS = [0.6, 0.86];

type AuthDrawerProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
};

export function AuthDrawer({ mode, onModeChange }: AuthDrawerProps) {
  const open = mode !== null;
  const [snap, setSnap] = useState<number | string | null>(SNAP_POINTS[0]);
  const [wasOpen, setWasOpen] = useState(open);
  const [displayedMode, setDisplayedMode] = useState<"login" | "register">(
    mode ?? "login",
  );

  if (mode && mode !== displayedMode) {
    setDisplayedMode(mode);
  }

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSnap(SNAP_POINTS[0]);
    }
  }

  return (
    <AppDrawer
      open={open}
      shouldScaleBackground={false}
      snapPoints={SNAP_POINTS}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      showClose
      overlayClassName="z-[var(--z-backdrop)]"
      contentClassName="z-[var(--z-sheet)]"
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onModeChange(null);
        }
      }}
    >
      {displayedMode === "login" ? (
        <LoginForm onSwitchToRegister={() => onModeChange("register")} />
      ) : null}
      {displayedMode === "register" ? (
        <RegisterForm onSwitchToLogin={() => onModeChange("login")} />
      ) : null}
    </AppDrawer>
  );
}
