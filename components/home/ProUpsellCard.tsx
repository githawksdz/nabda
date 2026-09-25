import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";

export function ProUpsellCard() {
  return (
    <Surface variant="muted" as="aside" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-headline-sm">Packs hors-ligne</h2>
          <p className="mt-1 text-body-sm text-text-secondary">
            Les packs hors-ligne se gèrent dans Hors-ligne. Les éléments Pro
            restent indiqués avant le téléchargement.
          </p>
        </div>
        <StatusBadge tone="free">Gratuit</StatusBadge>
      </div>
      <Button variant="secondary" href="/offline">
        Ouvrir Hors-ligne
      </Button>
    </Surface>
  );
}
