# Native page brief

Each design system gets one page built from its own real components and laid
out by its own guidelines. The Emphasis Engine app loads the page in an iframe
and sends it the solved color theme. The pages compare color treatment across
systems, so they share content (`src/native/scene.ts`) but not layout or
component choice.

## The contract

- Page entry: `native/<id>.html` (exists) → `src/native/<id>.tsx` (replace the placeholder).
- Mount with `mountNative(id, render, { onMode, scopes })` from `src/native/kit.tsx`.
  - `render(mode)` returns the page. Use `mode` for React providers that take a theme prop.
  - `onMode(mode)` switches the system's own light/dark mechanism (class, attribute).
    Copy what the probe harness for the system does: `src/probe/<id>-harness.tsx|ts`.
  - `scopes()` returns elements the system writes theme variables on besides `<html>`
    (a provider's root div). Copy it from the harness too.
- The kit applies solved variables exactly like the probe does (inline `!important`
  on html and scopes, rules for scoped variables, overrides for literal redefinitions
  under component selectors). Don't apply theme values yourself.
- Do not edit `kit.tsx`, `scene.ts`, `native-frame.tsx`, the engine, profiles, or any
  other system's files. If the contract needs a change, say so in your report.

## The scene

Use every piece of `scene.ts` that the system has a native component for:
app header / nav, breadcrumb, page title and description, tabs, stats,
the settings form (text, email with helper, a field in its error state, select,
switch, checkbox, radio group), the action hierarchy (primary, secondary,
tertiary/outline, ghost, danger, disabled), the four status alerts, the purchase
orders table with status badges/tags/lozenges, text emphasis and a link.

- Follow the system's own rules: its layout primitives and grid, spacing scale,
  type styles, button ordering and placement, form patterns, which component
  conveys status. Read its docs (WebFetch) where unsure. Cite the pages you used.
- Missing component: use its nearest native equivalent, or leave it out and say so.
  Never fake one with hand-rolled styles that imitate the system.
- Use the system's tokens for any color you write yourself (text on a plain div,
  a divider). No literal colors anywhere.
- Works at 390px wide and 1280px wide. No horizontal page scroll (wide tables scroll
  inside their own container). No `100vh` / `min-height: 100vh` (the frame sizes to content).
- Status mapping: success, info, warning, danger → the system's conventional status
  variants. Don't map status onto brand.

## Verify

- One shared dev server runs at http://localhost:5173 (don't start another; if it's
  down, start it with `npx vite --port 5173 --strictPort` in the background).
- `npx tsx scripts/native-shot.ts <id> --out /tmp/claude-0/native-shots` writes stock and
  themed shots, light and dark, at 390 and 1280. The themed run uses a loud magenta
  brand (#c026d3) so you can see what the solved theme reaches. Read the PNGs and look.
  It also prints page errors and horizontal overflow; fix both.
- If a page reloads mid-shot (Vite re-optimizing a new dependency), rerun once.
- `npx tsc -p tsconfig.app.json --noEmit` (only errors in your files matter; other agents
  are editing other pages) and `npx eslint src/native/<id>.tsx`.
- Don't commit. Don't run `npm run build` (another agent may be building).

## Learnings note: `docs/systems/<id>.md`

Write one per system. It's the source for a knowledge-base entry, so write what you
learned, not what you did. Plain language, short sentences. Sections:

1. **At a glance** — package and version (from node_modules), license, docs URLs used.
2. **How its color works** — token tiers and naming, where variables live (root, provider
   div, component classes, JS theme object), how light/dark switches, how hover/press/
   focus/disabled colors are produced (separate tokens, opacity, color-mix, filters).
3. **Building the native page** — the guidelines you followed and why (layout, ordering,
   status components), components missing or substituted.
4. **What the solved theme reached** — compare stock vs themed shots. Which components
   picked up the solved values, which didn't, and why (hardcoded colors, JS-computed
   colors, shadow DOM, portals, zone classes, inline styles). Be specific.
5. **Accessibility notes** — contrast or state problems you saw in the stock theme.
6. **Ideas for the Centric design system** — patterns from this system worth borrowing,
   and ones to avoid. Context: Sean leads the design system for an enterprise PLM product
   (fashion, food, and product-engineering verticals). It's data-dense (big tables,
   record detail, bulk edit), ships across Vue, React, React Native, and Angular, uses a
   3-tier token model (global → semantic → component), Radix-derived color scales on a
   shadcn base, and density modes. Be concrete: name the mechanism and why it would help.
7. **Open issues** — anything unfinished or worth a follow-up.

## Report back

A short summary: what the page contains, what the themed theme did and didn't reach,
anything that needs a contract change, and the paths of your files.
