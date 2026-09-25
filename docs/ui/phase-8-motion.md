# UI-8A — Motion audit and specification

Audit and specification only. No production motion was added or changed in this phase.

Date: 25 September 2026

Scope: existing transitions, keyframes, timed UI state, loading indicators, dialogs, sheets, feedback, reduced-motion handling, and performance implications in the doctor-facing Nabda UI.

Illustrations stay postponed until after the general live QA phase. This document does not specify illustration motion.

## 1. Executive summary

Nabda is mostly still. Clinical reading, search results, calculator numbers, and route changes update immediately. The motion that does exist is local, inconsistent, and largely disconnected from the UI-1 duration tokens.

What already exists:

- Unused tokens in `app/globals.css`: `--duration-fast` 120ms, `--duration-standard` 200ms, `--duration-slow` 320ms, `--ease-standard` `cubic-bezier(0.2, 0, 0, 1)`.
- A global `prefers-reduced-motion: reduce` rule that forces CSS `animation-duration` and `transition-duration` to `0.01ms` and `scroll-behavior` to `auto`.
- Instant press scale on cards and chips (`active:scale-*`) with no timing class, so the scale snaps.
- Tailwind `transition-transform` / `transition-colors` at the framework default of 150ms and `cubic-bezier(0.4, 0, 0.2, 1)`, used by chevrons, the preference switch, and flowchart node shadows.
- Vaul sheets at 500ms with `cubic-bezier(0.32, 0.72, 0, 1)`, plus drag.
- Framer Motion on the welcome carousel (260ms slide, elastic drag) and onboarding buttons (120ms press scale). Its default `reducedMotion` is `"never"`.
- Infinite `animate-pulse` on route/section loading and on two CAT status dots, plus one onboarding visual.
- JavaScript `scrollIntoView({ behavior: "smooth" })` and `scrollTo({ behavior: "smooth" })` that ignore the CSS reduced-motion rule.
- Confirmation toasts that appear and disappear with no enter/exit transition, held for 2800ms.

The product target is a fast, calm clinical tool. Users should feel that Nabda responds immediately, and they should not feel that the interface is animated everywhere.

Motion may confirm selection, completion, failure, acknowledgement, and where a panel came from. It must not delay medical content, search, calculators, or navigation. It must not animate clinical paragraphs or warnings, count numbers, bounce icons, use spring or elastic effects, or gamify a decision.

Later implementation phases follow sections 8–23. They must not add a motion library, and they must not expand Framer Motion or Vaul beyond the constraints in this document.

**Runtime browser inspection was not performed.** This session has no browser automation. Durations below are taken from source, Tailwind defaults, Vaul’s `TRANSITIONS` constant, and Framer Motion’s `MotionConfigContext` default. The four requested viewports were not opened.

No production component, `app/globals.css`, dependency, layout, color, type, navigation, API, database, entitlement, publication boundary, offline behavior, calculator behavior, or search behavior was modified.

## 2. Current motion inventory

Class codes:

1. Essential state feedback
2. Helpful orientation
3. Optional polish
4. Decorative or unnecessary
5. Potentially harmful
6. Missing

“Current duration” is `none` when the style change is instant. Tailwind `transition-transform` and `transition-colors` with no `duration-*` class use 150ms and `cubic-bezier(0.4, 0, 0.2, 1)`. `active:scale-*` without a `transition` class does not interpolate.

Reduced-motion notes:

- **CSS rule** means the global `0.01ms` override applies.
- **Not covered** means JavaScript sets scroll behavior, inline transforms, or a timer the CSS rule does not cancel.
- **motion-safe** means the utility is already omitted when `prefers-reduced-motion: reduce` matches, in addition to the global rule.

| Area | Component/file | Trigger | Property animated | Current duration | Current easing | Reduced-motion behavior | Purpose | Class | Keep/change/remove |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Buttons | `components/ui/Button.tsx` | Hover, active, disabled | Background color, opacity via disabled classes | none | none | Instant color | Essential feedback | 6 for press timing; 1 for color | Change: add shared hover/press timing. Keep disabled instant |
| Buttons | `components/ui/Button.tsx` | `loading` | Static ring (`border-t-transparent`), no `animate-spin` | none | none | Static | Loading meaning is missing visually | 6 | Change: spin only while `loading` is true |
| Icon buttons | `components/ui/IconButton.tsx` | Hover, active | Background color | none | none | Instant | Essential feedback | 6 for press | Change: same press contract as Button |
| Icon buttons | `components/ui/TextField.tsx` clear control | Click | None | none | none | n/a | Clear search | 6 | Change: press only. No icon motion |
| Icon buttons | `components/content-detail/BottomReadingDock.tsx` | Favorite, share, reset, sources | Icon swap and pill background | none | none | Instant | Essential state | 1 | Keep instant icon swap. No bounce |
| Icon buttons | `components/search/MedicationResultCard.tsx` | Favorite | Fill of bookmark, opacity while pending | none | none | Instant | Essential state | 1 | Keep instant fill. Add text confirmation. No bounce |
| Icon buttons | `components/app/ModuleSheet.tsx` close | Click | None | none | none | n/a | Close | 6 | Change: press only |
| Icon buttons | `components/onboarding/AuthDrawer.tsx` close | Click | None | none | none | n/a | Close | 6 | Change: press only |
| Filter chips | `components/ui/FilterChip.tsx` | Selected, hover | Background, text color | none | none | Instant | Essential selection | 1 | Keep selection instant. Optional 120ms color |
| Filter chips | `components/search/FrequentSearchChips.tsx` | Press | `scale(0.95)` | none (snap) | none | Scale still applies | Press | 4 | Remove 0.95 scale |
| Pill navigation | `components/ui/PillNav.tsx` | Route current | Background, weight | none | none | Instant | Essential current page | 1 | Keep instant. No route animation |
| Text fields | `components/ui/TextField.tsx`, `SearchInputBar.tsx` | Focus | Background, focus ring | none | none | Instant | Essential focus | 1 | Keep ring instant. Do not animate height |
| Text fields | `components/search/SearchInputBar.tsx` | Screen change | Height `h-14` / `h-12` / `h-11` | none (layout jump) | none | Jump remains | Unwanted shift | 5 | Change: one stable height. Do not transition height |
| Status badges | `components/ui/StatusBadge.tsx`, `ConnectionIndicator.tsx` | Tone change | Color | none | none | Instant | Essential status | 1 | Keep instant |
| Interactive surfaces | `components/ui/Surface.tsx` `interactive` | Hover | Background | none | none | Instant | Optional hover | 3 | Optional 120ms background |
| Interactive surfaces | Cards listed below | Press | `scale(0.98)` or `scale(0.99)` | none (snap) | none | Scale still applies | Press on large rows | 4 | Remove scale from cards and rows |
| Loading indicators | `components/ui/LoadingIndicator.tsx` | Mount | Opacity pulse | 2s infinite | Tailwind pulse curve | `motion-safe` plus CSS rule | Loading | 3, becomes 5 if left infinite on clinical screens | Remove infinite pulse. Keep the text |
| Loading indicators | `app/loading.tsx` via `AppLoadingState.tsx` | Route pending | Same pulse | 2s infinite | Tailwind pulse | Same | Route loading | 3 | Remove pulse. Keep the label |
| Empty-state actions | `components/ui/EmptyState.tsx` | Click | Inherits Button | none | none | Instant | Action | 1 | Follow Button contract |
| Desktop sidebar | `components/app/DesktopSidebar.tsx` | Route | Border, color, weight, icon stroke | none | none | Instant | Essential current item | 1 | Keep instant. Do not animate the sidebar |
| Mobile bottom nav | `components/app/BottomNav.tsx` | Route | Pill background, color, weight, stroke | none | none | Instant | Essential current item | 1 | Keep instant. Optional 120ms background on the active pill only |
| Modules sheet | `components/app/ModuleSheet.tsx` | `showModal` / `close` | None. Backdrop is a static color | none | none | Instant | Orientation missing | 6 | Change: short backdrop fade and sheet translate. See section 16 |
| Dialog backdrop | `ModuleSheet` `::backdrop` | Open | None | none | none | Instant | Orientation missing | 6 | Change: opacity only |
| Search state | `components/search/SearchPage.tsx` | Idle, loading, results, empty, error, offline | Swap of blocks. No list transition | none | none | Instant | Results must stay immediate | 1 | Keep instant swaps. No row stagger |
| Search URL | `SearchPage.tsx` | Query or filter | `setTimeout` 250ms then `router.replace` | 250ms timer | n/a | Timer still runs | URL sync, not a visual wait | 1 | Keep. Do not add a second delay |
| Search focus | `SearchPage.tsx` `clearQuery` | Clear | `requestAnimationFrame` focus | 1 frame | n/a | Still focuses | Restore focus | 1 | Keep |
| Favorite controls | Detail docks and `MedicationResultCard.tsx` | Toggle | Icon and `aria-pressed` | none | none | Instant | Essential state | 1 | Keep instant. No new persistence logic |
| Copy confirmation | Drug, protocol, CAT, calculator detail pages | Clipboard or share result | Toast mount/unmount | 2800ms dwell, 0ms transition | none | Dwell unchanged. CSS rule does not apply | Essential confirmation | 1 | Change: short fade. Do not animate the copied value |
| Clinical section nav | `SectionNav.tsx`, `DrugPreviewTabs.tsx`, `ProtocolSectionChips.tsx`, `CatStepChips.tsx` | Active section | Background, weight | none | none | Instant | Essential current section | 1 | Keep color instant |
| Clinical section nav | `ProtocolSectionChips.tsx`, `CatStepChips.tsx` | User click | `scrollIntoView({ behavior: "smooth" })` | Browser smooth scroll | Browser default | **Not covered** | Orientation | 5 under reduced motion | Change: smooth only when motion is allowed |
| Clinical section nav | `CatStepChips.tsx` | Active chip | Horizontal `scrollIntoView` smooth | Browser smooth scroll | Browser default | **Not covered** | Keep the active chip in view | 2 | Change: `auto` under reduced motion |
| Clinical section nav | `CatStepChips.tsx` image chip | Click | `setTimeout` 50ms then smooth scroll | 50ms + smooth | Browser default | **Not covered**. Timeout is not cleared | Orientation | 5 under reduced motion | Change: scroll after layout without a fixed delay, and honor reduced motion |
| Reading dock | `BottomReadingDock.tsx` | Active action | Background, weight | none | none | Instant | Essential state | 1 | Keep instant |
| Calculator selection | `GlasgowOptionGroup.tsx`, `CalculatorFieldControl.tsx`, Cockcroft unit chips | Select | Background, text | none | none | Instant | Essential selection | 1 | Keep instant |
| Calculator selection | `CockcroftInputForm.tsx` sex option | Press | `scale(0.98)` | none (snap) | none | Scale still applies | Press | 4 | Remove scale. Selection color is enough |
| Calculator results | Glasgow, Cockcroft, generated formula | Input change | Text replacement | none | none | Instant | Result | 1 | Keep instant. Never count |
| Offline progress | `OfflineManagerPage.tsx`, `DetailLibraryStatus.tsx` | Download or update | Text, and `<progress>` when the label matches `n/m` | Real work | n/a | Value updates stay | Essential progress | 1 | Keep. No fake timing |
| Offline removal | `OfflineManagerPage.tsx` `removeLocal` | Delete success | List re-render | none | none | Instant | Item gone | 1 | Optional one exit, then remove. See section 15 |
| Download completion | Both offline surfaces | Success | Badge or sentence swap | none | none | Instant | Essential completion | 1 | Keep instant |
| Update completion | Same, plus PWA banner | Success or waiting worker | Badge, or banner mount | none | none | Instant | Essential | 1 | Banner may fade in. No fake progress |
| Connection indicator | `components/pwa/ConnectionIndicator.tsx` | `online` / `offline` events | Badge tone and icon | none | none | Instant | Essential status | 1 | Keep instant |
| PWA update banner | `components/pwa/PwaProvider.tsx` | Waiting service worker | Banner mount. Reload after 250ms | 250ms timer, 0ms transition | none | Timer still runs | Essential update | 1 | Optional fade. Do not animate the reload |
| Toasts | Four detail pages | Favorite, copy, share, reset | Appear, then unmount | 2800ms dwell | none | Dwell unchanged | Essential confirmation | 1 | Add short fade. Keep 2800ms |
| Profile toggle | `PreferenceToggleRow.tsx` | Switch | `background-color`, thumb `transform` | 150ms | Tailwind default | CSS rule | Essential state | 1 | Keep. Retoken to 120ms and `--ease-standard` |
| Profile sheet | `PersonalizationSheet.tsx` | Open, close, drag | Vaul transform and overlay opacity | 500ms | `cubic-bezier(0.32, 0.72, 0, 1)` | CSS duration crushed to 0.01ms. Drag is still pointer-driven | Orientation | 2 | Change duration to the overlay token. No page scale |
| Profile save | `PersonalizationSheet.tsx` | Saved | Closes after 700ms | 700ms timer | n/a | Timer still runs | Dwell, not a transition | 1 | Keep the existing dwell. Sheet exit follows section 16 |
| Authentication | `AuthDrawer.tsx` | Open, snap, drag | Vaul transform and overlay opacity | 500ms | Vaul ease | CSS duration crushed. Snap drag remains | Orientation | 2 | Same overlay contract. Do not scale the page |
| Authentication | `LoginForm.tsx`, `RegisterForm.tsx` | `pending` | Label text, `disabled:opacity-60` | none | none | Instant | Loading | 6 for a spinner | Optional Button loading. No extra motion |
| Authentication | `WelcomeCarousel.tsx` | Slide change, drag | `x`, opacity. `dragElastic` 0.06–0.22 | 260ms | Framer `easeOut` | **Not covered** (`reducedMotion: "never"`) | Onboarding orientation | 4, and 5 under reduced motion | Keep a short slide only when motion is allowed. Remove elastic |
| Authentication | `BottomActionDock.tsx` | Press | `scale(0.985)` | 120ms | Framer `easeOut` | **Not covered** | Press | 3 | Align with the 80ms press token, and disable scale under reduced motion |
| Authentication | `SlideProgress.tsx` | Active index | `width`, `background-color` | 200ms | `ease-out` | CSS rule | Step indicator | 3 | Keep for onboarding only |
| Authentication | `SlideTwoVisual.tsx` | Always | Opacity pulse | 2s infinite | Tailwind pulse | CSS rule | Decorative | 4 | Remove |
| Route loading | `app/loading.tsx` | Next.js route pending | Pulse plus label | 2s infinite | Tailwind pulse | `motion-safe` plus CSS rule | Route loading | 3 | Remove pulse |
| List affordance | `DiscoveryListRow.tsx` | Hover | Chevron `translateX(2px)` | 150ms | Tailwind default | `motion-safe` | Polish | 4 | Remove |
| List affordance | `CatEmergencyCard.tsx`, `PersonalContentCard.tsx` | Hover | Chevron `translateX(2px)` | 150ms | Tailwind default | CSS rule | Polish | 4 | Remove |
| CAT identity | `CatModuleIdentity.tsx` | Always | Opacity pulse on a primary dot | 2s infinite | Tailwind pulse | CSS rule. No `motion-safe` | Decorative “live” count | 5 | Remove |
| CAT urgences | `CatUrgencesView.tsx` | Always | Opacity pulse on an error dot | 2s infinite | Tailwind pulse | CSS rule. No `motion-safe` | Reads as a live emergency signal | 5 | Remove |
| Flowchart | `CatFlowchartNode.tsx` | Selection | `box-shadow` via `transition-shadow` | 150ms | Tailwind default | CSS rule | Selection | 3 | Change: ring only, no shadow transition |
| Flowchart | `CatFlowchartBoard.tsx` | Double-click focus | `zoomToElement` `animationTime: 220` | 220ms JS | Library default | **Not covered** | Orientation inside the canvas | 2 | 0ms when reduced motion is set |
| Onboarding dots | `SlideProgress.tsx` | Step | Width | 200ms | `ease-out` | CSS rule | Indicator | 3 | Keep |

Press-scale surfaces to remove, all instant snaps today:

| File | Scale |
| --- | --- |
| `components/search/FrequentSearchChips.tsx` | 0.95 |
| `components/cat/cards/CatContextCard.tsx` | 0.98 |
| `components/calculators/CalculatorContextGrid.tsx` | 0.98 |
| `components/calculators/cockcroft/CockcroftInputForm.tsx` | 0.98 |
| `components/calculators/FrequentCalculatorsGrid.tsx` | 0.98 |
| `components/drugs/FrequentDrugsGrid.tsx` | 0.98 |
| `components/drugs/DrugClassGrid.tsx` | 0.98 |
| `components/drugs/DrugOverview.tsx` | 0.99 |
| `components/drugs/DrugLinkedResources.tsx` | 0.99 |
| `components/calculators/cockcroft/CockcroftLinkedResources.tsx` | 0.99 |
| `components/calculators/glasgow/GlasgowLinkedProtocolCard.tsx` | 0.99 |
| `components/personal/PersonalContentCard.tsx` | 0.99 |

No `transition: all` was found. No skeleton or shimmer was found. `lib/layout/` and `lib/offline/` contain no transitions or timers used as motion. There is no `features/` UI animation surface.

`app/vaul.css` is imported from `app/globals.css` and duplicates Vaul’s injected CSS: drawer `transform` 500ms, overlay opacity 500ms, and keyframes `fadeIn`, `fadeOut`, `slideFromBottom`, `slideToBottom`, `slideFromTop`, `slideToTop`, `slideFromLeft`, `slideToLeft`, `slideFromRight`, `slideToRight`.

## 3. Current duration and easing inventory

| Source | Value | Where it is used |
| --- | --- | --- |
| `--duration-fast` | 120ms | Defined only. No component references it |
| `--duration-standard` | 200ms | Defined only. `scripts/verify-ui-tokens.ts` checks that the name exists |
| `--duration-slow` | 320ms | Defined only. Exceeds the 300ms routine cap |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Defined only |
| Tailwind `transition-*` default | 150ms, `cubic-bezier(0.4, 0, 0.2, 1)` | Chevrons, preference switch, flowchart shadow |
| `duration-200 ease-out` | 200ms, `cubic-bezier(0, 0, 0.2, 1)` | Onboarding `SlideProgress` width |
| Vaul `TRANSITIONS` | 500ms, `cubic-bezier(0.32, 0.72, 0, 1)` | Auth drawer and personalization sheet, including inline styles |
| Framer carousel | 260ms, `easeOut` | `WelcomeCarousel.tsx` |
| Framer press | 120ms, `easeOut` | `BottomActionDock.tsx` |
| Flowchart zoom | 220ms, library curve | `zoomToElement` |
| Tailwind `animate-pulse` | 2s, `cubic-bezier(0.4, 0, 0.6, 1)`, infinite | Loading dot, CAT dots, onboarding visual |
| Toast dwell | 2800ms | Four detail pages. Not a transition |
| Personalization close dwell | 700ms | Closes the sheet after save. Not a transition |
| Search URL replace | 250ms | Does not delay the search request |
| PWA reload | 250ms | `location.reload` after `SKIP_WAITING`. Not a visual transition |
| CAT image scroll delay | 50ms | Then smooth scroll |

Exit transitions are not shorter than entrances. Vaul uses 500ms for both. Toasts have no exit. The modules dialog has neither.

Values that exceed 300ms:

- `--duration-slow` at 320ms, unused.
- Vaul open, close, and snap at 500ms.
- Pulse cycle at 2000ms, repeating.
- Toast dwell at 2800ms and the personalization close dwell at 700ms. These are visibility timers. They are allowed to exceed 300ms because they are not transitions. Do not turn them into longer animations.

## 4. Existing reduced-motion behavior

`app/globals.css` applies this to every element, including `::before` and `::after`:

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This covers CSS animations and CSS transitions, including Vaul’s stylesheet and inline `transition` durations, Tailwind transitions, `animate-pulse`, and `SlideProgress` width. `html` has no `scroll-behavior: smooth` of its own. The rule does not set `animation: none`.

It does not cover:

| Behavior | Why it still moves |
| --- | --- |
| `scrollIntoView({ behavior: "smooth" })` and `scrollTo({ behavior: "smooth" })` | The `behavior` argument overrides CSS `scroll-behavior` |
| `WelcomeCarousel` translate, opacity, and elastic drag | Framer Motion writes transforms from JavaScript. Default `reducedMotion` is `"never"` |
| `BottomActionDock` `whileTap` scale | Same Framer path |
| `zoomToElement({ animationTime: 220 })` | `react-zoom-pan-pinch` timer |
| `active:scale-*` | A state style, not a transition. The scale still snaps on press |
| Toast 2800ms, search 250ms, personalization 700ms, PWA 250ms, CAT 50ms | `setTimeout`. Appropriate for dwell. Not appropriate as a scroll delay |

Vaul does not read `prefers-reduced-motion`. `data-vaul-animate="false"` only disables CSS `animation`, and Vaul sets that flag for the default-open case, not for reduced motion. Under the global rule the CSS duration collapses. Pointer drag still follows the finger, which is correct.

`LoadingIndicator` also uses `motion-safe:animate-pulse`, so the pulse class is absent under reduced motion even before the global override. The CAT and onboarding pulses do not use `motion-safe`, but the global override still stops them.

No component calls `matchMedia("(prefers-reduced-motion: reduce)")`.

## 5. Existing loading-animation inventory

| Surface | What the user sees | Animation | Announcement | Verdict |
| --- | --- | --- | --- | --- |
| Route `app/loading.tsx` | Centered “Chargement…” and a pulsing circle | 2s infinite pulse | `role="status"` `aria-live="polite"` | Remove the pulse. Keep the sentence |
| Search results and drug results | “Recherche…” via `LoadingIndicator` while `needsLookup && !identityMatches` | Same pulse | Same | Remove the pulse. Keep the sentence in the results region. Do not move the field |
| Offline manager before auth | “Vérification du compte…” | Same pulse | Same | Remove the pulse |
| Detail library status | “Vérification hors-ligne…” or “Téléchargement…” | None | `role="status"` | Keep text. No spinner required |
| Button `loading` | Children remain, plus a static incomplete circle | None | `aria-busy` | The circle should rotate only while `loading` is true, or be replaced by the label alone |
| Auth submit | “Connexion…”, “Envoi du lien…”, “Création du compte…” | None | Disabled control | Label change is enough |
| Formula engine | “Chargement du moteur de calcul…” | None | Plain paragraph, not live | Keep text. Do not pulse the formula |
| Pack download | “Téléchargement du pack… n/m” and a native `<progress>` when the manager label matches `n/m` | Determinate value | `role="status"` and `aria-label` on `<progress>` | Keep. Duration is the real download |
| Item download | “Téléchargement…” or “Mise à jour…” with no bar | None | Status text | Keep indeterminate text. Stop it on success or failure |
| PWA update | Banner, then reload | None | No live region | Banner is the status. Do not add a progress animation |

There is no skeleton, shimmer, or full-page spinner other than the route loading state. Do not add skeletons on clinical content.

## 6. Missing feedback patterns

| Interaction | What exists | What is missing |
| --- | --- | --- |
| Shared buttons and icon buttons | Hover and active color, no shared timing | A single press response |
| Button loading | `aria-busy` and a static ring | Motion that means “working”, stopped when the action ends |
| Modules sheet | Instant dialog | A short, interruptible entrance and exit |
| Vaul sheets | 500ms slide | A duration inside the overlay budget |
| Search favorite | Icon fill and `aria-pressed` | A text confirmation. No toast exists on this control |
| Copy | Toast sentence | No icon or label change on the dock action. The value itself correctly stays still |
| Download on a detail page | Status sentence | No determinate bar unless a pack reports `n/m` on the manager |
| Connection change | Instant badge | Nothing. Instant is the right behavior |
| Search field | Height changes with the screen | Spatial stability |
| Repeated identical toast | Timer starts once per distinct string | A second “Résultat copié” does not restart the 2800ms timer |
| Calculator numeric result | Number updates immediately and is in a polite live region | Announcements on every keystroke. The visible number must stay immediate |

Favorite persistence is not missing motion. It is existing product behavior, and UI-8 must not rewrite it:

- Protocol detail rolls the icon back when `toggleFavorite` returns `skipped`, then shows “Connectez-vous pour ajouter aux favoris.” The optimistic toast (“Synthèse sauvegardée” / “Synthèse retirée”) has already been announced.
- Drug, CAT, and calculator docks set the optimistic icon and a success toast, then leave that icon in place when the result is `skipped`.
- Search medication cards set the optimistic fill and, on a non-skipped result, replace it with `mutation.saved`. A skipped result leaves the optimistic fill. There is no toast.

## 7. Harmful or unnecessary motion

Remove:

- Infinite pulses in `CatModuleIdentity.tsx` and `CatUrgencesView.tsx`. The urgences dot sits on an error-colored badge beside an emergency filter and can be read as a live clinical alarm. The count and the filter label already carry the meaning.
- The onboarding pulse in `SlideTwoVisual.tsx`.
- The infinite pulse inside `LoadingIndicator`. The sentence is the loading state.
- Chevron travel on discovery rows, emergency cards, and personal cards.
- Press scale on cards, grids, linked rows, frequent chips, and the Cockcroft sex option.
- Framer `dragElastic` on the welcome carousel.
- `transition-shadow` on flowchart nodes.

Do not add, because none of it exists today and it would work against the product:

- Count-up or digit animation on calculator results.
- Staggered search rows.
- Page transitions.
- Spring, bounce, or elastic curves on product UI.
- Confetti, celebratory icon motion, or gamified completion.
- Decorative motion on warnings, callouts, or clinical paragraphs.
- Fake download percentages or automatic retry loops.
- A syncing spinner. The offline screen only has a last-check sentence. There is no in-flight sync flag to animate.

Smooth scrolling through a protocol or CAT is useful when the user asked for it and has not requested reduced motion. The same call is harmful when reduced motion is on, because it ignores that preference. That is a P0.

## 8. Proposed motion tokens

Do not edit tokens in UI-8A. UI-8B may add the missing names and stop treating 320ms as a routine duration.

UI-1 names to preserve:

| Token | Current | Later value | Reason |
| --- | --- | --- | --- |
| `--duration-fast` | 120ms | 120ms | Already the right fast step. Equals the recommended `--motion-fast` |
| `--duration-standard` | 200ms | 200ms | Already inside the cap. A separate 180ms token would be a duplicate |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | unchanged | Already the recommended standard curve |

Do not preserve `--duration-slow` (320ms) as a routine token. It is unused and over the cap. UI-8B may remove it after confirming `scripts/verify-ui-tokens.ts` still only requires `--duration-standard`.

Add these names later. Do not also add `--motion-fast` or `--motion-standard` at different numbers.

| Token | Value | Use |
| --- | --- | --- |
| `--motion-instant` | 80ms | Press feedback |
| `--motion-emphasis` | 220ms | Rare emphasis. Not for results, search, or navigation |
| `--motion-overlay` | 260ms | Sheet and dialog entrance only |
| `--ease-enter` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving |

Exit is shorter than entrance. Overlay entrance uses `--motion-overlay` and `--ease-enter`. Overlay exit uses `--duration-fast` and `--ease-exit`. Color and opacity feedback use `--duration-fast` and `--ease-standard`.

Routine transitions stay at or under 300ms. Progress duration is the real transfer, not a token. Calculator results, search results, and navigation do not wait for a transition.

## 9. Approved properties

Preferred:

- `opacity`
- `transform` (`translate` for sheets and toasts, `scale` for compact controls only)
- `background-color`
- `border-color`
- `color`
- A small `box-shadow` change on a control, not on a flowchart node or a scrolling list

Use caution, and only for the cases in section 15:

- `height`, `max-height`, `grid-template-rows` when a downloaded row leaves after a successful delete
- `width` for the onboarding step indicator only

Avoid:

- `transition: all`
- Animating `blur`, `filter`, or `backdrop-filter`
- Animating `font-size`
- Large shadow animation
- Continuous JavaScript position updates
- Scroll-linked animation
- Layout polling

`backdrop-blur-xl` on the header, bottom nav, reading dock, and sticky chip bars is a static paint cost. Do not animate it.

The one justified layout animation is removal of an offline item after a successful delete: opacity plus height, at most `--duration-standard`, then remove the node. Under reduced motion, remove the node immediately. Do not animate height to reveal clinical text.

## 10. Prohibited patterns

- `transition: all`
- Any routine transition longer than 300ms
- Vaul’s 500ms duration on product sheets after UI-8C
- Spring, bounce, elastic, and overshoot easing on product UI
- Icon bounce or decorative rotation
- Rotation that does not mean “this action is in progress”
- Infinite animation on a resting screen
- Pulse on clinical status, warnings, or emergency filters
- Number count-up
- Staggered result rows
- Page-to-page transitions
- Animating clinical paragraphs, tables, doses, or warnings
- Delaying search, calculation, or navigation until motion ends
- Fake progress
- A new motion dependency
- New Framer Motion usage
- Illustrations and illustration motion

## 11. Component-by-component motion specifications

Shared rules for every control below:

- State (selected, current, pressed, disabled, error) is visible without motion.
- Focus uses the existing instant outline in `app/globals.css`. Do not animate the outline.
- Disabled controls do not run press scale. Opacity or color changes immediately.
- Failure removes any in-progress indicator in the same paint as the error message.
- Implementation is CSS unless the row says otherwise.

### Buttons

| State | Response | Duration | Easing | Properties | Reduced motion | Failure |
| --- | --- | --- | --- | --- | --- | --- |
| Hover | Background darkens where a hover color already exists | `--duration-fast` | `--ease-standard` | `background-color` | Instant color | n/a |
| Focus | Existing outline | 0 | n/a | `outline` | Unchanged | n/a |
| Press | Scale to 0.98 on `Button` and `IconButton` only, when the control is compact and the scale does not reflow neighbors | `--motion-instant` | `--ease-standard` | `transform` | No scale | n/a |
| Loading | One spinning ring, or the existing label change if there is no room for a ring. `aria-busy="true"` | Rotation while `loading` is true | linear | `transform` on the ring only | Static ring or label. No spin | Remove the ring when `loading` becomes false |
| Disabled | Muted fill and text, no press | 0 | n/a | color | Unchanged | n/a |

Do not scale links that wrap a whole card. Empty-state actions use the Button contract.

### Icon buttons

Favorite, copy, close, download, delete, and refresh use the Button press contract. No bounce.

| Control | Visual response | Notes |
| --- | --- | --- |
| Favorite | Icon swaps between bookmark and bookmark-check in the same frame as `aria-pressed` | Fill may cross-fade in `--duration-fast`. No scale on the icon |
| Copy | Toast already in place. Optional label stays “Partager” | Do not animate the copied string |
| Close | Press only, then the sheet exit | Close is available immediately |
| Download | Label or status text changes to the working sentence | Spin only if the button `loading` prop is set |
| Delete | Press, then the row-removal contract in section 15 | No shake |
| Refresh / update | Same as download | Rotate only while the request is in flight |

### Filter chips and segmented controls

Selection updates in the same frame as the click. `aria-pressed` or `aria-checked` updates with it.

| State | Response | Duration | Properties | Reduced motion |
| --- | --- | --- | --- | --- |
| Selected | Fill and text swap | 0, or `--duration-fast` on `background-color` and `color` only | color | Instant |
| Focus | Existing outline | 0 | outline | Unchanged |
| Pressed | No scale. Optional background | `--motion-instant` if any | `background-color` | Instant |

Calculator Oui/Non, Glasgow options, Cockcroft sex and unit chips, drug tabs, protocol Lecture/Garde, and CAT step chips follow this table. The selected option is not allowed to wait for a transition before the result renders.

### Sidebar and bottom navigation

| State | Response | Duration | Reduced motion |
| --- | --- | --- | --- |
| Active item | Color, weight, and the existing pill or border | 0, or `--duration-fast` on the active pill background | Instant |
| Hover and focus | Background or outline | `--duration-fast` / 0 for outline | Instant color, outline unchanged |
| Route change | Next view paints normally | 0 | 0 |

Do not slide, fade, or restage the whole navigation on each route.

### Profile and account

- The preference switch keeps a thumb `translate` and track color change at `--duration-fast` with `--ease-standard`. Under reduced motion both snap.
- Account buttons follow the Button contract. Pending stays a disabled label unless `loading` is passed.
- Personalization chips follow the chip contract.
- The personalization sheet follows section 16. The existing 700ms pause before close stays a timer, not an animation.

## 12. Search-state specification

The search request starts from the query effect. The 250ms timer only writes the URL. Do not add a visual delay on top of it.

The input stays spatially stable. `SearchInputBar` currently switches among `h-14`, `h-12`, and `h-11` when the screen changes from idle to results, empty, error, or drugs. UI-8D must stop that height change. Do not animate `height`.

| State | Visual response | Duration | Reduced motion | Failure |
| --- | --- | --- | --- | --- |
| Idle | Field and idle content | 0 | 0 | n/a |
| Loading | Replace the results region with `LoadingIndicator` text. No pulse | 0 | 0 | n/a |
| Results | Replace the loading block with the list | 0 | 0 | n/a |
| Empty | Existing empty state | 0 | 0 | n/a |
| Error | Existing error state, distinct from empty | 0 | 0 | Indicator is gone |
| Offline local results | Same list as results, fed by the local repository | 0 | 0 | If local lookup fails, the existing error state |

Do not stagger rows. Do not fade the list in a way that delays reading the first result. Filter chips follow section 11 and update the query immediately.

`requestAnimationFrame` used to refocus after clear is focus management, not a transition. Keep it.

## 13. Favorite and copy specification

UI-8 does not change `toggleFavorite`, optimistic flags, or toast copy.

### Favorites

| Moment | Visual response | Duration | Reduced motion | Accessibility |
| --- | --- | --- | --- | --- |
| Optimistic selection | Icon, weight, and `aria-pressed` update immediately | 0 | 0 | Name still describes the next action |
| Persistence success | Stay on the server result if the existing code assigns `result.saved` | 0 | 0 | Do not announce a second success if a toast already fired |
| Failure or skipped rollback | Only where the component already reverts state. Protocol reverts the icon immediately | 0 | 0 | Do not add a rollback animation |
| Signed-out or skipped with no revert | Leave the existing icon behavior alone | 0 | 0 | Do not add a success animation that claims a save the code did not confirm |

Search medication cards have no toast. UI-8D may add a polite live region on that button whose text matches the pressed state (“Ajouté aux favoris” / “Retiré des favoris”). That is confirmation of the state already shown. It is not a new favorite mutation.

Do not bounce the bookmark icon.

### Copy

| Moment | Visual response | Duration | Easing | Properties | Reduced motion | Failure |
| --- | --- | --- | --- | --- | --- | --- |
| Success | Existing toast mounts | Fade `--duration-fast` | `--ease-enter` | `opacity`, at most 8px `translateY` | Opacity only, or instant | n/a |
| Held | Toast stays | 2800ms | n/a | none | Same dwell | n/a |
| Restore | Toast unmounts | `--duration-fast` | `--ease-exit` | `opacity` | Instant remove | n/a |
| Failure | Existing “Copie indisponible” or “Partage annulé” toast | Same fade | Same | Same | Same | No spinner remains |

The copied clinical value, dose, score, and URL do not move, fade, or count. Restart the 2800ms timer when the same message is requested again. Clear the timer on unmount, as the current effects already do.

## 14. Calculator specification

| Interaction | Visual response | Duration | Reduced motion | Failure |
| --- | --- | --- | --- | --- |
| Option, Oui/Non, unit | Selected fill immediately. Result text in the same commit | 0 | 0 | n/a |
| Numeric input | Displayed result updates on the existing render | 0 | 0 | Out-of-range copy appears immediately |
| Incomplete | Existing empty or pending copy | 0 | 0 | n/a |
| Validation error | Existing error sentence. Optional `--duration-fast` border color | 0 for text | Instant | No shake |
| Reset | Values return immediately. Existing toast | 0 for values | 0 | n/a |
| Copy | Section 13 | Fade only on the toast | No translate | Existing failure toast |
| Favorite | Section 13 | 0 | 0 | Existing dock behavior |

Do not count numbers. Do not fade the result. Do not disable the inputs during a transition.

Glasgow’s live region on a discrete choice is appropriate. Cockcroft and any formula that puts the numeric result in `aria-live="polite"` currently announce every keystroke. UI-8E may debounce the announcement by about 300ms. The visible number still updates on each key. The debounce is an announcement delay, not a calculation delay.

## 15. Offline and download specification

| Moment | Visual response | Duration | Reduced motion | Failure |
| --- | --- | --- | --- | --- |
| Download start | Working sentence immediately. Button follows the loading contract if `loading` is set | 0 for the sentence | 0 | n/a |
| Determinate progress | Native `<progress>` `value` follows `done/total` | The transfer | Value still updates | Bar clears when the error state replaces it |
| Indeterminate | Status sentence. A spinner only while the request is in flight | Spin until settle | Static sentence | Sentence is replaced by the error |
| Completion | “Disponible hors-ligne” or the downloaded badge | 0 | 0 | n/a |
| Update available | Existing stale badge | 0 | 0 | No pulse |
| Update progress | Same as download, with the existing “Mise à jour…” copy | The transfer | Same | Same |
| Failure | Error badge or sentence. Working state is gone | 0 | 0 | No automatic retry motion |
| Item removal | After a successful delete, opacity and height may run for `--duration-standard`, then the row unmounts | `--duration-standard` | Remove immediately | If delete fails, the row stays and the error shows. No exit |
| Storage full | Existing error copy | 0 | 0 | No retry loop |
| Corruption | Existing error badge and actions | 0 | 0 | No shake |

No fake percentages. A pack label that is not `n/m` stays indeterminate text. Connection loss during a download uses the existing error copy and stops the indicator.

There is no syncing animation because the screen does not have a syncing state. “Dernière vérification …” stays text. Do not imply a successful sync.

## 16. Dialog and sheet specification

### Modules sheet (`<dialog>`)

| Piece | Response | Duration | Easing | Properties | Reduced motion |
| --- | --- | --- | --- | --- | --- |
| Backdrop | Fade to the current `on-surface/40` | `--duration-standard` | `--ease-enter` | `opacity` | Instant or `--motion-instant` fade |
| Entrance | Sheet moves from `translateY(16px)` with opacity, not from a multi-second travel | `--motion-overlay` (260ms) | `--ease-enter` | `opacity`, `transform` | No translate. Instant or `--motion-instant` fade |
| Exit | Reverse, shorter | `--duration-fast` | `--ease-exit` | `opacity`, `transform` | Instant remove |
| Focus | `showModal()` moves focus when the dialog opens | 0, in parallel with the entrance | n/a | n/a | Same. Do not wait for the animation |
| Body scroll | Existing `overflow: hidden` while open | 0 | n/a | n/a | Same |
| Escape and backdrop click | Existing close path starts immediately | Exit may play | `--ease-exit` | n/a | Close is immediate |
| Route change | Existing pathname effect closes the sheet | Exit may play | `--ease-exit` | n/a | Immediate |

The entrance stays in the 240–280ms band. 260ms is the token. The panel must be interactive as soon as it is open. Do not lock pointer events for the whole duration.

### Vaul sheets (auth drawer, personalization)

Keep Vaul. Do not add another sheet library. In UI-8C, override the 500ms duration so entrance matches `--motion-overlay` and exit matches `--duration-fast`. Keep `shouldScaleBackground={false}`. Do not animate `backdrop-filter` on the overlay. Drag may follow the pointer. Release snaps with `--ease-standard` inside the overlay budget, not with an elastic curve.

Under reduced motion, open and close are immediate. Drag still tracks the finger. Focus and scroll lock stay on Vaul’s current behavior and must not wait for the animation. `PersonalizationSheet` still refuses to close while `saveState === "saving"`.

## 17. Loading specification

| Kind | Use when | Motion |
| --- | --- | --- |
| Inline indicator | A button or icon action is in flight | Spinner only while busy, or a label change |
| Section loading | Search results, offline account check, detail library check | Text in the section. No pulse |
| Route loading | `app/loading.tsx` | Centered sentence. No pulse. No branded animation |
| Skeleton | Do not add | None exist. Do not introduce them for clinical pages |
| Full-page loading | Route loading only | Same as route loading |

Remove or reduce:

- `motion-safe:animate-pulse` on `LoadingIndicator`
- Any future use of that pulse on CAT identity, CAT urgences, and the onboarding slide

A spinner that is still running after an error is a defect. Current download paths already clear the working state in `catch`. Keep that order.

## 18. Toast specification

| Piece | Contract |
| --- | --- |
| Entry | Opacity, optional 8px translate, `--duration-fast`, `--ease-enter` |
| Exit | Opacity, `--duration-fast`, `--ease-exit` |
| Dwell | 2800ms for the existing detail toasts. Restart on a repeated message |
| PWA banner | Stays until “Mettre à jour”. It is not a timed toast. Optional fade-in. No fake progress before reload |
| Focus | Do not move focus into the toast. It is `role="status"` |
| Reduced motion | No translate. Instant or `--motion-instant` opacity |
| Stacking | One status per detail page, as today |

Use a toast when the result has no durable control state: copy, share, reset confirmation, and the existing signed-out favorite sentence.

Prefer in-place feedback for selection, favorite `aria-pressed`, validation, download badges, and connection status.

Toasts must remain readable for the full 2800ms. Do not shorten that dwell for decoration.

## 19. Reduced-motion specification

Under `@media (prefers-reduced-motion: reduce)`:

- Remove translate entrances on sheets, toasts, and the welcome carousel.
- Remove press scale.
- Disable smooth scrolling, including `scrollIntoView` and `scrollTo` behavior flags.
- Disable shimmer. None exists. Do not add any.
- Remove pulsing.
- Use instant state changes, or fades no longer than `--motion-instant`.
- Keep real `<progress>` values updating.
- Keep loading sentences and `aria-busy`.
- Keep status, badge, and favorite changes.
- Keep dialog and sheet usability: focus, Escape, scroll lock, and dismiss.
- Keep focus outlines instant.

The global `0.01ms` rule may stay. It is stricter than a short fade, and that is acceptable. Do not weaken it so that decorative motion returns.

These still animate excessively today and must be fixed in UI-8C or UI-8E:

| Component | What still runs |
| --- | --- |
| `ProtocolSectionChips`, `CatStepChips`, search, drug, calculator, and CAT filter jumps | `behavior: "smooth"` |
| `WelcomeCarousel`, `BottomActionDock` | Framer Motion with `reducedMotion: "never"` |
| `CatFlowchartBoard` | `animationTime: 220` |
| Press-scale cards | Instant scale, which is nonessential |

Set Framer Motion’s `reducedMotion` to `"user"` only around the existing onboarding tree, or skip those animations when `matchMedia` matches. Do not import Framer Motion anywhere else.

A small shared helper is the right place for “scroll smoothly only if the user allows motion”. Call it from the existing click handlers. Do not add a scroll listener.

## 20. Accessibility requirements

| Check | Current finding | Required behavior |
| --- | --- | --- |
| Motion as the only channel | No control uses motion as the only state. Pulses repeat information that is already in text, except they add a false “live” cue on CAT | Every state remains in text, color, or `aria-*` if motion is removed |
| Loading announcement | `LoadingIndicator` is polite and named | Keep one polite status per region. Do not pulse |
| Search results | The list is not a live region. Loading is | Do not announce every row. Announce the loading sentence, then let the list be read normally |
| Calculator results | Glasgow and Cockcroft scores are polite live regions. Formula errors use `role="status"` | Keep discrete Glasgow announcements. Debounce numeric announcements. Never announce a count-up sequence |
| Toasts | Polite, 2800ms, not focused | Long enough to hear. Avoid a success toast and a failure toast for the same tap. Protocol currently does this when favorite is skipped |
| Dialog focus | `showModal()` focuses on open, before any future animation | Keep focus at open. Do not delay it until `transitionend` |
| Smooth scroll | Ignores reduced motion | Section 19 |
| Failure vs indeterminate | Download errors clear the working sentence | The spinner or working label must not survive the error |
| Disabled controls | Disabled styles and `disabled` are present. Some icon buttons only drop opacity | Disabled state stays visible without motion |
| Repeated announcements | Identical toast text does not restart the timer. Protocol favorite can announce success and then the sign-in sentence | One clear outcome per action |

Clinical warnings stay visually static. Do not rely on motion to communicate severity.

## 21. Performance requirements

Current risks:

| Risk | Where |
| --- | --- |
| Layout animation | `SlideProgress` animates `width`. Search input changes height without a transition, which is a layout jump. Card `scale` is a transform but hits large rows |
| Large repaint | `transition-shadow` on flowchart nodes. Static `backdrop-blur-xl` on sticky bars. Vaul `will-change: transform` on drawers |
| Infinite animation | Four `animate-pulse` sites |
| JavaScript animation | Framer carousel and press. Vaul drag. `zoomToElement` |
| Scroll listeners | `scrollend` in `ProtocolSectionChips` for `aria-current` when `scroll-target-group` exists. Not a motion loop |
| Resize listeners | `ResizeObserver` in `CatFlowchartCanvas` for layout, not for animation |
| Repeated updates | Cockcroft result and its live region on each keystroke. Search identity updates when the query changes |
| Dependencies | `framer-motion` and `vaul` are already installed. No new motion package |
| Animated assets | None of substance. Onboarding SVG is static apart from the pulse dot |
| Layout shift | Search field height variants |
| `transition: all` | None found |

Rules for UI-8B through UI-8E:

- Prefer `transform` and `opacity`.
- No continuous JavaScript animation loops.
- No new motion dependency and no new Framer Motion call sites.
- No new network behavior.
- No delay from input to calculator result.
- No delay from query to search results.
- No PWA or offline request changes.
- No motion-induced layout shift. Fix the search height jump by using one height, not by transitioning height.
- No animation that blocks interaction. Sheets are usable while they enter.
- Do not add scroll or resize listeners for motion.

## 22. Prioritized implementation order

### Findings by severity

| ID | Severity | Finding |
| --- | --- | --- |
| M1 | P0 | Clinical and filter `scrollIntoView` / `scrollTo` use `behavior: "smooth"` and ignore reduced motion |
| M2 | P1 | Framer Motion runs slide, elastic drag, and press scale with `reducedMotion: "never"` |
| M3 | P1 | Flowchart zoom uses a 220ms JavaScript animation with no reduced-motion check |
| M4 | P1 | Infinite error-colored pulse on the CAT urgences filter |
| M5 | P1 | Infinite pulse on CAT identity and onboarding, and on every loading indicator |
| M6 | P1 | Vaul sheets take 500ms, above the overlay budget, with `will-change: transform` |
| M7 | P1 | Modules dialog appears and disappears with no orientation |
| M8 | P1 | Cockcroft (and similar) live regions announce every keystroke |
| M9 | P1 | Protocol favorite announces success and then, on skip, a second sign-in status |
| M10 | P1 | Search field height changes between idle, results, and drug layout |
| M11 | P1 | Button loading ring does not communicate progress |
| M12 | P2 | Duration tokens are unused. Components use 0ms, 150ms, 200ms, 220ms, 260ms, and 500ms with three different curves |
| M13 | P2 | `--duration-slow` is 320ms |
| M14 | P2 | Chevron nudges and large-surface press scales are inconsistent and nonessential |
| M15 | P2 | Toasts pop in and out. Repeated identical text does not restart the timer |
| M16 | P2 | Search favorites have no text confirmation |
| M17 | P2 | CAT image chip waits 50ms and does not clear that timeout |
| M18 | P3 | Shared buttons have no common press timing |
| M19 | P3 | Onboarding step width is the only token-adjacent timing, and it is hard-coded |

P0 is fixed in UI-8C. P1 motion and reduced-motion gaps are fixed in UI-8C through UI-8E. Favorite persistence and live-region copy stay inside the boundaries in sections 13, 14, and 20.

### Sequence

```text
UI-8B — Primitive motion
UI-8C — Navigation and overlays
UI-8D — Product feedback
UI-8E — Reduced motion and performance verification
```

**UI-8B — Primitive motion.** Add the missing tokens from section 8 without adding a 180ms duplicate. Apply the Button, IconButton, chip, field, and switch contracts. Remove card and chip press scale. Remove chevron travel. Replace the loading pulse with text, and spin a button ring only while `loading` is true. Remove the three decorative pulses. No screen redesign.

**UI-8C — Navigation and overlays.** Modules sheet entrance and exit. Vaul duration override. Active nav colors within the fast token. User-initiated scroll honors reduced motion (M1). Flowchart zoom duration becomes 0 under reduced motion. No full-screen route transition.

**UI-8D — Product feedback.** Stable search field height. Toast fade and timer restart. In-place favorite confirmation on the search card. Offline row exit only after a successful delete. Connection and download states stay immediate. No new favorite, download, or calculator logic.

**UI-8E — Reduced motion and performance verification.** Framer `reducedMotion="user"` or equivalent on the existing onboarding tree only. Confirm the global CSS rule still kills pulses and CSS sheet motion. Debounce calculator live announcements without delaying the visible number. Browser pass at 390×844, 430×932, 1024×768, and 1440×900, including `prefers-reduced-motion: reduce`. Confirm no new dependency and no `transition: all`.

## 23. Acceptance criteria for later UI-8 implementation

- Tokens in section 8 exist, `--duration-fast` and `--ease-standard` keep their values, and no routine transition uses a duration above 300ms.
- `--duration-slow` is unused or removed.
- Buttons and icon buttons share one press treatment. Cards and list rows do not scale.
- Chips, Glasgow options, Oui/Non, and unit controls update selection in the same frame as the result.
- Search results, calculator numbers, and route changes are not delayed by motion.
- The search field does not change height when results, empty, or error appear.
- Result lists do not stagger.
- Modules sheet and Vaul sheets enter in about 260ms and exit faster. Focus is not delayed. Reduced motion removes the translate.
- Smooth scroll runs only when the user has not requested reduced motion.
- Infinite pulses are gone, including CAT urgences, CAT identity, loading, and the onboarding slide.
- Download progress follows real `done/total` or stays an honest indeterminate sentence. Errors stop that sentence.
- Toasts fade, stay about 2800ms, and do not take focus.
- Favorite and copy behavior matches section 13 without changes to `toggleFavorite`.
- Clinical paragraphs, warnings, and calculated numbers do not animate.
- No new motion library, no new Framer Motion usage, no illustrations, no icon set additions.
- `prefers-reduced-motion: reduce` leaves status, progress, dialogs, and action feedback usable.

## 24. Illustration exclusion

Illustrations are out of UI-8. Do not add illustrations, empty-state drawings, animated diagrams, Lottie or image sequences, or decorative medical artwork. The onboarding slide SVGs that already exist stay as they are, minus the pulse dot specified above. Any illustration work waits until after the general live QA phase.

## Verification note

This phase is source-based. Viewports 390×844, 430×932, 1024×768, and 1440×900 were not opened. Computed styles were not read from a running browser.

UI-8A was an audit and specification phase only. No production motion, illustration, layout, database, API, authorization, entitlement, offline, or calculator logic was changed.

## 25. UI-8B implementation notes

UI-8B applied the primitive contracts from sections 8–11 and removed the decorative motion listed in section 7. It did not implement sheets, Vaul timing, Framer Motion, smooth-scroll guards, toasts, search height, favorites, copy, or offline progress.

### Tokens

Defined once on `:root`. They are not copied into `@theme`, so Tailwind does not get a second duration with the same meaning. Primitives use the `.motion-*` classes, which reference these variables.

| Token | Value | Used by primitives |
| --- | --- | --- |
| `--motion-instant` | 80ms | Press scale only |
| `--duration-fast` | 120ms | Color, border, background, field, surface, switch |
| `--duration-standard` | 200ms | Reserved. Not applied in UI-8B |
| `--motion-emphasis` | 220ms | Reserved |
| `--motion-overlay` | 260ms | Reserved for UI-8C sheets. Not applied |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | All `.motion-*` transitions |
| `--ease-enter` | `cubic-bezier(0, 0, 0.2, 1)` | Reserved for UI-8C and UI-8D |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Reserved for UI-8C and UI-8D |
| `--duration-slow` | 320ms | Retained, unused. Do not apply |

Font weight is not transitioned. A weight change can reflow a chip or pill, so it still snaps when selection changes. Color and background interpolate.

### Classes

| Class | Role |
| --- | --- |
| `.motion-press` | Fast color, border, and shadow, plus 80ms scale to 0.98 on `:active` when the control is not `:disabled` |
| `.motion-color` | Fast background, border, and text color. No scale |
| `.motion-surface` | Fast background, border, and shadow on large surfaces. No scale |
| `.motion-field` | Fast background, border, and shadow on fields. Outline is not included |
| `.motion-transform` | Fast transform for the preference-switch thumb only |
| `.motion-spin` | 1s linear rotation cycle for a pending spinner. This is not a state-transition duration |

The global reduced-motion rule is unchanged. Inside that same media query, `.motion-press` drops its scale and `.motion-spin` sets `animation: none`. The static ring and the loading sentence stay. Keyboard focus still uses the instant outline.

### What changed

- `Button` and `IconButton` use `.motion-press`. Loading buttons stay disabled, so they do not scale. The loading mark is `Spinner` from `LoadingIndicator`, shown only while `loading` is true, beside the existing label.
- `FilterChip`, `PillNavLink`, and `StatusBadge` use `.motion-color`. Chips do not scale. `aria-pressed` and `aria-current` are unchanged.
- `TextField` and `SearchField` use `.motion-field`. Search heights are unchanged. The clear control uses `.motion-press`.
- Interactive `Surface` and the former press-scale cards use `.motion-surface`. Large cards use a background change on press instead of scale. Selection grids keep their ring and do not scale.
- Glasgow options, calculator Oui/Non, and Cockcroft sex and unit controls use `.motion-color` only. Calculation still runs in the same click. They are not `PillNav`.
- Chevron `translate` on discovery rows, emergency cards, and personal cards is gone. The icons stay.
- `animate-pulse` is removed from loading, CAT identity (static dot), CAT urgences (dot removed; the label remains), and the onboarding slide (static dot).
- Flowchart nodes no longer transition `box-shadow`. Selection still uses the ring.
- The preference switch uses the fast color and transform tokens. Its thumb still moves to the on/off position.

### Still deferred

UI-8C covers the modules sheet, Vaul timing, reduced-motion scrolling, and clinical section chips. See section 26. These items stay deferred:

- Framer Motion `reducedMotion: "never"`, carousel elastic drag, and onboarding `whileTap` (UI-8E).
- Flowchart `zoomToElement` and `fitToView` `animationTime: 220` (UI-8E).
- Search field height variants (UI-8D).
- Toast fade, favorite confirmation, and copy confirmation (UI-8D).
- Offline row removal, download motion, and connection transitions (UI-8D).
- Onboarding `SlideProgress` still animates width at 200ms. That is an onboarding indicator, not a shared primitive.
- Calculator live-region debounce (UI-8E).

`npm run check:motion-primitives` covers the primitive checks. `npm run check:motion-overlays` covers UI-8C. Neither script rejects Framer Motion or flowchart zoom.

## 26. UI-8C implementation notes

UI-8C adds restrained modules-dialog motion, shortens the visible Vaul sheet timing, routes user-initiated smooth scrolling through one reduced-motion helper, and applies `.motion-color` to clinical section and tab controls. Routes, module destinations, auth, personalization, and clinical content are unchanged.

### Modules dialog

The native `<dialog>` still uses `showModal()`, `closedby="any"`, Escape, backdrop click, Fermer, and module `Link` navigation. Focus enters when `showModal()` runs, before the entrance frames. Selecting a module still calls `onClose` on click and navigates immediately.

Entrance is a 16px upward move plus opacity, using `--motion-overlay` and `--ease-enter`. Exit uses `--duration-fast` and `--ease-exit`. The backdrop fades opacity only: `--duration-standard` on entrance and `--duration-fast` on exit. Its color stays `backdrop:bg-on-surface/40`. Blur is not animated.

Native `dialog.close()` removes the top layer immediately, so Escape and other dismissals call `preventDefault` on `cancel` and the component closes the dialog after the exit token. The timer is cleared on the next open or close, and on unmount of that effect. Reduced motion reads `--duration-fast` as 0 and closes in the same effect, with `transform: none` on the sheet. Body overflow stays locked until the phase returns to `closed`, then the previous overflow is restored.

### Vaul

Auth and personalization still use Vaul. Snap points, dismiss, drag-to-close, `shouldScaleBackground={false}`, and the personalization save lock are unchanged. Overlay and content use `--z-backdrop` and `--z-sheet`. Personalization keeps its safe-area footer padding. The static `backdrop-blur-[2px]` is not transitioned.

`app/vaul.css` now uses `--motion-overlay` / `--ease-enter` for the open sheet and `--duration-fast` / `--ease-exit` for the closed sheet. Backdrop entrance uses `--duration-standard`; backdrop exit uses `--duration-fast`. `globals.css` repeats those durations with `!important` so they beat Vaul's inline style and the stylesheet Vaul injects at runtime. `will-change` is cleared. There is no spring or elastic easing.

Vaul's `TRANSITIONS.DURATION` in `node_modules` is still 0.5s. That value still schedules snap reset and `onAnimationEnd`. The visible transition does not wait for it. The library was not forked. Under reduced motion the override is not applied, so the existing 0.01ms duration rule wins over the inline timing.

### Scrolling

`lib/ui/scroll-behavior.ts` exposes `preferredScrollBehavior`, `scrollElementIntoView`, and `scrollWindowTo`. On the server, or when `prefers-reduced-motion: reduce` matches, the behavior is `auto`. Otherwise it is `smooth`. There is no listener and no polling.

Updated call sites, with the same target and alignment:

- Protocol section chips
- CAT step chips, including the horizontal active-chip scroll, the top offset, and the image-anchor jump
- CAT, drug, calculator, and search filter-row jumps

The CAT image jump still waits 50ms so the anchor can exist after the mode change. That timer is cleared on the next image jump and on unmount. It is not a motion duration.

No calculator field or result jump, and no drug-tab scroll, existed. Drug tabs change the route. Those were left as they are.

### Clinical controls

`.motion-color` is on protocol section navigation, protocol section chips, CAT segmented tabs, CAT step chips, CAT preview mode, drug tabs, drug preview tabs, drug preview mode, and the protocol shift toggle. There is no press scale, sliding indicator, or content-panel animation. `aria-current` and `aria-pressed` are unchanged. Reduced motion already collapses `.motion-color` through the global duration rule.

### Left unchanged on purpose

- Flowchart `zoomToElement` and `fitToView` still pass `animationTime: 220` (UI-8E).
- Welcome carousel Framer Motion, elastic drag, and `whileTap` (UI-8E).
- Toasts, favorites, copy, offline progress, and connection feedback are implemented in section 27.
- The personalization saved-state wait before close. That is product dwell, not an overlay duration.
- Browser scrolling that does not pass `behavior: "smooth"`.

### Verification

Runtime browser validation was not performed. Viewports 390×844, 430×932, 1024×768, and 1440×900 were not opened.

`npm run check:motion-overlays` is the static check for UI-8C.

## 27. UI-8D implementation notes

UI-8D adds product feedback on top of the existing actions. It does not change search queries, `toggleFavorite`, the offline repository, or calculator formulas.

### Search height

The shared search control is `--size-input` (48px). Home, the search page, and the CAT, drug, and calculator index fields use that height. Focus, clear, loading, and error do not change it. `SearchField` `compact` stays `h-11` (44px) and is used only by the protocol list filter. Height is not animated.

### Toasts

`StatusToast` fades and moves 8px, entering with `--duration-standard` and exiting with `--duration-fast`. The dwell is 2800ms. Each `showToast` call increments an id, so an identical message restarts the timer. Timers are cleared when the notice changes and when the effect cleans up. The toast uses `pointer-events: none`, `role="status"` for ordinary messages, and `role="alert"` for copy or share failure. It sits above the reading dock with the existing safe-area offset and `--z-toast`. Reduced motion removes the translation.

### Favorites

The icon and `aria-pressed` still change immediately. After a confirmed save or removal, the icon plays one 220ms emphasis and a polite live region says “Ajouté aux favoris” or “Retiré des favoris”. A skipped result restores the previous icon. Sign-in feedback uses “Connectez-vous pour gérer vos favoris.” A write failure uses “Impossible de modifier les favoris. Réessayez.” The control is disabled while the request is in flight. There is no success toast.

`toggleFavorite` returns `reason: "unauthenticated"` when there is no session and `reason: "write_failed"` for database or client errors. `isFavorite` still returns `false` on read failure without a separate error UI.

### Copy

Clipboard success changes the control to “Copié” for 2000ms and restarts that timer on a repeat. Cockcroft’s “Copier le résultat” button and the share fallback on protocol, CAT, and calculator docks use that label. Failure keeps the original label and shows the existing error toast. The copied value does not move.

### Offline and connection

Pack progress still uses the repository `done/total` values on a native `progress` element. The bar width eases between those values. Item downloads that have no count show the shared spinner and the existing sentence. Completion replaces that with “Disponible hors-ligne”. Failure clears the working state. Pro, sign-in, and online-only messages stay badges, not error motion.

Corrupt-item removal still calls `removeItem` first. After that succeeds, the row fades and collapses for `--duration-standard`, then leaves the list. Focus moves to the next row, the previous row, or the “Téléchargés” heading. Reduced motion removes the row immediately. There is no removal control on healthy downloads, and none was added.

`ConnectionIndicator` still reads `online` and `offline` events. The badge color and label change in place. A polite live region announces the change after the first reading. It does not say the library synchronized, and it does not pulse.

### Auth drawer

The auth drawer’s bottom padding is `24px` plus `safe-area-inset-bottom`, matching the inset already used by the modules sheet.

### Still deferred to UI-8E

Completed in section 28.

`npm run check:product-feedback` is the static check for UI-8D. Runtime browser validation was not performed.

## 28. UI-8E implementation notes

Framer Motion is limited to the welcome carousel and uses `MotionConfig reducedMotion="user"`. Slide travel is a 260ms tween with `dragElastic={0}`. Under reduced motion the slide does not translate and drag is off. Previous, next, and progress controls stay. Onboarding actions use `.motion-press` instead of Framer `whileTap`.

Flowchart zoom, fit, center, and zoom in/out pass `preferredMotionDuration`, which is 0 when reduced motion is preferred and the normal duration otherwise. The selected node and fit target are unchanged.

Cockcroft and Glasgow visible results update on the same render. A separate polite live region receives that text after 500ms. The timer restarts on each change and clears on unmount. Empty Cockcroft output is not announced. Generated formula results were not a live region and stay immediate without a new announcement.

`--duration-slow` is removed. Vaul’s internal 500ms close timer remains inside the library.

`npm run check:motion-final` is the static check for this phase. Runtime browser and screen-reader validation were not performed.

