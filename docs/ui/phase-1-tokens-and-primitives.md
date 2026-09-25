# UI-1 — Tokens and shared primitives

Foundation only. Screens keep their current layout and information architecture.

## Tokens

Defined in `app/globals.css`. Existing Stitch aliases (`--background`, `--primary`, `--on-surface`, …) remain so current Tailwind classes still compile.

New semantic names sit beside them:

| Role | Token | Value origin |
| --- | --- | --- |
| Canvas | `--canvas` | `#fcf8fb` |
| Muted surface | `--surface-muted` | `#f6f2f5` |
| Elevated surface | `--surface-elevated` | `#ffffff` |
| Inverse surface | `--surface-inverse` | `#1b1b1e` |
| Text | `--text-primary` / `--text-secondary` / `--text-muted` / `--text-disabled` / `--text-inverse` | Existing ink scale |
| Action | `--action-primary` (`#000`) with hover `#1b1b1e` | Existing primary |
| Success / downloaded | `#1f6b3a` on `#dceee2` | New, restrained |
| Warning / stale | `#8a5a00` on `#f5e6c8` | New, restrained |
| Danger / error | Existing `--error` | Unchanged |
| Info / offline | Existing secondary container | Unchanged |
| Premium | Inverse ink, not a second black button | `--status-premium` |

Type, radius, and Inter are unchanged. Spacing, shadow, z-index, control size, and motion duration tokens are defined for later phases. No new animations ship here. `prefers-reduced-motion` disables pulse and smooth scroll.

## Primitives

| Primitive | Path |
| --- | --- |
| Button | `components/ui/Button.tsx` |
| IconButton | `components/ui/IconButton.tsx` |
| Surface | `components/ui/Surface.tsx` |
| StatusBadge | `components/ui/StatusBadge.tsx` |
| FilterChip / FilterChipRow | `components/ui/FilterChip.tsx` |
| PillNav | `components/ui/PillNav.tsx` |
| TextField / SearchField | `components/ui/TextField.tsx` |
| LoadingIndicator | `components/ui/LoadingIndicator.tsx` |
| EmptyState | `components/ui/EmptyState.tsx` |

Favoris / Récents remain **links** with `aria-current`. They are not `tab` / `tablist` because they change routes.

## Migrated in this phase

- Duplicate status chips wrap `StatusBadge`
- Search, CAT, drug, calculator, personal, and emergency filter rows
- Library tabs
- Empty states (content, personal, CAT, drugs, scores)
- Route loading
- Global search field
- Home search field (form submit preserved)
- Search request-error block

## Left for later phases

- App shell, sidebar, bottom nav, reading dock
- Homepage section composition
- Protocol / CAT / drug / calculator detail layout
- Calculator result hierarchy
- Offline manager status rows
- Auth type scale (`text-[15px]`, `h-[50px]`)
- Drug and calculator index buttons still inline
- `DrugTabs` and `SectionNav` still local 32px pills
- Home shortcut chips now use PillNav (44px); remaining one-off chips stay until UI-3 / UI-4
