# Emphasis Engine: system-agnostic architecture

Status: Phases 1–4 built (October 8, 2026). Supersedes the plan's assumption that the engine exports directly to one design system.

## The problem this fixes

The engine used to treat its output as final paint and then bolt each design system's rules on afterward. Every downstream system has its own way of turning tokens into what's on screen, so every fix was additive. shadcn made it visible: its components already apply their own opacity (`bg-input/30`, `hover:bg-primary/80`, `ring-ring/50`), so values the engine solved as if painted directly rendered differently, and translucent engine values got their alpha multiplied a second time.

The fix: the engine should not be additive to whichever system is in use. It produces intent. Each downstream system gets a profile describing how it renders, and a solver works backward through that profile.

## Three layers

### 1. Intent (engine core, system-agnostic)

The engine's output is a set of outcomes, not variables. An outcome is a rendered pair:

- **Element kind**: what the paint is for. `surface`, `text-primary`, `text-secondary`, `text-on-tint`, `border-decorative`, `border-control`, `focus`, `state`, `solid`, `on-solid`.
- **Surface**: what it sits on.
- **Requirement**: what the composite must reach, in one of three metrics: APCA Lc, OKLCH ΔL, or WCAG ratio.

It also provides the raw materials a profile can solve with: named surfaces (page, surface 1–5), solids per role (already resolved for dark-mode policy), maximal labels on each solid, role palettes (hue, chroma, held saturation), near-black and near-white inks, and chart series.

Element kinds carry the two things that must not vary by system:

- **Accessibility floors.** `text-secondary` and `text-on-tint` need Lc 60. `border-control` and `focus` need 3:1. `solid` needs Lc 30 against the page. Each floor has a Force accessibility switch.
- **Engine emphasis.** `text-primary` maps to text level 5, `text-secondary` to level 3, `border-control` to stroke level 2, and so on. This is the engine's own opinion, used when a profile's targets are set to Engine emphasis.

Code: `src/engine/intent.ts`.

### 2. System profile (data)

A profile describes one downstream system:

- **Variables**, in solve order, each with a path it can move along:
  - `page`: the engine's page color.
  - `step`: a lightness walk away from a parent variable along a role palette, optionally as a translucent ink when the layer allows, optionally adopting an engine surface under Engine targets.
  - `solid`, `onSolid`, `series`: fixed engine values.
  - `alias`: same as another variable.
  - `alphaOf`: the exact translucent form of another variable over a surface. Radix derives its alpha scales this way; it keeps the solid's hue and chroma, and recipes that paint the alpha form drive the solid it comes from.
  - Step paths can walk away from the page (default), back toward it (Material's lowest container), or toward whichever end gives the parent more contrast (on-colors).
- **Recipes**: every pair the system's components actually render, read from component source. Each recipe has a paint expression, the stack it sits on, a metric, an element kind, and optional mode filter. Expressions mirror the system's CSS: a plain variable, an opacity modifier (`color-mix(in oklab, X k, transparent)`), or a real blend (`color-mix(in oklch, A, B k)`).
- **Reference**: the system's stock theme as its own CSS values.
- **Recipe options**: `against` measures a render against another render instead of the surface underneath (a hover against its rest state). `alsoDrives` lets a recipe constrain a variable it doesn't paint (Material's fixed 8% on-color layer constrains the color under it); those are solved in a second pass.

Code: `src/engine/profile.ts` (types and solver), `src/engine/profiles/` (shadcn, Radix Themes, Material 3).

### 3. Solver

1. **Read the reference through its own recipes.** Rendering the stock theme through the recipes gives the outcomes the system renders today. Those become targets (Match shadcn). This is the general form of "interpret, then recalculate."
2. **Solve each variable against every recipe it paints.** A variable takes the weakest value on its path that satisfies all of its recipes. This is the same max-over-constraints rule the ink model uses for guard surfaces.
3. **Apply floors.** With a Force accessibility switch on, the floor for that element kind is added to every recipe of that kind.
4. **Report every outcome**: target, rendered result, which requirement source set it (shadcn, engine, forced), and the accessibility floor whether or not it is enforced.

Nothing is layered on top of the downstream system. Its own recipes are the overlay layer.

## How systems differ, and what gets solved

| System | How a variable becomes a color on screen | What the solver picks |
|---|---|---|
| shadcn (built, 31 recipes) | About 30 variables. Components apply opacity modifiers and `color-mix` | Variable values, worked back through each recipe |
| Radix Themes (built, 94 recipes) | Lookup by convention: steps 3–5 component backgrounds, 6–8 borders, 9–10 solids, 11–12 text | The 12 steps, so each lookup lands its target |
| Material 3 (built, 37 recipes) | Roles map to tones on a tonal palette. States are fixed-opacity layers (8–10%) in the on-color | The tone per role, given those fixed state alphas |
| MUI | `main`/`light`/`dark`/`contrastText`, plus fixed action opacities (hover 0.04, selected 0.08) | Palette values under those fixed alphas |
| Tailwind or a tiered custom system | Direct, global → semantic → component | Values directly |

Material 3 and MUI state layers are the engine's ink overlay with fixed alphas, so the solving method carries over. Only the recipes change.

## What Phase 1 proved

- shadcn rebuilt as a profile reproduces every rendered outcome of the stock theme, for any theme color, in all three layers (tested across four themes and four neutrals). Neutral variables land within 0.02 OKLCH lightness of the preset.
- The solve now runs through component opacity. Example: light-mode `--destructive` is set by the 10% tint the destructive button paints, so a lower-chroma red comes out slightly deeper to keep the tint visible. Before, nothing saw that tint.
- Shared variables are solved for every use. `--input` satisfies its 100% border, its 30% field fill, its 50% hover, and its 80% switch track at once.
- Force accessibility works per element kind, so it will apply unchanged to future profiles.

## What Phase 2 proved

- **The contract held for two very different systems.** Radix (lookup into 12-step solid and alpha scales) and Material 3 (tonal roles with fixed-opacity state layers) needed three solver additions and no change to intent: derived alpha paths, walk direction, and recipes that constrain a variable they don't paint.
- **Radix reproduces exactly.** Given Radix's own blue and gray, every solid and alpha step lands within 0.02 OKLCH lightness of stock Radix Colors, in both modes.
- **Material's fixed state layers drive the color under them.** M3's opacities are the system's, not ours, so the solver moves the container until the 8% and 10% layers land. Example: with the engine's red, `error` comes out deeper than M3's baseline so the white hover layer stays visible.
- **The accessibility floors travel.** The same four switches work in all three systems. Out of the box, stock Material 3 passes every floor, Radix misses control borders (gray-a7 is about 1.6:1) and two dark soft labels (about Lc 58), and shadcn misses control borders, focus ring, dark secondary text, and dark solids.
- **Engine targets expose translation conflicts.** With Engine emphasis on, the one recipe nothing can satisfy is shadcn's `hover:bg-muted/50`: the engine wants a 0.04 lightness step, and half of the engine's muted surface can't give it. The Report flags it rather than hiding it.
- **Every reference outcome is met** in all three profiles, for five themes, in Ink and Flat (tested).

## What Phase 3 proved

- **Any theme can be the reference.** Paste a system's CSS and its values replace stock as the targets. The parser reads oklch, hex (including 8-digit), rgb, hsl, shadcn v3's bare HSL channels, and `var()` references. It finds modes by selector (`:root`, `.light`, `.dark`, `.dark-theme`, `prefers-color-scheme: dark`) and Material's `-light` / `-dark` token suffixes. It skips Tailwind `@theme` mappings, display-p3 `@supports` duplicates, and Material's contrast variants.
- **Radix palettes match by job, not name.** A pasted `--indigo-*` / `--slate-*` palette maps to accent and gray. Alpha steps the paste leaves out are derived from its own solid steps, never borrowed from stock.
- **Missing values fall back to stock**, and the Reference panel says how many of each mode were read and which are missing. "Use its brand color" sets the Theme pick from the import.
- **Re-solving is stable.** Export any profile's output, paste it back as the reference, and the solve reproduces itself within 0.012 lightness for every variable in all three systems (tested).
- **Joint constraints are solved in one pass.** A recipe that constrains a color it doesn't paint (Material's 8% on-color layer over primary) now holds that color only to what its partner could reach at the far end of its path. That finds the minimal pair instead of iterating, and it's what made the output stable.
- **Reading through recipes surfaces version mismatches.** A shadcn v3 theme read through the v4 base-nova recipes shows dark `--destructive` at Lc 12 as text, because v3 used it as a solid fill. The Report flags it; that is the theme and the components disagreeing, not the solver.

## What Phase 4 proved

The probe (`npm run probe`, `scripts/probe.ts`) renders each system's real components in headless Chromium: this app's shadcn preset, `@radix-ui/themes` 3.3.0, and `@material/web` 2.5.0. It works like this:

1. **Sentinels.** Every color variable the system defines (found by scanning its stylesheets) is set to a unique color. Four lightness bands with evenly spaced hues keep any two sentinels far enough apart that a small mix can't land on the wrong one. (An earlier golden-angle layout did exactly that: a 5% secondary/foreground mix landed on the accent-foreground sentinel.)
2. **Real states.** Mouse hover, mouse press, and keyboard focus, with transitions stopped in the document and in every shadow root.
3. **Sampling.** Background, text, placeholder, SVG fill and stroke, borders, outlines, and zero-blur box-shadow rings, on every element and its `::before` and `::after`, through shadow DOM, multiplied by effective opacity.
4. **What's underneath.** The hit-test stack at the element's center, not just its ancestors, so sibling layers count (Material draws button containers and state layers as siblings; Radix draws card surfaces on pseudo-elements).
5. **Tracing.** Each color maps back to a variable, a variable at an opacity, or a two-variable mix. Pairs are keyed the way recipes are and diffed against the hand-written profile, with aliases resolved.

Results, light mode:

| Profile | Recipes seen exactly | Before the probe's fixes |
| --- | --- | --- |
| shadcn | 22 of 25 (3 are popover and sidebar, not in the harness) | 21 of 25 |
| Radix Themes | 23 of 26 | 6 of 18 |
| Material 3 | 19 of 40 (the rest are roles the harness has no component for) | 10 of 37 |

What the probe corrected in the hand-written profiles:

- **Radix cards paint `--color-panel`, not `--color-panel-solid`.** Radix Themes defaults to a translucent panel. Fields and checkboxes sit on `--color-surface`, another translucent layer. Both are now variables with stock references, and every component recipe sits on them. That's what took Radix from 6 to 23.
- **Radix switches draw their edge with `gray-a5`,** a step the convention calls a component background. It's now a control-border recipe, so Force accessibility covers it.
- **shadcn light-mode inactive tabs use `text-foreground/60`, not muted text.** Dark mode uses muted text. The profile now has both, per mode, and the 60% foreground counts toward secondary-text accessibility.
- **Material switches edge their track with `outline` on `surface-container-highest`,** and filled fields label with `on-surface-variant` on that same container. Both added.
- **Scale-step recipes are conventions, not paints.** Radix's "step N on the page" recipes state intent; they're marked `convention` and the probe doesn't look for them.

The Report now has a Components column: Seen, Seen on another surface, Not seen, or Convention. A test fails if a profile recipe was added or renamed without re-running the probe.

## Known limits

- **Recipes are still written by hand.** The probe verifies them and lists what's missing, but turning a candidate pair into a recipe (choosing its element kind and metric) is a person's call.
- **The probe sees what the harness renders.** Popovers, sidebars, dialogs, and Material's error-colored components aren't in the harnesses yet, so their recipes show as Not seen.
- **Animated states.** Material's pressed ripple is driven by script animation; the probe catches hover layers reliably and pressed layers only sometimes.
- **One value per variable.** Where one variable serves conflicting uses, the solver reports the unmet recipe. The fix is a split variable through a component override, flagged as leaving stock.
- **Monotonic paths assumed.** Each recipe's measure must grow as a variable moves away from its parent. True for every shadcn recipe; a profile with recipes that pull in opposite directions would need a different search.
- **Light-mode outline buttons** use `--border`, not `--input`, so the field-border switch does not reach them.
- **Radix and Material previews are approximations.** The app ships shadcn components only, so those two render as small specimens painted with the system's own variables, stock beside yours. Recipes come from each system's documented usage and component styles, not from their source trees.
- **Recipes are version-specific.** The shadcn profile models the base-nova (v4) components. Themes written for other component versions read through them faithfully, which can show up as misses.
- **CSS only.** Imports read CSS custom properties. DTCG or Tokens Studio JSON aren't read yet.
- **One accent per profile.** Radix and Material carry one brand scale and red for errors; other status roles aren't mapped yet.

## Phasing

1. **Intent contract and shadcn as the first profile.** Done.
2. **Radix Themes and Material 3 profiles.** Done. Output system picker, stock-beside-yours specimens, per-system Report and CSS export.
3. **Reference reading from any theme.** Done. Paste CSS per output system; coverage report; brand color pickup.
4. **Browser probing.** Done for verification and discovery. Next: generate a starter profile for a system nobody has written one for, from probe output alone.

## Decisions

- shadcn is the app's default output and the tool's own chrome. It is one profile, not the frame of reference.
- Variables components modify with opacity ship opaque; the system's own modifiers are the overlay.
- Targets default to Match shadcn (reference reading). Engine emphasis is one switch away.
- Accessibility floors belong to element kinds, not to systems or variables.
