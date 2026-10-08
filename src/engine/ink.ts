// The ink model. Surfaces and solid fills stay flat (Radix-style steps).
// Everything that sits on top of them — text, icons, strokes, soft fills,
// state overlays — is an ink at an alpha, the way Material 1 did text.
//
// The difference from Material 1: each alpha is solved against a guard set
// of surfaces, not one. An ink level gets the smallest alpha that clears its
// target on every guard surface, so it stays inside the APCA spec wherever
// it lands within that set, and it compounds naturally over whatever is
// underneath because the browser does the compositing.
import { composite, hex, rgbaCss, rgbToOklch, toRgb, maxChroma, type RGB } from "./color"
import { deltaL, lc } from "./contrast"
import type { Mode, Target } from "./settings"

export type GuardId = "page" | "card" | "muted" | "hover" | "selected"
export const GUARD_IDS: GuardId[] = ["page", "card", "muted", "hover", "selected"]
export const GUARD_LABELS: Record<GuardId, string> = {
  page: "Page",
  card: "Card",
  muted: "Muted",
  hover: "Hover",
  selected: "Selected",
}

export type Guard = { id: GuardId; label: string; rgb: RGB }

export type InkCheck = {
  guard: GuardId
  label: string
  surface: RGB
  visible: RGB
  achieved: number
  met: boolean
  /** The target is beyond what this ink can reach on this surface at full strength. */
  capped: boolean
}

export type InkResult = {
  ink: RGB
  alpha: number
  css: string
  /** Per-guard outcome: what the ink actually reaches on each surface. */
  checks: InkCheck[]
  /** The weakest result across guards — the number the guarantee rests on. */
  minAchieved: number
  met: boolean
}

const measure = (t: Target, fg: RGB, bg: RGB) => (t.kind === "lc" ? Math.abs(lc(fg, bg)) : deltaL(fg, bg))

/** Smallest alpha of `ink` over `bg` that reaches `target`, or null if alpha 1 can't. */
function alphaFor(ink: RGB, bg: RGB, target: Target): number | null {
  if (measure(target, composite(ink, 1, bg), bg) < target.value) return null
  let lo = 0
  let hi = 1
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2
    if (measure(target, composite(ink, mid, bg), bg) >= target.value) hi = mid
    else lo = mid
  }
  return hi
}

/**
 * Solve one ink level across guards: the alpha is the largest of the
 * per-guard minimums, rounded up to 1%. A guard the ink can't satisfy even
 * at full strength is reported, not hidden.
 */
export function solveInk(ink: RGB, guards: Guard[], target: Target): InkResult {
  let alpha = 0
  for (const g of guards) {
    const a = alphaFor(ink, g.rgb, target)
    alpha = Math.max(alpha, a ?? 1)
  }
  alpha = Math.min(1, Math.ceil(alpha * 100 - 1e-9) / 100)
  const checks = guards.map((g): InkCheck => {
    const visible = composite(ink, alpha, g.rgb)
    const achieved = measure(target, visible, g.rgb)
    const ceiling = measure(target, ink, g.rgb)
    const capped = ceiling < target.value - 0.05
    // A capped surface passes when the ink is already at full strength:
    // nothing could do better there.
    const met = achieved >= target.value - 0.05 || (capped && alpha >= 1)
    return { guard: g.id, label: g.label, surface: g.rgb, visible, achieved, met, capped }
  })
  const minAchieved = Math.min(...checks.map((c) => c.achieved))
  return { ink, alpha, css: rgbaCss(ink, alpha), checks, minAchieved, met: checks.every((c) => c.met) }
}

/** Distinct guards only: card and page are often the same color in light mode. */
export function dedupeGuards(guards: Guard[]): Guard[] {
  const seen = new Map<string, Guard>()
  for (const g of guards) {
    const k = hex(g.rgb)
    if (!seen.has(k)) seen.set(k, g)
  }
  return [...seen.values()]
}

/**
 * Ink colors. Neutral ink is a near-black or near-white carrying a trace of
 * the neutral's hue, like Material's black and white inks. Role inks are the
 * role's hue at a deep (light mode) or pale (dark mode) lightness, holding
 * as much saturation as the gamut allows there, so lower alphas read as the
 * role's color, not as gray.
 */
export function inkFor(mode: Mode, hue: number, chroma: number, neutral: boolean): RGB {
  if (neutral) {
    // Deep enough that full strength clears Lc 90 on the darkest guard.
    const l = mode === "light" ? 0.06 : 0.995
    return toRgb({ l, c: Math.min(chroma, 0.015), h: hue })
  }
  const l = mode === "light" ? 0.24 : 0.95
  return toRgb({ l, c: maxChroma(l, hue) * 0.95, h: hue })
}

/** A state overlay alpha that moves every guard surface by at least `delta` lightness. */
export function solveOverlayAlpha(ink: RGB, guards: Guard[], delta: number): InkResult {
  return solveInk(ink, guards, { kind: "dL", value: delta })
}

/** Lightness of a color, for ordering guards. */
export const lightness = (rgb: RGB) => rgbToOklch(rgb).l
