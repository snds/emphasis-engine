import { describe, expect, it } from "vitest"
import { converter } from "culori"
import { composite, hex, hueDelta, maxChroma, oklchToSrgb01, parseHex, rgbToOklch, toRgb } from "./color"
import { shadcnFindings, solveShadcn } from "./shadcn"
import { outputCss, outputFindings, outputJson, solveOutput } from "./outputs"
import { GENERATED_IDS, PROFILES } from "./profiles"
import { parseCss } from "./profile"
import { brandOf, coverage, mergedReference, parseTheme } from "./reference"
import { PROBES as PROBES_DATA } from "./probes"
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
    const l = sys.modes.light.tokens["brand.text.3"].flat.rgb
    const d = sys.modes.dark.tokens["brand.text.3"].flat.rgb
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
    const sys = generate(s({ darkSolid: { ...DEFAULT_SETTINGS.darkSolid, mode: "lift" } }))
    for (const role of ["brand", "danger", "success"] as const) {
      const d = rgbToOklch(sys.modes.dark.tokens[`${role}.fill.4`].flat.rgb)
      expect(d.c, role).toBeGreaterThan(sys.roles[role].named.c * 0.9)
      expect(Math.abs(lc(sys.modes.dark.tokens[`${role}.fill.4`].flat.rgb, sys.modes.dark.bg))).toBeGreaterThanOrEqual(29.9)
    }
  })

  it("keeps dark-mode solids saturated when the picked color is very dark", () => {
    // Walking down a picker's value axis must not walk the dark fill to gray.
    for (const theme of ["#1e40af", "#1e3a8a", "#172554", "#0b1a40", "#06102a"]) {
      const o = rgbToOklch(generate(s({ theme, darkSolid: { ...DEFAULT_SETTINGS.darkSolid, mode: "lift" } })).modes.dark.tokens["brand.fill.4"].flat.rgb)
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

  it("keeps fill levels ordered and distinct, with the named color in one level", () => {
    for (const fill of ["stepped", "linear", "ease-in", "ease-out", "ease-in-out"] as const) {
      const sy = generate(s({ ramps: { ...DEFAULT_SETTINGS.ramps, fill }, darkSolid: { ...DEFAULT_SETTINGS.darkSolid, mode: "lift" } }))
      for (const mode of ["light", "dark"] as const)
        for (const role of ROLES) {
          const lvls = ([1, 2, 3, 4, 5] as const).map((l) => sy.modes[mode].tokens[`${role}.fill.${l}`])
          for (let i = 1; i < 5; i++)
            expect(lvls[i].flat.achieved, `${fill} ${mode} ${role} L${i + 1}`).toBeGreaterThan(lvls[i - 1].flat.achieved + 1.5)
          const named = hex(sy.roles[role].namedRgb)
          expect(lvls.filter((t) => hex(t.flat.rgb) === named).length, `${fill} ${mode} ${role}`).toBeLessThanOrEqual(1)
        }
    }
  })

  it("keeps the lowest fill level a quiet tint, not a neon", () => {
    for (const role of ["success", "caution", "brand"] as const) {
      const o = rgbToOklch(sys.modes.light.tokens[`${role}.fill.1`].flat.rgb)
      expect(o.c, role).toBeLessThan(0.09)
    }
  })

  it("applies role overrides to that role only", () => {
    const base = generate(s())
    const sy = generate(s({ roleOverrides: { danger: { ramps: { text: "ease-out" }, offsets: { text: 5 } } } }))
    expect(sy.modes.light.tokens["danger.text.2"].target.value).toBeGreaterThan(base.modes.light.tokens["danger.text.2"].target.value + 5)
    expect(sy.modes.light.tokens["brand.text.2"].target.value).toBe(base.modes.light.tokens["brand.text.2"].target.value)
  })

  it("reaches shadcn's deeper dark-mode blue with a custom dark solid", () => {
    const sat = 0.199 / maxChroma(0.424, 264.376)
    const sy = generate(s({ theme: "#1447e6", darkSolid: { mode: "custom", l: 0.424, s: sat } }))
    const solid = rgbToOklch(sy.modes.dark.tokens["brand.fill.4"].flat.rgb)
    expect(solid.l).toBeCloseTo(0.424, 2)
    expect(hex(sy.modes.light.tokens["brand.fill.4"].flat.rgb)).toBe("#1447e6")
    expect(buildButton(sy, "dark", "brand", "primary").rest.labelLc).toBeGreaterThanOrEqual(60)
    const lv = ([1, 2, 3, 4] as const).map((l) => rgbToOklch(sy.modes.dark.tokens[`brand.fill.${l}`].flat.rgb).l)
    for (let i = 1; i < 4; i++) expect(lv[i]).toBeGreaterThan(lv[i - 1])
  })

  it("keeps the picked color as the dark solid under Match light", () => {
    const sy = generate(s({ theme: "#1447e6", darkSolid: { mode: "match", l: 0.4, s: 0.7 } }))
    expect(hex(sy.modes.dark.tokens["brand.fill.4"].flat.rgb)).toBe("#1447e6")
  })

  describe("ink model", () => {
    const scenarios: Partial<Settings>[] = [
      {},
      { offsets: { text: 5, fill: 5, stroke: -5 } },
      { ramps: { text: "ease-out", fill: "ease-in", stroke: "ease-in-out", surface: "linear" } },
      { theme: "#1447e6", darkSolid: { mode: "custom", l: 0.424, s: 0.68 } },
      { theme: "#f40009", neutral: "slate", themeTint: false },
    ]

    it("is the default layer", () => {
      expect(DEFAULT_SETTINGS.layer).toBe("ink")
    })

    it("passes every ink level on every guard surface", () => {
      for (const over of scenarios) {
        const sy = generate(s(over))
        for (const mode of ["light", "dark"] as const) {
          expect(sy.modes[mode].guards.length, `${mode} guards`).toBeGreaterThanOrEqual(4)
          for (const t of Object.values(sy.modes[mode].tokens)) {
            if (!t.ink) continue
            for (const c of t.ink.checks) expect(c.met, `${JSON.stringify(over)} ${mode} ${t.id} on ${c.label}: ${c.achieved.toFixed(1)}`).toBe(true)
          }
        }
      }
    })

    it("keeps ghost hovers visible on every surface, whatever the fill ramp", () => {
      for (const over of scenarios) {
        const sy = generate(s(over))
        for (const mode of ["light", "dark"] as const)
          for (const c of sy.modes[mode].overlay.hover.checks)
            expect(c.achieved, `${JSON.stringify(over)} ${mode} hover on ${c.label}`).toBeGreaterThanOrEqual(sy.settings.stateDelta - 0.002)
      }
    })

    it("keeps the lowest stroke visible on cards, not just the page", () => {
      for (const mode of ["light", "dark"] as const) {
        const t = sys.modes[mode].tokens["neutral.stroke.1"]
        const onCard = t.ink!.checks.find((c) => c.label === "Card" || c.guard === "page")!
        expect(onCard.achieved).toBeGreaterThanOrEqual(14.9)
      }
    })

    it("uses one translucent ink for strokes so it compounds over any surface", () => {
      const t = sys.modes.dark.tokens["neutral.stroke.2"]
      expect(t.ink!.alpha).toBeLessThan(1)
      expect(active(t, "ink").css).toMatch(/^rgb\(.* \/ \d+%\)$/)
    })
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

describe("shadcn tier", () => {
  // OKLCH lightness of the b1sABueby preset, measured on its own surfaces.
  const PRESET: Record<"light" | "dark", Record<string, number>> = {
    light: {
      "--background": 1, "--foreground": 0.145, "--card": 1, "--muted": 0.96, "--muted-foreground": 0.542,
      "--secondary": 0.967, "--accent": 0.96, "--primary": 0.488,
      // --destructive is left out in light mode: the engine's danger red carries less chroma than
      // the preset's, so reproducing the preset's 10% tint takes a slightly deeper red (see below).
      "--border": 0.922, "--input": 0.922, "--ring": 0.711, "--sidebar": 0.985,
    },
    dark: {
      "--background": 0.145, "--foreground": 0.985, "--card": 0.212, "--muted": 0.263, "--muted-foreground": 0.711,
      "--secondary": 0.274, "--accent": 0.263, "--destructive": 0.704,
      "--border": 0.308, "--input": 0.353, "--ring": 0.542, "--sidebar": 0.212,
    },
  }
  const presetTheme = hex(toRgb({ l: 0.488, c: 0.243, h: 264.376 }))

  it("matches the shadcn preset within 0.02 lightness, in every layer", () => {
    for (const layer of ["ink", "flat", "alpha"] as const) {
      const sy = generate(s({ theme: presetTheme, neutral: "mauve", layer }))
      for (const mode of ["light", "dark"] as const) {
        const res = solveShadcn(sy, mode)
        const card = res.values["--card"].rgb
        for (const [name, l] of Object.entries(PRESET[mode])) {
          const v = res.values[name]
          const seen = v.a < 1 ? composite(v.rgb, v.a, card) : v.rgb
          expect(Math.abs(rgbToOklch(seen).l - l), `${layer} ${mode} ${name}`).toBeLessThan(0.02)
        }
      }
    }
  })

  it("reproduces every rendered outcome of the reference, across themes and layers", () => {
    for (const over of [
      { theme: presetTheme },
      { theme: "#f40009", neutral: "sand" as const },
      { theme: "#059669", neutral: "slate" as const, layer: "flat" as const },
      { theme: "#7c3aed", neutral: "gray" as const, layer: "alpha" as const },
    ]) {
      const sy = generate(s(over))
      for (const mode of ["light", "dark"] as const)
        for (const o of solveShadcn(sy, mode).outcomes) {
          if (o.recipe.check) continue
          expect(o.met, `${JSON.stringify(over)} ${mode} ${o.recipe.id} ${o.checks.map((c) => c.achieved.toFixed(3) + "/" + c.req.min.toFixed(3))}`).toBe(true)
        }
    }
  })

  it("solves through component opacity: the destructive tint drives the destructive color", () => {
    const res = solveShadcn(generate(s()), "light")
    const tint = res.outcomes.find((o) => o.recipe.id === "destr-tint-light")!
    expect(tint.met).toBe(true)
    expect(tint.achieved - tint.checks[0].req.min).toBeLessThan(0.004)
  })

  it("uses the engine's emphasis levels when asked", () => {
    const sy = generate(s({ targetSource: "engine" }))
    const res = solveShadcn(sy, "light")
    const fg = res.outcomes.find((o) => o.recipe.id === "fg-page")!
    expect(fg.checks[0].req.source).toBe("engine")
    expect(fg.met).toBe(true)
    expect(rgbToOklch(res.values["--card"].rgb).l).toBeCloseTo(rgbToOklch(sy.modes.light.bg).l, 3)
  })

  it("ships opaque values for variables the components modify with opacity", () => {
    const res = solveShadcn(generate(s()), "dark")
    for (const n of ["--muted", "--primary", "--secondary", "--destructive", "--ring", "--foreground"])
      expect(res.values[n].a, n).toBe(1)
  })

  it("names the specs parity misses", () => {
    const f = shadcnFindings(generate(s()))
    expect(f.inputBorders.length).toBeGreaterThan(0)
    expect(f.secondaryText.some((x) => x.mode === "dark")).toBe(true)
  })

  it("lifts each area into spec when accessibility is forced", () => {
    const all = { inputBorders: true, secondaryText: true, solids: true, focusRing: true }
    for (const over of [
      {},
      { theme: "#153b99" },
      { theme: "#f40009", neutral: "sand" as const },
      { theme: "#0f172a", neutral: "gray" as const, layer: "flat" as const },
      { darkSolid: { mode: "custom" as const, l: 0.3, s: 0.8 } },
    ]) {
      const f = shadcnFindings(generate(s({ ...over, a11y: all })))
      for (const [k, list] of Object.entries(f)) expect(list, `${JSON.stringify(over)} ${k}`).toHaveLength(0)
    }
  })

  it("forces only the area whose switch is on", () => {
    const f = shadcnFindings(generate(s({ a11y: { ...DEFAULT_SETTINGS.a11y, inputBorders: true } })))
    expect(f.inputBorders).toHaveLength(0)
    expect(f.secondaryText.length).toBeGreaterThan(0)
  })
})

describe("system profiles", () => {
  const ids = ["shadcn", "radix", "material"] as const
  const themes = ["#2563eb", "#f40009", "#eab308", "#059669", "#0f172a"]

  it("reproduces every reference outcome in every profile, across themes and layers", () => {
    for (const id of ids)
      for (const theme of themes)
        for (const layer of ["ink", "flat"] as const) {
          const sy = generate(s({ theme, layer }))
          for (const mode of ["light", "dark"] as const)
            for (const o of solveOutput(sy, id, mode).outcomes)
              if (!o.recipe.check) expect(o.met, `${id} ${theme} ${layer} ${mode} ${o.recipe.id}`).toBe(true)
        }
  })

  it("matches the stock Radix scales when given Radix's own colors", () => {
    const sy = generate(s({ theme: "#0090ff", neutral: "gray", themeTint: false }))
    for (const mode of ["light", "dark"] as const) {
      const res = solveOutput(sy, "radix", mode)
      const ref = PROFILES.radix.reference[mode]
      const page = res.values["--color-background"].rgb
      const refPage = parseCss(ref["--color-background"]).rgb
      for (const [k, css] of Object.entries(ref)) {
        const p = parseCss(css)
        const v = res.values[k]
        const want = rgbToOklch(p.a < 1 ? composite(p.rgb, p.a, refPage) : p.rgb).l
        const got = rgbToOklch(v.a < 1 ? composite(v.rgb, v.a, page) : v.rgb).l
        expect(Math.abs(want - got), `${mode} ${k}`).toBeLessThan(0.02)
      }
    }
  })

  it("makes Material's fixed state layers land by moving the color under them", () => {
    const res = solveOutput(generate(s({ theme: "#6750a4" })), "material", "light")
    for (const id of ["primary-hover", "error-hover", "secondary-pressed"]) {
      const o = res.outcomes.find((x) => x.recipe.id === id)!
      expect(o.met, id).toBe(true)
      expect(o.capped, id).toBe(false)
    }
  })

  it("lifts every profile into spec when accessibility is forced", () => {
    const a11y = { inputBorders: true, secondaryText: true, solids: true, focusRing: true }
    for (const id of ids)
      for (const theme of themes)
        for (const targetSource of ["reference", "engine"] as const) {
          const f = outputFindings(generate(s({ theme, targetSource, a11y })), id)
          for (const [k, list] of Object.entries(f)) expect(list, `${id} ${theme} ${targetSource} ${k}`).toHaveLength(0)
        }
  })

  it("writes each profile's CSS with its own names and selectors", () => {
    const sy = generate(s())
    expect(outputCss(sy, "radix")).toContain(".dark, .dark-theme {")
    expect(outputCss(sy, "radix")).toMatch(/--accent-a3: rgba?\(.*\//)
    expect(outputCss(sy, "material")).toContain("--md-sys-color-on-primary-container:")
  })
})

describe("theme import", () => {
  const block = (sel: string, vals: Record<string, string>) => `${sel} {\n${Object.entries(vals).map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}`

  it("reads a shadcn v4 globals.css, skipping @theme mappings and comments", () => {
    const css = [
      "/* stock */",
      "@theme inline { --color-background: var(--background); }",
      block(":root", PROFILES.shadcn.reference.light),
      block(".dark", PROFILES.shadcn.reference.dark),
    ].join("\n")
    const t = parseTheme(css, PROFILES.shadcn)
    expect(t.values.light["--primary"]).toBe(PROFILES.shadcn.reference.light["--primary"])
    expect(t.values.dark["--border"]).toBe("oklch(1 0 0 / 10%)")
    expect(coverage(PROFILES.shadcn, t).dark.missing).toHaveLength(0)
  })

  it("reads shadcn v3 bare HSL channels and var() references", () => {
    const css = `:root { --background: 0 0% 100%; --foreground: 240 10% 3.9%; --primary: 240 5.9% 10%; --ring: var(--primary); }
.dark { --background: 240 10% 3.9%; --foreground: 0 0% 98%; }`
    const t = parseTheme(css, PROFILES.shadcn)
    expect(parseCss(t.values.light["--background"]).rgb).toEqual([255, 255, 255])
    expect(rgbToOklch(parseCss(t.values.light["--foreground"]).rgb).l).toBeLessThan(0.2)
    expect(t.values.light["--ring"]).toBe("240 5.9% 10%")
    // Dark has no primary of its own; light's doesn't leak into it as a value.
    expect(t.values.dark["--primary"]).toBeUndefined()
  })

  it("reads Material Theme Builder exports and skips contrast variants", () => {
    const css = `.light { --md-sys-color-primary: rgb(65 95 145); --md-sys-color-surface: rgb(249 249 255); }
.light-medium-contrast { --md-sys-color-primary: rgb(1 2 3); }
.dark { --md-sys-color-primary: rgb(170 199 255); }`
    const t = parseTheme(css, PROFILES.material)
    expect(parseCss(t.values.light["--md-sys-color-primary"]).rgb).toEqual([65, 95, 145])
    expect(parseCss(t.values.dark["--md-sys-color-primary"]).rgb).toEqual([170, 199, 255])
    const tokens = parseTheme(`:root { --md-sys-color-primary-light: #415f91; --md-sys-color-primary-dark: #aac7ff; }`, PROFILES.material)
    expect(tokens.values.dark["--md-sys-color-primary"]).toBe("#aac7ff")
    expect(brandOf(PROFILES.material, t)).toBe("#415f91")
  })

  it("reads a Radix custom palette by scale name, skipping display-p3 duplicates", () => {
    const css = `:root, .light, .light-theme { --indigo-1: #fdfdfe; --indigo-9: #3e63dd; --indigo-contrast: #fff; --slate-1: #fcfcfd; --slate-12: #1c2024; }
@supports (color: color(display-p3 1 1 1)) { @media (color-gamut: p3) { :root, .light { --indigo-9: color(display-p3 0.25 0.38 0.84); } } }
.dark, .dark-theme { --indigo-9: #3e63dd; --slate-12: #edeef0; }`
    const t = parseTheme(css, PROFILES.radix)
    expect(t.values.light["--accent-9"]).toBe("#3e63dd")
    expect(t.values.light["--gray-12"]).toBe("#1c2024")
    expect(t.values.light["--accent-contrast"]).toBe("#fff")
    expect(brandOf(PROFILES.radix, t)).toBe("#3e63dd")
    // Missing alpha steps come from the imported solids, not stock.
    const ref = mergedReference(PROFILES.radix, t)
    const a9 = parseCss(ref.light["--accent-a9"])
    expect(hex(composite(a9.rgb, a9.a, [255, 255, 255]))).toBe("#3e63dd")
  })

  it("re-solving from its own output is stable, in every profile", () => {
    for (const id of ["shadcn", "radix", "material"] as const) {
      const sy = generate(s({ theme: "#7c3aed" }))
      const t = parseTheme(outputCss(sy, id), PROFILES[id])
      const again = generate(s({ theme: "#7c3aed", imports: { [id]: t } }))
      for (const mode of ["light", "dark"] as const) {
        const a = solveOutput(sy, id, mode).values
        const b = solveOutput(again, id, mode).values
        for (const k of Object.keys(a)) {
          const pa = composite(a[k].rgb, a[k].a, [128, 128, 128])
          const pb = composite(b[k].rgb, b[k].a, [128, 128, 128])
          expect(Math.abs(rgbToOklch(pa).l - rgbToOklch(pb).l), `${id} ${mode} ${k}`).toBeLessThan(0.012)
        }
      }
    }
  })

  it("targets follow the import: a lighter imported border solves to a lighter border", () => {
    const css = `:root { --border: oklch(0.96 0 0); } .dark { --border: oklch(1 0 0 / 5%); }`
    const base = solveOutput(generate(s()), "shadcn", "dark")
    const soft = solveOutput(generate(s({ imports: { shadcn: parseTheme(css, PROFILES.shadcn) } })), "shadcn", "dark")
    const seen = (r: typeof base) => composite(r.values["--border"].rgb, r.values["--border"].a, r.values["--card"].rgb)
    expect(rgbToOklch(seen(soft)).l).toBeLessThan(rgbToOklch(seen(base)).l)
  })
})

describe("component probe data", () => {
  it("is current with the profiles: every probed recipe still exists, and every non-convention recipe was probed", () => {
    for (const id of ["shadcn", "radix", "material"] as const)
      for (const mode of ["light", "dark"] as const) {
        const m = PROBES_DATA[id].modes[mode]
        const ids = new Set(PROFILES[id].recipes.filter((r) => (!r.modes || r.modes.includes(mode)) && !r.convention).map((r) => r.id))
        const probed = [...m.observed, ...m.unobserved.map((u) => u.id)]
        for (const r of probed) expect(ids.has(r), `${id} ${mode} stale ${r}`).toBe(true)
        for (const r of ids) expect(probed.includes(r), `${id} ${mode} unprobed ${r} — rerun npm run probe`).toBe(true)
      }
  })

  it("sees most hand-written shadcn and Radix recipes in the real components", () => {
    for (const id of ["shadcn", "radix"] as const) {
      const m = PROBES_DATA[id].modes.light
      expect(m.observed.length / (m.observed.length + m.unobserved.length), id).toBeGreaterThan(0.8)
    }
  })
})

describe("generated profiles", () => {
  const themes = ["#2563eb", "#f40009", "#059669", "#7c3aed", "#eab308", "#0f172a"]

  it("exist for every popular system the probe covers", () => {
    expect(GENERATED_IDS.sort()).toEqual(["antd", "atlassian", "bootstrap", "carbon", "cds", "chakra", "daisyui", "fluent", "mantine", "primer"])
  })

  it("reproduce every outcome of the stock theme, across themes and layers", () => {
    for (const id of GENERATED_IDS)
      for (const theme of themes)
        for (const layer of ["ink", "flat"] as const) {
          const sy = generate(s({ theme, layer }))
          for (const mode of ["light", "dark"] as const)
            for (const o of solveOutput(sy, id, mode).outcomes) if (!o.recipe.check) expect(o.met, `${id} ${theme} ${layer} ${mode} ${o.recipe.id}`).toBe(true)
        }
  }, 120_000)

  it("solve fast enough to follow a slider", () => {
    const sy = generate(s({ theme: "#0ea5e9" }))
    const t0 = performance.now()
    for (const id of GENERATED_IDS) solveOutput(sy, id, "light")
    expect((performance.now() - t0) / GENERATED_IDS.length).toBeLessThan(150)
  })

  it("land near the stock values when given the system's own brand color", () => {
    let within = 0
    let total = 0
    for (const id of GENERATED_IDS) {
      const P = PROFILES[id]
      const solid = P.vars.find((v) => v.path.kind === "solid")
      const theme = solid ? hex(parseCss(P.reference.light[solid.name]).rgb) : "#2563eb"
      const sy = generate(s({ theme, neutral: "gray", themeTint: false }))
      let w = 0
      let t = 0
      for (const mode of ["light", "dark"] as const) {
        const r = solveOutput(sy, id, mode)
        const page = r.values[P.generated!.page].rgb
        const refPage = parseCss(P.reference[mode][P.generated!.page]).rgb
        for (const v of P.vars) {
          // The brand solid follows the engine's dark-mode policy, not the stock value.
          if (v.path.kind === "solid" && mode === "dark") continue
          const ref = P.reference[mode][v.name]
          const got = r.values[v.name]
          if (!ref || !got) continue
          const pr = parseCss(ref)
          const a = rgbToOklch(pr.a < 1 ? composite(pr.rgb, pr.a, refPage) : pr.rgb).l
          const b = rgbToOklch(got.a < 1 ? composite(got.rgb, got.a, page) : got.rgb).l
          t++
          if (Math.abs(a - b) < 0.03) w++
        }
      }
      expect(w / t, id).toBeGreaterThan(0.85)
      within += w
      total += t
    }
    expect(within / total).toBeGreaterThan(0.95)
  }, 60_000)

  it("write component-scoped variables under their component, and JSON for object-themed systems", () => {
    const sy = generate(s())
    const css = outputCss(sy, "bootstrap")
    expect(css).toMatch(/\[data-bs-theme="dark"\] \.btn-primary \{[^}]*--bs-btn-bg:/)
    expect(JSON.parse(outputJson(sy, "fluent")!).light.colorNeutralBackground1).toMatch(/^#|^rgba/)
    expect(Object.keys(JSON.parse(outputJson(sy, "antd")!).light)).toContain("colorPrimary")
    expect(outputJson(sy, "bootstrap")).toBeNull()
  })

  it("re-solving from their own CSS output is stable", () => {
    for (const id of GENERATED_IDS.filter((x) => !PROFILES[x].json)) {
      const sy = generate(s({ theme: "#7c3aed" }))
      const t = parseTheme(outputCss(sy, id), PROFILES[id])
      const again = generate(s({ theme: "#7c3aed", imports: { [id]: t } }))
      for (const mode of ["light", "dark"] as const) {
        const a = solveOutput(sy, id, mode).values
        const b = solveOutput(again, id, mode).values
        for (const k of Object.keys(a)) {
          const pa = composite(a[k].rgb, a[k].a, [128, 128, 128])
          const pb = composite(b[k].rgb, b[k].a, [128, 128, 128])
          expect(Math.abs(rgbToOklch(pa).l - rgbToOklch(pb).l), `${id} ${mode} ${k}`).toBeLessThan(0.03)
        }
      }
    }
  }, 60_000)
})
