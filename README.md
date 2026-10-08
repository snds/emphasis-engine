# Emphasis Engine

A perceptual color system generator. You pick three colors: a theme, a base neutral, and a chart seed. The engine solves a full UI and data-viz system for light and dark mode, every swatch traceable to a contrast target.

Designers ask for emphasis, not hex values. "High-emphasis text" and "medium-emphasis fill" resolve to different colors, because text and fills need different contrast. The solver does the math. Nobody has to guess that the right alpha is 62%, which is the point, since people guess 50%.

## How it works

- **Generators** pick hues under four forces, in priority order: semantic convention, brand identity, family coherence, categorical distinctness. Status colors outrank the brand when they collide.
- **The emphasis grid** resolves every role across four contexts (text, fill, stroke, surface) and five levels. Text, fill, and stroke target APCA Lc. Surfaces target OKLCH lightness difference, because APCA reads 0 below about Lc 10.
- **Two layers.** Flat solves a solid color. Alpha solves a live translucent ink whose composite lands the same target over the expected background. The ink stays translucent; it is never baked down.
- **Semantic tier.** Component colors come from role × variant × slot × state. States move a container away from its label, so a hover can never cost label contrast.
- **Light and dark** are solved as separate systems, the way Radix ships them. Dark is not light inverted.

References: [Radix Colors](https://www.radix-ui.com/colors) for the stepped structure, [APCA](https://git.apcacontrast.com/documentation/WhyAPCA) for thresholds, and the [shadcn/ui create page](https://ui.shadcn.com/create) for the live-preview pattern.

## Run it

```bash
npm install
npm run dev      # app at http://localhost:5173
npm test         # engine test suite
npm run build    # static build in dist/
```

## Layout

| Path | Contents |
| --- | --- |
| `src/engine/color.ts` | OKLCH math, gamut mapping (chroma only, never hue), sRGB compositing |
| `src/engine/contrast.ts` | APCA via unmodified `apca-w3`, WCAG 2 ratio, OKLCH ΔL |
| `src/engine/solve.ts` | Flat, alpha, and overlay solves |
| `src/engine/settings.ts` | Inputs, starting targets, Basic and Advanced bounds |
| `src/engine/system.ts` | Generators, force resolution, the emphasis grid |
| `src/engine/components.ts` | Button recipes and state strategies |
| `src/engine/export.ts` | shadcn CSS, Radix-shaped scales, DTCG JSON |
| `src/app/` | Controls, preview, grid, report, export, credits |
| `src/components/ui/` | shadcn components from preset `b1sABueby` (Base UI, mauve, blue, cyan, IBM Plex Sans) |

## Status

Built: the solver, generators, emphasis grid, button states, preview, contrast report, three exports, and a Credits page.

Not built yet: Blur and Glass layers, curve editors, scoped overrides, presets, and Tokens Studio and Figma exports. In the Alpha layer, Step states currently ship flat colors.

Every target in `settings.ts` is a starting value. Perception is not math; tune on real screens, in both modes.

## Licensing notes

APCA contrast comes from [`apca-w3`](https://github.com/Myndex/apca-w3), used unmodified. Its license covers web-content contrast and requires its notice to be viewable by users, which the in-app Credits page provides. The tool is free; revisit those terms before charging for it or targeting non-web platforms.
