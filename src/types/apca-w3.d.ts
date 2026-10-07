// Minimal typings for the unmodified apca-w3 package (0.1.9).
// Only the functions the engine calls are declared.
declare module "apca-w3" {
  /** Lc for text luminance against background luminance. Positive = dark on light. */
  export function APCAcontrast(txtY: number, bgY: number, places?: number): number
  /** Screen luminance (Ys) from 8-bit sRGB channels, 0–255. */
  export function sRGBtoY(rgb: [number, number, number]): number
}
