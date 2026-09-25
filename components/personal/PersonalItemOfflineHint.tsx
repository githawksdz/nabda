"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { contentRepository } from "@/lib/offline/repository";
import type { LocalContentRecord, OfflineContentType } from "@/lib/offline/types";
import type { PersonalEntityType } from "@/types/personal";

const TYPE_MAP: Record<PersonalEntityType, OfflineContentType> = {
  cat: "cat",
  protocol: "protocol",
  calculator: "calculator",
  drug: "drug",
};

type PersonalItemOfflineHintProps = {
  entityType: PersonalEntityType;
  slug: string;
};

export function PersonalItemOfflineHint({
  entityType,
  slug,
}: PersonalItemOfflineHintProps) {
  const [record, setRecord] = useState<LocalContentRecord | null | undefined>(
    undefined,
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        if (!cancelled) setRecord(null);
        return;
      }
      const local = await contentRepository.listLocal(user.id);
      if (cancelled) return;
      const match = local.find(
        (item) =>
          item.contentType === TYPE_MAP[entityType] && item.slug === slug,
      );
      setRecord(match ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [entityType, slug]);

  if (!record) {
    return null;
  }

  return (
    <span className="mt-1.5 inline-flex rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
      {record.stale ? "Mise à jour disponible" : "Disponible hors-ligne"}
    </span>
  );
}
