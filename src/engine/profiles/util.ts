// Helpers for writing profiles.
import { parseHex } from "../color"
import type { Expr } from "../profile"

export const v = (name: string): Expr => ({ v: name })
export const a = (name: string, k: number): Expr => ({ alpha: v(name), k })

/**
 * The translucent form of a solid swatch over a background: the lowest alpha
 * whose ink, composited over the background, lands exactly on the swatch.
 * Radix derives its alpha scales the same way.
 */
export function alphaOver(solidHex: string, bgHex: string): string {
  const s = parseHex(solidHex)!
  const b = parseHex(bgHex)!
  let alpha = 0
  for (let i = 0; i < 3; i++) {
    const d = s[i] - b[i]
    const need = d > 0 ? d / (255 - b[i] || 1) : d < 0 ? -d / (b[i] || 1) : 0
    alpha = Math.max(alpha, need)
  }
  alpha = Math.min(1, Math.max(alpha, 1e-3))
  const ink = s.map((c, i) => Math.round(Math.min(255, Math.max(0, b[i] + (c - b[i]) / alpha))))
  return `rgba(${ink[0]}, ${ink[1]}, ${ink[2]}, ${+alpha.toFixed(4)})`
}
