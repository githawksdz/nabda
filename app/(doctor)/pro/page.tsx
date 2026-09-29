import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ContentCard,
} from "@/components/ui/ContentCard";
import { getSubscriptionPlans, getCurrentUserPlan } from "@/features/subscriptions/api";
import type { BillingPeriod, SubscriptionPlan } from "@/types/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nabda Pro",
  description:
    "Packs hors-ligne et contenus Pro pour garder protocoles, médicaments et scores pendant une garde.",
};

const COMPARISON = [
  {
    label: "Contenus ouverts",
    free: "Consultables en ligne",
    pro: "Consultables en ligne",
  },
  {
    label: "Contenus Pro",
    free: "Non inclus",
    pro: "Protocoles, médicaments et outils réservés",
  },
  {
    label: "Packs hors-ligne",
    free: "Non inclus",
    pro: "À télécharger avant la garde",
  },
  {
    label: "Mises à jour",
    free: "—",
    pro: "Une fiche déjà téléchargée se rafraîchit quand une version plus récente est disponible",
  },
] as const;

function periodLabel(period: BillingPeriod) {
  if (period === "yearly") return "par an";
  if (period === "monthly") return "par mois";
  if (period === "lifetime") return "à vie";
  return "";
}

function planPrice(plan: SubscriptionPlan) {
  if (plan.price_dzd == null) return null;
  const amount = new Intl.NumberFormat("fr-DZ").format(plan.price_dzd);
  const period = periodLabel(plan.billing_period);
  return period ? `${amount} DZD ${period}` : `${amount} DZD`;
}

export default async function ProPage() {
  const [current, plans] = await Promise.all([
    getCurrentUserPlan(),
    getSubscriptionPlans(),
  ]);
  const isPro = Boolean(current?.slug?.startsWith("pro") && current.slug !== "freemium");
  const offered = plans.filter(
    (plan) => plan.slug.startsWith("pro") && plan.slug !== "freemium",
  );

  return (
    <div className="layout-reading flex flex-col gap-6 pt-1">
      <header className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold tracking-[0.04em] text-text-secondary">
          Nabda Pro
        </p>
        <h1
          className={
            isPro
              ? "text-display"
              : "font-signature text-[1.75rem] leading-[1.15]"
          }
        >
          {isPro
            ? "Votre espace Pro est déjà actif."
            : "Vos outils de garde, même sans réseau."}
        </h1>
        <p className="max-w-[36rem] text-body-md text-text-secondary">
          {isPro
            ? "Gérez vos packs et vérifiez les mises à jour des contenus déjà téléchargés."
            : "Pro sert à préparer une garde : télécharger les packs essentiels, puis retrouver protocoles, médicaments et scores sans dépendre du réseau."}
        </p>
      </header>

      {isPro ? (
        <Button href="/offline" className="w-fit">
          Gérer mes contenus hors-ligne
        </Button>
      ) : (
        <>
          <ContentCard size="sm">
            <CardHeader>
              <CardTitle>Gratuit et Pro</CardTitle>
              <CardDescription>
                Pro ajoute l’accès hors-ligne et les contenus réservés. Ce n’est pas une certification clinique.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3">
                {COMPARISON.map((row) => (
                  <li key={row.label} className="grid gap-1 border-t border-border pt-3 first:border-0 first:pt-0">
                    <p className="text-label-sm text-text-secondary">{row.label}</p>
                    <p className="text-body-sm">
                      <span className="text-text-secondary">Gratuit. </span>
                      {row.free}
                    </p>
                    <p className="text-body-sm">
                      <span className="text-text-secondary">Pro. </span>
                      {row.pro}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </ContentCard>

          <ContentCard size="sm">
            <CardHeader>
              <CardTitle>Plan disponible</CardTitle>
              <CardDescription>
                Le paiement ne se fait pas encore dans Nabda. Aucun bouton ici ne lance un achat.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {offered.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {offered.map((plan) => {
                    const price = planPrice(plan);
                    return (
                      <li key={plan.id}>
                        <p className="text-body-md font-medium">{plan.name}</p>
                        {price ? (
                          <p className="text-body-sm text-text-secondary">{price}</p>
                        ) : null}
                        {plan.description ? (
                          <p className="mt-1 text-body-sm text-text-secondary">{plan.description}</p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-body-sm text-text-secondary">
                  Aucun plan Pro n’est publié pour le moment. Le tarif apparaîtra ici dès qu’il sera disponible.
                </p>
              )}
            </CardContent>
          </ContentCard>

          <Button href="/home" variant="secondary" className="w-fit">
            Retour à l’accueil
          </Button>
        </>
      )}
    </div>
  );
}
