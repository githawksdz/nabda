# Motion

Updated: 26 September 2026. The Pro card aura is the only slow decorative motion.

## Principle

Nabda responds immediately. Motion confirms a press, a sheet, or a loading state. It does not delay a protocol, a search result, a warning, or a calculator.

## Durations

| Token | Time | Use |
| --- | --- | --- |
| `--motion-instant` | 80ms | Press |
| `--duration-fast` | 120ms | Color, exit |
| `--duration-standard` | 200ms | Backdrop, emphasis |
| `--motion-emphasis` | 220ms | Short emphasis |
| `--motion-overlay` | 260ms | Sheet entrance |

Overlay motion stays within 300ms. The Pro aura is outside that budget because it is not an overlay: 8.5s, opacity 0.22–0.32, scale 1–1.025. The warm grain on the card is still. The card, its type, and its button do not move.

## Allowed

- Press scale 0.98 on buttons, via `.motion-press`, not `active:scale-*`.
- Sheets and backdrops on the tokens above.
- A spinner while a control is busy.
- Skeleton opacity, stopped when reduced motion is requested.

## Not allowed

- Pulsing a button, a badge, or a clinical warning.
- Counting a calculator result.
- Animating type, card size, or border width.
- `transition: all` on product components.
- Springs, bounce, or shimmer.

## Reduced motion

`prefers-reduced-motion: reduce` stops animation and removes the press scale. The Pro aura stays as a static glow. Sheets still open and close; they do not travel.
