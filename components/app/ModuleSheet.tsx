"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent, type SyntheticEvent } from "react";
import { DoctorNavIcon } from "@/components/app/DoctorNavIcon";
import { MODULE_NAV, isDoctorNavActive } from "@/lib/navigation/doctor-nav";
import { prefersReducedMotion } from "@/lib/ui/scroll-behavior";
import { cn } from "@/lib/utils";

type ModuleSheetProps = {
  open: boolean;
  onClose: () => void;
};

type SheetPhase = "closed" | "open" | "closing";

const MODULE_SHEET_EXIT_FALLBACK_MS = 120;

function moduleSheetExitMs(): number {
  if (typeof window === "undefined" || prefersReducedMotion()) {
    return 0;
  }
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--duration-fast")
    .trim();
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : MODULE_SHEET_EXIT_FALLBACK_MS;
}

export function ModuleSheet({ open, onClose }: ModuleSheetProps) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathnameRef = useRef(pathname);
  const exitTimer = useRef(0);
  const [phase, setPhase] = useState<SheetPhase>("closed");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    dialog.setAttribute("closedby", "any");
    window.clearTimeout(exitTimer.current);

    let outerFrame = 0;
    let innerFrame = 0;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
      outerFrame = window.requestAnimationFrame(() => {
        innerFrame = window.requestAnimationFrame(() => {
          setPhase("open");
        });
      });
      return () => {
        window.cancelAnimationFrame(outerFrame);
        window.cancelAnimationFrame(innerFrame);
      };
    }

    if (dialog.open && moduleSheetExitMs() > 0) {
      setPhase("closing");
      exitTimer.current = window.setTimeout(() => {
        const current = dialogRef.current;
        if (current?.open) {
          current.close();
        }
        setPhase("closed");
      }, moduleSheetExitMs());
      return () => {
        window.clearTimeout(exitTimer.current);
      };
    }

    setPhase("closed");
    if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (pathnameRef.current === pathname) {
      return;
    }
    pathnameRef.current = pathname;
    onClose();
  }, [onClose, pathname]);

  useEffect(() => {
    if (!open && phase === "closed") {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, phase]);

  function onCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    onClose();
  }

  function onDialogClick(event: MouseEvent<HTMLDialogElement>) {
    const dialog = dialogRef.current;
    if (!dialog || event.target !== dialog) {
      return;
    }
    const rect = dialog.getBoundingClientRect();
    const inside =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!inside) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      id="doctor-modules"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doctor-modules-title"
      data-phase={phase}
      onClose={onClose}
      onCancel={onCancel}
      onClick={onDialogClick}
      className="module-sheet top-auto z-[var(--z-sheet)] m-0 mt-auto max-h-[min(70dvh,32rem)] w-full max-w-none overflow-y-auto rounded-t-2xl border-0 bg-surface p-0 text-on-surface shadow-[var(--shadow-sheet)] backdrop:bg-on-surface/40"
    >
      <div className="layout-gutter layout-workspace pt-3 pb-[calc(16px+env(safe-area-inset-bottom,0px))]">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 id="doctor-modules-title" className="text-headline-sm">
            Modules
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-on-surface-variant"
          >
            <X className="size-5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        <nav aria-label="Modules">
          <ul className="flex flex-col">
            {MODULE_NAV.map((item) => {
              const active = isDoctorNavActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={onClose}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-xl px-3 text-body-md",
                      active
                        ? "bg-secondary-container font-semibold text-primary"
                        : "text-on-surface",
                    )}
                  >
                    <DoctorNavIcon name={item.icon} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </dialog>
  );
}
