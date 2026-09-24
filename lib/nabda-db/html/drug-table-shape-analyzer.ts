/**
 * Analyze RCP table shape without rewriting cell text.
 */

import { htmlToPlainText } from "@/lib/nabda-db/html/html-cleaner";
import { tableDepth } from "@/lib/nabda-db/html/drug-table-normalizer";
import type { NabdaDrugSectionKind } from "@/types/nabda-drug-sections";
import type { NabdaDrugTableShape } from "@/types/nabda-drug-tables";

export type ParsedTableCell = {
  tag: "td" | "th";
  text: string;
  colspan: number;
  rowspan: number;
  hasImage: boolean;
};

export type DrugTableShapeAnalysis = {
  rowCount: number;
  columnCount: number;
  nestedDepth: number;
  headerTexts: string[];
  firstColumnSamples: string[];
  cellPreview: string[][];
  emptyCellCount: number;
  cellCount: number;
  hasMergedCells: boolean;
  hasLongCellText: boolean;
  hasImage: boolean;
  missingHeaders: boolean;
  shape: NabdaDrugTableShape;
  warnings: string[];
  joinedText: string;
};

const PREVIEW_ROWS = 5;
const PREVIEW_COLS = 5;
const PREVIEW_CELL_CHARS = 80;
const LONG_CELL_CHARS = 400;
const EMPTY_RATIO = 0.4;

function tagName(tag: string): string {
  return (tag.match(/^<\/?\s*([a-z0-9]+)/i)?.[1] ?? "").toLowerCase();
}

function attrInt(tag: string, name: string): number {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']?(\\d+)`, "i"));
  const value = match ? Number(match[1]) : 1;
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function clip(text: string, max: number): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max)}…`;
}

export function parseTopLevelRows(tableHtml: string): ParsedTableCell[][] {
  const rows: ParsedTableCell[][] = [];
  let tableLevel = 0;
  let currentRow: ParsedTableCell[] | null = null;
  let cellStart = -1;
  let cellTag: "td" | "th" | null = null;
  let cellColspan = 1;
  let cellRowspan = 1;
  const re = /<\/?(?:table|tr|td|th)\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(tableHtml))) {
    const tag = match[0];
    const name = tagName(tag);
    const isClose = tag.startsWith("</");
    if (name === "table") {
      tableLevel += isClose ? -1 : 1;
      tableLevel = Math.max(0, tableLevel);
      continue;
    }
    if (tableLevel !== 1) continue;
    if (name === "tr") {
      if (!isClose) {
        currentRow = [];
      } else if (currentRow) {
        rows.push(currentRow);
        currentRow = null;
      }
      continue;
    }
    if (name !== "td" && name !== "th") continue;
    if (!isClose) {
      cellStart = match.index + tag.length;
      cellTag = name as "td" | "th";
      cellColspan = attrInt(tag, "colspan");
      cellRowspan = attrInt(tag, "rowspan");
    } else if (cellTag && cellStart >= 0 && currentRow) {
      const inner = tableHtml.slice(cellStart, match.index);
      currentRow.push({
        tag: cellTag,
        text: htmlToPlainText(inner),
        colspan: cellColspan,
        rowspan: cellRowspan,
        hasImage: /<img\b/i.test(inner),
      });
      cellTag = null;
      cellStart = -1;
    }
  }
  if (currentRow && currentRow.length) rows.push(currentRow);
  return rows;
}

function looksLikeHeaderRow(row: ParsedTableCell[]): boolean {
  if (!row.length) return false;
  if (row.some((cell) => cell.tag === "th")) return true;
  const nonempty = row.filter((cell) => cell.text);
  if (nonempty.length < 2) return false;
  const short = nonempty.filter((cell) => cell.text.length <= 48).length;
  return short / nonempty.length >= 0.75;
}

function classifyShape(
  sectionKind: NabdaDrugSectionKind | string,
  nestedDepth: number,
  rowCount: number,
  columnCount: number,
): NabdaDrugTableShape {
  if (nestedDepth >= 2) return "nested_layout_table";
  if (sectionKind === "adverse_effects") return "long_adverse_effect_table";
  if (sectionKind === "interactions") return "interaction_table";
  if (sectionKind === "posology") return "posology_table";
  if (sectionKind === "composition" || sectionKind === "forms") return "composition_table";
  if (sectionKind === "pharmacology") return "pharmacology_table";
  if (columnCount === 2 && rowCount <= 12) return "two_column_label_value";
  if (columnCount <= 2 && rowCount <= 6) return "small_key_value";
  if (columnCount >= 3 && rowCount >= 3) return "multi_column_grid";
  return "unknown";
}

export function analyzeTableShape(
  tableHtml: string,
  sectionKind: NabdaDrugSectionKind | string,
): DrugTableShapeAnalysis {
  const nestedDepth = tableDepth(tableHtml);
  const rows = parseTopLevelRows(tableHtml);
  const rowCount = rows.length;
  const columnCount = rows.reduce(
    (max, row) => Math.max(max, row.reduce((sum, cell) => sum + cell.colspan, 0)),
    0,
  );
  const headerRow = rows[0] && looksLikeHeaderRow(rows[0]) ? rows[0] : null;
  const headerTexts = (headerRow ?? []).map((cell) => clip(cell.text, PREVIEW_CELL_CHARS)).filter(Boolean);
  const firstColumnSamples = rows
    .slice(headerRow ? 1 : 0, 8)
    .map((row) => clip(row[0]?.text ?? "", PREVIEW_CELL_CHARS))
    .filter(Boolean);
  const cellPreview = rows.slice(0, PREVIEW_ROWS).map((row) =>
    row.slice(0, PREVIEW_COLS).map((cell) => clip(cell.text, PREVIEW_CELL_CHARS)),
  );
  let emptyCellCount = 0;
  let cellCount = 0;
  let hasMergedCells = false;
  let hasLongCellText = false;
  let hasImage = false;
  for (const row of rows) {
    for (const cell of row) {
      cellCount += 1;
      if (!cell.text) emptyCellCount += 1;
      if (cell.colspan > 1 || cell.rowspan > 1) hasMergedCells = true;
      if (cell.text.length >= LONG_CELL_CHARS) hasLongCellText = true;
      if (cell.hasImage) hasImage = true;
    }
  }
  const missingHeaders = rowCount > 1 && columnCount >= 2 && headerTexts.length === 0;
  const emptyRatio = cellCount ? emptyCellCount / cellCount : 0;
  const warnings: string[] = [];
  if (nestedDepth >= 2) warnings.push("nested_table");
  if (rowCount >= 20 || columnCount >= 8) warnings.push("large_table");
  if (hasMergedCells) warnings.push("merged_cells");
  if (emptyRatio >= EMPTY_RATIO && cellCount >= 4) warnings.push("many_empty_cells");
  if (hasLongCellText) warnings.push("long_cell_text");
  if (hasImage) warnings.push("image_in_table");
  if (missingHeaders) warnings.push("missing_headers");
  const shape = classifyShape(sectionKind, nestedDepth, rowCount, columnCount);
  if (shape === "unknown") warnings.push("unknown_table_pattern");
  const joinedText = rows
    .flatMap((row) => row.map((cell) => cell.text))
    .join("\n");
  return {
    rowCount,
    columnCount,
    nestedDepth,
    headerTexts,
    firstColumnSamples,
    cellPreview,
    emptyCellCount,
    cellCount,
    hasMergedCells,
    hasLongCellText,
    hasImage,
    missingHeaders,
    shape,
    warnings,
    joinedText,
  };
}
