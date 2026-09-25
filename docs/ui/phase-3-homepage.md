# UI-3 — Homepage visual refinement

Visual and compositional only. Data sources, search behavior, and shell architecture are unchanged.

## Hierarchy (unchanged order)

1. Identity
2. Search
3. Reprendre
4. Souvent utilisés
5. Nouveautés cliniques
6. Profile completion (signed-in incomplete only)
7. Pro / offline support

## Surfaces

- Search: elevated field, reading-width cluster
- Reprendre: elevated clinical card
- Souvent utilisés: compact muted rows
- Updates: compact muted list, reading width
- Profile / Pro / offline: muted support cards, reading width

## Honesty

- No demo score fallback on the homepage
- Feed failure is not presented as empty content
- Profile progress uses `computeCompletionPercent` on already-fetched profile fields
- Shortcut chips are navigation links, not fake selected filters
