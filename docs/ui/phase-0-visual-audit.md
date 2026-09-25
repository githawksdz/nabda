# Phase UI-0 — Visual audit and inventory

Audit only. No production UI was redesigned in this phase.

Date: 25 September 2026
Scope: doctor-facing Nabda UI as implemented in the repository after the secure content boundary, entitlement, published-only access, PWA/offline, calculator, and workspace-shell work.

## 1. Executive summary

Nabda already has a coherent grayscale clinical shell: Inter, cream page background (`#fcf8fb`), white cards, black primary actions, and a shared type scale in `app/globals.css`. The product direction (calm clinical workspace, fast search, clear free/Pro/offline status) is partly present in structure and copy. It is not yet present in layout or status color.

The largest visual problem is the frame, not the palette. Home, search, favorites, and offline sit in a centered `42rem` column. CAT, protocoles, médicaments, scores, and profile are still locked to `max-w-[390px]`. Detail pages widen only to `56rem` at the `lg` breakpoint, while source renderers often clamp reading back to `42rem`. On a desktop workstation the sidebar is real, but the page still behaves like a phone column in a large empty field.

The second problem is hierarchy inside that column. Almost every surface is the same pale card. Free, Pro, downloaded, stale, and error states are mostly gray sentences. Glasgow uses a 34px result; generic and additive calculators use body or 17px text. Black pills are the only strong action color, so primary, filter, and status compete.

Accessibility is ahead of the visual system in a few places (44px targets on main nav and index chips, `aria-current`, `aria-pressed`, native module dialog, focus outlines) and behind it in others (pinch-zoom disabled, duplicate `h1`, 32px favorite chips, hidden scrollbars, no `prefers-reduced-motion`, search failures that look like empty results).

No P0 “the screen is blank or the primary action cannot be reached” defect was confirmed from source. Several P1 issues will make the next refinement phases feel like a layout change rather than a restyle.

**Runtime visual inspection was not performed.** This session has no browser automation. Findings below are from the current components, tokens, and layout classes. Viewport behavior is inferred from those classes and must be checked in a browser during UI-2.

No production code, routes, APIs, database logic, authorization logic, entitlement logic, offline logic, or calculator logic was modified.

## 2. Screens and viewport sizes inspected

### Method

Static inspection of `app/`, `components/`, `app/globals.css`, and doctor-facing copy. Contrast ratios were computed from the token hex values. The six requested viewports were **not** opened:

| Viewport | Inspected in a browser |
| --- | --- |
| 390 × 844 | No |
| 430 × 932 | No |
| 768 × 1024 | No |
| 1024 × 768 | No |
| 1280 × 800 | No |
| 1440 × 900 | No |

Breakpoint behavior below is what the classes will do, not what was seen on screen.

### Screens read in source

| Area | Primary files | Shell |
| --- | --- | --- |
| App shell | `components/app/AppShell.tsx`, `AppHeader.tsx`, `BottomNav.tsx`, `DesktopSidebar.tsx`, `ModuleSheet.tsx` | Shared |
| Connection | `components/pwa/ConnectionIndicator.tsx` | Header |
| Home | `components/home/HomeDashboard.tsx` and section cards | `AppShell`, max `42rem` |
| Search | `components/search/SearchPage.tsx` | `AppShell`, max `42rem` |
| CAT index | `components/cat/CatIndexPage.tsx` | `max-w-[390px]` |
| Protocoles index | `components/protocols/ProtocolsIndexPage.tsx` | `max-w-[390px]` |
| Médicaments index | `components/drugs/DrugsIndexPage.tsx` | `max-w-[390px]` |
| Scores index | `components/calculators/CalculatorsIndexPage.tsx` | `max-w-[390px]` |
| Favoris / récents | `components/personal/favorites/FavoritesPage.tsx`, `history/HistoryPage.tsx` | `AppShell`, max `42rem` |
| Detail | `ClinicalDetailFrame.tsx`, protocol / CAT / drug / calculator detail pages | `lg:max-w-[56rem]`, bottom nav hidden, reading dock |
| Calculators | Glasgow, Cockcroft, `GeneratedFormulaCalculator.tsx`, `AdditivePointsCalculator.tsx` | Inside detail frame |
| Offline | `components/offline/OfflineManagerPage.tsx`, `OfflineContentView.tsx` | `AppShell`, max `42rem` |
| Profile | `components/personal/profile/ProfilePage.tsx` | `max-w-[390px]` |
| Auth | `app/page.tsx` → `OnboardingEntry.tsx`, `AuthDrawer.tsx`, `app/auth/update-password/page.tsx` | Own `max-w-[430px]` column, no app shell |
| Missing content | `app/not-found.tsx`, `ContentUnavailable.tsx`, `app/error.tsx`, `app/loading.tsx` | Own `max-w-[390px]` column, no shell |
| Empty modules | `/premium` redirects to `/offline`. `/notifications` redirects to `/profile`. `/interactions` redirects to `/search?type=drugs`. `EmptyModulePage` is unused by routes. | — |
| Internal staff | `components/internal/protocol-preview/InternalPreviewBanner.tsx`, `/internal/*` | Separate from doctor UI |

## 3. Data, demo, and auth limitations

- Live Supabase content, signed-in profile, Pro entitlement, and IndexedDB offline packs were not opened.
- Home (`app/home/page.tsx`) renders an empty resume/frequent state when Supabase is unconfigured or the feed throws. It does not invent clinical rows.
- Search uses demo fixtures only when `isDemoContentModeClient()` is on, and only for the existing “douleur” / amoxicillin demo queries. Otherwise a failed lookup becomes an empty result set.
- Offline manager states (empty, downloaded, stale, storage-full, checksum mismatch, Pro-required, signed-out) exist in `OfflineManagerPage` and `DetailLibraryStatus`. They were read as markup, not exercised against a device store.
- Auth screens were read from components. Phone sign-in still surfaces `AUTH_INFO.phoneSoon` (“Connexion par téléphone bientôt disponible.”). That string is account UI, not a clinical content placeholder.
- No fake production data was created. No authorization path was bypassed.

## 4. Current visual direction

What the UI is today:

- A Material-like grayscale / cream system, commented in CSS as “Stitch grayscale / cream tokens”.
- One sans family: Inter, with an iOS-like type ramp (`.text-display` through `.text-label-sm`).
- Page canvas and header surface are the same cream. Cards are white with a very small shadow, or the same cream-gray as the page (`surface-container-low`) with no shadow.
- The only filled action color is black. The only semantic color with a container is error red. There is no success, warning, Pro, or offline token.
- Shape language is mixed: 8 / 12 / 16 / 20px radii are tokenized, but screens also use `rounded-lg`, `rounded-xl`, `rounded-2xl`, and `rounded-full` on equivalent buttons.
- Tone is mostly calm. Exceptions: incomplete-home greeting “Bonjour 👋”, the word “Freemium”, and onboarding marketing slides that use one-off pixel sizes outside the type ramp.
- Gamification is limited to a profile-completion percent bar. Clinical scores are not styled as achievements. That matches the product direction.

What it does not yet feel like:

- A desktop workstation. The sidebar exists; the content width does not use it.
- A system where content type, Pro, and offline are recognizable without reading a sentence.
- One component library. Chips, empty states, search fields, and status chips are copied with small differences.

## 5. Current design-token inventory

Tokens live in `app/globals.css` (`:root` and `@theme inline`). Tailwind v4 is used. There is no `tailwind.config.*`. `app/layout.tsx` loads Inter as `--font-inter` and sets `themeColor: #fcf8fb`.

### Colors

Contrast is against the page background `#fcf8fb` unless noted. WCAG AA for normal text is 4.5:1. UI component boundaries are 3:1.

| Token | Value | Defined | Semantic role today | Reuse | Later token? |
| --- | --- | --- | --- | --- | --- |
| `--background`, `--surface` | `#fcf8fb` | `:root` | Page and header. Same value, so header does not separate from the page except by blur and a 4% shadow. | Consistent | Keep as canvas. Consider a distinct header surface only if hierarchy needs it. |
| `--surface-container-lowest` | `#ffffff` | `:root` | Elevated cards | Consistent on lists and identity cards | Yes, `surface/card` |
| `--surface-container-low` | `#f6f2f5` | `:root` | Inputs, empty panels, secondary buttons, offline blocks | Overloaded: input, empty, secondary button, and status panel share it | Split input vs inset vs empty |
| `--surface-container` | `#f0edf0` | `:root` | Search field on `/search`, some grouped lists | Not the same field as home search | Yes |
| `--surface-container-high` | `#eae7ea` | `:root` | Inactive chips, progress track, status pills | Consistent enough | Yes |
| `--surface-container-highest`, `--surface-variant` | `#e5e1e4` | `:root` | Dividers (`bg-surface-variant`), clear-search button | Divider and control share a color | Yes, `border/subtle` |
| `--outline` | `#77767b` | `:root` | Rare. Drug row chevron. Contrast **4.28:1** on canvas: fails AA for small text, passes large text and non-text. | Inconsistent | Do not use for 11–13px text |
| `--outline-variant` | `#c8c5cb` | `:root` | Sidebar border, some input borders, auth icon rings | Light use | Yes |
| `--primary`, `--on-primary` | `#000000` / `#ffffff` | `:root` | Every primary button, active chip, active nav label. Contrast 21:1. | Overused. Status “PRO”, filters, and actions look identical. | Keep for primary action. Stop using it as the only status color. |
| `--primary-container` | `#1b1b1e` | `:root` | Pro home offline card, Pro avatar | Rare, effective | Candidate for one inverse surface, not a second black button |
| `--on-surface` | `#1c1b1d` | `:root` | Primary text. Contrast **16.31:1**. | Consistent | Yes |
| `--on-surface-variant` | `#47464b` | `:root` | Secondary text. Contrast **8.89:1** on canvas, **8.43:1** on `surface-container-low`. Readable at 13px. | Consistent and not too faint at full opacity | Yes |
| `--secondary` | `#5d5e66` | `:root` | Outline “Freemium” chip, avatar initials. Contrast **6.13:1**. | Narrow | Fold into muted text or a neutral chip |
| `--secondary-container` | `#e3e1ec` | `:root` | Active nav pill, active module row, internal preview banner | Clinical UI and staff banner share it | Split staff vs selected-nav |
| `--on-secondary-container` | `#63646c` | `:root` | Text on `--secondary-container`. Contrast **4.55:1**. Barely AA. | Internal banner | Do not put 11px labels on this pair |
| `--error`, `--error-container` | `#ba1a1a` / `#ffdad6` | `:root` | Zero-result badge, flowchart emergency, status `warning` variant. Pair contrast **5.00:1**. | Only semantic hue | Keep. Add warning and success only if a real status needs them. |
| Success | — | Missing | Download success is plain text “Disponible hors-ligne” | — | Direction: a quiet confirmation, not a green celebration |
| Warning | — | Missing except error | Stale content uses the same gray as downloaded | — | Direction: distinguish stale from error without a new brand color in this audit |
| Pro | — | Missing | Black “PRO” chip or the word “Pro” | — | Direction: one restrained label treatment, not a game badge |
| Offline | — | Missing | Wifi icon plus gray sentence | — | Direction: same label system as Pro |

Hard-coded colors outside tokens: flowchart SVG strokes, onboarding illustration fills, Google brand marks, `app/vaul.css` handle `#e2e2e4`, PWA icons. Auth placeholders use `text-on-surface-variant/60`, which drops a passing color below comfortable contrast. That is the faint-text problem; body secondary text is not faint.

`body` also sets `background: #fcf8fb` as a literal, duplicating the token.

### Typography

Font: Inter (`--font-sans`), `antialiased`, French `lang="fr"`.

| Class | Size / line / tracking / weight | Intended role |
| --- | --- | --- |
| `.text-display` | 34 / 41 / -0.022em / 600 | Glasgow total only |
| `.text-headline-lg` | 24 / 30 / -0.019em / 600 | Index page titles under the header |
| `.text-headline-md` | 20 / 25 / -0.017em / 600 | Identity titles, error titles |
| `.text-headline-sm` | 17 / 22 / -0.016em / 600 | Shell `h1`, section titles, many card titles |
| `.text-body-lg` | 17 / 22 / -0.016em / 400 | Rare |
| `.text-body-md` | 15 / 20 / -0.015em / 400 | Default reading and list titles (often bumped to medium) |
| `.text-body-sm` | 13 / 18 / -0.006em / 400 | Meta, empty descriptions, generic calculator inputs |
| `.text-label-md` | 13 / 18 / -0.006em / 500 | Buttons, chips, header actions |
| `.text-label-sm` | 11 / 13 / +0.006em / 500 | Nav labels, eyebrows, status |
| `.text-data-metric` | 22 / 28 / -0.018em / 500 | Profile completion percent only |

One-off sizes that bypass the ramp:

- Onboarding and auth: `text-[22px]`, `text-[16px]`, `text-[15px]`, `text-[14px]`, `text-[13px]`, `text-[12px]`, `text-[11px]`.
- Chip counts: `text-[10px] leading-[13px]` on search, CAT, drugs, calculators, personal filters.
- Flowchart and image captions: `text-[10px]`, `text-[11px]`, `text-[9px]`.
- `.source-html` headings are forced to 13px / 600, so clinical HTML does not use the heading ramp.

Heading hierarchy is flat. The shell `h1` is 17px. In-page titles are often `h2` at 24px, which is visually stronger than the `h1`. Detail identity cards add a second `h1` at 20px.

French wrapping: list titles are block-level and can wrap. Shell titles `truncate`. Dock labels `truncate`. Long DCI names in drug rows are not clamped. Chip labels use `shrink-0`, so they scroll instead of wrapping.

Numeric results: only Glasgow uses `.text-display`. Additive scores use `.text-headline-sm`. Formula calculators use `.text-body-md` for the result string, including units. That is the weak clinical result.

### Spacing

| Use | Values in code |
| --- | --- |
| Screen padding | `px-4` (16px) on shell, auth, and error columns |
| Section gap | `gap-5` (20px) on home, indexes, favorites, offline. Search uses `gap-4`. |
| Card padding | `p-4` (16px) or `p-3.5` (14px). Empty states use `px-4 py-8` or `px-6 py-8`. Protocol empty index uses `p-6`. |
| List row | Protocol index `px-4 py-3`. Drug row `p-3.5`. Home `ContentRow` `p-4`. |
| Buttons | `h-10` (completion card), `h-11` / `min-h-11` (most), auth `h-[50px]` and `h-[54px]` |
| Chips | Home links `px-3 py-1.5` (about 30px tall). Index filters `min-h-11` + `px-3.5`. Favorites filters `h-8` (32px). |
| Inputs | Home and search `h-12`. Protocol index `py-3` with a border. Offline and calculators `py-2.5` without a fixed height. |
| Header | `h-14` (56px) plus `pt-safe` |
| Bottom nav | `h-16` (64px) plus `pb-safe`. Content reserve `112px + safe` on mobile. |
| Reading dock | Bar `h-[72px]`, content reserve `104px + safe` inside a shell that already reserves `96px + safe` when the bottom nav is hidden |
| Sidebar | `w-60` (240px), `gap-1` links, `px-4` wordmark |
| Sticky chip offset | `top-[calc(64px+safe)]` while the header content is 56px. About 8px of extra offset. Desktop section nav uses `72px`. |

One-off widths: `390px`, `430px`, `42rem`, `56rem`, `720px` (staff packs), `300px`, `320px`.

### Radius and elevation

Token radii: 8, 12, 16, 20, sheet 24. Usage does not follow the tokens strictly.

Elevation is `shadow-sm` on white cards, or custom `rgba(0,0,0,0.03–0.08)` on header, nav, and the module sheet. Many inset panels have no shadow and no border, so they disappear into the canvas.

## 6. Shared component inventory

There is no `components/ui` primitive layer. Patterns are local.

| Pattern | Existing component(s) | File path(s) | Screens used | Variants | Problems | Later action |
| --- | --- | --- | --- | --- | --- | --- |
| Buttons | None shared. Links and buttons inline. | Shell, empty states, docks, calculators, auth `BottomActionDock` | All | Filled black `rounded-lg` / `rounded-xl` / `rounded-full`; gray secondary; text links with `min-h-11` | Radius, height (`h-10` vs `h-11` vs `h-[50px]`), and padding differ for the same job | UI-1: `Button` primary / secondary / ghost. Do not restyle clinical logic. |
| Cards | None shared | `ContentRow`, identity cards, `ProUpsellCard`, `OfflinePackCard`, `ProfileCompletionCard`, list rows | Home, indexes, details, offline | White + `shadow-sm`; inset `surface-container-low`; inverse `primary-container` | White and inset cards have almost the same contrast against the canvas. Pro upsell looks like any other card. | UI-1: `Surface` card / inset / inverse. UI-3 applies them on home. |
| Chips | `SearchFilterChips`, `CatFilterChips`, `DrugCategoryChips`, `CalculatorFilterChips`, `PersonalFilterChips`, home chip links, `StatusChip` ×2 | `components/search`, `cat`, `drugs`, `calculators`, `personal`, `home/cards`, `content-detail` | Search, indexes, favorites, home, identity | Active black pill; inactive gray. Heights 32, ~30, and 44px. | Four filter implementations plus home links. Favorites chips are not 44px and are not sticky. Scrollbars hidden. | UI-1: one `FilterChip` and one `StatusChip`. UI-4 applies them. |
| Badges | `StatusChip` (home, children) and `StatusChip` (content-detail, `label`) | `components/home/cards/StatusChip.tsx`, `components/content-detail/StatusChip.tsx` | Home identity, protocol/CAT/drug identity, drug rows (raw span, not the component) | soft, dark, outline, and warning only on the detail chip | Two components, same name, different props. Drug index invents a third pill. | UI-1: merge API. Do not invent new statuses. |
| Tabs | `PersonalLibraryTabs`, `CatSegmentedTabs`, `DrugTabs`, preview chip navs | `PersonalLibraryTabs.tsx`, CAT/drug renderers | Favorites, history, CAT detail, drug detail | Black pill tabs vs sticky chip rows | Same visual job, different stickiness and desktop layout | UI-1 tab primitive, UI-5 for detail nav |
| Inputs | None shared | `HomeSearchBar`, `SearchInputBar`, `CatSearchBar`, `DrugSearchBar`, `CalculatorSearchBar`, protocol `<input>`, calculator fields, auth fields | Home, search, indexes, calculators, auth | Filled 48px, bordered protocol field, 15px auth fields, decimal text inputs | Placeholder color and chrome differ. Protocol index is the only bordered field. | UI-1: `TextField` and `SearchField` |
| Search fields | `SearchInputBar`, `HomeSearchBar` | `components/search/SearchInputBar.tsx`, `components/home/HomeSearchBar.tsx` | `/search`, `/home` | hero `h-12` + shadow, compact `h-11`, dock (same as hero), home field without shadow | Home and search do not match. Filter button in the header only scrolls to chips. | UI-4 |
| List rows | `ContentRow`, `DrugListRow`, `HistoryRow`, `FavoriteCard`, `PersonalContentCard`, protocol `<Link>` rows | `components/home/cards`, `drugs`, `personal` | Home, drugs, favorites, history, protocol index | Icon tile + chevron, or text-only divided list | Protocol index has no type icon. Row padding and status placement differ. | UI-4 / UI-5 row primitive after tokens |
| Empty states | `PersonalEmptyState`, `EmptyContentState`, `CatEmptyInlineState`, `DrugEmptyState`, `CalculatorEmptyState`, `ZeroResultCanvas`, inline home divs, index-local divs | Those files plus `ProtocolsIndexPage.tsx`, `HomeResumeSection.tsx` | Home, search, indexes, favorites, missing sections | Centered icon + black button, or a flat sentence | Copy is mostly honest. Visual weight is the same as a content card, so empty and filled states do not separate. Default title in `EmptyContentState` is still “Fiche en préparation” if a caller omits `title`. Current callers override it. | UI-1 empty pattern. Remove the default preparation title in a later phase without changing the boundary. |
| Loading | `AppLoadingState`, inline sentences | `app/loading.tsx`, search page, offline page, `DetailLibraryStatus`, calculator engines | Route transitions, search, offline, calculators | Pulse circle in a 390px column, or one gray sentence | Route loading has no shell, so the sidebar and nav disappear. Search loading is easy to miss. | UI-7 / UI-8 |
| Error | `AppErrorState`, `app/global-error.tsx`, `app/not-found.tsx`, `ContentUnavailable` | `components/app` | Route errors, 404, missing slugs | 390px column, black primary, gray secondary | Search has no error view. Failures become zero results. Offline errors are `text-body-sm` with no error color. | UI-4 search error. UI-7 offline error color using the existing error token. |
| Headers | `AppHeader` | `components/app/AppHeader.tsx` | Every `AppShell` screen | Title, optional Retour, Modules (mobile), Recherche (desktop), connection, profile (mobile only) | `h1` is 17px and truncates. Detail pages add another `h1`. Desktop header stretches full width while content stays narrow. | UI-2 |
| Navigation | `DesktopSidebar`, `BottomNav`, `ModuleSheet` | `components/app` | `lg` sidebar; `< lg` bottom nav + sheet | Sidebar: left border active. Bottom nav: pill or text variant. Sheet: native `<dialog>`. | Primary and module lists in the sidebar have no group label. Bottom nav `variant="text"` is passed by several pages but the label style barely changes. Profile control is hidden at `lg` because Profil is already in the sidebar. | UI-2 |
| Docks | `BottomReadingDock`, auth `BottomActionDock`, PWA update toast | `BottomReadingDock.tsx`, `onboarding/BottomActionDock.tsx`, `PwaProvider.tsx` | Clinical details, welcome, service worker | 5 icon+label actions, or stacked auth buttons, or a black toast | Detail toasts are duplicated per page. Protocol toast offsets for the sidebar; CAT, drug, and calculator toasts do not (`left-1/2` only). | UI-5 dock, UI-2 toast position |
| Status indicators | `ConnectionIndicator`, `DetailLibraryStatus`, drug/calculator status text, `doctorPublicationLabel` | `components/pwa`, `content-detail/DetailLibraryStatus.tsx`, `lib/content-detail/doctor-facing-status.ts` | Header, detail, indexes | Text first. Color almost never encodes state. | Downloaded, stale, Pro, online-only, and signed-out look like the same inset paragraph. Header always shows “En ligne”, which spends scarce mobile header space. | UI-7. Do not change entitlement rules. |

## 7. Screen-by-screen audit

### 7.1 App shell

**Hierarchy.** On mobile the purpose of a page is the truncated header title plus the bottom nav. On desktop the sidebar wordmark “Nabda” and two unlabeled link groups are clear enough. The primary action of the shell is navigation, and the active item is visible (black text, pill or left border).

**Typography.** Header title uses `.text-headline-sm` (17px) as the document `h1`. That is smaller than in-page `.text-headline-lg` titles, so the header is a bar, not a title.

**Color.** Header, page, and bottom bar are the same cream at 85–90% opacity. Separation depends on blur and a 1px shadow. Acceptable, slightly washed.

**Spacing.** Mobile content starts below `56px + safe-area`. Bottom nav is `64px` and the shell reserves `112px + safe-area`, so the nav should not cover the last line. That overlap was **not** confirmed in a browser. Indexes also pass a second `pb-[calc(96px+safe)]`, which replaces the 112px reserve via Tailwind merge. 96px is still more than 64px.

**Responsive.** Sidebar is `hidden` below `lg` and `w-60` from `lg`. Header becomes `lg:left-60`. Bottom nav is `lg:hidden`. Module button is `lg:hidden`. Desktop search link is `hidden` until `lg`. At 768×1024 the layout is still the phone shell (`lg` is 1024px). That is a reasonable tablet choice if content width grows. Today several pages stay at 390px even above `lg`.

**Interaction.** Module sheet is a native `<dialog>` with `showModal`, `closedby="any"`, Escape via dialog close, `aria-modal`, and a labelled close button. Focus return depends on the browser dialog implementation; it was not tested. Bottom nav and sidebar set `aria-current="page"`.

**Issues.** See UI-001, UI-002, UI-010.

### 7.2 Homepage

Order in `HomeDashboard`: identity, search, Reprendre, Souvent utilisés, clinical updates, then one of profile completion / Pro card / offline pack.

**Hierarchy.** Search is near the top, which is correct. It is not visually dominant: a gray field and small chips, then equal-weight sections. Profile completion is below the clinical blocks, so it does not steal the first viewport when resume content exists. On an empty incomplete profile it still sits under two empty cards, so it competes with “start working” only after the empty states. Pro upsell is a normal white card. The Pro offline card is the only inverse surface and reads as more important than search.

**Typography.** Greeting is `.text-headline-sm`. Incomplete mode uses “Bonjour 👋” and a “Non renseigné” chip. That emoji is the main playful note on an otherwise clinical home.

**Spacing.** `gap-5` between sections is even. Empty resume and frequent blocks are inset panels, not the white cards used when data exists, so the empty home looks flatter than the populated home.

**Responsive.** Column max `42rem` (672px), centered. At 1280 and 1440 the sidebar takes 240px and the rest of the width is empty cream. Confirmed by class, not by screenshot. The reading column is not too narrow for a phone; it is narrow for a workstation.

**States.** Empty resume and empty frequent have real next steps (Recherche, CAT, Protocoles, Médicaments, Scores). No “Bientôt disponible” on these actions.

### 7.3 Search

**Hierarchy.** The field is first. Filters stick. Results, loading, and zero states follow. The header “Filtres” control does not open a filter dialog; it scrolls to `#search-filters`. That is a misleading icon button (`aria-label="Filtres"`).

**Results.** Grouped results and medication results exist. Premium and offline are properties of result mappers, not a distinct visual language in the search components reviewed. Long titles are not given a shared clamp in the search input; result rows need a browser pass for overflow.

**Loading.** One line: “Recherche en cours…”. No skeleton, no `aria-busy` on the region.

**Error.** The lookup `catch` path writes an empty result list or falls back to local offline search. The doctor sees the zero-result canvas (“Ce contenu n’existe pas dans Nabda.”) or an empty group. A network failure and a true miss look the same. That is a UX defect with a visual consequence. Do not “fix” it by changing the search API in a UI phase; change the presentation of the existing failure.

**Empty.** `ZeroResultCanvas` is an intentional empty state (icon, explanation, clear). It is still the same pale card as everything else. The error-colored badge on the magnifying glass is the strongest color on the page for a non-error event, which overstates a simple miss.

**Chips.** `min-h-11`, `shrink-0`, horizontal scroll, scrollbar hidden. They should not clip text; they can clip the row visually at the screen edge with no fade and no scroll hint. Not confirmed in a browser.

### 7.4 Content indexes

CAT, médicaments, and scores share a pattern: identity heading, local search, sticky chips, grids, list, safety notice. Protocoles is a simpler bordered search plus a divided list.

All four set `frameClassName="max-w-[390px]"`, which overrides the shell’s `42rem`. On desktop they are a phone strip.

Each index repeats the shell title in a larger `h2` (“Protocoles”, “Médicaments”, “Calculateurs cliniques & scores”). The first viewport spends space on a title the header already shows.

CAT empty copy (“Le référentiel sera enrichi au fur et à mesure des imports.”) and the protocol empty copy are the same editorial-sounding sentence. They do not say “Bientôt disponible”, but they describe the catalog as a future import rather than an empty clinical library.

Drug rows show `drugIndexStatusLabel`: “Pro”, “Publié”, or “Contenu en préparation” if a non-published row is rendered. Public routes are supposed to pass published rows only. If that boundary holds, doctors see “Publié” or “Pro”, both in the same gray pill.

### 7.5 Favorites and history

Tabs Favoris / Récents are 44px black pills and set `aria-current`. Type filters underneath are **32px** (`h-8`), `role="toolbar"`, `aria-pressed`, horizontal scroll, scrollbar hidden. On a 390px screen the chip row will scroll. Tap size is below 44px.

Empty favorites and empty recents use `PersonalEmptyState`: icon, title, description, black button. Populated rows use `FavoriteCard` / `HistoryRow` / `PersonalContentCard` with a separate offline hint component. Status is text, not color.

Favorites and history use the `42rem` shell, so they are wider than the indexes they link back to. The frame jumps when moving from a favori to a protocole index.

### 7.6 Clinical detail

`ClinicalDetailFrame` hides the bottom nav, shows Retour, and sets `lg:max-w-[56rem]`. Children include `DetailLibraryStatus`, an identity block, section chips, source or rich content, and `BottomReadingDock`.

**Header.** Retour + truncated title + connection + profile avatar share one 56px row. A long protocol title will truncate before the clinical name is readable. The identity card below repeats the title at 20px, which is the real title. Two `h1` elements exist when the identity card renders.

**Section nav.** Horizontal chips on small screens, vertical stack at `lg` inside the same column. It does not become a second column beside the article, except Glasgow / formula calculators which use `lg:grid-cols-2`.

**Reading width.** Several source renderers add `lg:max-w-[42rem]` inside the 56rem frame, so the article stays narrow while the frame is wider. That matches the “central column feels narrow” note, with an extra inconsistency: the frame and the article do not share a width.

**Dock.** Fixed, `lg:left-60`, 72px, labels under icons. Content padding is doubled (shell `96px` plus inner `104px`), so the last section sits higher than necessary. Labels truncate. Active state uses the same secondary pill as the bottom nav.

**References and actions.** Dock actions are Favori, Sources, Suivant, Mode garde, Partager, and offline-related icons depending on the page. They are secondary to the article, which is correct. Toast confirmation is a black bar that can sit on the dock; protocol positions it for the sidebar, other details do not.

**Missing content.** Callers pass “introuvable” copy into `EmptyContentState`. `ProtocolDeepSection` can still show “Section en préparation” when a published protocol has an empty section. That is not the retired public phrase list, but it is preparation language on a doctor-facing page.

### 7.7 Calculators

| UI | Result treatment | Input treatment |
| --- | --- | --- |
| Glasgow | `.text-display` fraction, label, pills, safety note. Reset is a full-width gray button. | Option groups, `min-h-[56px]`, two columns from `lg`, sticky result. |
| Cockcroft | Separate result column, sticky from `lg` | Labeled numeric fields, `min-h-[56px]` choices |
| Additive points | `.text-headline-sm` total / max, or a gray error sentence | Black selected option, gray idle option |
| Generic formula | `.text-body-md` string “Résultat” in an inset box. Incomplete input and the computed value share that style. | `text-body-sm` inputs, placeholder “Valeur”, no `min-h-11` guaranteed |

Glasgow is the only calculator that looks like a clinical instrument. The generic result is easy to miss, which is a P1 for a tool used under pressure.

Validation is inline engine text, not a field error with `aria-invalid` or `aria-describedby`. Reset, copy, and favorite live in the page or dock, not in one control cluster. Offline and Pro for calculators go through `DetailLibraryStatus` and `CalculatorLockedNotice`, styled as inset text.

Favorite and copy were not exercised. The components expose them as dock or button actions.

### 7.8 Offline

`OfflineManagerPage` is a stack of inset sections inside the `42rem` shell.

| State | How it looks |
| --- | --- |
| Signed out | Inset card, “Connectez-vous pour télécharger.”, text link |
| Loading auth | “Vérification du compte…” |
| Empty local library | Status card with “0 contenus”, empty pack list |
| Downloaded | Row text plus a remove control (further in the same file) |
| Progress | A sentence: “Téléchargement du pack… 2/5” |
| Stale / update | “Mise à jour disponible” as body text |
| Storage full, corrupt, Pro, online-only | `errorCopy()` as `text-body-sm`, including Pro and corruption. Error color is not applied. |
| Local search miss | “Aucun contenu téléchargé ne correspond.” |

The screen explains the right things and looks unfinished. Progress has no bar. Pro-required and storage-full look like helper text. That is the main offline visual gap. Do not change download rules while fixing it.

`DetailLibraryStatus` repeats the same sentences on every clinical page, in a smaller inset block above the article. It is easy to skip, and it pushes the title down.

### 7.9 Profile and account

Profile is locked to 390px. It stacks eyebrow, identity card, optional completion card, plan card, practice rows, preference toggles, offline link (“Ouvrir”), language, display, account.

Completion uses the same card as home, including a 40px (`h-10`) button pair. Plan and Pro are a card, not a status color. Preference errors render as muted body text, not `--error`.

Signed-out doctors still reach profile through the shell; account actions live in `AccountSection`. Loading and error for the route use the global 390px states, which drop the shell.

### 7.10 Authentication

`/` is outside the shell: 430px column, carousel, bottom dock “Créer un compte” / “Se connecter”, Vaul drawer.

Auth type is a private scale (`22px` titles, `15px` fields, `50–54px` buttons), so sign-in does not look like the clinical app. Focus rings on fields use `ring-primary/20`, which is a 20% black ring and can fail focus visibility. Social buttons are 48px circles with clearer outlines.

Phone control calls `onPhone(AUTH_INFO.phoneSoon)`. If that handler surfaces the string, the doctor sees “bientôt disponible” on the auth drawer. That is the one remaining public “bientôt disponible” path found in components. It is not a clinical content state.

Password update is `app/auth/update-password/page.tsx` (separate route). Redirect and error copy live in `lib/auth/error-messages.ts`. They were not walked in a browser.

### 7.11 Redirect and missing-content behavior

| Case | What the UI shows |
| --- | --- |
| Unknown route | `app/not-found.tsx`: “Page introuvable”, link home. No shell. |
| Missing protocol, CAT, drug, calculator | Detail page empty state and/or `ContentUnavailable` (“introuvable”, back to the index, search). `ContentUnavailable` is not referenced by the public detail route files that were checked; those pages inline `EmptyContentState`. |
| `/premium` | Redirects to `/offline` |
| `/notifications` | Redirects to `/profile` |
| `/interactions` | Redirects to `/search?type=drugs` |
| Unpublished content | Not a public visual state if the publication boundary holds. Residual label function `doctorPublicationLabel` still returns “Contenu en préparation” for any status other than `published`. |
| Invalid calculator slug | Calculator unavailable copy via the detail/missing path |
| Empty search | Zero-result canvas |

### Legacy public copy check

These strings were **not** found in doctor-facing component JSX:

- “Bientôt disponible”
- “Ce contenu sera disponible prochainement”
- “Après relecture”
- “Révision médicale requise”
- “Sources à consolider”
- “Me prévenir”
- “Suggérer ce contenu”

They still exist in `lib/content-detail/status-labels.ts`, `lib/drugs/status-labels.ts`, demo fixtures, and calculator config. Public identity cards use `doctor-facing-status.ts` instead of the editorial maps. Drug index status for published items is “Publié” or “Pro”.

Remaining preparation language that doctors can still see:

- Auth phone: “Connexion par téléphone bientôt disponible.”
- `EmptyContentState` default title “Fiche en préparation” (overridden by current callers).
- `ProtocolDeepSection`: “Section en préparation”.
- `EmptyModulePage`: “Module en préparation” (component unused by current routes).
- Index empty lines about the référentiel being enriched by imports.
- `doctorPublicationLabel` / `drugIndexStatusLabel` fallback “Contenu en préparation” if a non-published row is ever rendered.

Internal staff UI is separate. `InternalPreviewBanner` says “Aperçu interne”, “Non publié, non Validé.”, and role requirements. That wording must stay on `/internal/*` and must not be copied into the doctor shell.

## 8. Responsive audit

Inferred from classes. Not screenshot-verified.

| Viewport | Expected behavior | Risk |
| --- | --- | --- |
| 390 × 844 | Shell column is full width (`42rem` cap does not bind). Index `390px` plus `px-4` is slightly tighter than the viewport. Header row is crowded: Retour, title, “En ligne”, Modules, avatar. | Header truncation. Chip rows scroll with no affordance. Bottom nav should clear content. |
| 430 × 932 | Home/search use the full width up to 672px. Indexes stay 390px and center, so ~20px of canvas appears on each side while the header stays full width. | Header and content widths diverge. |
| 768 × 1024 | Still the phone shell (`lg` = 1024). Bottom nav remains. Content caps at 672px or 390px in a tablet portrait field. | Large side margins. Module sheet is full width, which is fine. |
| 1024 × 768 | Sidebar appears. Bottom nav hides. Usable content width is about 1024 − 240 = 784px, then capped at 672, 390, or 896. Landscape height is short; sticky chips + header consume ~72px and the dock consumes 72px. | Index pages become a 390px column beside a sidebar. Dock + sticky nav compete for vertical space. |
| 1280 × 800 | Same pattern with more unused horizontal space. Home is a 672px column in ~1040px. | Workstation feels empty. |
| 1440 × 900 | Same, more empty space. Detail frame 896px still leaves a wide cream margin. Source text often stops at 672px. | Reading measure may actually be acceptable at 672px; the problem is the empty field and the inconsistent caps, not a need to stretch lines to 1200px. |

Other responsive notes:

- No horizontal page overflow was found in the shell (`min-w-0` on the main column, `overflow-x-auto` only on chip rows).
- Cards do not stretch to an unreadable line length because of the caps. The caps are what make desktop look like a scaled phone.
- Glasgow and formula calculators are the only doctor screens with a real two-column layout, and only from `lg`.
- Personalization sheet and auth drawer are `max-w-[390px]` or `430px` while `position` is full-bleed. On a wide screen the sheet stays a phone width anchored to the bottom. That is acceptable for auth and awkward for profile editing on desktop.
- Safe area: header `pt-safe`, nav and dock `pb-safe`, shell padding includes `env(safe-area-inset-*)`. `viewportFit: "cover"` is set. Not verified on a notched device.

## 9. Accessibility audit

Separate from visual style.

| Topic | Finding | Severity |
| --- | --- | --- |
| Pinch zoom | `app/layout.tsx` sets `maximumScale: 1` and `userScalable: false`. Doctors cannot zoom clinical text. WCAG 1.4.4. | P1 |
| Heading order | Shell renders `h1` for every page title. Detail identity cards render a second `h1`. Home sections correctly use `h2`. Index pages use `h2` for a title that duplicates the `h1`, and profile preferences jump to `h3` (“Préférences”) without an `h2`. | P1 |
| Focus visible | Global `outline: 2px solid` on links, buttons, inputs, summary, `[role=button]`. Auth fields add a 20% black ring that is weaker than the global outline. `outline-none` on inputs can suppress the global outline depending on source order. Needs a keyboard pass. | P1 to verify |
| Keyboard | Chip rows are buttons or links, so they are focusable. Horizontal scroll has no scroll buttons. Module dialog should trap focus because it uses `showModal`. Not tested. | P2 |
| Escape | Native dialog closes on Escape and calls `onClose`. Vaul drawers need a manual check. | P2 |
| Names | Profile, Retour, Fermer, Effacer la recherche, and Filtres have accessible names. Filtres does not match the behavior. Connection state is text, not icon-only. Dock actions have visible labels. | P2 for the Filtres mismatch |
| `aria-current` | Bottom nav, sidebar, module links, section nav, library tabs. | Pass in source |
| `aria-pressed` | Filter chips and several toggles. | Pass in source |
| Semantics | Navigation is `<nav>` or `<Link>`. Actions that navigate are links. Reset and download are buttons. | Generally sound |
| Form labels | Home and search inputs use `aria-label`. Calculator numeric fields use `<label>`. Protocol search uses `aria-label`. Auth fields need a pass for visible labels vs placeholders. | Partial |
| Errors | Search and offline errors are not associated with inputs via `aria-describedby` / `aria-invalid`. Calculator failures are plain text. Global error boundary does not expose `error.digest` in the UI (good). | P1 for search |
| Touch targets | Bottom nav, header profile, module rows, index chips, dock rows: at least 44px on one axis. Home shortcut chips ~30px. Favorite filters 32px. Chip count badges are inside the chip. Glasgow options 56px. | P1 for the short chips |
| Contrast | Primary text and secondary text pass AA. `--outline` at 4.28:1 should not be used for small text. `--on-secondary-container` on `--secondary-container` is 4.55:1. Auth placeholder at 60% opacity is the faint case. Error on error-container passes at 5.0:1. | P2 |
| Reduced motion | `animate-pulse` on route loading. `scrollIntoView({ behavior: "smooth" })` on filter buttons. `active:scale-[0.98]` on several cards. No `prefers-reduced-motion` override. | P2 |
| Screen reader | Glasgow result is `role="status"` + `aria-live="polite"`. Connection indicator is `aria-live="polite"` and will announce “En ligne” on load. Search loading is not live. Zero-result heading is static. | P2 |
| Horizontal scroll | Chip scroller is not a named region and hides the scrollbar (`no-scrollbar`). Keyboard users can tab between chips; pointer users get no cue that more chips exist. | P1 on narrow screens |
| Language | `html lang="fr"`. | Pass |

## 10. Loading, empty, error, and status audit

| State | Where | Visual | Gap |
| --- | --- | --- | --- |
| Route loading | `AppLoadingState` | Centered pulse and “Chargement…”, 390px, no shell | Context disappears. No mention of which screen. |
| Search loading | `SearchPage` | “Recherche en cours…” | Too quiet. No busy state. |
| Calculator engine loading | Generic calculator | “Chargement du moteur de calcul…” | Acceptable sentence, same inset as the result. |
| Offline auth check | Offline page | “Vérification du compte…” | Same. |
| Home empty | Resume and frequent sections | Inset panel + links | Honest. Looks like a placeholder because it shares the input color. |
| Index empty | CAT, protocoles, drugs, scores | Local empty components | Import-referential copy feels unfinished. |
| Favorites / history empty | `PersonalEmptyState` | Icon, title, one action | Best empty pattern in the app. |
| Search miss | `ZeroResultCanvas` | Icon with error badge | Miss is styled as an alert. |
| Search failure | Same as miss | — | Misleading. |
| 404 / unavailable | `not-found`, `ContentUnavailable`, detail empty | Title, explanation, black button | Consistent enough. No shell, so they feel like a different app. |
| Route error | `AppErrorState` | “Un problème est survenu”, Réessayer, home | Clear. No shell. |
| Pro | Home chip, drug pill, offline pack line, detail status | Black chip or the word “Pro” | Not one component. |
| Offline / downloaded | Header wifi, detail paragraph, offline page | Text | Header “En ligne” is noise. Downloaded vs stale vs failed share one style. |
| Signed-out download | Detail and offline | Sentence + link to `/` | Clear copy, weak button (text link, not the primary button style). |
| Storage full / corrupt | `errorCopy` strings | Body text | Copy is specific. Color does not mark it as a blocking error. |
| Success | Download progress ending in “Disponible hors-ligne” | Sentence | No confirmation component. Fine if it stays quiet. |

## 11. Visual consistency problems

1. Three content widths: 390px, 42rem, 56rem, plus auth at 430px.
2. Two `StatusChip` components and a third hand-built drug pill.
3. Filter chips copied four times, plus shorter chips on home and favorites.
4. Search fields: home (low surface, no shadow), global search (container surface, shadow), protocol index (bordered white).
5. Primary buttons: `rounded-lg`, `rounded-xl`, and `rounded-full`; heights 40, 44, 48, 50, 54.
6. Empty states: shared personal component vs one-off index blocks vs home inset divs.
7. Page title in the header and again as a larger heading.
8. Calculator results: 34px, 17px, and 15px for the same job.
9. Toasts: protocol offsets for the sidebar; other detail toasts stay viewport-centered and can sit under the sidebar.
10. Onboarding typography is outside the clinical ramp, so the first screen and the workspace do not look like one product.
11. Staff preview banner reuses `--secondary-container`, which is also the active nav pill.

## 12. Prioritized issue list

Classification is separate from the fix phase. “Kind” follows the requested split. None of these are permission to change data, entitlement, or calculator formulas.

### P0 — Blocking

None confirmed from source. Do not treat desktop emptiness or pale cards as blocking. Re-check in a browser before UI-2: if the reading dock or bottom nav actually covers the last action on a device, raise that item to P0.

### P1 — High

| ID | Kind | Screen | Viewport | Problem | User impact | File | Direction | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UI-001 | Visual + responsive | Indexes, profile | ≥1024 | `frameClassName="max-w-[390px]"` overrides the shell. | Desktop CAT, protocoles, médicaments, scores, and profile remain a phone column beside the sidebar. | `CatIndexPage.tsx`, `ProtocolsIndexPage.tsx`, `DrugsIndexPage.tsx`, `CalculatorsIndexPage.tsx`, `ProfilePage.tsx` | One shell frame. Indexes match home width. Do not change routes. | UI-2 |
| UI-002 | Visual + responsive | Home, search, favorites, offline, detail | ≥1024 | Content is centered at 42rem or 56rem in a wide canvas. Header at `lg` is full width (`lg:max-w-none`) while the column is not. | Workstation looks empty. Header actions and content do not share an edge. | `AppShell.tsx`, `AppHeader.tsx` | Align header content to the same column. Use remaining width for nav, not for stretching body text to the viewport edge. | UI-2 |
| UI-003 | Visual | Generic and additive calculators | All | Result is 15px or 17px in a gray box. Glasgow is 34px. Incomplete input and a real result look similar. | A score is easy to miss during a shift. | `GeneratedFormulaCalculator.tsx`, `AdditivePointsCalculator.tsx`, `GlasgowResultCard.tsx` | One result surface. Large numeric, unit, and interpretation. Same component for every engine. | UI-6 |
| UI-004 | Interaction | Search | All | Failed search is rendered as “Ce contenu n’existe pas dans Nabda.” | A doctor may believe the drug or CAT is absent when the request failed. | `SearchPage.tsx`, `ZeroResultCanvas.tsx` | Distinct error presentation using the existing error token. Keep the query. Do not change the search API. | UI-4 |
| UI-005 | Accessibility | All | All | Pinch zoom is disabled. | Low-vision reading of doses and scores is blocked. | `app/layout.tsx` | Allow user scaling. This is an accessibility change, not a visual redesign. | UI-8, can land earlier if wanted |
| UI-006 | Accessibility | Detail | All | Two `h1` elements. Shell `h1` truncates the clinical title. | Screen-reader outline is wrong. Sighted users lose the long title in the bar. | `AppHeader.tsx`, `ContentIdentityCard.tsx`, `CatIdentityCard.tsx`, `DrugIdentityCard.tsx` | Shell bar is a label, not the page `h1`. Identity card keeps the single `h1`. | UI-2 and UI-5 |
| UI-007 | Interaction + responsive | Search, CAT, drugs, scores, favorites | 390–430 | Chip rows hide the scrollbar and give no fade or scroll cue. Favorite chips are 32px. Home chips are ~30px. | Filters look clipped. Some are hard to tap. Text itself uses `shrink-0`, so this is overflow affordance, not cut glyphs. | Filter chip components, `HomeSearchBar.tsx`, `PersonalFilterChips.tsx` | One chip height ≥44px, visible overflow cue. | UI-1, UI-4 |
| UI-008 | Visual | Offline, detail status | All | Pro, downloaded, stale, online-only, storage-full, and corrupt are the same gray inset text. Storage and corruption do not use `--error`. | Status is readable only if the doctor reads the sentence. Blocking failures look optional. | `OfflineManagerPage.tsx`, `DetailLibraryStatus.tsx` | One status row: label, short sentence, one action. Use error color only for failed or corrupt. Do not change who may download. | UI-7 |

### P2 — Medium

| ID | Kind | Screen | Viewport | Problem | User impact | File | Direction | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UI-009 | Visual | All cards | All | White cards and cream page are close. Inset empty panels match input fields. | Sections blur together. Empty looks unfinished. | Card call sites, `globals.css` | Stronger separation between canvas, card, and inset. No new brand hue required. | UI-1, UI-3 |
| UI-010 | Visual | Home | All | Black is used for primary buttons, active filters, and the PRO chip. | Pro and “submit” look like the same control. | `StatusChip`, `HomeIdentityBar.tsx` | PRO is a status label, not a button. | UI-1, UI-3 |
| UI-011 | Visual | Home | Empty incomplete | Profile completion and empty clinical cards have the same weight. Greeting includes a wave emoji. | The home can feel like account setup before a workspace. | `HomeDashboard.tsx`, `HomeIdentityBar.tsx`, `ProfileCompletionCard.tsx` | Keep completion available and visually quieter than search and Reprendre. Drop the emoji when touching this screen. | UI-3 |
| UI-012 | Visual | Indexes | All | Header title and a larger `h2` repeat. | First viewport is a title, not a list. | Index pages | Keep one visible title. | UI-4 |
| UI-013 | Visual | Buttons, chips | All | Radius and height drift. | The app feels assembled from screens. | See inventory | Primitives, then replace call sites by screen. | UI-1 |
| UI-014 | Responsive | Detail | All | Shell reserves ~96px and the dock reserves another ~104px. | Extra blank area above the dock. | `AppShell.tsx`, `BottomReadingDock.tsx` | One bottom reserve. | UI-2, UI-5 |
| UI-015 | Visual | Detail | ≥1024 | Article wrappers cap at `42rem` inside a `56rem` frame. Section nav becomes a vertical list in the same column. | Width jumps between header, nav, and article. | Source renderers, `SectionNav.tsx` | One reading measure. Section nav can sit beside the article only if it does not change routes. | UI-5 |
| UI-016 | Interaction | Detail toasts | ≥1024 | Only the protocol toast offsets for the sidebar. | Confirmation can sit under the sidebar or away from the column. | Detail pages | One toast anchored to the content column. | UI-5 |
| UI-017 | Accessibility | Loading, chips, cards | All | Pulse, smooth scroll, and press scale ignore reduced motion. | Vestibular risk is small but real. | `AppLoadingState.tsx`, filter scroll calls | Respect `prefers-reduced-motion`. | UI-8 |
| UI-018 | Visual | Auth vs app | ≤430 | Auth uses a private type scale and a 430px frame. | Sign-in feels like a different product. | `components/onboarding/*` | Map auth text onto the ramp after clinical screens. | UI-7 or UI-8 |
| UI-019 | Visual | Route loading, 404, error | All | Full-screen states omit the shell and use 390px. | Navigation disappears during the moment the doctor is lost. | `AppLoadingState.tsx`, `AppErrorState.tsx`, `not-found.tsx` | Render these inside the shell when a session exists. | UI-7 |
| UI-020 | Interaction | Search header | All | Sliders icon is named “Filtres” and only scrolls. | The control promises a panel it does not open. | `SearchPage.tsx` | Either remove it or make it move focus to the chip row and say so. | UI-4 |
| UI-021 | Copy residual | Detail section, empty default, auth phone | All | “Section en préparation”, default “Fiche en préparation”, phone “bientôt disponible”. | Sounds like the retired editorial placeholder. | `ProtocolDeepSection.tsx`, `EmptyContentState.tsx`, `SocialAuthRow.tsx` | Replace doctor-facing wording with unavailable / not offered. Do not show unpublished bodies. | UI-5, UI-7 |

### P3 — Low

| ID | Kind | Screen | Problem | Direction | Phase |
| --- | --- | --- | --- | --- | --- |
| UI-022 | Visual | Header | Sticky chips use 64px offset; header content is 56px. | Align the offset when the shell changes. | UI-2 |
| UI-023 | Visual | Header | “En ligne” is always visible. | Show the offline state prominently; quiet the online state. | UI-7 |
| UI-024 | Visual | Sidebar | Primary and module links have no group label. | “Principal” / “Modules” as text, not a new IA. | UI-2 |
| UI-025 | Visual | Cards | `shadow-sm` is easy to miss on white-on-cream. | A 1px border may separate better than a larger shadow. Decide in UI-1. | UI-1 |
| UI-026 | Motion | Sheets, nav, download | Module sheet and downloads change state with little transition. | Short opacity/translate only after layout is stable. | UI-8 |
| UI-027 | Visual | Home | “Freemium” is product jargon on the identity row. | Use the existing “Gratuit” label if the plan is free. Copy decision, not a new feature. | UI-3 |

## 13. Recommended design-system changes

Do this in UI-1 before screen restyles. Do not pick a new brand palette in that phase. The current cream, ink, and error red can stay.

1. **Semantic color roles, not new hues.** Document roles: canvas, card, inset, text, muted, border, action, action-on, selected, danger, danger-on. Map them to the existing variables. Add Pro and offline as label roles that may reuse selected and muted until a single accent is chosen.
2. **Stop using black for non-actions.** Active filter can stay filled. PRO, “Publié”, and “En ligne” should not look like buttons.
3. **Type ramp only.** Ban new `text-[Npx]` on doctor screens. Decide whether shell titles stay 17px or move to `headline-md`. Keep 34px for calculator totals.
4. **Spacing roles.** Screen padding 16. Section gap 20. Card padding 16. Control height 44. Chip height 44. Reading measure: one number, applied by the shell.
5. **Primitives.** Button, icon button, search field, text field, filter chip, status chip, card, inset notice, empty state, list row, spinner/busy line. Implement by wrapping current class strings so screens can adopt them one phase at a time.
6. **One status language.** Gratuit, Pro, En ligne, Hors-ligne, Téléchargé, Mise à jour, En ligne seulement, Connexion requise, Espace insuffisant, Contenu illisible. Same words in the header, the detail block, the index row, and the offline manager.
7. **Focus and zoom.** Visible focus on every control, including fields that set `outline-none`. Remove the zoom lock.
8. **Motion later.** No animation until UI-8, except honoring reduced motion if a primitive already pulses.

## 14. Recommended implementation order

### UI-1: tokens and primitives

- **Goals.** Freeze the current palette into named roles. Add the missing primitives without changing screens yet, or change only the primitive files and one reference screen if needed to prove them.
- **Components.** Button, chips, status, card, field, empty, busy.
- **Screens.** None required, or a single internal sample. Doctor routes stay as they are until UI-2.
- **Risks.** A global CSS variable rename can shift every screen at once. Prefer adding roles beside the current variables, then pointing Tailwind theme keys at them.
- **Acceptance.** Existing screens look the same until a later phase opts in. New primitives match the documented sizes. Contrast of text roles stays at or above current ratios. No route or API change.

### UI-2: shell and responsive frame

- **Goals.** One content width strategy from the sidebar edge. Header, main, and dock share that edge. Remove the 390px index cap. Fix duplicate `h1` in the shell. Single bottom padding.
- **Components.** `AppShell`, `AppHeader`, `DesktopSidebar`, `BottomNav`, `ModuleSheet`, `BottomReadingDock`.
- **Screens.** Every `AppShell` page. 404 and loading can wait until UI-7.
- **Risks.** `lg:max-w-*` overrides are scattered. Missing one leaves a page on the old width. Sticky `top` offsets must be updated with the header height.
- **Acceptance.** At 390 and 430, primary actions clear the bottom nav and the dock. At 1280 and 1440, indexes are the same width as home. No horizontal page scroll. Sidebar does not cover toasts. Keyboard focus still visible. Zoom policy can wait, but heading order in the shell is fixed.

### UI-3: homepage

- **Goals.** Search is the dominant control. Reprendre and Souvent utilisés are the next layer. Completion, Pro, and offline are quieter and use the status language. Empty home looks intentional.
- **Components.** Home sections, both completion cards, `ProUpsellCard`, `OfflinePackCard`, `StatusChip`.
- **Screens.** `/home` only.
- **Risks.** Hiding completion entirely would fight profile setup. Keep it, lower its contrast.
- **Acceptance.** First viewport shows identity, search, and either a resume item or a clear empty resume. No emoji. Pro is not a black button. Empty and filled cards are distinguishable.

### UI-4: search and indexes

- **Goals.** One search field, one chip row, one list row. Search failure ≠ zero results. Index titles are not duplicated. Long French titles wrap or clamp consistently.
- **Components.** Search input, filter chips, grouped results, medication results, four index pages.
- **Screens.** `/search`, `/cat`, `/protocols`, `/drugs`, `/calculators`, favorites filters if the chip primitive is ready.
- **Risks.** Demo query branches must keep working. Chip `aria-pressed` must remain.
- **Acceptance.** A thrown search shows an error with retry, not “n’existe pas”. Chips are 44px and show that the row scrolls. Protocol, drug, CAT, and score lists share row structure. Width matches UI-2.

### UI-5: clinical detail pages

- **Goals.** One identity header, one section nav, one reading measure, one dock, one toast. Library status uses the UI-7 status row if that phase has started; otherwise leave a slot.
- **Components.** Identity cards, `SectionNav`, source renderers, `BottomReadingDock`, `EmptyContentState`, detail pages.
- **Screens.** Protocol, CAT, drug, calculator detail.
- **Risks.** Source HTML (`.source-html`) has its own 13px headings. Changing that affects medical content readability. Test a long protocol and a long drug name.
- **Acceptance.** One `h1`. Last section clears the dock without a double gap. Dock labels do not overlap. “Section en préparation” is replaced with unavailable copy. Unpublished bodies are still not rendered.

### UI-6: calculators

- **Goals.** Glasgow, Cockcroft, additive, and generic engines share input, result, reset, and error presentation. The result is the visual focus.
- **Components.** The four calculator bodies and `CalculatorLockedNotice`.
- **Screens.** `/calculators` and `/calculators/[slug]`.
- **Risks.** Any shared result component must display engine output only. Do not recompute, round differently, or change validation messages’ meaning.
- **Acceptance.** A completed generic score is readable at arm’s length on a phone. Incomplete and invalid states are not styled as a final result. Reset and copy still call the current handlers. Calculation stays local.

### UI-7: offline, profile, and access states

- **Goals.** The status language is visible on the offline manager, the detail status block, profile plan, and signed-out / Pro / storage / corrupt states. Auth and global error/loading sit in the same frame as the app where that does not bypass the staging gate.
- **Components.** `OfflineManagerPage`, `DetailLibraryStatus`, `ProfilePage`, `AppLoadingState`, `AppErrorState`, auth drawer.
- **Screens.** `/offline`, `/profile`, `/`, `/auth/update-password`, loading and error boundaries.
- **Risks.** Styling a Pro message must not enable download. Styling signed-out must not skip auth.
- **Acceptance.** Each offline state in the audit table is visually distinct and uses the agreed words. Phone “bientôt disponible” is gone or clearly “non proposé”, not a clinical placeholder. Profile is on the shell width.

### UI-8: motion, accessibility, and polish

- **Goals.** Zoom, focus, reduced motion, live regions for search and calculator results, chip scroll affordance polish, optional short sheet and progress motion.
- **Components.** Root layout, primitives, module sheet, progress text.
- **Screens.** Cross-cutting.
- **Risks.** Motion that runs during a calculator update will feel slower than the local engine. Keep result updates instant.
- **Acceptance.** User scaling works. Focus is visible on fields and icon buttons. `prefers-reduced-motion: reduce` disables pulse, smooth scroll, and press scale. No new clinical gamification.

## 15. Explicitly out of scope

- Business logic, publication rules, entitlement, RLS, and content gates.
- Offline architecture, encryption, pack selection, and IndexedDB.
- Calculator formulas, engines, and when they call the network.
- Routes, redirects, and information architecture changes (for example moving Historique).
- New product features, new data fields, and new clinical modules.
- Editorial or review UI, unpublished previews, and “me prévenir” / “suggérer”.
- Final brand colors, illustration, and marketing pages beyond mapping auth onto the existing ramp.
- Gamification of scores, diagnoses, or outcomes.
- Internal `/internal/*` visual redesign, except keeping its copy out of the doctor UI.

## 16. Open product and design decisions

1. **Reading measure.** Is the desktop article `42rem` (~672px) or `56rem` (~896px)? 672px is enough for French prose. The empty margin is a frame problem. Decide before UI-2 so detail and home do not diverge again.
2. **Tablet.** Should 768px stay on the bottom nav? Today it does, because `lg` is 1024px. Confirm that is intended.
3. **Online indicator.** Always visible, or only when offline?
4. **Free label.** “Freemium”, “Gratuit”, or nothing when the item is free?
5. **“Publié” on drug rows.** For a published catalog, a “Publié” pill on every row is noise. Prefer type + Pro only, if product agrees.
6. **Single accent.** The audit does not choose one. If Pro and offline need a color later, it should be one restrained hue, not a category rainbow.
7. **Profile completion.** Persistent until done, or dismissible and only in profile? The component already supports “Plus tard”.
8. **Search filter button.** Remove it, or turn it into a real filter disclosure? Behavior change needs a product yes.
9. **Auth phone.** Remove the control until it works, or keep it with honest “non disponible” copy?
10. **Empty catalog sentence.** “Le référentiel sera enrichi…” describes an internal process. Replace with a doctor-facing empty library sentence when UI-4 starts.

## 17. Screenshots and references

No screenshots were captured in this phase. The notes supplied with the brief were checked against source:

| Suggested issue | Source check |
| --- | --- |
| Desktop home has large unused space | Confirmed by `max-w-[42rem]` inside a fluid main column next to `w-60`. |
| Central reading column feels narrow on desktop | Confirmed for source renderers at `lg:max-w-[42rem]`, while the frame allows `56rem`. |
| Mobile filter chips may clip | Text is `shrink-0` inside `overflow-x-auto`. Clipping of glyphs is unlikely. Clipping of the row, with no scrollbar, is likely. Not seen in a browser. |
| Fixed navigation may overlap content | Shell and dock reserve padding greater than the bar height. Overlap not confirmed. Double reserve on detail pages is confirmed in classes. |
| Cards look similar | Confirmed. Same cream family, light or no shadow. |
| Empty states feel like placeholders | Confirmed for home and index empties. Favorites empty is more deliberate. |
| Profile completion competes with clinical content | It is below resume and frequent, so it competes mainly on an empty home. |
| Loading / offline screen is too empty | Confirmed. Pulse or a sentence, no context. |
| Typography and chips are inconsistent | Confirmed. See sections 5 and 11. |
| Pale surfaces and black pills dominate | Confirmed. Black is `#000000` `--primary`. |

Code references for the frame:

```54:61:components/app/AppShell.tsx
        <main
          className={cn(
            showBottomNav
              ? "mx-auto w-full max-w-[42rem] px-4 pt-[calc(56px+env(safe-area-inset-top,0px))] pb-[calc(112px+env(safe-area-inset-bottom,0px))] lg:pb-8"
              : "mx-auto w-full max-w-[42rem] px-4 pt-[calc(56px+env(safe-area-inset-top,0px))] pb-[calc(96px+env(safe-area-inset-bottom,0px))] lg:pb-10",
            frameClassName,
            contentClassName,
          )}
```

Index override example: `components/cat/CatIndexPage.tsx` passes `frameClassName="max-w-[390px]"`. Detail override: `ClinicalDetailFrame` adds `lg:max-w-[56rem]`.

Prior UX notes in `docs/ux/phase-3-ux-foundation.md` describe an older shell (`max-w-[430px]`, no sidebar). This audit supersedes that document for visual layout. It does not replace it for information architecture.

## Verification

- Visual runtime inspection: **not done**. No browser tool was available. Do not treat viewport rows as observed pixels.
- Contrast ratios: computed from token hex values in this phase.
- `git diff --check`: run after this file was added.
- `npm run lint`, `npx tsc --noEmit`, and `npm run build` were not re-run. No production source was changed.

No production code, routes, APIs, database logic, authorization logic, entitlement logic, offline logic, or calculator logic was modified.
