// Inputs and the starting targets. Every number here is a starting value
// to be tuned on real screens (doc: Project risks, "Perception is not math").

import type { ImportedTheme } from "./reference"

export type Mode = "light" | "dark"
export type Context = "text" | "fill" | "stroke" | "surface"
export type Level = 1 | 2 | 3 | 4 | 5
export const LEVELS: Level[] = [1, 2, 3, 4, 5]
export const CONTEXTS: Context[] = ["text", "fill", "stroke", "surface"]
export const LEVEL_NAMES: Record<Level, string> = {
  1: "minimal",
  2: "low",
  3: "medium",
  4: "high",
  5: "maximal",
}

export type RoleId = "brand" | "neutral" | "danger" | "success" | "warning" | "caution" | "info"
export const ROLES: RoleId[] = ["brand", "neutral", "danger", "success", "warning", "caution", "info"]
export const STATUS_ROLES: RoleId[] = ["danger", "success", "warning", "caution", "info"]

export type NeutralId = "gray" | "mauve" | "slate" | "sand" | "olive" | "mist"
export const NEUTRALS: Record<NeutralId, { label: string; hue: number; chroma: number }> = {
  gray: { label: "Gray", hue: 0, chroma: 0 },
  mauve: { label: "Mauve", hue: 326, chroma: 0.014 },
  slate: { label: "Slate", hue: 260, chroma: 0.014 },
  sand: { label: "Sand", hue: 70, chroma: 0.012 },
  olive: { label: "Olive", hue: 120, chroma: 0.012 },
  mist: { label: "Mist", hue: 210, chroma: 0.012 },
}

/** Conventional status colors as OKLCH anchors. Meaning outranks brand. */
export const STATUS_ANCHORS: Record<string, { l: number; c: number; h: number; label: string }> = {
  danger: { l: 0.577, c: 0.215, h: 27, label: "Danger" },
  success: { l: 0.6, c: 0.16, h: 150, label: "Success" },
  warning: { l: 0.68, c: 0.18, h: 55, label: "Warning" },
  caution: { l: 0.82, c: 0.17, h: 92, label: "Caution" },
  info: { l: 0.6, c: 0.15, h: 245, label: "Info" },
}

/**
 * How a context's five levels are spread between its level 1 and level 5
 * targets. Stepped keeps APCA's landmark values (45, 60, 75, 90 for text).
 * The others interpolate between the endpoints, which stay fixed.
 */
export type Ramp = "stepped" | "linear" | "ease-in" | "ease-out" | "ease-in-out"
export const RAMPS: Ramp[] = ["stepped", "linear", "ease-in", "ease-out", "ease-in-out"]

export function easeRamp(ramp: Exclude<Ramp, "stepped">, t: number): number {
  switch (ramp) {
    case "linear":
      return t
    case "ease-in":
      return t * t
    case "ease-out":
      return 1 - (1 - t) * (1 - t)
    case "ease-in-out":
      return t * t * (3 - 2 * t)
  }
}

export type Target = { kind: "lc"; value: number } | { kind: "dL"; value: number }

/**
 * Base targets per context × level × mode. Text, fill, and stroke use APCA
 * Lc. Surfaces use OKLCH ΔL, because APCA clamps to 0 below about Lc 10
 * and reads 0 for most of the dark surface range.
 */
export const BASE_TARGETS: Record<Mode, Record<Context, Target[]>> = {
  light: {
    text: [45, 60, 75, 90, 100].map((value) => ({ kind: "lc", value })),
    fill: [15, 30, 45, 60, 75].map((value) => ({ kind: "lc", value })),
    stroke: [15, 30, 45, 60, 75].map((value) => ({ kind: "lc", value })),
    surface: [0.009, 0.036, 0.06, 0.084, 0.11].map((value) => ({ kind: "dL", value })),
  },
  dark: {
    // Large text in dark mode stays under Lc 90 (APCA dark-mode guidance).
    text: [45, 60, 75, 85, 90].map((value) => ({ kind: "lc", value })),
    // APCA reads light-on-dark solids lower than dark-on-light; Radix's dark
    // step 9 sits near Lc 38. Dark fills target lower so solids stay solid.
    fill: [15, 25, 35, 45, 60].map((value) => ({ kind: "lc", value })),
    stroke: [15, 30, 45, 60, 75].map((value) => ({ kind: "lc", value })),
    // Dark surfaces need larger lightness steps to read as separate. Levels
    // 2 and 3 are calibrated to shadcn's card (+0.067) and muted (+0.118).
    surface: [0.036, 0.067, 0.118, 0.15, 0.185].map((value) => ({ kind: "dL", value })),
  },
}

/** Floor for a true-to-brand solid: APCA's minimum for large solid non-text. */
export const SOLID_FLOOR = 30

/** Minimum Lc for a label on a filled control (16px/700 per APCA). */
export const ON_FILL_MIN = 60
export const ON_FILL_PREFERRED = 75

/** Per-role overrides of the threshold controls. Unset keys inherit global. */
export type RoleOverride = {
  ramps?: Partial<Record<Context, Ramp>>
  offsets?: Partial<{ text: number; fill: number; stroke: number }>
  surfaceScale?: number
}

/**
 * The dark-mode solid fill. Lift raises it to the large-solid floor
 * (Lc 30). Match keeps the light-mode color. Custom sets its lightness and
 * saturation directly, the way shadcn ships a deeper dark-mode primary.
 */
export type DarkSolid = { mode: "lift" | "match" | "custom"; l: number; s: number }

/**
 * Force accessibility. Parity with shadcn puts a few tokens under the spec;
 * each switch here lifts one area back into it, at the cost of looking less
 * like stock shadcn.
 */
export type A11y = {
  /** Field and control borders ≥ 3:1 (WCAG 1.4.11). shadcn's sit near 1.3:1. */
  inputBorders: boolean
  /** Muted and destructive text ≥ Lc 60 on card and muted (APCA body text). */
  secondaryText: boolean
  /** Dark-mode solids ≥ Lc 30 against the page (APCA large solid). */
  solids: boolean
  /** Focus ring ≥ 3:1 against the card once drawn at shadcn's 50%. */
  focusRing: boolean
}
export const A11Y_KEYS: (keyof A11y)[] = ["inputBorders", "secondaryText", "solids", "focusRing"]

export type Settings = {
  theme: string
  chart: string
  neutral: NeutralId
  themeTint: boolean
  tintStrength: number
  layer: "flat" | "alpha" | "ink"
  /** Surfaces every ink level must pass on. */
  inkGuards: ("page" | "card" | "muted" | "hover" | "selected")[]
  tighter: boolean
  advanced: boolean
  leashDeg: number
  tieBreak: "lowest-alpha" | "hue-fidelity"
  stateStrategy: "step" | "overlay"
  overlaySource: "brand" | "neutral"
  pressedMode: "stacked" | "from-rest"
  stateDelta: number
  secondarySource: "neutral-flat" | "neutral-alpha" | "role-tint"
  /** Neutral primary: a light gray fill with dark text, or a solid gray. */
  neutralPrimary: "light" | "solid"
  /** Solid fills (level 4) stay true to the named color down to an Lc 30 floor. */
  trueSolids: boolean
  categoricalCount: number
  /** Seed the chart palette from the theme color instead of the chart pick. */
  chartUseTheme: boolean
  familyPull: number
  offsets: { text: number; fill: number; stroke: number }
  ramps: Record<Context, Ramp>
  roleOverrides: Partial<Record<RoleId, RoleOverride>>
  darkSolid: DarkSolid
  surfaceScale: number
  holdSaturation: boolean
  chromaScale: number
  a11y: A11y
  /**
   * Where output-system targets come from. Reference reads the system's stock
   * theme through its own recipes (parity). Engine uses the engine's emphasis
   * levels for each element kind.
   */
  targetSource: "reference" | "engine"
  /** The downstream system the output is solved for. */
  output: string
  /** Imported themes per output system; when present, they replace the stock reference. */
  imports: Partial<Record<string, ImportedTheme>>
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "#2563eb",
  chart: "#06b6d4",
  neutral: "mauve",
  themeTint: true,
  tintStrength: 0.35,
  layer: "ink",
  inkGuards: ["page", "card", "muted", "hover", "selected"],
  tighter: false,
  advanced: false,
  leashDeg: 5,
  tieBreak: "lowest-alpha",
  stateStrategy: "step",
  overlaySource: "neutral",
  pressedMode: "stacked",
  stateDelta: 0.04,
  secondarySource: "neutral-flat",
  neutralPrimary: "light",
  trueSolids: true,
  categoricalCount: 8,
  chartUseTheme: false,
  familyPull: 0.5,
  offsets: { text: 0, fill: 0, stroke: 0 },
  ramps: { text: "stepped", fill: "stepped", stroke: "stepped", surface: "stepped" },
  roleOverrides: {},
  // Match keeps the picked color in dark mode, which is how shadcn ships it.
  darkSolid: { mode: "match", l: 0.42, s: 0.7 },
  surfaceScale: 1,
  holdSaturation: true,
  chromaScale: 1,
  a11y: { inputBorders: false, secondaryText: false, solids: false, focusRing: false },
  targetSource: "reference",
  output: "shadcn",
  imports: {},
}

/** Bounds per control. Basic clamps to the inner range; Advanced to outer. */
export const BOUNDS = {
  leashDeg: { basic: [2.5, 5], advanced: [2, 8] },
  offset: { basic: [-5, 5], advanced: [-15, 15] },
  surfaceScale: { basic: [0.8, 1.2], advanced: [0.5, 1.8] },
  chromaScale: { basic: [1, 1], advanced: [0.5, 1.3] },
  stateDelta: { basic: [0.03, 0.06], advanced: [0.01, 0.12] },
} as const

/** Settings as one role sees them: its overrides layered over global. */
export function withRole(s: Settings, role: RoleId): Settings {
  const o = s.roleOverrides?.[role]
  if (!o) return s
  return {
    ...s,
    ramps: { ...s.ramps, ...o.ramps },
    offsets: { ...s.offsets, ...o.offsets },
    surfaceScale: o.surfaceScale ?? s.surfaceScale,
  }
}

export function effectiveLeash(s: Settings): number {
  // An Advanced leash value persists in Basic as an override.
  if (s.advanced || s.leashDeg !== DEFAULT_SETTINGS.leashDeg) return s.leashDeg
  return s.tighter ? 2.5 : 5
}

/** Advanced-only values still in force; shown as a badge in Basic. */
export function advancedOverrides(s: Settings): string[] {
  const out: string[] = []
  const d = DEFAULT_SETTINGS
  if (s.leashDeg !== d.leashDeg) out.push(`Hue leash ±${s.leashDeg}°`)
  if (s.chromaScale !== d.chromaScale) out.push(`Chroma scale ${Math.round(s.chromaScale * 100)}%`)
  if (s.holdSaturation !== d.holdSaturation) out.push("Hold saturation off")
  if (s.tieBreak !== d.tieBreak) out.push("Alpha tie-break: closest to hue")
  if (s.familyPull !== d.familyPull) out.push(`Family pull ${Math.round(s.familyPull * 100)}%`)
  const [lo, hi] = BOUNDS.offset.basic
  for (const k of ["text", "fill", "stroke"] as const)
    if (s.offsets[k] < lo || s.offsets[k] > hi) out.push(`${k} offset ${s.offsets[k]} Lc`)
  const [slo, shi] = BOUNDS.surfaceScale.basic
  if (s.surfaceScale < slo || s.surfaceScale > shi) out.push(`Surface spacing ${Math.round(s.surfaceScale * 100)}%`)
  const [dlo, dhi] = BOUNDS.stateDelta.basic
  if (s.stateDelta < dlo || s.stateDelta > dhi) out.push(`State step ${s.stateDelta.toFixed(3)}`)
  if (!s.trueSolids) out.push("Solid fills contrast-solved")
  for (const [role, o] of Object.entries(s.roleOverrides ?? {})) {
    if (!o) continue
    const n =
      Object.keys(o.ramps ?? {}).length + Object.keys(o.offsets ?? {}).length + (o.surfaceScale !== undefined ? 1 : 0)
    if (n) out.push(`${role[0].toUpperCase()}${role.slice(1)}: ${n} threshold override${n === 1 ? "" : "s"}`)
  }
  if (s.tintStrength > 0.6) out.push(`Tint strength ${Math.round(s.tintStrength * 100)}%`)
  return out
}
