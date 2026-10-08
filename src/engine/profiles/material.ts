// Material 3 as a system profile. Color roles are tones on tonal palettes;
// containers carry their own "on" colors; interaction states are fixed-
// opacity layers of the on-color (hover 8%, focus and pressed 10%) painted
// over the container. The opacities are the system's, so the solver picks
// tones that make those fixed layers land.
import type { Profile, Recipe, VarSpec } from "../profile"
import type { Mode, RoleId } from "../settings"
import { a, v } from "./util"

const M = (role: string) => `--md-sys-color-${role}`

// Stock M3 baseline scheme (source color #6750A4).
const BASELINE: Record<Mode, Record<string, string>> = {
  light: {
    surface: "#fef7ff", "surface-container-lowest": "#ffffff", "surface-container-low": "#f7f2fa", "surface-container": "#f3edf7",
    "surface-container-high": "#ece6f0", "surface-container-highest": "#e6e0e9", "on-surface": "#1d1b20", "on-surface-variant": "#49454f",
    outline: "#79747e", "outline-variant": "#cac4d0", primary: "#6750a4", "on-primary": "#ffffff", "primary-container": "#eaddff",
    "on-primary-container": "#21005d", secondary: "#625b71", "on-secondary": "#ffffff", "secondary-container": "#e8def8",
    "on-secondary-container": "#1d192b", error: "#b3261e", "on-error": "#ffffff", "error-container": "#f9dedc", "on-error-container": "#410e0b",
  },
  dark: {
    surface: "#141218", "surface-container-lowest": "#0f0d13", "surface-container-low": "#1d1b20", "surface-container": "#211f26",
    "surface-container-high": "#2b2930", "surface-container-highest": "#36343b", "on-surface": "#e6e0e9", "on-surface-variant": "#cac4d0",
    outline: "#938f99", "outline-variant": "#49454f", primary: "#d0bcff", "on-primary": "#381e72", "primary-container": "#4f378b",
    "on-primary-container": "#eaddff", secondary: "#ccc2dc", "on-secondary": "#332d41", "secondary-container": "#4a4458",
    "on-secondary-container": "#e8def8", error: "#f2b8b5", "on-error": "#601410", "error-container": "#8c1d18", "on-error-container": "#f9dedc",
  },
}

const ref = (mode: Mode) => Object.fromEntries(Object.entries(BASELINE[mode]).map(([k, val]) => [M(k), val]))

const step = (from: string, palette: RoleId, chroma = 1, dir?: "away" | "back" | "contrast") =>
  ({ kind: "step", palette, from: M(from), chroma, dir }) as const

// A role group: color, on-color, container, on-container.
function group(role: string, palette: RoleId, chroma: number): VarSpec[] {
  return [
    { name: M(role), path: step("surface", palette, chroma) },
    { name: M(`on-${role}`), path: step(role, palette, chroma * 0.5, "contrast") },
    { name: M(`${role}-container`), path: step("surface", palette, chroma * 0.55) },
    { name: M(`on-${role}-container`), path: step(`${role}-container`, palette, chroma * 0.6, "contrast") },
  ]
}

const VARS: VarSpec[] = [
  { name: M("surface"), path: { kind: "page" } },
  { name: M("surface-container-lowest"), path: step("surface", "neutral", 1, "back") },
  { name: M("surface-container-low"), path: step("surface", "neutral") },
  { name: M("surface-container"), path: step("surface-container-low", "neutral") },
  { name: M("surface-container-high"), path: step("surface-container", "neutral") },
  { name: M("surface-container-highest"), path: step("surface-container-high", "neutral") },
  { name: M("on-surface"), path: step("surface", "neutral", 0.6) },
  { name: M("on-surface-variant"), path: step("surface", "neutral") },
  { name: M("outline"), path: step("surface", "neutral") },
  { name: M("outline-variant"), path: step("surface", "neutral") },
  ...group("primary", "brand", 1),
  // Secondary is the primary hue at low chroma, the way M3 derives it.
  ...group("secondary", "brand", 0.3),
  ...group("error", "danger", 1),
]

const S = v(M("surface"))
const container = (k: string): Recipe => ({
  id: k,
  label: `${k.replace(/-/g, " ").replace("surface ", "Surface ")} on surface`,
  source: `${M(k)}`,
  element: "surface",
  paint: v(M(k)),
  over: [S],
  metric: "dL",
})

function roleRecipes(role: string, label: string): Recipe[] {
  const c = v(M(role))
  const on = M(`on-${role}`)
  const box = v(M(`${role}-container`))
  const onBox = M(`on-${role}-container`)
  return [
    { id: `${role}`, label: `${label} on surface`, source: `${M(role)}: filled button, active indicator`, element: role === "error" ? "text-secondary" : "solid", paint: c, over: [S], metric: "lc" },
    { id: `on-${role}`, label: `Label on ${label.toLowerCase()}`, source: `${on} on ${M(role)}`, element: "on-solid", paint: v(on), over: [c], metric: "lc" },
    { id: `${role}-hover`, label: `${label} hover layer`, source: `state layer: ${on} at 8%`, element: "state", paint: a(on, 0.08), over: [c], metric: "dL", alsoDrives: [M(role)] },
    { id: `${role}-pressed`, label: `${label} pressed layer`, source: `state layer: ${on} at 10%`, element: "state", paint: a(on, 0.1), over: [c], metric: "dL", alsoDrives: [M(role)] },
    { id: `${role}-container`, label: `${label} container on surface`, source: `${M(role)}-container`, element: "surface", paint: box, over: [S], metric: "dL" },
    { id: `on-${role}-container`, label: `Text on ${label.toLowerCase()} container`, source: `${onBox} on ${M(role)}-container`, element: "text-on-tint", paint: v(onBox), over: [box], metric: "lc" },
    { id: `${role}-container-hover`, label: `${label} container hover`, source: `state layer: ${onBox} at 8%`, element: "state", paint: a(onBox, 0.08), over: [box], metric: "dL" },
  ]
}

const R: Recipe[] = [
  container("surface-container-lowest"),
  container("surface-container-low"),
  container("surface-container"),
  container("surface-container-high"),
  container("surface-container-highest"),
  { id: "on-surface", label: "Text on surface", source: `${M("on-surface")}`, element: "text-primary", paint: v(M("on-surface")), over: [S], metric: "dL" },
  { id: "on-surface-highest", label: "Text on highest container", source: `${M("on-surface")} on surface-container-highest`, element: "text-primary", paint: v(M("on-surface")), over: [v(M("surface-container-highest"))], metric: "dL" },
  { id: "on-surface-variant", label: "Secondary text on surface", source: `${M("on-surface-variant")}`, element: "text-secondary", paint: v(M("on-surface-variant")), over: [S], metric: "lc" },
  { id: "on-surface-variant-highest", label: "Secondary text on highest container", source: `${M("on-surface-variant")} on surface-container-highest`, element: "text-secondary", paint: v(M("on-surface-variant")), over: [v(M("surface-container-highest"))], metric: "lc" },
  { id: "outline", label: "Outline on surface", source: "outlined button, text field: outline", element: "border-control", paint: v(M("outline")), over: [S], metric: "dL" },
  { id: "outline-variant", label: "Divider on surface", source: "divider, card outline: outline-variant", element: "border-decorative", paint: v(M("outline-variant")), over: [S], metric: "dL" },
  ...roleRecipes("primary", "Primary"),
  ...roleRecipes("secondary", "Secondary"),
  ...roleRecipes("error", "Error"),
  { id: "text-button-hover", label: "Text button hover", source: "text button: primary at 8%", element: "state", paint: a(M("primary"), 0.08), over: [S], metric: "dL", check: true },
  { id: "text-button-label", label: "Text button label, hovered", source: "text button: primary on its 8% layer", element: "text-on-tint", paint: v(M("primary")), over: [S, a(M("primary"), 0.08)], metric: "lc" },
  { id: "focus", label: "Focus indicator", source: "focus ring: secondary, 3dp", element: "focus", paint: v(M("secondary")), over: [S], metric: "dL" },
  { id: "list-hover", label: "List item hover", source: "state layer: on-surface at 8%", element: "state", paint: a(M("on-surface"), 0.08), over: [v(M("surface-container"))], metric: "dL", check: true },
  { id: "disabled-label", label: "Disabled label", source: "on-surface at 38%", element: "state", paint: a(M("on-surface"), 0.38), over: [S], metric: "lc", check: true },
]

export const MATERIAL: Profile = {
  id: "material",
  label: "Material 3",
  description: "Roles are tones on tonal palettes. States are fixed-opacity layers of the on-color.",
  selectors: { light: ":root", dark: ".dark" },
  vars: VARS,
  recipes: R,
  reference: { light: ref("light"), dark: ref("dark") },
}
