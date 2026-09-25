import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";

export function OfflinePackCard() {
  return (
    <Surface variant="muted" as="aside" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-headline-sm">Garde et contenus téléchargés</h2>
          <p className="mt-1 text-body-sm text-text-secondary">
            Téléchargez un pack choisi par l’équipe, ou une fiche publiée. Rien
            n’est mis en cache par défaut.
          </p>
        </div>
        <StatusBadge tone="pro">
          <WifiOff className="size-3.5" strokeWidth={1.75} aria-hidden />
          Pro
        </StatusBadge>
      </div>
      <Button variant="secondary" href="/offline">
        Gérer le stockage hors-ligne
      </Button>
    </Surface>
  );
}
