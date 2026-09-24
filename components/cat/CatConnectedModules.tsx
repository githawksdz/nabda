import { CatConnectedModuleRow } from "./cards/CatConnectedModuleRow";
import { CONNECTED_MODULES } from "@/lib/cat/cat-ui-config";

export function CatConnectedModules() {
  return (
    <section>
      <div className="mb-2">
        <h2 className="text-headline-sm">Modules transversaux connexes</h2>
        <p className="text-label-sm text-on-surface-variant">Accès rapide</p>
      </div>
      <div className="flex flex-col gap-2">
        {CONNECTED_MODULES.map((module) => (
          <CatConnectedModuleRow key={module.id} module={module} />
        ))}
      </div>
    </section>
  );
}
