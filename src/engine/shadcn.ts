// The shadcn component tier. shadcn's variables are jobs, not emphasis
// levels: each one has its own target, measured against the surface it sits
// on. This module solves every variable against that target from the
// engine's roles and surfaces, so a themed app reads like stock shadcn.
//
// Two rules make it line up with shadcn's own components:
// 1. Variables the components modify with opacity (bg-input/30,
//    hover:bg-primary/80, bg-muted/50) ship opaque, so the components' own
//    modifiers are the overlay layer and nothing compounds twice.
// 2. Separators and field borders are lightness steps, not APCA levels.
//    shadcn draws them below Lc 15; APCA can't see them, ΔL can.
//
// Where parity drops under a spec, the tier says so, and a Force
// accessibility switch lifts that one area back in.
import { composite, hex, rgbToOklch, rgbaCss, type RGB } from "./color"
import { deltaL, lc, wcagRatio } from "./contrast"
import { inkFor } from "./ink"
import type { A11y, Mode } from "./settings"
import { solveFlat, type ChromaRule, type Direction } from "./solve"
import { tokenId, type System } from "./system"

export type SpecCheck = {
  /** What the spec asks, in words: "3:1 (WCAG 1.4.11)". */
  rule: string
  achieved: string
  pass: boolean
  /** The switch that lifts this area into spec. */
  a11y: keyof A11y
}

export type TierVar = {
  name: string
  css: string
  /** What it looks like on its parent surface. */
  rgb: RGB
  parent: string | null
  /** The job, in words, and the measured result on the parent. */
  target: string
  lc: number
  dL: number
  spec?: SpecCheck
}

export type Tier = Record<string, TierVar>

/** Parity targets, measured from the b1sABueby preset. Lightness steps are signed away from the parent. */
const PARITY = {
  light: {
    secondary: 0.033,
    sidebar: 0.015,
    border: 0.078,
    input: 0.078,
    ring: 0.289,
    foreground: 0.855,
    mutedText: 75,
    destructiveText: 0, // light destructive is the solid itself
  },
  dark: {
    secondary: 0.062,
    sidebar: 0,
    border: 0.096,
    input: 0.141,
    ring: 0.33,
    foreground: 0.84,
    mutedText: 50,
    destructiveText: 47,
  },
} as const

const TEXT_MIN = 60
const NON_TEXT_RATIO = 3
/** shadcn draws its focus ring at ring-ring/50. */
const RING_ALPHA = 0.5

export function buildTier(sys: System, mode: Mode): Tier {
  const s = sys.settings
  const a11y = s.a11y
  const ms = sys.modes[mode]
  const P = PARITY[mode]
  const away: Direction = mode === "light" ? "darker" : "lighter"
  const nRole = sys.roles.neutral
  const neutral = (factor = 1): ChromaRule => ({
    hue: nRole.named.h,
    baseChroma: nRole.named.c,
    baseL: nRole.named.l,
    factor,
    holdSaturation: false,
  })
  const flat = (id: string) => ms.tokens[id].flat.rgb
  const out: Tier = {}
  const put = (name: string, rgb: RGB, parent: RGB | null, parentName: string | null, target: string, css = hex(rgb), spec?: SpecCheck) => {
    out[name] = {
      name,
      css,
      rgb,
      parent: parentName,
      target,
      lc: parent ? Math.abs(lc(rgb, parent)) : 0,
      dL: parent ? deltaL(rgb, parent) : 0,
      spec,
    }
  }

  // Surfaces.
  const page = ms.bg
  const card = mode === "light" ? page : flat("neutral.surface.2")
  const muted = mode === "light" ? flat("neutral.surface.2") : flat("neutral.surface.3")
  const step = (from: RGB, dL: number) => (dL <= 0 ? from : solveFlat(neutral(), from, { kind: "dL", value: dL }, away).rgb)
  put("--background", page, null, null, "page")
  put("--card", card, page, "--background", mode === "light" ? "same as page" : "surface 2")
  put("--popover", card, page, "--background", "same as card")
  put("--muted", muted, card, "--card", mode === "light" ? "surface 2" : "surface 3")
  put("--accent", muted, card, "--card", "same as muted")
  put("--secondary", step(card, P.secondary), card, "--card", `ΔL ${P.secondary.toFixed(3)} from card`)
  put("--sidebar", mode === "light" ? step(page, P.sidebar) : card, page, "--background", mode === "light" ? `ΔL ${P.sidebar} from page` : "same as card")

  // Text. Foreground runs to the top of the range, like Radix step 12.
  // Placed by lightness: APCA flattens out near black, so an Lc target
  // can't tell L 0.11 from 0.15.
  const fg = solveFlat(neutral(0.6), page, { kind: "dL", value: P.foreground }, away).rgb
  for (const n of ["--foreground", "--card-foreground", "--popover-foreground", "--accent-foreground", "--secondary-foreground", "--sidebar-foreground", "--sidebar-accent-foreground"])
    put(n, fg, n === "--foreground" || n === "--sidebar-foreground" ? page : card, n === "--foreground" || n === "--sidebar-foreground" ? "--background" : "--card", "maximal")

  // Muted text: parity solves on the card; forced accessibility guarantees
  // Lc 60 on the weakest surface it lands on (muted in dark, card in light).
  const worstText = (rgb: RGB) => Math.min(Math.abs(lc(rgb, card)), Math.abs(lc(rgb, muted)))
  let mutedFg = solveFlat(neutral(), card, { kind: "lc", value: P.mutedText }, away).rgb
  if (a11y.secondaryText && worstText(mutedFg) < TEXT_MIN) {
    const weakest = Math.abs(lc(mutedFg, muted)) < Math.abs(lc(mutedFg, card)) ? muted : card
    mutedFg = solveFlat(neutral(), weakest, { kind: "lc", value: TEXT_MIN }, away).rgb
  }
  put("--muted-foreground", mutedFg, card, "--card", `Lc ${a11y.secondaryText ? Math.max(P.mutedText, TEXT_MIN) : P.mutedText} on card`, hex(mutedFg), {
    rule: `Lc ${TEXT_MIN} on card and muted (APCA body text)`,
    achieved: `Lc ${Math.round(worstText(mutedFg))}`,
    pass: worstText(mutedFg) >= TEXT_MIN - 0.5,
    a11y: "secondaryText",
  })

  // Solids.
  const primary = flat(tokenId("brand", "fill", 4))
  put("--primary", primary, card, "--card", "brand solid")
  put("--primary-foreground", ms.onFill["brand.fill.4"].rgb, primary, "--primary", "maximal on primary")
  put("--sidebar-primary", primary, card, "--card", "brand solid")
  put("--sidebar-primary-foreground", ms.onFill["brand.fill.4"].rgb, primary, "--primary", "maximal on primary")

  // Destructive doubles as text (text-destructive, the soft destructive
  // button's label), so dark mode lifts it into a readable red, as shadcn does.
  const danger = sys.roles.danger
  const dangerRule: ChromaRule = { hue: danger.named.h, baseChroma: danger.named.c, baseL: danger.named.l, factor: 1, holdSaturation: true }
  let destructive = P.destructiveText
    ? solveFlat(dangerRule, card, { kind: "lc", value: P.destructiveText }, away).rgb
    : flat(tokenId("danger", "fill", 4))
  if (a11y.secondaryText && worstText(destructive) < TEXT_MIN) {
    destructive = solveFlat(dangerRule, mode === "dark" ? muted : card, { kind: "lc", value: TEXT_MIN }, away).rgb
  }
  put("--destructive", destructive, card, "--card", P.destructiveText ? `Lc ${P.destructiveText} on card` : "danger solid", hex(destructive), {
    rule: `Lc ${TEXT_MIN} as text on card and muted`,
    achieved: `Lc ${Math.round(worstText(destructive))}`,
    pass: worstText(destructive) >= TEXT_MIN - 0.5,
    a11y: "secondaryText",
  })

  // Separators and field borders: neutral ink stepped by lightness. Ink and
  // Alpha layers ship them translucent (shadcn's dark border is white at
  // 10%); Flat ships them opaque.
  const ink = inkFor(mode, nRole.named.h, nRole.named.c, true)
  const translucent = s.layer !== "flat"
  const edge = (dL: number, on: RGB) => {
    const opaque = solveFlat(neutral(), on, { kind: "dL", value: dL }, away)
    if (!translucent) return { rgb: opaque.rgb, css: hex(opaque.rgb) }
    let lo = 0
    let hi = 1
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2
      if (deltaL(composite(ink, mid, on), on) >= dL) hi = mid
      else lo = mid
    }
    const a = Math.ceil(hi * 100) / 100
    return { rgb: composite(ink, a, on), css: rgbaCss(ink, a) }
  }
  const border = edge(P.border, card)
  put("--border", border.rgb, card, "--card", `ΔL ${P.border.toFixed(3)} from card (decorative)`, border.css)
  put("--sidebar-border", border.rgb, card, "--card", "same as border", border.css)

  // Field borders: a control boundary, so WCAG 1.4.11 asks 3:1 on whatever
  // the field sits on. Forced, the step grows until page and card both pass.
  let input = edge(P.input, card)
  const inputRatio = (rgb: RGB) => Math.min(wcagRatio(rgb, card), wcagRatio(rgb, page))
  if (a11y.inputBorders && inputRatio(input.rgb) < NON_TEXT_RATIO) {
    let lo: number = P.input
    let hi = 0.9
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2
      if (inputRatio(edge(mid, card).rgb) >= NON_TEXT_RATIO) hi = mid
      else lo = mid
    }
    input = edge(hi, card)
  }
  const ir = inputRatio(input.rgb)
  put("--input", input.rgb, card, "--card", a11y.inputBorders ? "3:1 on page and card" : `ΔL ${P.input.toFixed(3)} from card`, input.css, {
    rule: "3:1 against the surface (WCAG 1.4.11)",
    achieved: `${ir.toFixed(2)}:1`,
    pass: ir >= NON_TEXT_RATIO - 0.005,
    a11y: "inputBorders",
  })

  // Focus ring: neutral, drawn by the components at 50%. Forced, the ring
  // is chosen so its 50% composite clears 3:1 on the card.
  let ring = solveFlat(neutral(), card, { kind: "dL", value: P.ring }, away).rgb
  const ringRatio = (rgb: RGB) => wcagRatio(composite(rgb, RING_ALPHA, card), card)
  if (a11y.focusRing && ringRatio(ring) < NON_TEXT_RATIO) {
    let lo: number = P.ring
    let hi = 1
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2
      if (ringRatio(solveFlat(neutral(), card, { kind: "dL", value: mid }, away).rgb) >= NON_TEXT_RATIO) hi = mid
      else lo = mid
    }
    // Neutral can top out short of 3:1 at half strength; the check reports it.
    ring = solveFlat(neutral(), card, { kind: "dL", value: hi }, away).rgb
  }
  const rr = ringRatio(ring)
  put("--ring", ring, card, "--card", a11y.focusRing ? "3:1 at 50% on card" : `ΔL ${P.ring.toFixed(3)} from card`, hex(ring), {
    rule: "3:1 at shadcn's 50% ring (WCAG 1.4.11)",
    achieved: `${rr.toFixed(2)}:1`,
    pass: rr >= NON_TEXT_RATIO - 0.005,
    a11y: "focusRing",
  })
  put("--sidebar-ring", ring, card, "--card", "same as ring")
  put("--sidebar-accent", muted, card, "--card", "same as accent")

  // Dark solids against the page: APCA's large-solid floor.
  const solidLc = Math.abs(lc(primary, page))
  if (mode === "dark") out["--primary"].spec = {
    rule: "Lc 30 against the page (APCA large solid)",
    achieved: `Lc ${Math.round(solidLc)}`,
    pass: solidLc >= 29.5,
    a11y: "solids",
  }

  ms.categorical.colors.slice(0, 5).forEach((c, i) => put(`--chart-${i + 1}`, c.rgb, page, "--background", "chart series"))
  return out
}

/** Every spec the parity tier misses, across both modes, grouped by switch. */
export function tierFindings(sys: System): Record<keyof A11y, { mode: Mode; name: string; spec: SpecCheck }[]> {
  const res = { inputBorders: [], secondaryText: [], solids: [], focusRing: [] } as Record<keyof A11y, { mode: Mode; name: string; spec: SpecCheck }[]>
  for (const mode of ["light", "dark"] as Mode[]) {
    for (const v of Object.values(buildTier(sys, mode))) {
      if (v.spec && !v.spec.pass) res[v.spec.a11y].push({ mode, name: v.name, spec: v.spec })
    }
  }
  return res
}

/** Lightness of a tier value, for reports. */
export const tierL = (v: TierVar) => rgbToOklch(v.rgb).l
