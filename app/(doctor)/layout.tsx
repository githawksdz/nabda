import type { ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";
import { getCurrentProfile } from "@/features/profile/api";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { shellPersonFromProfile } from "@/lib/session/person";

export default async function DoctorLayout({
  children,
}: {
  children: ReactNode;
}) {
  let person = null;
  if (isSupabaseConfigured()) {
    try {
      person = shellPersonFromProfile(await getCurrentProfile());
    } catch {
      person = null;
    }
  }

  return <AppShell person={person}>{children}</AppShell>;
}
