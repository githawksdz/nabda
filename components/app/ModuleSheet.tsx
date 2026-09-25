"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useEffect, useRef, type MouseEvent } from "react";
import { DoctorNavIcon } from "@/components/app/DoctorNavIcon";
import { MODULE_NAV, isDoctorNavActive } from "@/lib/navigation/doctor-nav";
import { cn } from "@/lib/utils";

type ModuleSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function ModuleSheet({ open, onClose }: ModuleSheetProps) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    dialog.setAttribute("closedby", "any");
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
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
    if (!open) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

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
      onClose={onClose}
      onClick={onDialogClick}
      className="top-auto m-0 mt-auto max-h-[min(70dvh,32rem)] w-full max-w-none overflow-y-auto rounded-t-2xl border-0 bg-surface p-0 text-on-surface shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop:bg-on-surface/40"
    >
      <div className="mx-auto w-full max-w-[42rem] px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom,0px))]">
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
