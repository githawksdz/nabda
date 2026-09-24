import type {
  NabdaDrugSectionDisplay,
  NabdaDrugSectionKind,
  NabdaDrugTablePattern,
  NabdaDrugTableStats,
} from "@/types/nabda-drug-sections";

const LARGE_ROWS = 20;
const LARGE_COLS = 8;

export function tableDepth(html: string): number {
  let depth = 0;
  let max = 0;
  const re = /<\/?table\b/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    if (match[0].toLowerCase().startsWith("</")) {
      depth = Math.max(0, depth - 1);
    } else {
      depth += 1;
      if (depth > max) max = depth;
    }
  }
  return max;
}

export function countTables(html: string): number {
  return (html.match(/<table\b/gi) ?? []).length;
}

function firstRowCells(tableHtml: string): number {
  const row = tableHtml.match(/<tr\b[\s\S]*?<\/tr>/i)?.[0] ?? "";
  return (row.match(/<(td|th)\b/gi) ?? []).length;
}

function rowCount(tableHtml: string): number {
  return (tableHtml.match(/<tr\b/gi) ?? []).length;
}

export function splitTables(html: string): string[] {
  const tables: string[] = [];
  let depth = 0;
  let start = -1;
  const re = /<\/?table\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const isClose = match[0].toLowerCase().startsWith("</");
    if (!isClose) {
      if (depth === 0) {
        start = match.index;
      }
      depth += 1;
    } else {
      depth = Math.max(0, depth - 1);
      if (depth === 0 && start >= 0) {
        tables.push(html.slice(start, match.index + match[0].length));
        start = -1;
      }
    }
  }
  return tables;
}

function patternsForTable(
  kind: NabdaDrugSectionKind,
  nested: boolean,
  rows: number,
  cols: number,
): NabdaDrugTablePattern[] {
  const patterns: NabdaDrugTablePattern[] = [];
  if (nested) patterns.push("nested_table");
  if (kind === "interactions") patterns.push("interaction_table");
  else if (kind === "adverse_effects") patterns.push("adverse_effect_table");
  else if (kind === "posology") patterns.push("posology_table");
  else if (kind === "composition" || kind === "forms") patterns.push("composition_table");
  if (rows >= LARGE_ROWS || cols >= LARGE_COLS) patterns.push("large_table");
  if (!patterns.length) {
    patterns.push(rows <= 2 && cols <= 2 ? "other_table" : "simple_table");
  }
  return patterns;
}

function displayForPatterns(
  patterns: NabdaDrugTablePattern[],
  kind: NabdaDrugSectionKind,
): NabdaDrugSectionDisplay {
  if (patterns.includes("interaction_table") || kind === "interactions") {
    return "interaction_table";
  }
  if (patterns.includes("adverse_effect_table") || kind === "adverse_effects") {
    return "adverse_effect_table";
  }
  if (patterns.includes("posology_table") || kind === "posology") {
    return "posology_card";
  }
  if (patterns.includes("nested_table") || patterns.includes("large_table")) {
    return "table_cards";
  }
  if (patterns.length) {
    return "table_cards";
  }
  return "collapsible";
}

export function analyzeDrugTables(
  html: string,
  kind: NabdaDrugSectionKind,
): NabdaDrugTableStats {
  const tables = splitTables(html);
  let maxRows = 0;
  let maxColumns = 0;
  const hasNestedTables = tableDepth(html) >= 2;
  const patterns: NabdaDrugTablePattern[] = [];
  for (const table of tables) {
    const rows = rowCount(table);
    const cols = firstRowCells(table);
    if (rows > maxRows) maxRows = rows;
    if (cols > maxColumns) maxColumns = cols;
    const nested = tableDepth(table) >= 2;
    for (const pattern of patternsForTable(kind, nested, rows, cols)) {
      if (!patterns.includes(pattern)) {
        patterns.push(pattern);
      }
    }
  }
  return {
    tableCount: tables.length,
    maxRows,
    maxColumns,
    hasNestedTables,
    patterns,
    recommendedDisplay: displayForPatterns(patterns, kind),
  };
}
