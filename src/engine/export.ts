import { solveShadcn } from "./shadcn"
// Exports. shadcn token names for compatibility, an extension set for what
// shadcn cannot express, Radix-shaped scales, and DTCG JSON.
import { hex, rgbToOklch, oklchCss, rgbaCss } from "./color"
import { BUTTON_ROLES, VARIANTS, buildButton, overlayImage } from "./components"
import { CONTEXTS, LEVELS, LEVEL_NAMES, ROLES, type Mode } from "./settings"
import { active, tokenId, type System } from "./system"

/** shadcn variable → value, per mode. Each traces to a grid cell. */
export function shadcnVars(sys: System, mode: Mode): Record<string, string> {
  // The engine's intent, solved back through shadcn's own recipes.
  const res = solveShadcn(sys, mode)
  return Object.fromEntries(Object.entries(res.values).map(([k, v]) => [k, v.css]))
}

/** Extension set: every semantic token plus button component tokens. */
export function extensionVars(sys: System, mode: Mode): Record<string, string> {
  const s = sys.settings
  const ms = sys.modes[mode]
  const vars: Record<string, string> = {}
  for (const role of ROLES)
    for (const ctx of CONTEXTS)
      for (const lvl of LEVELS) vars[`--${role}-${ctx}-${lvl}`] = active(ms.tokens[tokenId(role, ctx, lvl)], s.layer).css
  for (const [id, f] of Object.entries(ms.onFill)) vars[`--on-${id.replace(/\./g, "-")}`] = f.css
  ms.categorical.colors.forEach((c, i) => (vars[`--series-${i + 1}`] = c.css))
  // State overlays: one alpha that steps every guard surface by the state step.
  vars["--overlay-hover"] = rgbaCss(ms.overlay.ink, ms.overlay.hover.alpha)
  vars["--overlay-pressed"] = rgbaCss(ms.overlay.ink, ms.overlay.pressedAlpha)
  for (const [k, v] of Object.entries(ms.trend)) vars[`--trend-${k}`] = v.css
  for (const role of BUTTON_ROLES)
    for (const variant of VARIANTS) {
      const b = buildButton(sys, mode, role, variant)
      for (const [state, p] of Object.entries(b)) {
        const base = `--button-${variant}-${role}-${state}`
        vars[`${base}-bg`] = p.bg
        vars[`${base}-fg`] = p.fg
        vars[`${base}-border`] = p.border ?? "transparent"
        vars[`${base}-overlay`] = overlayImage(p.overlay) ?? "none"
      }
    }
  return vars
}

const block = (selector: string, vars: Record<string, string>) =>
  `${selector} {\n${Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n")}\n}`

export function cssExport(sys: System): string {
  return [
    `/* Emphasis Engine · shadcn tokens + extension set · layer: ${sys.settings.layer} */`,
    block(":root", { ...shadcnVars(sys, "light"), ...extensionVars(sys, "light") }),
    block(".dark", { ...shadcnVars(sys, "dark"), ...extensionVars(sys, "dark") }),
  ].join("\n\n")
}

/** Radix-shaped 12-step solid and alpha scales per role, per mode. */
const STEP_MAP: [string, number][] = [
  ["surface", 1],
  ["surface", 2],
  ["surface", 3],
  ["surface", 4],
  ["surface", 5],
  ["stroke", 1],
  ["stroke", 2],
  ["stroke", 3],
  ["fill", 4],
  ["fill", 5],
  ["text", 3],
  ["text", 5],
]

export function radixScales(sys: System, mode: Mode) {
  const ms = sys.modes[mode]
  const out: Record<string, { solid: string[]; alpha: string[] }> = {}
  for (const role of ROLES) {
    out[role] = { solid: [], alpha: [] }
    for (const [ctx, lvl] of STEP_MAP) {
      const tk = ms.tokens[`${role}.${ctx}.${lvl}`]
      out[role].solid.push(hex(tk.flat.rgb))
      out[role].alpha.push(rgbaCss(tk.alpha.tint, tk.alpha.alpha))
    }
  }
  return out
}

export function radixCss(sys: System): string {
  const parts: string[] = []
  for (const mode of ["light", "dark"] as Mode[]) {
    const scales = radixScales(sys, mode)
    const vars: Record<string, string> = {}
    for (const [role, sc] of Object.entries(scales)) {
      sc.solid.forEach((v, i) => (vars[`--${role}-${i + 1}`] = v))
      sc.alpha.forEach((v, i) => (vars[`--${role}-a${i + 1}`] = v))
    }
    parts.push(block(mode === "light" ? ":root" : ".dark", vars))
  }
  return `/* Radix-shaped 12-step scales: 1–5 surfaces, 6–8 strokes, 9–10 solid fills, 11–12 text */\n\n${parts.join("\n\n")}`
}

/** W3C Design Tokens Community Group format, both modes. */
export function dtcgJson(sys: System): string {
  const doc: Record<string, unknown> = {}
  for (const mode of ["light", "dark"] as Mode[]) {
    const ms = sys.modes[mode]
    const m: Record<string, unknown> = {}
    for (const role of ROLES) {
      const r: Record<string, unknown> = {}
      for (const ctx of CONTEXTS) {
        const c: Record<string, unknown> = {}
        for (const lvl of LEVELS) {
          const tk = ms.tokens[tokenId(role, ctx, lvl)]
          const a = active(tk, sys.settings.layer)
          c[LEVEL_NAMES[lvl]] = {
            $type: "color",
            $value: sys.settings.layer === "alpha" ? a.css : oklchCss(rgbToOklch(tk.flat.rgb)),
            $description: `Level ${lvl}. Target ${tk.target.kind === "lc" ? "Lc " + +tk.target.value.toFixed(1) : "ΔL " + tk.target.value.toFixed(3)}, achieved ${a.achieved.toFixed(tk.target.kind === "lc" ? 1 : 3)}${a.met ? "" : " (below target)"}.`,
          }
        }
        r[ctx] = c
      }
      m[role] = r
    }
    m.series = Object.fromEntries(
      ms.categorical.colors.map((c, i) => [String(i + 1), { $type: "color", $value: c.css }])
    )
    doc[mode] = m
  }
  return JSON.stringify(doc, null, 2)
}
