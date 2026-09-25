"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionNav } from "@/components/content-detail/SectionNav";
import { EmptyContentState } from "@/components/content-detail/EmptyContentState";
import { RichContentRenderer } from "@/components/content-detail/rich-content/RichContentRenderer";
import {
  adjacentSections,
  getSectionNavItems,
  protocolHref,
  readingTrackerLabel,
} from "@/lib/content-detail/content-detail-ui-config";
import type { ProtocolDetail, ProtocolSection } from "@/types/content-detail";

type ProtocolDeepSectionProps = {
  detail: ProtocolDetail;
  section: ProtocolSection;
};

export function ProtocolDeepSection({
  detail,
  section,
}: ProtocolDeepSectionProps) {
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const navItems = getSectionNavItems(detail);
  const { previous, next } = adjacentSections(detail, section.slug);

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <p className="text-label-sm text-on-surface-variant">
          {readingTrackerLabel(detail, section)}
        </p>
        <h1 className="mt-1 text-headline-sm">{section.title}</h1>
      </section>

      <SectionNav
        protocolSlug={detail.protocol.slug}
        items={navItems}
        activeSlug={section.slug}
      />

      {section.content.blocks.length > 0 ? (
        <RichContentRenderer document={section.content} />
      ) : (
        <EmptyContentState
          title="Section en préparation"
          description="Le contenu de cette section n'est pas encore disponible dans Nabda."
          href={protocolHref(detail.protocol.slug)}
          actionLabel="Retour à la synthèse"
        />
      )}

      <div className="flex gap-2">
        {previous ? (
          <Link
            href={protocolHref(detail.protocol.slug, { section: previous.slug })}
            className="flex min-h-11 min-w-0 flex-1 items-center gap-1 rounded-xl bg-surface-container-low px-3 text-label-md"
          >
            <ChevronLeft className="size-4 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{previous.nav_label}</span>
          </Link>
        ) : (
          <Link
            href={protocolHref(detail.protocol.slug)}
            className="flex min-h-11 min-w-0 flex-1 items-center gap-1 rounded-xl bg-surface-container-low px-3 text-label-md"
          >
            <ChevronLeft className="size-4 shrink-0" strokeWidth={1.75} />
            <span className="truncate">Points clés</span>
          </Link>
        )}
        {next ? (
          <Link
            href={protocolHref(detail.protocol.slug, { section: next.slug })}
            className="flex min-h-11 min-w-0 flex-1 items-center justify-end gap-1 rounded-xl bg-primary px-3 text-label-md text-on-primary"
          >
            <span className="truncate">{next.nav_label}</span>
            <ChevronRight className="size-4 shrink-0" strokeWidth={1.75} />
          </Link>
        ) : (
          <Link
            href={protocolHref(detail.protocol.slug)}
            className="flex min-h-11 min-w-0 flex-1 items-center justify-end gap-1 rounded-xl bg-primary px-3 text-label-md text-on-primary"
          >
            <span className="truncate">Synthèse</span>
            <ChevronRight className="size-4 shrink-0" strokeWidth={1.75} />
          </Link>
        )}
      </div>

      <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <h2 className="text-headline-sm">Notes de service & annotations</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Ajouter une consigne propre à l&apos;équipe. Enregistrement local uniquement.
        </p>
        <label className="sr-only" htmlFor="protocol-local-note">
          Note locale
        </label>
        <textarea
          id="protocol-local-note"
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
            setNoteSaved(false);
          }}
          rows={3}
          placeholder="Consignes d'équipe, rappels de filière locale…"
          className="mt-3 w-full resize-none rounded-xl bg-surface-container-low px-3 py-2.5 text-body-sm text-on-surface outline-none"
        />
        <button
          type="button"
          onClick={() => setNoteSaved(true)}
          className="mt-3 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-label-md text-on-primary"
        >
          {noteSaved ? "Note enregistrée" : "Enregistrer la note"}
        </button>
      </section>
    </div>
  );
}
