// Output systems: the engine's intent solved through each system profile.
import { buildIntent } from "./intent"
import { solveProfile, type Outcome, type Profile, type ProfileResult } from "./profile"
import type { RGB } from "./color"
import { PROFILES, type ProfileId } from "./profiles"
import { withReference } from "./reference"
import type { A11y, Mode } from "./settings"
import type { System } from "./system"

const cache = new WeakMap<System, Map<string, ProfileResult>>()

export function solveOutput(sys: System, id: ProfileId, mode: Mode): ProfileResult {
  let m = cache.get(sys)
  if (!m) cache.set(sys, (m = new Map()))
  const key = id + mode
  let r = m.get(key)
  if (!r) m.set(key, (r = solveProfile(profileFor(sys, id), buildIntent(sys, mode))))
  return r
}

/** The profile with its reference: an imported theme when there is one, stock otherwise. */
export const profileFor = (sys: System, id: ProfileId) => withReference(PROFILES[id], sys.settings.imports?.[id])

export type Finding = { mode: Mode; outcome: Outcome }

/** Every accessibility check an output carries, both modes, grouped by switch. */
export function outputSpecs(sys: System, id: ProfileId): Record<keyof A11y, Finding[]> {
  const res = { inputBorders: [], secondaryText: [], solids: [], focusRing: [] } as Record<keyof A11y, Finding[]>
  for (const mode of ["light", "dark"] as Mode[])
    for (const o of solveOutput(sys, id, mode).outcomes) if (o.spec) res[o.spec.key].push({ mode, outcome: o })
  return res
}

export function outputFindings(sys: System, id: ProfileId): Record<keyof A11y, Finding[]> {
  const all = outputSpecs(sys, id)
  return Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v.filter((f) => !f.outcome.spec!.pass)])) as Record<keyof A11y, Finding[]>
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

/** A value in the variable's own format: bare channels for systems that wrap them later. */
function valueAs(p: Profile, key: string, v: { rgb: RGB; a: number; css: string }) {
  const f = p.formats?.[key]
  if (f === "rgb-channels") return v.rgb.join(" ")
  if (f === "hsl-channels") {
    const [h, s, l] = rgbToHsl(v.rgb)
    return `${+h.toFixed(1)} ${+s.toFixed(1)}% ${+l.toFixed(1)}%`
  }
  return v.css
}

/** Descendant selectors for every part of a mode selector list. */
const within = (modeSel: string, scope: string) =>
  modeSel
    .split(",")
    .map((m) => `${m.trim()} ${scope}`)
    .join(", ")

/**
 * A profile's CSS: its own variable names and mode selectors. Variables a
 * system defines per component (Bootstrap's --bs-btn-bg on .btn-primary) are
 * written under that component's selector.
 */
export function outputCss(sys: System, id: ProfileId): string {
  const p = PROFILES[id]
  const blocks: string[] = []
  for (const mode of ["light", "dark"] as Mode[]) {
    const vals = solveOutput(sys, id, mode).values
    const groups = new Map<string, string[]>()
    for (const [k, v] of Object.entries(vals)) {
      const scope = p.scopes?.[k]
      const sel = scope ? within(p.selectors[mode], scope.selector) : p.selectors[mode]
      const name = scope ? scope.name : k
      if (!groups.has(sel)) groups.set(sel, [])
      groups.get(sel)!.push(`  ${name}: ${valueAs(p, k, v)};`)
    }
    for (const [sel, lines] of groups) blocks.push(`${sel} {\n${lines.join("\n")}\n}`)
  }
  return blocks.join("\n\n")
}

/** For systems themed through a JS object: tokens keyed the way the system names them. */
export function outputJson(sys: System, id: ProfileId): string | null {
  const p = PROFILES[id]
  if (!p.json) return null
  const keyOf = (name: string) => {
    const k = name.startsWith(p.json!.strip) ? name.slice(p.json!.strip.length) : name.replace(/^--/, "")
    return p.json!.camel ? k.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()) : k
  }
  // Legacy rgba() for alpha: theme parsers in JS libraries don't all read the space syntax.
  const css = (v: { rgb: RGB; a: number; css: string }) => (v.a < 1 ? `rgba(${v.rgb.join(", ")}, ${+v.a.toFixed(3)})` : v.css)
  const out = Object.fromEntries(
    (["light", "dark"] as Mode[]).map((mode) => [
      mode,
      Object.fromEntries(Object.entries(solveOutput(sys, id, mode).values).map(([k, v]) => [keyOf(p.scopes?.[k]?.name ?? k), css(v)])),
    ]),
  )
  return JSON.stringify(out, null, 2)
}

/** The solved values for one mode, as a native page applies them: root or scoped, in each variable's own format. */
export function nativeTheme(sys: System, id: ProfileId, mode: Mode): { name: string; selector: string | null; value: string }[] {
  const p = PROFILES[id]
  return Object.entries(solveOutput(sys, id, mode).values).map(([k, v]) => {
    const scope = p.scopes?.[k]
    return { name: scope ? scope.name : k, selector: scope ? scope.selector : null, value: valueAs(p, k, v) }
  })
}
