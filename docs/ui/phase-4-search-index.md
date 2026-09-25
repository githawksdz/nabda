# Phase UI-4 — Search and index refinement

Visual-only pass on global search, search results/filters/states, and CAT / Protocoles / Médicaments / Scores index pages.

## Scope

- Shared `DiscoveryListRow` for scannable list rows with type label, status badges, and link semantics.
- Search input (form + `SearchField`), loading (`LoadingIndicator`), empty/error copy separation preserved.
- Filter chips with horizontal scroll and edge fade on `/search`.
- Index pages use `IndexPageIntro`, clinical `AppShell` frame, and consistent row density.

## Out of scope

Search API, ranking, publication filters, routes, offline repository, calculator engines, homepage composition, clinical detail layouts.

## Verification

```bash
npm run check:search-index-ui
```

Runtime browser inspection was not performed in the authoring session.
