"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn/avatar";
import { ShellHeaderSlot } from "./shell-chrome";
import {
  LAYOUT_FRAME,
  LAYOUT_GUTTER,
  type ShellFrame,
} from "@/lib/layout/frames";
import type { ShellPerson } from "@/lib/session/person";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  title?: string;
  actions?: ReactNode;
  avatarDot?: boolean;
  pageHeading?: boolean;
  frame?: ShellFrame;
  person?: ShellPerson | null;
};

export function AppHeader({
  title = "Accueil",
  actions,
  avatarDot = false,
  pageHeading = true,
  frame = "workspace",
  person = null,
}: AppHeaderProps) {
  const titleClassName =
    "min-w-0 truncate text-center text-headline-sm";
  const displayName = person?.displayName?.trim() ?? "";
  const initials = person?.initials || "ND";
  const profileLabel = displayName
    ? `Profil, ${displayName}`
    : "Profil";
  const TitleTag = pageHeading ? "h1" : "p";

  return (
    <header
      data-app-header
      className="fixed top-0 right-0 left-0 z-[var(--z-header)] bg-surface/85 pt-safe shadow-[var(--shadow-subtle)] backdrop-blur-xl lg:left-[var(--layout-sidebar)]"
    >
      <div
        className={cn(
          "grid h-[var(--layout-header-height)] w-full grid-cols-3 items-center gap-2",
          LAYOUT_GUTTER,
          LAYOUT_FRAME[frame],
        )}
      >
        <div className="flex min-w-0 items-center">
          <Link
            href="/home"
            aria-label="Nabda, accueil"
            className="inline-flex min-h-11 min-w-11 items-center justify-center"
          >
            <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-label-md text-primary-foreground">
              N
            </span>
          </Link>
        </div>
        <TitleTag className={titleClassName}>{title}</TitleTag>
        <div className="flex min-w-0 items-center justify-end gap-1.5">
          {actions}
          <ShellHeaderSlot />
          <Link
            href="/profile"
            aria-label={profileLabel}
            className="relative inline-flex min-h-11 max-w-full items-center gap-2 rounded-full py-1 pl-0.5 pr-2.5 text-on-surface"
          >
            <Avatar>
              {person?.avatarUrl ? (
                <AvatarImage src={person.avatarUrl} alt="" />
              ) : null}
              <AvatarFallback className="bg-primary text-label-md text-primary-foreground">
                {initials}
              </AvatarFallback>
              {avatarDot ? <AvatarBadge className="bg-secondary-container" /> : null}
            </Avatar>
            {displayName ? (
              <span className="hidden min-w-0 truncate text-headline-sm sm:inline">
                {displayName}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
