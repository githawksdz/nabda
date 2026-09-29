/**
 * Writes Nabda PWA PNG icons and iOS splash screens.
 * Usage: node scripts/generate-pwa-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "icons");

const INK = [0x1b, 0x1b, 0x1e, 0xff];
const CREAM = [0xfc, 0xf8, 0xfb, 0xff];

function crc32(buf) {
  let crc = ~0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(data.length, 0);
  header.write(type, 4, 4, "ascii");
  const crcBuf = Buffer.concat([header.subarray(4, 8), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf), 0);
  return Buffer.concat([header, data, crc]);
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const dest = y * (width * 4 + 1);
    raw[dest] = 0;
    rgba.copy(raw, dest + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function fill(rgba, width, height, color) {
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = color[0];
    rgba[i * 4 + 1] = color[1];
    rgba[i * 4 + 2] = color[2];
    rgba[i * 4 + 3] = color[3];
  }
}

function setPx(rgba, width, x, y, color) {
  if (x < 0 || y < 0 || x >= width) return;
  const i = (y * width + x) * 4;
  rgba[i] = color[0];
  rgba[i + 1] = color[1];
  rgba[i + 2] = color[2];
  rgba[i + 3] = color[3];
}

function fillRect(rgba, width, x0, y0, x1, y1, color) {
  const xa = Math.max(0, Math.round(x0));
  const ya = Math.max(0, Math.round(y0));
  const xb = Math.round(x1);
  const yb = Math.round(y1);
  for (let y = ya; y < yb; y++) {
    for (let x = xa; x < xb; x++) {
      setPx(rgba, width, x, y, color);
    }
  }
}

function drawN(rgba, size, pad, color) {
  const x0 = pad;
  const y0 = pad;
  const inner = size - pad * 2;
  const stroke = Math.max(4, Math.round(inner * 0.18));
  fillRect(rgba, size, x0, y0, x0 + stroke, y0 + inner, color);
  fillRect(rgba, size, x0 + inner - stroke, y0, x0 + inner, y0 + inner, color);
  const steps = inner;
  for (let i = 0; i < steps; i++) {
    const x = x0 + Math.round((i / (steps - 1)) * (inner - stroke));
    const y = y0 + Math.round((i / (steps - 1)) * (inner - stroke));
    fillRect(rgba, size, x, y, x + stroke, y + stroke, color);
  }
}

function writeIcon(name, size, { maskable = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  fill(rgba, size, size, INK);
  const pad = maskable ? Math.round(size * 0.22) : Math.round(size * 0.22);
  drawN(rgba, size, pad, CREAM);
  fs.writeFileSync(path.join(OUT, name), encodePng(size, size, rgba));
}

function writeSplash(name, width, height) {
  const rgba = Buffer.alloc(width * height * 4);
  fill(rgba, width, height, CREAM);
  const mark = Math.round(Math.min(width, height) * 0.16);
  const x = Math.round((width - mark) / 2);
  const y = Math.round((height - mark) / 2);
  fillRect(rgba, width, x, y, x + mark, y + mark, INK);
  const inner = Buffer.alloc(mark * mark * 4);
  fill(inner, mark, mark, INK);
  drawN(inner, mark, Math.round(mark * 0.22), CREAM);
  for (let row = 0; row < mark; row++) {
    inner.copy(rgba, ((y + row) * width + x) * 4, row * mark * 4, (row + 1) * mark * 4);
  }
  fs.writeFileSync(path.join(OUT, name), encodePng(width, height, rgba));
}

fs.mkdirSync(OUT, { recursive: true });
writeIcon("icon-192.png", 192);
writeIcon("icon-512.png", 512);
writeIcon("icon-512-maskable.png", 512, { maskable: true });
writeIcon("apple-touch-icon.png", 180);
writeSplash("splash-750x1334.png", 750, 1334);
writeSplash("splash-1170x2532.png", 1170, 2532);
writeSplash("splash-1284x2778.png", 1284, 2778);
writeSplash("splash-1179x2556.png", 1179, 2556);
writeSplash("splash-1290x2796.png", 1290, 2796);
console.log("wrote PWA icons to public/icons");
