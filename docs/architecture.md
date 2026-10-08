# Emphasis Engine: system-agnostic architecture

Status: Phase 1 built (October 8, 2026). Supersedes the plan's assumption that the engine exports directly to one design system.

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
- **Recipes**: every pair the system's components actually render, read from component source. Each recipe has a paint expression, the stack it sits on, a metric, an element kind, and optional mode filter. Expressions mirror the system's CSS: a plain variable, an opacity modifier (`color-mix(in oklab, X k, transparent)`), or a real blend (`color-mix(in oklch, A, B k)`).
- **Reference**: the system's stock theme as its own CSS values.

Code: `src/engine/profile.ts` (types and solver), `src/engine/profiles/shadcn.ts` (first profile, 30 recipes).

### 3. Solver

1. **Read the reference through its own recipes.** Rendering the stock theme through the recipes gives the outcomes the system renders today. Those become targets (Match shadcn). This is the general form of "interpret, then recalculate."
2. **Solve each variable against every recipe it paints.** A variable takes the weakest value on its path that satisfies all of its recipes. This is the same max-over-constraints rule the ink model uses for guard surfaces.
3. **Apply floors.** With a Force accessibility switch on, the floor for that element kind is added to every recipe of that kind.
4. **Report every outcome**: target, rendered result, which requirement source set it (shadcn, engine, forced), and the accessibility floor whether or not it is enforced.

Nothing is layered on top of the downstream system. Its own recipes are the overlay layer.

## How systems differ, and what gets solved

| System | How a variable becomes a color on screen | What the solver picks |
|---|---|---|
| shadcn (built) | About 30 variables. Components apply opacity modifiers and `color-mix` | Variable values, worked back through each recipe |
| Radix Themes | Lookup by convention: steps 3–5 component backgrounds, 6–8 borders, 9–10 solids, 11–12 text | The 12 steps, so each lookup lands its target |
| Material 3 | Roles map to tones on a tonal palette. States are fixed-opacity layers (8–10%) in the on-color | The tone per role, given those fixed state alphas |
| MUI | `main`/`light`/`dark`/`contrastText`, plus fixed action opacities (hover 0.04, selected 0.08) | Palette values under those fixed alphas |
| Tailwind or a tiered custom system | Direct, global → semantic → component | Values directly |

Material 3 and MUI state layers are the engine's ink overlay with fixed alphas, so the solving method carries over. Only the recipes change.

## What Phase 1 proved

- shadcn rebuilt as a profile reproduces every rendered outcome of the stock theme, for any theme color, in all three layers (tested across four themes and four neutrals). Neutral variables land within 0.02 OKLCH lightness of the preset.
- The solve now runs through component opacity. Example: light-mode `--destructive` is set by the 10% tint the destructive button paints, so a lower-chroma red comes out slightly deeper to keep the tint visible. Before, nothing saw that tint.
- Shared variables are solved for every use. `--input` satisfies its 100% border, its 30% field fill, its 50% hover, and its 80% switch track at once.
- Force accessibility works per element kind, so it will apply unchanged to future profiles.

## Known limits

- **Recipes live in code.** They were read by hand from the preset's class names. They drift when components change or new ones are added.
- **One value per variable.** Where one variable serves conflicting uses, the solver reports the unmet recipe. The fix is a split variable through a component override, flagged as leaving stock.
- **Monotonic paths assumed.** Each recipe's measure must grow as a variable moves away from its parent. True for every shadcn recipe; a profile with recipes that pull in opposite directions would need a different search.
- **Light-mode outline buttons** use `--border`, not `--input`, so the field-border switch does not reach them.

## Phasing

1. **Intent contract and shadcn as the first profile.** Done.
2. **Radix Themes and Material 3 profiles.** Two different rendering models (lookup, tonal palette plus state layers). If the contract survives both, it generalizes. Adds a profile picker to the Preview and per-profile exports.
3. **Reference reading from any theme.** Paste or point at an existing theme; read it through the profile to get starting targets.
4. **Browser probing.** Render real components headlessly, sample computed colors per state, and back-solve. Works for systems nobody has written a profile for, and validates hand-written profiles.

## Decisions

- shadcn is the app's default output and the tool's own chrome. It is one profile, not the frame of reference.
- Variables components modify with opacity ship opaque; the system's own modifiers are the overlay.
- Targets default to Match shadcn (reference reading). Engine emphasis is one switch away.
- Accessibility floors belong to element kinds, not to systems or variables.
