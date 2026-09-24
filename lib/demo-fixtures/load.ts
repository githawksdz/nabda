/**
 * Demo-mode fixture loader.
 * Production/runtime components may import this module only — not individual fixture files.
 * Returns null/empty unless NABDA_CONTENT_MODE=demo (or NEXT_PUBLIC_ for client).
 */

import {
  isDemoContentMode,
  isDemoContentModeClient,
} from "@/lib/content-data/content-source-mode";

function demoEnabled(): boolean {
  if (typeof window !== "undefined") {
    return isDemoContentModeClient();
  }
  return isDemoContentMode();
}

export function getHomeDemoFixturesSync() {
  if (!demoEnabled()) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("@/lib/demo-fixtures/home") as typeof import("@/lib/demo-fixtures/home");
}

export function getSearchDemoFixturesSync() {
  if (!demoEnabled()) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("@/lib/demo-fixtures/search") as typeof import("@/lib/demo-fixtures/search");
}

export function getCatDemoFixturesSync() {
  if (!demoEnabled()) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("@/lib/demo-fixtures/cat") as typeof import("@/lib/demo-fixtures/cat");
}

export function getPersonalDemoFixtures() {
  if (!demoEnabled()) return null;
  // Server-only sync path for personal-api
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("@/lib/demo-fixtures/personal") as typeof import("@/lib/demo-fixtures/personal");
}

export function getDrugDemoFixtures() {
  if (!demoEnabled()) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("@/lib/demo-fixtures/drugs") as typeof import("@/lib/demo-fixtures/drugs");
}

export function getCalculatorDemoFixtures() {
  if (!demoEnabled()) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("@/lib/demo-fixtures/calculators") as typeof import("@/lib/demo-fixtures/calculators");
}

export function getContentDetailDemoFixtures() {
  if (!demoEnabled()) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("@/lib/demo-fixtures/content-detail") as typeof import("@/lib/demo-fixtures/content-detail");
}

export function getFlowchartDemoFixtures() {
  if (!demoEnabled()) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("@/lib/demo-fixtures/flowchart") as typeof import("@/lib/demo-fixtures/flowchart");
}
