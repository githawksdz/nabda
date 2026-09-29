"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/shadcn/drawer";
import { cn } from "@/lib/utils";

type AppDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title?: string;
  description?: string;
  badge?: ReactNode;
  footer?: ReactNode;
  showClose?: boolean;
  tall?: boolean;
  snapPoints?: (number | string)[];
  activeSnapPoint?: number | string | null;
  setActiveSnapPoint?: (snapPoint: number | string | null) => void;
  shouldScaleBackground?: boolean;
  contentClassName?: string;
  overlayClassName?: string;
  footerClassName?: string;
};

export function AppDrawer({
  open,
  onOpenChange,
  children,
  title,
  description,
  badge,
  footer,
  showClose = false,
  tall = false,
  snapPoints,
  activeSnapPoint,
  setActiveSnapPoint,
  shouldScaleBackground = false,
  contentClassName,
  overlayClassName,
  footerClassName,
}: AppDrawerProps) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      shouldScaleBackground={shouldScaleBackground}
      snapPoints={snapPoints}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
    >
      <DrawerContent
        overlayClassName={cn("z-[var(--z-backdrop)]", overlayClassName)}
        className={cn(
          "z-[var(--z-sheet)]",
          tall && "h-[85dvh] max-h-[85dvh]",
          contentClassName,
        )}
      >
        {showClose ? (
          <DrawerClose
            aria-label="Fermer"
            className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full text-muted-foreground"
          >
            <X className="size-4" strokeWidth={1.75} />
          </DrawerClose>
        ) : null}
        {title || description || badge ? (
          <DrawerHeader className="items-start text-start">
            {badge}
            {title ? <DrawerTitle>{title}</DrawerTitle> : null}
            {description ? (
              <DrawerDescription>{description}</DrawerDescription>
            ) : null}
          </DrawerHeader>
        ) : null}
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4">
          {children}
        </div>
        {footer ? (
          <DrawerFooter
            className={cn(
              "pb-[calc(1rem+env(safe-area-inset-bottom,0px))]",
              footerClassName,
            )}
          >
            {footer}
          </DrawerFooter>
        ) : (
          <div className="pb-[env(safe-area-inset-bottom,0px)]" />
        )}
      </DrawerContent>
    </Drawer>
  );
}

export { DrawerDescription, DrawerTitle };
