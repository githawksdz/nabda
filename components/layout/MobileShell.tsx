import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type MobileShellProps = {
  children: ReactNode;
  className?: string;
};

export function MobileShell({ children, className }: MobileShellProps) {
  return (
    <main className="min-h-dvh bg-background text-on-surface">
      <div
        className={cn(
          "mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-4 pt-safe pb-safe",
          className,
        )}
      >
        {children}
      </div>
    </main>
  );
}
