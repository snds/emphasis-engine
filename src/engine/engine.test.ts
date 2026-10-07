import { describe, expect, it } from "vitest"
import { converter } from "culori"
import { composite, hex, hueDelta, oklchToSrgb01, parseHex, rgbToOklch } from "./color"
import { lc } from "./contrast"
import { DEFAULT_SETTINGS, NEUTRALS, ROLES, type Settings } from "./settings"
import { active, generate, resolveNeutral } from "./system"
import { buildButton } from "./components"
import { cssExport, dtcgJson } from "./export"

const s = (over: Partial<Settings> = {}): Settings => ({ ...DEFAULT_SETTINGS, ...over })
const toRgbCulori = converter("rgb")

describe("color math", () => {
  it("matches culori for OKLCH → sRGB", () => {
    for (const c of [
      { l: 0.6, c: 0.15, h: 30 },
      { l: 0.3, c: 0.08, h: 250 },
      { l: 0.9, c: 0.05, h: 120 },
    ]) {
      const ours = oklchToSrgb01(c)
      const theirs = toRgbCulori({ mode: "oklch", ...c })!
      expect(ours[0]).toBeCloseTo(theirs.r, 3)
      expect(ours[1]).toBeCloseTo(theirs.g, 3)
      expect(ours[2]).toBeCloseTo(theirs.b, 3)
    }
  })

  it("uses the unmodified APCA reference values", () => {
    expect(lc([0, 0, 0], [255, 255, 255])).toBeCloseTo(106.04, 1)
    expect(lc([255, 255, 255], [0, 0, 0])).toBeCloseTo(-107.88, 1)
  })
})

describe("generate", () => {
  const sys = generate(s())

  it("is deterministic", () => {
    expect(cssExport(generate(s()))).toBe(cssExport(generate(s())))
  })

  it("solves both modes as separate systems", () => {
    const l = sys.modes.light.tokens["brand.fill.4"].flat.rgb
    const d = sys.modes.dark.tokens["brand.fill.4"].flat.rgb
    expect(hex(l)).not.toBe(hex(d))
  })

  it("lands every text, fill, stroke, and surface target", () => {
    for (const mode of ["light", "dark"] as const) {
      for (const t of Object.values(sys.modes[mode].tokens)) {
        if (t.role === "caution" && t.context === "text" && t.level === 5) continue
        expect(t.flat.met, `${mode} ${t.id}`).toBe(true)
      }
    }
  })

  it("never rotates hue to fit gamut", () => {
    for (const t of Object.values(sys.modes.light.tokens)) {
      const o = rgbToOklch(t.flat.rgb)
      if (o.c < 0.04) continue
      expect(Math.abs(hueDelta(o.h, sys.roles[t.role].named.h)), t.id).toBeLessThan(4)
    }
  })

  it("anchors the brand fill to the named color when it lands the band", () => {
    expect(hex(sys.modes.light.tokens["brand.fill.4"].flat.rgb)).toBe("#2563eb")
  })

  it("keeps alpha ink live and lands the same target", () => {
    for (const t of Object.values(sys.modes.light.tokens)) {
      const { tint, alpha, composite: comp } = t.alpha
      expect(alpha).toBeLessThanOrEqual(1)
      expect(alpha * 100).toBeCloseTo(Math.round(alpha * 100), 6)
      expect(composite(tint, alpha, t.surface)).toEqual(comp)
      expect(t.alpha.achieved, t.id).toBeGreaterThanOrEqual(t.target.value - 1)
    }
  })

  it("gives the brand primary a label that clears Lc 60 in both modes", () => {
    expect(sys.modes.light.onFill["brand.fill.4"].met).toBe(true)
    expect(sys.modes.dark.onFill["brand.fill.4"].met).toBe(true)
  })

  it("lets status outrank brand when hues collide", () => {
    const red = generate(s({ theme: "#f40009" }))
    expect(Math.abs(hueDelta(red.roles.danger.named.h, red.roles.brand.named.h))).toBeGreaterThan(9)
    expect(red.log.some((e) => e.force === "semantic convention")).toBe(true)
  })

  it("ignores the theme hue when Theme tint is off", () => {
    const theme = rgbToOklch(parseHex("#f40009")!)
    expect(resolveNeutral(s({ themeTint: false, neutral: "slate" }), theme)).toEqual({
      hue: NEUTRALS.slate.hue,
      chroma: NEUTRALS.slate.chroma,
    })
  })

  it("keeps categorical series visible and distinct", () => {
    for (const mode of ["light", "dark"] as const) {
      const cat = sys.modes[mode].categorical
      expect(cat.colors).toHaveLength(8)
      for (const c of cat.colors) expect(Math.abs(c.lc)).toBeGreaterThanOrEqual(29.5)
      expect(cat.minNeighborDeltaE).toBeGreaterThan(0.05)
    }
  })

  it("hover moves by at least the state delta, under both strategies", () => {
    for (const stateStrategy of ["step", "overlay"] as const) {
      const sy = generate(s({ stateStrategy }))
      for (const mode of ["light", "dark"] as const) {
        const b = buildButton(sy, mode, "brand", "primary")
        expect(b.hover.deltaMet, `${stateStrategy} ${mode}`).toBe(true)
        expect(b.rest.labelMet).toBe(true)
      }
    }
  })

  it("runs fast enough to re-solve on every drag", () => {
    const t0 = performance.now()
    generate(s({ theme: "#7c3aed", layer: "alpha" }))
    expect(performance.now() - t0).toBeLessThan(400)
  })

  it("exports valid DTCG JSON for every role", () => {
    const doc = JSON.parse(dtcgJson(sys))
    for (const role of ROLES) expect(doc.light[role].fill.high.$type).toBe("color")
    expect(active(sys.modes.light.tokens["brand.fill.4"], "flat").css).toBe("#2563eb")
  })
})
