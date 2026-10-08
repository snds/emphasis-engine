import { describe, expect, it } from "vitest"
import { converter } from "culori"
import { composite, hex, hueDelta, maxChroma, oklchToSrgb01, parseHex, rgbToOklch } from "./color"
import { lc } from "./contrast"
import { DEFAULT_SETTINGS, NEUTRALS, ROLES, type Settings } from "./settings"
import { active, generate, resolveNeutral, targetFor } from "./system"
import { BUTTON_ROLES, VARIANTS, buildButton } from "./components"
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

  it("never lets a state cost label contrast, across configurations", () => {
    const configs: Partial<Settings>[] = [
      {},
      { stateStrategy: "overlay" },
      { layer: "alpha" },
      { secondarySource: "role-tint", stateStrategy: "overlay", pressedMode: "from-rest" },
      { theme: "#f40009" },
      { theme: "#eab308", neutral: "sand", themeTint: false },
    ]
    for (const over of configs) {
      const sy = generate(s(over))
      for (const mode of ["light", "dark"] as const)
        for (const role of BUTTON_ROLES)
          for (const variant of VARIANTS) {
            const b = buildButton(sy, mode, role, variant)
            const where = `${JSON.stringify(over)} ${mode} ${role} ${variant}`
            for (const st of ["rest", "hover", "pressed"] as const) expect(b[st].labelMet, `${where} ${st}`).toBe(true)
            expect(b.hover.deltaMet, `${where} hover step`).toBe(true)
          }
    }
  })

  it("keeps solid fills true to the named color in dark mode", () => {
    for (const role of ["brand", "danger", "success"] as const) {
      const d = rgbToOklch(sys.modes.dark.tokens[`${role}.fill.4`].flat.rgb)
      expect(d.c, role).toBeGreaterThan(sys.roles[role].named.c * 0.9)
      expect(Math.abs(lc(sys.modes.dark.tokens[`${role}.fill.4`].flat.rgb, sys.modes.dark.bg))).toBeGreaterThanOrEqual(29.9)
    }
  })

  it("keeps dark-mode solids saturated when the picked color is very dark", () => {
    // Walking down a picker's value axis must not walk the dark fill to gray.
    for (const theme of ["#1e40af", "#1e3a8a", "#172554", "#0b1a40", "#06102a"]) {
      const o = rgbToOklch(generate(s({ theme })).modes.dark.tokens["brand.fill.4"].flat.rgb)
      expect(o.c / maxChroma(o.l, o.h), theme).toBeGreaterThan(0.7)
    }
  })

  it("seeds the chart palette from the theme when asked", () => {
    const sy = generate(s({ chartUseTheme: true, theme: "#7c3aed" }))
    const first = rgbToOklch(sy.modes.light.categorical.colors[0].rgb)
    expect(Math.abs(hueDelta(first.h, sy.roles.brand.named.h))).toBeLessThan(6)
    expect(cssExport(sy)).not.toBe(cssExport(generate(s({ theme: "#7c3aed" }))))
  })

  it("ramps redistribute the middle levels and keep the endpoints", () => {
    const at = (ramp: Settings["ramps"]["text"]) =>
      ([1, 2, 3, 4, 5] as const).map((l) => targetFor(s({ ramps: { ...DEFAULT_SETTINGS.ramps, text: ramp } }), "light", "text", l).value)
    expect(at("stepped")).toEqual([45, 60, 75, 90, 100])
    expect(at("linear")).toEqual([45, 58.75, 72.5, 86.25, 100])
    const easeIn = at("ease-in")
    const easeOut = at("ease-out")
    expect(easeIn[0]).toBe(45)
    expect(easeIn[4]).toBe(100)
    expect(easeIn[1]).toBeLessThan(58.75)
    expect(easeOut[1]).toBeGreaterThan(58.75)
    for (const ramp of ["linear", "ease-in", "ease-out", "ease-in-out"] as const) {
      const sy = generate(s({ ramps: { text: ramp, fill: ramp, stroke: ramp, surface: ramp } }))
      expect(Object.values(sy.modes.dark.tokens).filter((t) => !t.flat.met && !(t.role === "caution" && t.level === 5))).toHaveLength(0)
    }
  })

  it("paints the light neutral primary as a light fill with dark text in both modes", () => {
    for (const mode of ["light", "dark"] as const) {
      const b = buildButton(sys, mode, "neutral", "primary")
      expect(rgbToOklch(b.rest.visible).l, mode).toBeGreaterThan(0.8)
      expect(rgbToOklch(parseHex(b.rest.fg)!).l, mode).toBeLessThan(0.4)
      expect(b.rest.labelLc, mode).toBeGreaterThanOrEqual(75)
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
