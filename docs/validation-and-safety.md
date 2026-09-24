# Validation and safety

Contract for when Nabda may show a clinical payload, a **Validé** chip, or only identity/preparation UI. Implementation: `lib/content-source/readiness.ts`. Calculator execution lives in `lib/calculators/` — never imported `eval`.

Related: [runtime-content-source-of-truth.md](./runtime-content-source-of-truth.md).

## Runtime gates

```ts
isPlaceholderPublicationStatus(status)
// seed_placeholder, draft, imported, cleaned, hidden, archived

isPlaceholderReviewStatus(status)
// editorial_placeholder

canShowValidatedLabel(review, publication)
// review === "validated" AND not a placeholder record

canRenderClinicalDetails(review, publication)
// same as canShowValidatedLabel
```

`IS_DEMO_CONTENT` remains `true`: public UI must not treat unvalidated imported rows as a medical claim. Demo **fixtures** are a separate opt-in (`NABDA_CONTENT_MODE=demo`).

`PLACEHOLDER_CONTENT_WARNING`: *Contenu de démonstration. À confirmer après validation.*

Source-preserved HTML uses `canRenderSourcePreservedContent()` (on unless `NABDA_SOURCE_RENDER=0` or demo mode). That is not the same as Validé.

## Clinical payload

A payload is clinical if it can change a clinician’s action (protocol bodies, CAT decisions, calculator execution, drug safety, posology). Render it only when:

1. Parent `review_status === "validated"`.
2. Publication status is not a placeholder (`seed_placeholder`, `draft`, `imported`, `cleaned`, `hidden`, `archived`).
3. Review status is not `editorial_placeholder`.
4. Child rows used on screen are themselves validated (or CAT edges `manual_verified` with a validated parent).
5. Visibility allows the current user.

Otherwise keep **identity** (title, slug, category) and show preparation / “révision requise”. Search must not leak seed descriptions as if they were validated.

`medical_reviewed` / `editorial_reviewed` may appear as chips; they are not enough for `canRenderClinicalDetails`.

## Calculator execution

- Never `eval` / `new Function` of nabda_db `equation_logic_text` or other imported JavaScript.
- Only Nabda-owned engines in `lib/calculators/` (hand-written or compiled from a reviewed AST) may compute.
- Dosing / high-risk calculators stay locked until an implemented, reviewed engine exists (`engine_implemented`).
- Client bundles must not include a JS evaluator for vendor formulas.

Verify:

```bash
npx tsx scripts/verify-calculator-client-safety.ts
npx tsx scripts/verify-calculator-engines.ts
```
