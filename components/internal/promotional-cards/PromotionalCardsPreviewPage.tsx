"use client";

import { useMemo } from "react";
import {
  DiscoveryList,
  DiscoveryListItem,
} from "@/components/discovery/DiscoveryListRow";
import { ProtocolListCard } from "@/components/protocols/ProtocolListCard";
import { DrugListRow } from "@/components/drugs/DrugListRow";
import type { DrugCatalogCardItem } from "@/types/drugs";
import { ProCouponCard } from "@/components/promotions/ProCouponCard";
import { ProfileCompletionCard } from "@/components/promotions/ProfileCompletionCard";
import { ProPainPointCard } from "@/components/promotions/ProPainPointCard";
import {
  couponFixtureExpired,
  couponFixtureLongTtl,
  couponFixtureShortTtl,
  painPointDefault,
  painPointOffline,
  profileCompletionAlmostDone,
  profileCompletionMid,
  profileVerificationMid,
} from "@/lib/demo-fixtures/promotions";

const PREVIEW_ROWS = [
  {
    id: "1",
    title: "Douleur thoracique",
    href: "/protocols/douleur-thoracique",
    summary: "Orientation initiale et conduite à tenir",
    categorySlug: "cardiologie",
  },
  {
    id: "2",
    title: "Fièvre de l’enfant",
    href: "/protocols/fievre-enfant",
    summary: "Repères cliniques et critères de gravité",
    categorySlug: "pediatrie",
  },
  {
    id: "3",
    title: "Céphalées brutales",
    href: "/protocols/cephalees-brutales-hsa",
    summary: "Suspecter une hémorragie sous-arachnoïdienne",
    categorySlug: "neurologie",
  },
  {
    id: "4",
    title: "Intoxication médicamenteuse",
    href: "/protocols/intoxication-medicamenteuse",
    summary: "Stabilisation et avis spécialisé",
    categorySlug: "urgences",
  },
] as const;

const PREVIEW_DRUGS: DrugCatalogCardItem[] = [
  {
    id: "amoxicilline",
    slug: "amoxicilline",
    genericName: "Amoxicilline",
    brandNames: ["Clamoxyl"],
    className: "Pénicilline A · Bêtalactamine",
    classLabels: ["Pénicilline A", "Bêtalactamine"],
    categorySlugs: ["infectiologie"],
    categorySlug: "infectiologie",
    status: "published",
    reviewStatus: "unreviewed",
    visibility: "public_free",
    href: "/drugs/amoxicilline",
    iconName: "pill",
    searchTerms: [],
    description: "Antibiotique de première intention, à confirmer selon le contexte.",
    cardKey: "amoxicilline:Clamoxyl",
    commercialName: "Clamoxyl",
    dciLabel: "Amoxicilline",
  },
  {
    id: "paracetamol",
    slug: "paracetamol",
    genericName: "Paracétamol",
    brandNames: ["Doliprane"],
    className: "Analgésique · Antipyrétique",
    classLabels: ["Analgésique", "Antipyrétique"],
    categorySlugs: ["neurologie"],
    categorySlug: "neurologie",
    status: "published",
    reviewStatus: "unreviewed",
    visibility: "public_free",
    href: "/drugs/paracetamol",
    iconName: "pill",
    searchTerms: [],
    description: "Antalgique et antipyrétique de recours fréquent.",
    cardKey: "paracetamol:Doliprane",
    commercialName: "Doliprane",
    dciLabel: "Paracétamol",
  },
  {
    id: "furosemide",
    slug: "furosemide",
    genericName: "Furosémide",
    brandNames: ["Lasilix"],
    className: "Diurétique de l'anse",
    classLabels: ["Diurétique de l'anse"],
    categorySlugs: ["cardiologie"],
    categorySlug: "cardiologie",
    status: "published",
    reviewStatus: "unreviewed",
    visibility: "public_free",
    href: "/drugs/furosemide",
    iconName: "pill",
    searchTerms: [],
    description: "Diurétique utilisé en urgence et en insuffisance cardiaque.",
    cardKey: "furosemide:Lasilix",
    commercialName: "Lasilix",
    dciLabel: "Furosémide",
  },
  {
    id: "enoxaparine",
    slug: "enoxaparine",
    genericName: "Énoxaparine",
    brandNames: ["Lovenox"],
    className: "HBPM · Antithrombotique",
    classLabels: ["HBPM", "Antithrombotique"],
    categorySlugs: ["hematologie"],
    categorySlug: "hematologie",
    status: "published",
    reviewStatus: "unreviewed",
    visibility: "public_free",
    href: "/drugs/enoxaparine",
    iconName: "pill",
    searchTerms: [],
    description: "Héparine de bas poids moléculaire, à vérifier selon le terrain.",
    cardKey: "enoxaparine:Lovenox",
    commercialName: "Lovenox",
    dciLabel: "Énoxaparine",
  },
];

export function PromotionalCardsPreviewPage({
  focus,
}: {
  focus?: string;
}) {
  const referenceMs = useMemo(() => Date.now(), []);
  const show = (id: string) => !focus || focus === id;

  return (
    <div className="layout-reading flex flex-col gap-8 py-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-display">Cartes promotionnelles</h1>
        <p className="text-body-md text-text-secondary">
          Aperçu interne — fixtures de démonstration uniquement. Les cartes
          sont montrées dans un rythme de liste, pas isolées.
        </p>
      </header>

      {show("coupon") ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-headline-sm">Coupon dans une liste module</h2>
          <DiscoveryList>
            {PREVIEW_ROWS.slice(0, 3).map((item) => (
              <DiscoveryListItem key={item.id}>
                <ProtocolListCard
                  href={item.href}
                  title={item.title}
                  description={item.summary}
                  categorySlug={item.categorySlug}
                />
              </DiscoveryListItem>
            ))}
            <DiscoveryListItem>
              <ProCouponCard campaign={couponFixtureShortTtl(referenceMs)} />
            </DiscoveryListItem>
            {PREVIEW_ROWS.slice(3).map((item) => (
              <DiscoveryListItem key={item.id}>
                <ProtocolListCard
                  href={item.href}
                  title={item.title}
                  description={item.summary}
                  categorySlug={item.categorySlug}
                />
              </DiscoveryListItem>
            ))}
          </DiscoveryList>
        </section>
      ) : null}

      {show("coupon") ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-headline-sm">Médicaments — cartes 1:1</h2>
          <ul className="grid grid-cols-2 gap-2">
            {PREVIEW_DRUGS.map((drug) => (
              <li key={drug.cardKey} className="min-w-0">
                <DrugListRow drug={drug} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {show("coupon-long") ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-headline-sm">ProCoupon — plus de 24 h</h2>
          <ProCouponCard campaign={couponFixtureLongTtl(referenceMs)} />
        </section>
      ) : null}

      {show("coupon-expired") ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-headline-sm">ProCoupon — expiré (non rendu)</h2>
          <p className="text-body-sm text-text-secondary">
            La carte suivante doit rester vide.
          </p>
          <ProCouponCard campaign={couponFixtureExpired(referenceMs)} />
        </section>
      ) : null}

      {show("profile") ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-headline-sm">Accueil — profil ~60 %</h2>
          <p className="text-label-sm text-text-secondary">Reprendre</p>
          <ProfileCompletionCard data={profileCompletionMid} />
        </section>
      ) : null}

      {show("profile-last") ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-headline-sm">Profil — une étape restante</h2>
          <ProfileCompletionCard data={profileCompletionAlmostDone} />
        </section>
      ) : null}

      {show("profile-verify") ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-headline-sm">Vérification professionnelle</h2>
          <ProfileCompletionCard data={profileVerificationMid} />
        </section>
      ) : null}

      {show("pain") ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-headline-sm">Accueil — pain-point défaut</h2>
          <ProPainPointCard variant={painPointDefault} />
        </section>
      ) : null}

      {show("pain-offline") ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-headline-sm">Pain-point — hors-ligne</h2>
          <ProPainPointCard variant={painPointOffline} />
        </section>
      ) : null}

      {show("pro-hidden") ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-headline-sm">Pro user — conversion masquée</h2>
          <ProPainPointCard variant={painPointDefault} show={false} />
          <p className="text-body-sm text-text-secondary">
            Aucune carte visible ci-dessus.
          </p>
        </section>
      ) : null}
    </div>
  );
}
