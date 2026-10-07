// Color math. All solving happens in OKLCH; everything is converted to
// 8-bit sRGB at the edge, because that is what a browser paints and what
// APCA measures.

export type Oklch = { l: number; c: number; h: number }
/** 8-bit sRGB channels, 0–255, always integers once quantized. */
export type RGB = [number, number, number]

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

// --- OKLab <-> linear sRGB (Björn Ottosson's matrices) -------------------

function oklabToLinear(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

function linearToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

const toGamma = (x: number) =>
  x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055
const toLinear = (x: number) =>
  x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)

const rad = (d: number) => (d * Math.PI) / 180

/** OKLCH -> gamma sRGB in 0–1, unclamped (may be out of gamut). */
export function oklchToSrgb01({ l, c, h }: Oklch): [number, number, number] {
  const [r, g, b] = oklabToLinear(l, c * Math.cos(rad(h)), c * Math.sin(rad(h)))
  return [toGamma(r), toGamma(g), toGamma(b)]
}

export function srgb01ToOklch([r, g, b]: [number, number, number]): Oklch {
  const [L, A, B] = linearToOklab(toLinear(r), toLinear(g), toLinear(b))
  const c = Math.hypot(A, B)
  let h = (Math.atan2(B, A) * 180) / Math.PI
  if (h < 0) h += 360
  return { l: L, c, h: c < 1e-4 ? 0 : h }
}

export function rgbToOklch(rgb: RGB): Oklch {
  return srgb01ToOklch([rgb[0] / 255, rgb[1] / 255, rgb[2] / 255])
}

const EPS = 0.0005
function inGamut([r, g, b]: [number, number, number]) {
  return r >= -EPS && r <= 1 + EPS && g >= -EPS && g <= 1 + EPS && b >= -EPS && b <= 1 + EPS
}

// Max chroma at a given lightness and hue, cached. Gamut mapping only ever
// reduces chroma; hue is never rotated to fit (doc: Non-functional, Gamut).
const maxChromaCache = new Map<string, number>()
export function maxChroma(l: number, h: number): number {
  const key = `${l.toFixed(3)}|${h.toFixed(1)}`
  const hit = maxChromaCache.get(key)
  if (hit !== undefined) return hit
  let lo = 0
  let hi = 0.4
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2
    if (inGamut(oklchToSrgb01({ l, c: mid, h }))) lo = mid
    else hi = mid
  }
  maxChromaCache.set(key, lo)
  return lo
}

export function gamutMap(color: Oklch): Oklch {
  const l = clamp01(color.l)
  const c = Math.min(color.c, maxChroma(l, color.h))
  return { l, c, h: color.h }
}

/** OKLCH -> quantized 8-bit sRGB, gamut-mapped by chroma reduction. */
export function toRgb(color: Oklch): RGB {
  const [r, g, b] = oklchToSrgb01(gamutMap(color))
  return [Math.round(clamp01(r) * 255), Math.round(clamp01(g) * 255), Math.round(clamp01(b) * 255)]
}

export function hex(rgb: RGB): string {
  return "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("")
}

export function parseHex(input: string): RGB | null {
  const m = input.trim().replace(/^#/, "")
  const full = m.length === 3 ? m.split("").map((x) => x + x).join("") : m
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as RGB
}

/** CSS `oklch()` string for a displayed color (rounded for readability). */
export function oklchCss({ l, c, h }: Oklch, alpha = 1): string {
  const base = `${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h.toFixed(1)}`
  return alpha < 1 ? `oklch(${base} / ${Math.round(alpha * 100)}%)` : `oklch(${base})`
}

export function rgbaCss(rgb: RGB, alpha: number): string {
  return alpha >= 1 ? hex(rgb) : `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / ${Math.round(alpha * 100)}%)`
}

/**
 * Browser compositing: source-over in gamma-encoded sRGB, per channel,
 * quantized to 8 bits. This is what actually reaches the screen, so the
 * alpha solve has to aim at this, not at linear light.
 */
export function composite(tint: RGB, alpha: number, bg: RGB): RGB {
  return [0, 1, 2].map((i) => Math.round(alpha * tint[i] + (1 - alpha) * bg[i])) as RGB
}

/** Smallest signed difference between two hues, in degrees (-180..180]. */
export function hueDelta(a: number, b: number): number {
  let d = (((a - b) % 360) + 360) % 360
  if (d > 180) d -= 360
  return d
}

/** Rotate hue `from` toward `to` by at most `maxDeg`. */
export function hueToward(from: number, to: number, maxDeg: number): number {
  const d = hueDelta(to, from)
  const step = Math.sign(d) * Math.min(Math.abs(d), maxDeg)
  return (from + step + 360) % 360
}

/** OKLab Euclidean distance (ΔE OK), used for categorical spacing. */
export function deltaE(a: Oklch, b: Oklch): number {
  const ax = a.c * Math.cos(rad(a.h))
  const ay = a.c * Math.sin(rad(a.h))
  const bx = b.c * Math.cos(rad(b.h))
  const by = b.c * Math.sin(rad(b.h))
  return Math.hypot(a.l - b.l, ax - bx, ay - by)
}
