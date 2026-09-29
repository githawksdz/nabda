# UX

Updated: 26 September 2026. Homepage may show one promotional card in the first slot (profile completion or contextual Pro). Module indexes may show one Pro coupon after real items when server-owned campaign data exists.

## Promise

Nabda is a clinical workspace for a shift. It helps a doctor resume work, find a protocol, drug, or score, and keep essential tools when the network is weak. It does not claim certification, guaranteed outcomes, or that a subscription saves lives.

## Placement

On the homepage, after the greeting:

1. Reprendre
2. At most one promotional card (`ProfileCompletionCard` **or** `ProPainPointCard`, never both)
3. Protocoles cliniques

Promotional support stays after the primary resume action so clinical work remains first.

Profile completion also remains available on `/profile`. Pro details live on `/pro`. Search and frequent items stay on their own screens.

## Banners & Promotional Cards

### Purpose

- Promotional cards must communicate genuine user value.
- They must not interrupt clinical workflows.
- They must not imitate medical warnings.

### Supported card types

- Pro coupon (`ProCouponCard`)
- Profile completion / professional verification (`ProfileCompletionCard`)
- Pro pain-point card (`ProPainPointCard`)
- Informational/event card — **postponed** (see below)

### Component separation

- Three separate components under `components/promotions/`.
- No universal mega component (`type="coupon" | "profile" | …`).

### Placement

- **Homepage:** after Reprendre — profile completion **or** contextual Pro pain-point (priority: incomplete professional verification → incomplete profile → eligible Pro promotion).
- **Module/index lists:** at most one insert after three or four real content items — `ProCouponCard` when a genuine campaign exists, otherwise `ProPainPointCard` for eligible free users. Hidden while a list filter query is active.
- No promotional cards on clinical detail reading, calculator forms, or CAT decision pathways.
- No automatic promotional modal.

### Frequency

- Maximum one promotion in the first homepage promotional slot.
- Maximum one coupon per module list.
- Maximum two promotional impressions per session (initial product rule; enforce when a campaign layer exists).
- Pro coupon and Pro pain-point cards are not dismissible. Free users keep seeing them until the account is Pro.
- Profile completion may be deferred; dismissing it must not immediately replace it with a Pro conversion card.

### Eligibility

- Server-owned: eligibility, Pro status, offer windows, verification, and prices come from the server or typed props derived from server data.
- Active Pro users do not see free-to-Pro conversion cards.
- Expired campaigns are excluded.
- Do not fabricate campaign data in production runtime.

### Coupon integrity

- Absolute `endsAt` timestamp from the server.
- Refreshing the page does not restart the offer.
- Transparent billing (current price, original price, period, disclosure).
- Real terms link only when a real destination exists.
- No fake scarcity or countdown pulse.

### Profile integrity

- Profile completion is not the same as professional identity verification.
- Medication dosage unlock copy appears only when verification is server-owned, enforced elsewhere, and explicitly passed in card data.
- Checklist reflects real completion steps.
- CTA resumes the next incomplete step (`continueHref` from server/product routing).

### Pain-point variants

- Variant selection is session-stable, daily-stable, or contextual — never `Math.random()` during render.
- No exaggerated medical claims.
- One pain point per card.

### Typography

- Headlines stronger than badges and eyebrows.
- Badges stay smaller than titles.
- Respect maximum line lengths; use semantic type roles (`text-headline-*`, `text-body-*`).

### Color

- Promotional accents do not reuse clinical danger red.
- Reward accents may use amber/gold; Pro accents use indigo/teal/blue.
- Nabda Pro conversion cards use a dark surface. The rainbow border and glow belong on the CTA, not the whole card. Do not use gold or silver treatments.
- Feature lines are ticked bullets with concrete actions, not chips or jargon labels.
- Status must remain readable without color alone.

### Motion

- Slow Pro aura only on the Pro CTA (background of the button).
- Countdown text updates without pulse or `aria-live` every minute.
- CTA does not pulse.
- `prefers-reduced-motion` keeps aura static and progress immediate.

### Accessibility

- WCAG AA contrast, visible focus, correct button/link semantics.
- One heading per card (`h2`/`h3` by placement).
- Decorative flourishes are `aria-hidden`.
- Pro conversion cards have no dismiss control.
- Profile completion deferral, when present, has an accessible label.
- Do not make the full card clickable when separate CTA or terms exist.

### Deferred event cards

Informational and event announcement cards are postponed until after live QA. They require separate rules for priority, scheduling, dismissal, urgency, illustration usage, and campaign ownership.

### Anti-patterns

Do not ship:

- Fake countdown or false discount
- Fake verification requirement
- Dead CTA (`onboardingHref` null in production)
- Full-card click target wrapping nested actions
- Repeated promotional cards in the same list
- Modal upsell during clinical work
- Oversized badges dominating titles
- CTA animation designed to pressure the user

## Trust

- Say what Pro actually does: offline packs, Pro content, and a simple refresh of a downloaded fiche.
- If checkout is not available, the explainer says so. Do not show a buy button that does nothing.
- A free user who is already Pro sees a way to manage downloads, not an upgrade pitch.
- Copy can follow a real product state already on the page, such as score-heavy history. Do not add tracking only to personalize a card.

## Language

French, sentence case for actions. One name per object across navigation, empty states, and toasts. A visible control does a real thing.

## Workspace

Phone and desktop share routes. Reading content stays in the reading column. Do not stretch a support card across the full workspace.
