import fs from "node:fs";
import path from "node:path";

import { mapCalculatorIdentity } from "@/lib/nabda-db/calculator-mapper";
import { mapCatIdentity } from "@/lib/nabda-db/cat-mapper";
import { mapDrugIdentity } from "@/lib/nabda-db/drug-mapper";
import { mapContentLinks } from "@/lib/nabda-db/link-mapper";
import { mapGuidelineToProtocolIdentity } from "@/lib/nabda-db/protocol-mapper";
import { UNCATEGORIZED } from "@/lib/nabda-db/taxonomy";
import type {
  CalculatorIdentity,
  CatIdentity,
  ContentLinkIdentity,
  DrugIdentity,
  NabdaDbAtc,
  NabdaDbCalculator,
  NabdaDbGuideline,
  NabdaDbLink,
  NabdaDbPresentation,
  NabdaDbProduct,
  NabdaDbSubstance,
  ProtocolIdentity,
} from "@/lib/nabda-db/source-types";

export type LoadedIdentities = {
  protocols: ProtocolIdentity[];
  cats: CatIdentity[];
  drugs: DrugIdentity[];
  calculators: CalculatorIdentity[];
  links: ContentLinkIdentity[];
  presentations_indexed: number;
  products_indexed: number;
  links_source_rows: number;
  unmapped: {
    protocols: Array<{ source_id: string; title: string }>;
    calc_specialties: Array<{ value: string; count: number }>;
    drugs_uncategorized_atc: Array<{ source_id: string; atc_id: string | null }>;
    drugs_uncategorized_atc_count: number;
  };
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function listPrefixedJson(dir: string, prefix: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((name) => name.startsWith(prefix) && name.endsWith(".json"))
    .map((name) => path.join(dir, name))
    .sort();
}

function increment(map: Record<string, number>, key: string): void {
  map[key] = (map[key] ?? 0) + 1;
}

function groupBy<T>(rows: T[], keyFn: (row: T) => string | null | undefined): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const key = keyFn(row);
    if (!key) {
      continue;
    }
    const list = map.get(key);
    if (list) {
      list.push(row);
    } else {
      map.set(key, [row]);
    }
  }
  return map;
}

function parseJsonl(filePath: string): NabdaDbLink[] {
  const text = fs.readFileSync(filePath, "utf8");
  const records: NabdaDbLink[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) {
      continue;
    }
    records.push(JSON.parse(line) as NabdaDbLink);
  }
  return records;
}

export function nabdaDbRoot(cwd = process.cwd()): string {
  return path.join(cwd, "nabda_db");
}

export function loadNabdaDbIdentities(cwd = process.cwd()): LoadedIdentities {
  const root = nabdaDbRoot(cwd);
  const protocolFiles = listPrefixedJson(path.join(root, "cat"), "g.");
  const calcFiles = listPrefixedJson(path.join(root, "calcs"), "calc.");

  const protocols: ProtocolIdentity[] = [];
  const cats: CatIdentity[] = [];
  const unmappedProtocols: Array<{ source_id: string; title: string }> = [];

  for (const filePath of protocolFiles) {
    const source = readJson<NabdaDbGuideline>(filePath);
    const protocol = mapGuidelineToProtocolIdentity(source);
    protocols.push(protocol);
    if (protocol.category_slug === UNCATEGORIZED) {
      unmappedProtocols.push({ source_id: protocol.source_id, title: protocol.title });
    }
    const cat = mapCatIdentity(source);
    if (cat) {
      cats.push(cat);
    }
  }

  const calculators: CalculatorIdentity[] = [];
  const unmappedSpecialtyCounts: Record<string, number> = {};
  for (const filePath of calcFiles) {
    const source = readJson<NabdaDbCalculator>(filePath);
    const mapped = mapCalculatorIdentity(source);
    calculators.push(mapped);
    const unmapped = mapped.source_trace.unmapped_specialties;
    if (Array.isArray(unmapped)) {
      for (const specialty of unmapped) {
        if (typeof specialty === "string") {
          increment(unmappedSpecialtyCounts, specialty);
        }
      }
    }
  }

  const substances = readJson<NabdaDbSubstance[]>(
    path.join(root, "drugs", "substances.json"),
  );
  const presentations = readJson<NabdaDbPresentation[]>(
    path.join(root, "drugs", "presentations.json"),
  );
  const products = readJson<NabdaDbProduct[]>(
    path.join(root, "drugs", "products.json"),
  );
  const atcRows = readJson<NabdaDbAtc[]>(path.join(root, "drugs", "atc.json"));
  const atcById = new Map(atcRows.map((row) => [row.id, row] as const));
  const presentationsBySubstance = groupBy(presentations, (row) => row.substance_id);
  const productsBySubstance = groupBy(products, (row) => row.substance_id);

  const drugs: DrugIdentity[] = [];
  const unmappedDrugAtc: Array<{ source_id: string; atc_id: string | null }> = [];
  for (const substance of substances) {
    const mapped = mapDrugIdentity({
      substance,
      presentations: presentationsBySubstance.get(substance.id) ?? [],
      products: productsBySubstance.get(substance.id) ?? [],
      atc: substance.atc_id ? atcById.get(substance.atc_id) ?? null : null,
    });
    drugs.push(mapped);
    if (mapped.class_slug === UNCATEGORIZED) {
      unmappedDrugAtc.push({
        source_id: mapped.source_id,
        atc_id: substance.atc_id ?? null,
      });
    }
  }

  const linkRecords = parseJsonl(path.join(root, "links.jsonl"));
  const links = mapContentLinks(linkRecords);

  return {
    protocols,
    cats,
    drugs,
    calculators,
    links,
    presentations_indexed: presentations.length,
    products_indexed: products.length,
    links_source_rows: linkRecords.length,
    unmapped: {
      protocols: unmappedProtocols,
      calc_specialties: Object.entries(unmappedSpecialtyCounts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([value, count]) => ({ value, count })),
      drugs_uncategorized_atc: unmappedDrugAtc.slice(0, 50),
      drugs_uncategorized_atc_count: unmappedDrugAtc.length,
    },
  };
}
