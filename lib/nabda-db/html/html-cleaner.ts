/**
 * Conservative HTML cleaner for nabda_db protocol body_html.
 * Strips scripts, hover handlers, and imagemaps. Does not rewrite wording.
 */

export type HtmlCleanResult = {
  html: string;
  warnings: string[];
  strippedImagemap: boolean;
  keptImageSrcs: string[];
};

const EVENT_HANDLER_ATTR =
  /\s+on(?:mouseover|mouseout|mousemove|mouseenter|mouseleave|click|load|error|focus|blur)\s*=\s*("[\s\S]*?"|'[\s\S]*?')/gi;

function matchOpenDiv(html: string, from: number): { end: number; attrs: string } | null {
  if (html.slice(from, from + 4).toLowerCase() !== "<div") {
    return null;
  }
  const close = html.indexOf(">", from);
  if (close < 0) {
    return null;
  }
  return { end: close + 1, attrs: html.slice(from + 4, close) };
}

function classList(attrs: string): string[] {
  const match = attrs.match(/\bclass\s*=\s*("([^"]*)"|'([^']*)')/i);
  const raw = match?.[2] ?? match?.[3] ?? "";
  return raw.split(/\s+/).filter(Boolean);
}

/**
 * Find `<div>` ranges whose class tokens include every `requiredClass`.
 */
export function findDivRanges(
  html: string,
  requiredClass: string[],
): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  const stack: Array<{ start: number; match: boolean }> = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] !== "<") {
      i += 1;
      continue;
    }
    const slice = html.slice(i, i + 6).toLowerCase();
    if (slice.startsWith("</div")) {
      const close = html.indexOf(">", i);
      const popped = stack.pop();
      if (popped?.match) {
        ranges.push({ start: popped.start, end: (close < 0 ? i + 6 : close + 1) });
      }
      i = close < 0 ? html.length : close + 1;
      continue;
    }
    const open = matchOpenDiv(html, i);
    if (open) {
      const classes = classList(open.attrs);
      const match = requiredClass.every((token) => classes.includes(token));
      stack.push({ start: i, match });
      i = open.end;
      continue;
    }
    i += 1;
  }
  return ranges;
}

export function findContentItemBlocks(html: string): Array<{
  className: string;
  start: number;
  end: number;
  depth: number;
}> {
  const blocks: Array<{ className: string; start: number; end: number; depth: number }> = [];
  const stack: Array<{ start: number; className: string | null; depth: number }> = [];
  let depth = 0;
  let i = 0;
  while (i < html.length) {
    if (html[i] !== "<") {
      i += 1;
      continue;
    }
    const slice = html.slice(i, i + 6).toLowerCase();
    if (slice.startsWith("</div")) {
      const close = html.indexOf(">", i);
      const end = close < 0 ? html.length : close + 1;
      const popped = stack.pop();
      depth = Math.max(0, depth - 1);
      if (popped?.className) {
        blocks.push({
          className: popped.className,
          start: popped.start,
          end,
          depth: popped.depth,
        });
      }
      i = end;
      continue;
    }
    const open = matchOpenDiv(html, i);
    if (open) {
      const classes = classList(open.attrs);
      const itemClass = classes.includes("content-item")
        ? (classes.find((token) => token !== "content-item") ?? "content-item")
        : null;
      stack.push({ start: i, className: itemClass, depth });
      depth += 1;
      i = open.end;
      continue;
    }
    i += 1;
  }
  return blocks.sort((a, b) => a.start - b.start || a.end - b.end);
}

function cutRanges(html: string, ranges: Array<{ start: number; end: number }>): string {
  if (!ranges.length) {
    return html;
  }
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  let out = "";
  let cursor = 0;
  for (const range of sorted) {
    if (range.start < cursor) {
      continue;
    }
    out += html.slice(cursor, range.start);
    cursor = range.end;
  }
  out += html.slice(cursor);
  return out;
}

function extractSrc(tag: string): string | null {
  const match = tag.match(/\bsrc\s*=\s*("([^"]*)"|'([^']*)')/i);
  return match?.[2] ?? match?.[3] ?? null;
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#xa0;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function extractFirstTitle(html: string): string {
  const match = html.match(/<div[^>]*class="[^"]*\btitle\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (!match) {
    return "";
  }
  return htmlToPlainText(match[1] ?? "");
}

export function extractLibreTitle(html: string): string {
  const match = html.match(/<div[^>]*class="[^"]*\btitlibre\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (!match) {
    return "";
  }
  return htmlToPlainText(match[1] ?? "");
}

export function extractLinkedSourceIds(html: string): string[] {
  const ids = new Set<string>();
  const re = /href\s*=\s*["']nabda:([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    ids.add(match[1]);
  }
  return [...ids];
}

export function cleanProtocolHtml(html: string): HtmlCleanResult {
  const warnings: string[] = [];
  let out = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");

  const hidden = findDivRanges(out, ["itemcom", "hiddenDiv"]);
  if (hidden.length) {
    out = cutRanges(out, hidden);
    warnings.push("hover_itemcom_stripped");
  }

  const hadMap = /<map\b/i.test(out) || /\busemap\s*=/i.test(out);
  out = out.replace(/<map\b[\s\S]*?<\/map>/gi, "");
  out = out.replace(/\s+usemap\s*=\s*("[\s\S]*?"|'[\s\S]*?')/gi, "");
  if (hadMap) {
    warnings.push("flowchart_imagemap_stripped");
  }

  out = out.replace(EVENT_HANDLER_ATTR, "");
  out = out.replace(/\s+href\s*=\s*["']javascript:[^"']*["']/gi, ' href="#"');

  const keptImageSrcs: string[] = [];
  out = out.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = extractSrc(tag);
    if (src) {
      keptImageSrcs.push(src);
    }
    const altMatch = tag.match(/\balt\s*=\s*("([^"]*)"|'([^']*)')/i);
    const alt = altMatch?.[2] ?? altMatch?.[3] ?? "";
    if (alt === "(Référent)" || alt === "(Groupe générique)" || alt === "(Générique)") {
      warnings.push("decorative_drug_icon_omitted");
      return "";
    }
    const safeSrc = src ? src.replace(/"/g, "") : "";
    const safeAlt = alt.replace(/"/g, "");
    return `<img src="${safeSrc}" alt="${safeAlt}">`;
  });

  out = out.replace(/<span(?:\s[^>]*)?>\s*<\/span>/gi, "");
  out = out.replace(/\s+style\s*=\s*("[\s\S]*?"|'[\s\S]*?')/gi, "");
  out = out.replace(/\n{3,}/g, "\n\n");
  out = out.trim();

  return {
    html: out,
    warnings: [...new Set(warnings)],
    strippedImagemap: hadMap,
    keptImageSrcs,
  };
}
