// Node-side color reading for the probe: parse what the browser reports,
// make sentinels, and trace painted colors back to variables.
import { hex, maxChroma, rgbToOklch, toRgb, type RGB } from "../../src/engine/color"
import { parseCss, type Expr } from "../../src/engine/profile"

export type Paint = { rgb: RGB; a: number }
export type Traced = Expr | { literal: string }
// rgb-csv: Bootstrap's "13, 110, 253" channel triplets, read through rgba(var(--x-rgb), a).
export type Format = "color" | "hsl-channels" | "rgb-channels" | "rgb-csv"

/** Computed colors as Chromium reports them. */
export function parseComputed(css: string): Paint | null {
  css = css.trim()
  let m = css.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/)
  if (m) return { rgb: [+m[1], +m[2], +m[3]], a: m[4] === undefined ? 1 : +m[4] }
  m = css.match(/^color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([\d.]+))?\)$/)
  if (m) return { rgb: [+m[1], +m[2], +m[3]].map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255)) as RGB, a: m[4] === undefined ? 1 : +m[4] }
  m = css.match(/^oklab\(([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([\d.]+))?\)$/)
  if (m) {
    const [l, A, B] = [+m[1], +m[2], +m[3]]
    return { rgb: toRgb({ l, c: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 }), a: m[4] === undefined ? 1 : +m[4] }
  }
  m = css.match(/^oklch\(([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([\d.]+))?\)$/)
  if (m) return { rgb: toRgb({ l: +m[1], c: +m[2], h: +m[3] }), a: m[4] === undefined ? 1 : +m[4] }
  return null
}

/** A variable's stock value, which may be bare channels (hsl or rgb) for systems that wrap them later. */
export function parseStock(value: string): (Paint & { format: Format }) | null {
  const v = value.trim()
  if (/^\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}$/.test(v)) {
    const [r, g, b] = v.split(/\s*,\s*/).map(Number)
    return { rgb: [r, g, b], a: 1, format: "rgb-csv" }
  }
  if (/^\d{1,3}\s+\d{1,3}\s+\d{1,3}$/.test(v)) {
    const [r, g, b] = v.split(/\s+/).map(Number)
    return { rgb: [r, g, b], a: 1, format: "rgb-channels" }
  }
  if (/^[\d.]+(deg)?\s+[\d.]+%\s+[\d.]+%$/.test(v)) {
    const p = parseCss(v)
    return { ...p, format: "hsl-channels" }
  }
  if (/^(transparent|currentcolor|inherit|initial|unset|none)$/i.test(v)) return null
  try {
    const p = parseCss(v)
    return { ...p, format: "color" }
  } catch {
    const c = parseComputed(v)
    return c ? { ...c, format: "color" } : null
  }
}

function rgbToHsl([r, g, b]: RGB) {
  const [R, G, B] = [r / 255, g / 255, b / 255]
  const max = Math.max(R, G, B)
  const min = Math.min(R, G, B)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l * 100]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === R ? (G - B) / d + (G < B ? 6 : 0) : max === G ? (B - R) / d + 2 : (R - G) / d + 4
  return [h * 60, s * 100, l * 100]
}

/** Write a color in a variable's own format. */
export function formatAs(format: Format, rgb: RGB): string {
  if (format === "rgb-channels") return `${rgb[0]} ${rgb[1]} ${rgb[2]}`
  if (format === "rgb-csv") return `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`
  if (format === "hsl-channels") {
    const [h, s, l] = rgbToHsl(rgb)
    return `${+h.toFixed(1)} ${+s.toFixed(1)}% ${+l.toFixed(1)}%`
  }
  return hex(rgb)
}

/**
 * Distinct, in-gamut sentinel colors: lightness bands with hues spaced evenly
 * inside each band. More variables get more bands, so neighbors stay far
 * enough apart that an exact match is unambiguous.
 */
export function sentinels(keys: string[]): Map<string, RGB> {
  const out = new Map<string, RGB>()
  const nb = Math.max(4, Math.min(8, Math.ceil(keys.length / 40)))
  const bands = Array.from({ length: nb }, (_, i) => 0.36 + (0.5 * i) / (nb - 1))
  const perBand = Math.ceil(keys.length / nb)
  keys.forEach((k, i) => {
    const band = i % nb
    const slot = Math.floor(i / nb)
    const h = (slot * (360 / perBand) + band * (360 / perBand / nb)) % 360
    const l = bands[band]
    out.set(k, toRgb({ l, c: Math.min(0.13, maxChroma(l, h) * 0.9), h }))
  })
  return out
}

const dist = (a: RGB, b: RGB) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]))

function mixOklch(a: RGB, b: RGB, k: number): RGB {
  const oa = rgbToOklch(a)
  const ob = rgbToOklch(b)
  let d = ob.h - oa.h
  if (d > 180) d -= 360
  if (d < -180) d += 360
  return toRgb({ l: oa.l + (ob.l - oa.l) * k, c: oa.c + (ob.c - oa.c) * k, h: (oa.h + d * k + 360) % 360 })
}

/** Trace a painted color back to the expression that made it. */
export function trace(p: Paint, sent: Map<string, RGB>): Traced {
  const round = (a: number) => Math.round(a * 1000) / 1000
  let best: [string, number] | null = null
  for (const [n, rgb] of sent) {
    const d = dist(rgb, p.rgb)
    if (!best || d < best[1]) best = [n, d]
  }
  if (best && best[1] <= 1) return p.a < 0.999 ? { alpha: { v: best[0] }, k: round(p.a) } : { v: best[0] }
  // A blend of two variables: try every pair, solving the mix amount on lightness.
  if (p.a >= 0.999 && sent.size <= 160) {
    const L = rgbToOklch(p.rgb).l
    let pick: { a: string; b: string; k: number; d: number } | null = null
    for (const [na, ra] of sent)
      for (const [nb, rb] of sent) {
        if (na === nb) continue
        const la = rgbToOklch(ra).l
        const lb = rgbToOklch(rb).l
        if (Math.abs(lb - la) < 0.02) continue
        const k = (L - la) / (lb - la)
        if (k <= 0.005 || k >= 0.5) continue
        const d = dist(mixOklch(ra, rb, k), p.rgb)
        if (d <= 2 && (!pick || d < pick.d)) {
          const k2 = Math.round(k * 100) / 100
          pick = dist(mixOklch(ra, rb, k2), p.rgb) <= 3 ? { a: na, b: nb, k: k2, d } : { a: na, b: nb, k: round(k), d }
        }
      }
    if (pick) return { mix: [{ v: pick.a }, { v: pick.b }], k: pick.k, space: "oklch" }
  }
  return { literal: p.a < 0.999 ? `${hex(p.rgb)}@${round(p.a)}` : hex(p.rgb) }
}

export const key = (e: Traced): string =>
  "literal" in e ? e.literal : "v" in e ? e.v : "alpha" in e ? `${key(e.alpha)}/${e.k}` : `mix(${key(e.mix[0])},${key(e.mix[1])},${e.k})`

/** The opaque stack under an element, bottom to top. */
export function stack(colors: string[], sent: Map<string, RGB>): Traced[] {
  const out: Traced[] = []
  for (const c of colors) {
    const p = parseComputed(c)
    if (!p || p.a <= 0.001) continue
    out.unshift(trace(p, sent))
    if (p.a >= 0.999) break
  }
  return out
}
