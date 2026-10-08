// The solver. Flat finds the lightness that lands a target; Alpha finds a
// live translucent ink whose composite lands the same target. The ink is
// never baked down: tint + alpha are what ship.
import {
  composite,
  hueDelta,
  maxChroma,
  rgbToOklch,
  toRgb,
  type Oklch,
  type RGB,
} from "./color"
import { deltaL, lc } from "./contrast"

export type Metric = { kind: "lc"; value: number } | { kind: "dL"; value: number }
export type Direction = "darker" | "lighter"

export type ChromaRule = {
  hue: number
  /** Chroma of the named color the role is anchored to. */
  baseChroma: number
  /** Lightness of the named color, for hold-saturation ratios. */
  baseL: number
  /** Context multiplier: text, stroke, surface run quieter than fills. */
  factor: number
  /** Hold saturation: chroma follows lightness as a share of gamut max. */
  holdSaturation: boolean
}

export function chromaAt(rule: ChromaRule, l: number): number {
  const max = maxChroma(l, rule.hue)
  if (rule.holdSaturation) {
    // Saturation is chroma relative to lightness (C ÷ L). Holding it means a
    // deep navy lifted to button lightness comes out a vivid blue, the way
    // people read it, rather than the gray-blue absolute chroma would give.
    // Never drops below the gamut-relative share or the absolute chroma.
    const rel = Math.min(1, rule.baseChroma / Math.max(1e-4, maxChroma(rule.baseL, rule.hue)))
    const sat = rule.baseChroma / Math.max(0.05, rule.baseL)
    const held = Math.max(rel * max, sat * l, Math.min(rule.baseChroma, max))
    return Math.min(max, held) * rule.factor
  }
  return Math.min(rule.baseChroma * rule.factor, max)
}

export function measure(metric: Metric, fg: RGB, bg: RGB): number {
  return metric.kind === "lc" ? Math.abs(lc(fg, bg)) : deltaL(fg, bg)
}

export type FlatResult = {
  color: Oklch
  rgb: RGB
  achieved: number
  met: boolean
}

/**
 * Flat solve: move lightness away from the background until the metric
 * reaches its target. Hue is fixed; chroma follows the rule and is cut to
 * gamut, never rotated.
 */
export function solveFlat(
  rule: ChromaRule,
  bg: RGB,
  metric: Metric,
  direction: Direction
): FlatResult {
  const bgL = rgbToOklch(bg).l
  const end = direction === "darker" ? 0 : 1
  const at = (l: number): FlatResult => {
    const color = { l, c: chromaAt(rule, l), h: rule.hue }
    const rgb = toRgb(color)
    const achieved = measure(metric, rgb, bg)
    return { color, rgb, achieved, met: achieved >= metric.value - 0.05 }
  }

  const far = at(end)
  if (far.achieved < metric.value) return { ...far, met: false }

  // Binary search for the smallest step away from the background that
  // clears the target. Metric is monotonic in L for a fixed hue.
  let near = bgL
  let farL = end
  for (let i = 0; i < 26; i++) {
    const mid = (near + farL) / 2
    if (at(mid).achieved >= metric.value) farL = mid
    else near = mid
  }
  return at(farL)
}

export type AlphaResult = {
  /** The tint that ships, 8-bit. */
  tint: RGB
  /** Alpha that ships, rounded up to 1%. */
  alpha: number
  /** What the viewer sees over the assumed background. */
  composite: RGB
  achieved: number
  met: boolean
  method: "lowest-alpha" | "hue-fidelity" | "hue-fidelity→lowest-alpha"
}

function leashOk(tint: RGB, hue: number, leashDeg: number): boolean {
  const t = rgbToOklch(tint)
  // Chroma-weighted leash: a hue degree is invisible without chroma to
  // carry it, so the allowance widens as chroma falls.
  if (t.c < 0.03) return true
  const allowed = leashDeg * Math.max(1, 0.08 / t.c)
  return Math.abs(hueDelta(t.h, hue)) <= allowed
}

/**
 * Lowest-alpha solve. The composite we want (F) is fixed by the flat solve.
 * Every tint on the ray from the background through F composites to F at
 * alpha = 1/t. Pushing t to the sRGB cube edge gives the smallest alpha;
 * the hue leash may pull it back.
 */
function lowestAlpha(target: RGB, bg: RGB, hue: number, leashDeg: number) {
  const d = [0, 1, 2].map((i) => target[i] - bg[i])
  let tMax = Infinity
  for (let i = 0; i < 3; i++) {
    if (d[i] > 0.5) tMax = Math.min(tMax, (255 - bg[i]) / d[i])
    else if (d[i] < -0.5) tMax = Math.min(tMax, bg[i] / -d[i])
  }
  if (!isFinite(tMax)) tMax = 1
  const tintAt = (t: number) =>
    [0, 1, 2].map((i) => Math.min(255, Math.max(0, Math.round(bg[i] + t * d[i])))) as RGB

  let t = tMax
  if (!leashOk(tintAt(t), hue, leashDeg)) {
    let lo = 1
    let hi = tMax
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2
      if (leashOk(tintAt(mid), hue, leashDeg)) lo = mid
      else hi = mid
    }
    t = lo
  }
  // Round alpha UP to 1%, then re-derive the tint so the composite still
  // lands on target. Rounding to a comfortable number is not allowed.
  const alpha = Math.min(1, Math.ceil((1 / t) * 100) / 100)
  const tint = [0, 1, 2].map((i) =>
    Math.min(255, Math.max(0, Math.round(bg[i] + d[i] / alpha)))
  ) as RGB
  return { tint, alpha }
}

export function solveAlpha(opts: {
  flat: FlatResult
  bg: RGB
  metric: Metric
  hue: number
  leashDeg: number
  tieBreak: "lowest-alpha" | "hue-fidelity"
  /** The role's named color, used as the tint under hue-fidelity. */
  named: RGB
}): AlphaResult {
  const { flat, bg, metric, hue, leashDeg, tieBreak, named } = opts
  const finish = (tint: RGB, alpha: number, method: AlphaResult["method"]): AlphaResult => {
    const comp = composite(tint, alpha, bg)
    const achieved = measure(metric, comp, bg)
    return { tint, alpha, composite: comp, achieved, met: achieved >= metric.value - 0.05, method }
  }

  if (tieBreak === "hue-fidelity") {
    // Keep the named color as the tint and search alpha alone.
    const full = finish(named, 1, "hue-fidelity")
    const sameSide = Math.sign(lc(named, bg)) === Math.sign(lc(flat.rgb, bg))
    if (full.achieved >= metric.value && sameSide) {
      let lo = 0
      let hi = 1
      for (let i = 0; i < 20; i++) {
        const mid = (lo + hi) / 2
        if (measure(metric, composite(named, mid, bg), bg) >= metric.value) hi = mid
        else lo = mid
      }
      return finish(named, Math.min(1, Math.ceil(hi * 100) / 100), "hue-fidelity")
    }
    // Named color can't reach: fall back to moving the tint (doc fallback 1–3).
    const r = lowestAlpha(flat.rgb, bg, hue, leashDeg)
    return finish(r.tint, r.alpha, "hue-fidelity→lowest-alpha")
  }

  const r = lowestAlpha(flat.rgb, bg, hue, leashDeg)
  return finish(r.tint, r.alpha, "lowest-alpha")
}

/**
 * Overlay state layer: find the alpha of `ink` over `base` that moves the
 * visible color by `delta` in OKLCH lightness.
 */
export function solveOverlay(ink: RGB, base: RGB, delta: number) {
  let lo = 0
  let hi = 1
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    if (deltaL(composite(ink, mid, base), base) >= delta) hi = mid
    else lo = mid
  }
  const alpha = Math.min(1, Math.ceil(hi * 100) / 100)
  const comp = composite(ink, alpha, base)
  return { alpha, composite: comp, achieved: deltaL(comp, base), met: deltaL(comp, base) >= delta - 0.002 }
}
