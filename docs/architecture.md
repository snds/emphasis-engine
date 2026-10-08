# Emphasis Engine: system-agnostic architecture

Status: Phases 1–4 built, plus generated profiles for ten more systems (October 8, 2026). Supersedes the plan's assumption that the engine exports directly to one design system.

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

## Generated profiles for popular systems

Thirteen systems now ship as output profiles. Three are hand-written and probe-verified (shadcn/ui, Radix Themes, Material 3). Ten were generated by the probe from each system's real components:

| System | Package probed | Recipes | Notes |
| --- | --- | --- | --- |
| Bootstrap | bootstrap 5.3.8 | 88 | Component classes carry their own variables (`--bs-btn-bg` on `.btn-primary`); exported under those selectors |
| IBM Carbon | @carbon/react 1.118 | 97 | Theme zones: white for light, g100 for dark |
| Fluent 2 | @fluentui/react-components 9.74 | 84 | Exported as JSON for a FluentProvider theme |
| GitHub Primer | @primer/react 38.40 | 86 | Functional and component tokens |
| Atlassian | @atlaskit/tokens 20.4 | 55 | Tokens loaded by setGlobalTheme |
| Ant Design | antd 6.6 | 48 | CSS variables on; exported as JSON for ConfigProvider `theme.token` |
| Chakra UI | @chakra-ui/react 3.37 | 54 | Semantic tokens, including per-palette remaps |
| Mantine | @mantine/core 9.7 | 50 | Per-color variant variables |
| daisyUI | daisyui 5.7 | 26 | A few theme colors with matching content colors |
| Coinbase CDS | @coinbase/cds-web 9.29 | 53 | ThemeProvider writes variables inline; exported as JSON for the theme's color objects |

How generation works, on top of the probe:

1. **Harness contract.** Each harness page exposes `window.__probe` with `setMode(light | dark)` and the elements its variables are defined on. The probe reads stock values in both modes before setting sentinels.
2. **Where variables live.** Root variables, variables on a scope element, and variables scoped to a component selector are told apart. A component rule that points a root variable at another one (Radix's `data-accent-color`, Chakra's color palettes) is a remap and left alone; one that copies a literal is forced to the sentinel too.
3. **Bare channels.** Variables stored as `212 100% 47%` or `255 255 255` get sentinels and exports in that same format.
4. **Inference.** The page is what plain text on the page sits on. Each variable's parent is the surface it's painted over most; its palette comes from its name (danger, success, warning, info, brand) or, failing that, its chroma and hue. Only the brand fill becomes the engine's solid: status fills stay on their palettes so they keep the lightness the system's labels are tuned to. Direction (away from the page's polarity, or back) is decided per mode, from the stock values or, when a variable matches its parent, from which side its pairs sit on. Variables are ordered so everything a variable is measured against is solved first.
5. **Recipes.** Every traced pair becomes a recipe. The element kind comes from the property (background, text, edge), the state it appeared in, the component, and the variable's name. Edges drawn in the color of what's under them, and pairs that paint a fully transparent token, are dropped.

Solver changes this needed, all general:

- **Polarity.** Contrast metrics are unsigned, so a black label passed where the system has a white one. Requirements now carry the reference pair's direction; a pair pointing the wrong way counts as negative.
- **Per-mode direction.** White text sits on a white page in light mode and a dark page in dark mode; a step's direction can differ by mode.
- **Interval search.** A focus ring lighter than a button but darker than the page has a feasible range, not a ray. When the top of the range fails, the solver scans for the interval, then takes the closest compromise if there is none.
- **Relax passes.** Generated profiles can carry cycles (text over a fill that is measured against that text). After the ordered pass, steps are re-solved against all of their recipes until nothing moves.

Results, tested: every generated profile reproduces every stock outcome for six themes, in Ink and Flat, in both modes. Given each system's own brand color, 98% of variables land within 0.03 lightness of stock (each system above 85%). Re-solving from its own CSS output is stable within 0.03. A generated profile solves in well under 150 ms.

Known outliers worth a look in the Report: Bootstrap's warning text emphasis, Carbon's link hover, Coinbase CDS's foreground and line colors, and Mantine's placeholder and outline colors land off stock. Each is a variable whose pairs pull in different directions once the engine's colors replace the stock ones.

## Native examples

Every system except shadcn gets a page built from its own real components and laid out by its own guidelines. They all share one scene's content (`src/native/scene.ts`): an enterprise PLM "Workspace settings" page with a header, form, actions, status alerts, an orders table, and text emphasis. The pages compare color treatment, not content. Where a system lacks a piece, the page uses that system's nearest equivalent or leaves it out.

- **Isolation.** Each page is its own document (`native/<id>.html` → `src/native/<id>.tsx`) in an iframe. Systems ship global resets that would collide with each other and with the app.
- **Theme in.** The app sends the solved values for the current mode by `postMessage`. The kit (`src/native/kit.tsx`) switches the system's own mode mechanism, then applies the values the way the probe applies sentinels:
  - root variables inline `!important` on `<html>` and the system's scope elements;
  - scoped variables as `!important` rules;
  - literal redefinitions under component selectors get the same value.
- **Restore.** Restore puts a variable back only if it still holds the value the kit set. That way a provider that rewrote its variables on a mode switch keeps its values.
- **Sizing.** The page reports its content height, so the app page scrolls, not the frame. Native pages don't use `100vh`.
- **Instant switching.**
  - Every page is in the build: a multi-page Vite config with one entry per system.
  - The last three frames stay mounted, and only the visible one receives theme messages.
  - A service worker (`src/sw-template.js`, written to `dist/sw.js` with the full file list) caches every file after the first visit. That's about 8.8 MB, 86 files. It skips this when Data Saver is on.
- **Preview.** Preview shows Native or Pairs. Pairs is the measurement view (the specimens for Radix and Material, the recipe board for generated systems). Hold-to-compare sends the defaults' solved values.
- **Tooling.** `scripts/native-shot.ts <id>` screenshots stock and themed, light and dark, at 390 and 1280. It uses a loud brand so any component the theme misses stands out, and it solves in the page because the engine uses Vite-only imports. `docs/native/BRIEF.md` is the contract for building a page. `docs/systems/<id>.md` records what each system taught us.

What the native pages showed: whether a theme reaches a component depends on where the system makes state colors.
- **Followed the theme:**
  - separate state tokens (Carbon, Fluent, Primer, Atlassian, Mantine);
  - runtime `color-mix()` (daisyUI, Chakra);
  - opacity (shadcn, Material).
- **Didn't follow:**
  - build-time literals (Bootstrap);
  - JS-computed colors (Ant Design component tokens, Coinbase CDS hover and disabled).

Profile fixes the pages surfaced, and how they were fixed (2026-10-08). Each fix went into the probe or the generator, not the JSON, so a re-probe reproduces it.
- **Generated profiles are probed from the native pages.** Before, they came from small harnesses. With `?probe`, a page tags its own sample roots (`<kind>-<what it says>@page`) and exposes the same mode switch and scopes the app uses. Every alert, badge, table row, disabled button, and header the page shows is now measured. Hand profiles (shadcn, Radix, Material) are still diffed against their harnesses.
- **Scoped stock values come from the declaring rule.** Bootstrap's `.btn { --bs-btn-bg: transparent }` was read off the first `.btn`, which is a `.btn-primary`, so it came out blue. The profile then painted outline and link buttons solid. Now the declared value is read, the transparent token drops out, and outline and link buttons stay outlined.
- **Every trace is confirmed by a second, shuffled sentinel pass.** A build-time literal (Bootstrap's link hover, its focus borders) once landed near a blend of two sentinels by chance. That produced false "mix" recipes and Bootstrap's white warning text. A trace now counts only if both passes name the same variables.
- **Pairs are grouped by property too.** A color as a checkbox's focus outline and the same color as a button fill over the same surface used to merge. The merged pair kept whichever property came first, so daisyUI and Coinbase CDS lost their brand solid.
- **Overrides keep the system's source order.** Scoped overrides carry their rule's position, so a base rule lands before its variants. The order is kept in the probe, the CSS export, and the native kit.
- **Comma channel triplets are read.** Bootstrap's `--bs-primary-rgb: 13, 110, 253` feeds its links, badges, and tables through `rgba(var(--x-rgb), a)`.
- **Status names win over low chroma, and selectors count as names.** A pale info tint (`#e6f4ff`) is info, not a neutral the brand tint pulls pink. `--bs-alert-bg@.alert-success` is success. Blue means info. Brand comes from brand words (primary, accent, interactive, link, a chromatic secondary). So Mantine's and Chakra's blue, Carbon's blue tag, and Ant Design's info background keep their meaning when the brand changes.
- **The brand solid is the rest fill.** The generator prefers a fill named for rest (not hover, border, or stroke) with the most labels on it. If its labels are literals (Ant Design), it falls back to the rest fill painted most.
- **Parents sit under the variable in both modes.** If a variable sits on different surfaces in light and dark (Mantine's placeholder on white, then on dark-6), it hangs off the page. Faint tints in a stack (a card footer's 3% wash) are looked through.
- **Unpainted in one mode keeps its stock distance.** A variable no recipe paints in a mode (Mantine's dark-6 in light mode) keeps its stock offset from its parent. Before, it collapsed onto the parent.
- **JS-themed systems get the values in their theme object.** The kit's `useThemeValues()` gives pages the solved root values in legacy syntax. Ant Design takes them as tokens, and its algorithm re-derives the component tokens (the Tabs ink bar, a checked Radio, the selected Menu item). Coinbase CDS takes them in its ThemeProvider theme, so its JS-blended hover, pressed, and disabled colors follow.
- **Radix's switch track** (`--accent-track`, an alias of step 9) and surface tint (`--accent-surface`) are solved.
- **Mantine** probes its gray and dark shades. Components paint those directly (dark inputs on dark-6).

What stays as each system designed it:
- **Same role by design:** Primer's info and brand are one role (`accent`). Coinbase CDS's informational banner is its primary color. Both follow the brand.
- **No brand color by default:** Chakra's default palette is gray, so the brand pick has nothing to drive until a page sets `colorPalette`.
- **One brand:** daisyUI's secondary follows the brand, since the engine solves one brand color.
- **Literals the solved theme can't reach:** Bootstrap's checked checkbox fill and focus rings are build-time literals.

Results after the fixes: every generated profile still reproduces every stock outcome. Given each system's own brand color, about 99% of variables land within 0.03 lightness of stock, with each system above 90%.

## Known limits

- **Recipes are still written by hand.** The probe verifies them and lists what's missing, but turning a candidate pair into a recipe (choosing its element kind and metric) is a person's call.
- **The probe sees what the page renders.** Generated profiles cover everything on their native page. Popovers, menus, and dialogs aren't on any page yet. Hand profiles still use their harnesses.
- **Animated states.** Material's pressed ripple is driven by script animation. Since traces must agree across two passes, its pressed layers are now usually rejected rather than half-caught (15 of 40 Material recipes observed, down from 19).
- **One value per variable.** Where one variable serves conflicting uses, the solver reports the unmet recipe. The fix is a split variable through a component override, flagged as leaving stock.
- **Monotonic paths assumed.** Each recipe's measure must grow as a variable moves away from its parent. True for every shadcn recipe; a profile with recipes that pull in opposite directions would need a different search.
- **Light-mode outline buttons** use `--border`, not `--input`, so the field-border switch does not reach them.
- **Native pages theme only what the profile solves.** Variables the probe never saw, and colors a system computes in JS, stay stock on the native page. The Pairs view shows exactly what's solved.
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
