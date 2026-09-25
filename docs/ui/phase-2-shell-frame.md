# UI-2 — Shell and responsive frame

Structural layout only. Cards, homepage sections, calculator visuals, and clinical copy are unchanged.

## Width model

Tokens in `app/globals.css`. Classes: `.layout-gutter`, `.layout-workspace`, `.layout-clinical`, `.layout-reading`. Shared class names also live in `lib/layout/frames.ts`.

| Layer | Token / class | Width | Used by |
| --- | --- | --- | --- |
| Sidebar | `--layout-sidebar` | `15rem` | `DesktopSidebar`, header/dock `lg:left` |
| Shell gutter | `.layout-gutter` | 16px / 24px at `lg` | Header and `main` |
| Workspace | `--layout-workspace` `72rem` | Home, search, favorites, history, offline, profile, empty/error shells |
| Clinical | `--layout-clinical` `72rem` | CAT / protocol / drug / score indexes and detail |
| Reading | `--layout-reading` `42rem` | Long-form columns inside split clinical layouts |

Workspace and clinical share the same max width so header and body stay aligned. They stay separate names so a later phase can widen clinical split layouts without changing list pages.

## Bottom padding ownership

1. **Bottom navigation** — `LAYOUT_NAV_RESERVE` on `AppShell` `main` only when `showBottomNav` is true. Hidden at `lg`. Includes safe-area.
2. **Reading dock** — `READING_DOCK_CONTENT_CLASS` (`LAYOUT_DOCK_RESERVE`) on `ClinicalDetailFrame` children only. Detail pages set `showBottomNav={false}`, so shell does not add nav padding.
3. **No-nav pages without a dock** — modest `pb-6 lg:pb-8` only.

Indexes no longer add a second `pb-[calc(96px+…)]`.

## Sticky offset

`--layout-header-height` (`3.5rem`) plus safe-area. Filter rows, section nav, drug tabs, and calculator result panels share that offset.

## Out of scope (unchanged)

- Auth / onboarding `MobileShell` (`430px`)
- Auth and profile drawers
- Staging access and internal preview columns
- Homepage section order and card chrome
- Calculator formulas and result typography
