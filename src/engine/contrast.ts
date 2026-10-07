// Contrast metrics. APCA comes from the unmodified apca-w3 package; its
// constants are not ours to tune (license: no alteration). WCAG 2 ratio is
// always computed alongside. OKLCH ΔL covers differences APCA clamps to 0.
import { APCAcontrast, sRGBtoY } from "apca-w3"
import { rgbToOklch, type RGB } from "./color"

/** Signed APCA Lc. Positive: darker element on lighter background. */
export function lc(fg: RGB, bg: RGB): number {
  return APCAcontrast(sRGBtoY(fg), sRGBtoY(bg)) as number
}

function relLum([r, g, b]: RGB) {
  const f = (v: number) => {
    const x = v / 255
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

/** WCAG 2.x contrast ratio, shown as a secondary column. */
export function wcagRatio(a: RGB, b: RGB): number {
  const la = relLum(a)
  const lb = relLum(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** OKLCH lightness difference, for sub-clamp surfaces and state deltas. */
export function deltaL(a: RGB, b: RGB): number {
  return Math.abs(rgbToOklch(a).l - rgbToOklch(b).l)
}
