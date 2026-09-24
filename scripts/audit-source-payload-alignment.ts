/**
 * Audit identity ↔ source payload alignment. Read-only.
 *
 * Usage: npx tsx scripts/audit-source-payload-alignment.ts
 */
import fs from "node:fs";
import path from "node:path";

import { createImportClient } from "@/lib/nabda-db/import-client";
import { loadLocalEnvFiles } from "@/lib/nabda-db/load-env";
import { auditSourcePayloadAlignment } from "@/lib/nabda-db/source-payload-alignment";

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "data", "source-payload-alignment-report.json");

async function main() {
  loadLocalEnvFiles(ROOT);
  const client = createImportClient();
  const report = await auditSourcePayloadAlignment(client, ROOT);

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  process.stdout.write(
    [
      `Wrote ${path.relative(ROOT, REPORT_PATH)}`,
      `protocols with_payload=${report.protocols.identities_with_payload} without=${report.protocols.identities_without_payload} orphan_payloads=${report.protocols.payloads_without_identity}`,
      `cats with_payload=${report.cats.identities_with_payload} orphan_payloads=${report.cats.payloads_without_identity} strategy=${report.cat_orphan_strategy}`,
      `drugs identities=${report.drugs.identities_total} bundles=${report.drugs.payload_bundles_total}`,
      `  exact_slug=${report.drugs.by_entity_slug_exact} presentation_index=${report.drugs.by_presentation_index} slug_prefix=${report.drugs.by_slug_prefix} unmatched=${report.drugs.unmatched_payloads}`,
      `  identities_with_payload=${report.drugs.identities_with_any_payload} ambiguous=${report.drugs.ambiguous_matches}`,
      `calculators with_payload=${report.calculators.identities_with_payload} orphan_payloads=${report.calculators.payloads_without_identity}`,
    ].join("\n") + "\n",
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exit(1);
});
