// Radix Themes as a system profile. Two 12-step scales per color (solid and
// alpha), picked by convention: 1-2 backgrounds, 3-5 component backgrounds
// (rest, hover, pressed), 6-8 borders, 9-10 solids, 11-12 text. Components
// lean on the alpha scale so they sit on any panel. Recipes follow the Radix
// Colors usage guide and Radix Themes component styles.
import type { ElementKind } from "../intent"
import type { Profile, Recipe, VarSpec } from "../profile"
import type { Mode, RoleId } from "../settings"
import { alphaOver, v } from "./util"

const STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const

// Stock Radix Colors: blue accent, gray neutral, red for errors.
const SCALES: Record<Mode, Record<"gray" | "accent" | "red", string[]>> = {
  light: {
    gray: ["#fcfcfc", "#f9f9f9", "#f0f0f0", "#e8e8e8", "#e0e0e0", "#d9d9d9", "#cecece", "#bbbbbb", "#8d8d8d", "#838383", "#646464", "#202020"],
    accent: ["#fbfdff", "#f4faff", "#e6f4fe", "#d5efff", "#c2e5ff", "#acd8fc", "#8ec8f6", "#5eb1ef", "#0090ff", "#0588f0", "#0d74ce", "#113264"],
    red: ["#fffcfc", "#fff7f7", "#feebec", "#ffdbdc", "#ffcdce", "#fdbdbe", "#f4a9aa", "#eb8e90", "#e5484d", "#dc3e42", "#ce2c31", "#641723"],
  },
  dark: {
    gray: ["#111111", "#191919", "#222222", "#2a2a2a", "#313131", "#3a3a3a", "#484848", "#606060", "#6e6e6e", "#7b7b7b", "#b4b4b4", "#eeeeee"],
    accent: ["#0d1520", "#111927", "#0d2847", "#003362", "#004074", "#104d87", "#205d9e", "#2870bd", "#0090ff", "#3b9eff", "#70b8ff", "#c2e6ff"],
    red: ["#191111", "#201314", "#3b1219", "#500f1c", "#611623", "#72232d", "#8c333a", "#b54548", "#e5484d", "#ec5d5e", "#ff9592", "#ffd1d9"],
  },
}
const PAGE: Record<Mode, string> = { light: "#ffffff", dark: "#111111" }
const PANEL: Record<Mode, string> = { light: "#ffffff", dark: "#191919" }

function reference(mode: Mode): Record<string, string> {
  const ref: Record<string, string> = {
    "--color-background": PAGE[mode],
    "--color-panel-solid": PANEL[mode],
    "--accent-contrast": "#ffffff",
  }
  for (const scale of ["gray", "accent", "red"] as const)
    SCALES[mode][scale].forEach((hex, i) => {
      ref[`--${scale}-${i + 1}`] = hex
      ref[`--${scale}-a${i + 1}`] = alphaOver(hex, PAGE[mode])
    })
  ref["--focus-8"] = ref["--accent-8"]
  ref["--accent-indicator"] = ref["--accent-9"]
  // Probe-confirmed: cards paint the translucent panel, fields and checkboxes the surface color.
  ref["--color-panel"] = mode === "light" ? "rgba(255, 255, 255, 0.7)" : ref["--gray-a2"]
  ref["--color-surface"] = mode === "light" ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.25)"
  return ref
}

// Chroma along the scale, as a share of the role's held saturation: quiet
// tints at the start, full at the solid, softer again for high-contrast text.
const CHROMA = [0.25, 0.3, 0.4, 0.45, 0.5, 0.55, 0.6, 0.7, 1, 1, 0.9, 0.55]

function scaleVars(scale: string, palette: RoleId, solid: boolean): VarSpec[] {
  const out: VarSpec[] = []
  for (const k of STEPS) {
    const name = `--${scale}-${k}`
    const from = k === 1 ? "--color-background" : `--${scale}-${k - 1}`
    out.push({
      name,
      path: k === 9 && solid ? { kind: "solid", role: palette } : { kind: "step", palette, from, chroma: palette === "neutral" ? 1 : CHROMA[k - 1] },
    })
  }
  // Alpha steps are the exact translucent form of each solid step over the
  // page, so they keep its hue; recipes that paint them drive the solid step.
  for (const k of STEPS) out.push({ name: `--${scale}-a${k}`, path: { kind: "alphaOf", of: `--${scale}-${k}`, over: "--color-background" } })
  return out
}

/** What each step is for, by Radix convention. */
const STEP_KIND = (k: number): ElementKind =>
  k <= 5 ? "surface" : k === 6 ? "border-decorative" : k === 7 ? "border-control" : k === 8 || k === 10 ? "state" : k === 9 ? "solid" : k === 11 ? "text-secondary" : "text-primary"

function scaleRecipes(scale: string, label: string): Recipe[] {
  const out: Recipe[] = []
  for (const alpha of [false, true])
    for (const k of STEPS) {
      const name = `--${scale}-${alpha ? "a" : ""}${k}`
      const element = STEP_KIND(k)
      out.push({
        id: `${scale}${alpha ? "-a" : "-"}${k}`,
        label: `${label} ${alpha ? "a" : ""}${k} on page`,
        source: `var(${name})`,
        element: element === "solid" ? "state" : element,
        paint: v(name),
        over: [v("--color-background")],
        metric: k >= 11 ? "lc" : "dL",
        // Step 9 of a solid scale is the engine's solid; reported, not solved.
        check: k === 9 && scale === "accent",
        convention: true,
      })
    }
  return out
}

const VARS: VarSpec[] = [
  { name: "--color-background", path: { kind: "page" } },
  { name: "--color-panel-solid", path: { kind: "step", palette: "neutral", from: "--color-background" } },
  // Cards use the translucent panel by default (panelBackground="translucent"); fields sit on --color-surface.
  { name: "--color-panel", path: { kind: "step", palette: "neutral", from: "--color-background", translucent: "always" } },
  { name: "--color-surface", path: { kind: "step", palette: "neutral", from: "--color-background", translucent: "always", dir: "back" } },
  ...scaleVars("gray", "neutral", false),
  ...scaleVars("accent", "brand", true),
  ...scaleVars("red", "danger", false),
  { name: "--accent-contrast", path: { kind: "onSolid", role: "brand" } },
  { name: "--focus-8", path: { kind: "alias", of: "--accent-8" } },
  { name: "--accent-indicator", path: { kind: "alias", of: "--accent-9" } },
]

// Translucent layers always sit on the page, so stacks start there.
const BG = "--color-background"
const P = "--color-panel"
const F = "--color-surface"
const R: Recipe[] = [
  { id: "panel", label: "Solid panel on page", source: "Dialog, Popover: var(--color-panel-solid)", element: "surface", paint: v("--color-panel-solid"), over: [v("--color-background")], metric: "dL", convention: true },
  { id: "card", label: "Card on page", source: "Card: var(--color-panel)", element: "surface", paint: v(P), over: [v("--color-background")], metric: "dL" },
  { id: "field", label: "Field surface", source: "TextField, Checkbox: var(--color-surface)", element: "surface", paint: v(F), over: [v(BG), v(P)], metric: "dL" },
  ...scaleRecipes("gray", "Gray"),
  ...scaleRecipes("accent", "Accent"),
  ...scaleRecipes("red", "Red"),
  // Component steps: hover and pressed measured against rest.
  { id: "gray-hover", label: "Gray component hover", source: "gray-4 after gray-3", element: "state", paint: v("--gray-4"), over: [v("--color-background")], against: [v("--gray-3")], metric: "dL", convention: true },
  { id: "accent-hover", label: "Accent component hover", source: "accent-4 after accent-3", element: "state", paint: v("--accent-4"), over: [v("--color-background")], against: [v("--accent-3")], metric: "dL", convention: true },
  { id: "solid-hover", label: "Solid button hover", source: "Button solid: accent-10 after accent-9", element: "state", paint: v("--accent-10"), over: [v("--color-background")], against: [v("--accent-9")], metric: "dL" },
  // Text on panels.
  { id: "text-hi-panel", label: "High-contrast text on panel", source: "Text: gray-12", element: "text-primary", paint: v("--gray-12"), over: [v(BG), v(P)], metric: "lc" },
  { id: "text-lo-panel", label: "Low-contrast text on panel", source: "Text color=gray: gray-11", element: "text-secondary", paint: v("--gray-11"), over: [v(BG), v(P)], metric: "lc" },
  { id: "link", label: "Link on panel", source: "Link: accent-a11", element: "text-secondary", paint: v("--accent-a11"), over: [v(BG), v(P)], metric: "lc" },
  // Buttons.
  { id: "solid-label", label: "Solid button label", source: "Button solid: accent-contrast on accent-9", element: "on-solid", paint: v("--accent-contrast"), over: [v("--accent-9")], metric: "lc", check: true },
  { id: "solid-page", label: "Solid button on page", source: "Button solid: accent-9", element: "solid", modes: ["dark"], paint: v("--accent-9"), over: [v("--color-background")], metric: "lc", check: true },
  { id: "soft-rest", label: "Soft button", source: "Button soft: accent-a3", element: "state", paint: v("--accent-a3"), over: [v(BG), v(P)], metric: "dL" },
  { id: "soft-hover", label: "Soft button hover", source: "Button soft: accent-a4 after accent-a3", element: "state", paint: v("--accent-a4"), over: [v(BG), v(P)], against: [v(BG), v(P), v("--accent-a3")], metric: "dL" },
  { id: "soft-label", label: "Soft button label", source: "Button soft: accent-a11 on accent-a3", element: "text-on-tint", paint: v("--accent-a11"), over: [v(BG), v(P), v("--accent-a3")], metric: "lc" },
  { id: "outline-edge", label: "Outline button edge", source: "Button outline: inset 0 0 0 1px accent-a8", element: "border-control", paint: v("--accent-a8"), over: [v(BG), v(P)], metric: "dL" },
  { id: "ghost-hover", label: "Ghost button hover", source: "Button ghost: hover accent-a3", element: "state", paint: v("--accent-a3"), over: [v(BG), v(P)], metric: "dL" },
  // Fields, cards, separators.
  { id: "field-edge", label: "Field and checkbox border", source: "TextField, Checkbox: inset 0 0 0 1px gray-a7 on color-surface", element: "border-control", paint: v("--gray-a7"), over: [v(BG), v(P), v(F)], metric: "dL" },
  { id: "field-hover", label: "Text field border, hover", source: "TextField: gray-a8 after gray-a7", element: "state", paint: v("--gray-a8"), over: [v(BG), v(P), v(F)], against: [v(BG), v(P), v(F), v("--gray-a7")], metric: "dL" },
  { id: "field-text", label: "Field text", source: "TextField: gray-12 on color-surface", element: "text-primary", paint: v("--gray-12"), over: [v(BG), v(P), v(F)], metric: "lc" },
  { id: "placeholder", label: "Field placeholder", source: "TextField: gray-a10 on color-surface", element: "state", paint: v("--gray-a10"), over: [v(BG), v(P), v(F)], metric: "lc", check: true },
  { id: "checkbox-mark", label: "Checkbox mark", source: "Checkbox checked: accent-contrast on accent-indicator", element: "on-solid", paint: v("--accent-contrast"), over: [v("--accent-indicator")], metric: "lc", check: true },
  { id: "switch-edge", label: "Switch track edge", source: "Switch: inset 0 0 0 1px gray-a5", element: "border-control", paint: v("--gray-a5"), over: [v(BG), v(P)], metric: "dL" },
  { id: "tab-inactive", label: "Inactive tab", source: "Tabs: gray-a11", element: "text-secondary", paint: v("--gray-a11"), over: [v(BG), v(P)], metric: "lc" },
  { id: "solid-hover-label", label: "Solid button label, hovered", source: "Button solid: accent-contrast on accent-10", element: "on-solid", paint: v("--accent-contrast"), over: [v("--accent-10")], metric: "lc", check: true },
  { id: "card-edge", label: "Card edge", source: "Card surface: 0 0 0 1px gray-a5", element: "border-decorative", paint: v("--gray-a5"), over: [v("--color-background")], metric: "dL" },
  { id: "separator", label: "Separator on panel", source: "Separator: gray-a6", element: "border-decorative", paint: v("--gray-a6"), over: [v(BG), v(P)], metric: "dL" },
  { id: "focus", label: "Focus ring on page", source: "focus-visible: 2px solid focus-8", element: "focus", paint: v("--focus-8"), over: [v("--color-background")], metric: "dL" },
  { id: "focus-panel", label: "Focus ring on panel", source: "focus-visible: 2px solid focus-8", element: "focus", paint: v("--focus-8"), over: [v(BG), v(P)], metric: "dL" },
  // Errors.
  { id: "error-text", label: "Error text on panel", source: "Text color=red: red-a11", element: "text-secondary", paint: v("--red-a11"), over: [v(BG), v(P)], metric: "lc" },
  { id: "callout", label: "Error callout text", source: "Callout red: red-a11 on red-a3", element: "text-on-tint", paint: v("--red-a11"), over: [v(BG), v(P), v("--red-a3")], metric: "lc" },
]

export const RADIX: Profile = {
  id: "radix",
  label: "Radix Themes",
  description: "Two 12-step scales per color, solid and alpha. Components pick steps by convention.",
  selectors: { light: ":root, .light, .light-theme", dark: ".dark, .dark-theme" },
  vars: VARS,
  recipes: R,
  reference: { light: reference("light"), dark: reference("dark") },
}
