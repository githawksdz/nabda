# Typography

Updated: 26 September 2026. Replaced Inter with a three-role system. Families are self-hosted with `next/font` in `app/layout.tsx`. Latin subset only.

## Roles

| Role | Family | Token | Use |
| --- | --- | --- | --- |
| Signature | Instrument Serif | `--font-signature` / `font-signature` | One short brand phrase per screen |
| Headings | Manrope | `--font-heading` / `font-heading` | Page titles, clinical titles, sections, card and row titles |
| Body and UI | Geist Sans | `--font-body` / `font-sans` | Reading, controls, badges, metadata, results, tables |

Buttons, navigation, badges, inputs, warnings, dosages, and tables never use Instrument Serif.

Signature text is regular weight, about 28px, and at most one phrase on a screen. It is for a brand or onboarding line, not a status such as “Aucun protocole récent.”

## Scale

Tokens live in `app/globals.css`.

| Token | Role | Size | Line height | Weight | Family |
| --- | --- | --- | --- | --- | --- |
| `text-display` | Page title | 24px, 28px from 1024px | 1.2 | 700 | Manrope |
| `text-clinical-title` | Protocol, drug, or score title | 24px, 30px from 1024px | 1.2 | 700 | Manrope |
| `text-headline-lg` | Section title | 18px, 20px from 1024px | 1.3 | 700 | Manrope |
| `text-headline-md` | Card or result label | 16px | 1.35 | 700 | Manrope |
| `text-headline-sm` | Compact title or row | 15px | 1.35 | 600 | Manrope |
| `text-body-lg` | Clinical paragraph | 16px | 25px | 400 | Geist |
| `text-body-md` | UI body | 15px | 22px | 400 | Geist |
| `text-body-sm` | Supporting text | 13px | 19px | 400 | Geist |
| `text-label-md` | Form label, button-scale label | 14px | 18px | 600 | Geist |
| `text-label-sm` | Metadata | 12px | 16px | 500 | Geist |
| `text-result` | Calculator number | 40px, 48px from 1024px | 1.05 | 700 | Geist, tabular nums |
| `text-data-metric` | Compact figure | 20px | 1.2 | 600 | Geist, tabular nums |

Weights stay on 400, 500, 600, and 700. Do not invent a fourth family to separate a button from a paragraph.

## Badges

A badge is metadata. It stays Geist, 12px, weight 600, about 24px tall. It must stay smaller than the title beside it. Do not set a badge in uppercase if that makes it louder than the name.

## Calculators

Labels are `text-label-md`. Typed values are 16px Geist, medium, with tabular numerals. The main number uses `text-result`. The unit beside it is 16px Geist semibold. Do not count the number up.

## Clinical reading

`.source-html` and `ParagraphBlock` use 16px / 25px Geist. Headings inside clinical HTML stay Manrope. Warnings keep Geist and use status color, weight, and an icon. They do not change family.

## Pro card

Updated: 26 September 2026. The signature line spans the card. It is not locked to the left half.

Eyebrow: Geist 11px, bold. Headline: Instrument Serif, 36px on a phone and about 42px once the card is wider, regular weight, open line height, full card width. Description: Geist 14px. Benefit labels: Manrope 14px, semibold. Button: Geist 14px, semibold, sentence case. The action sells the garde — “Préparer ma garde” — and opens the Pro explainer.

## Arabic

The interface is French. `:lang(ar)` names the companions and does not load their files yet:

- Signature: Noto Serif Arabic
- Headings and body: IBM Plex Sans Arabic

Bundle those families with `next/font` when an Arabic locale ships. Do not put Arabic text in Instrument Serif, Manrope, or Geist.
