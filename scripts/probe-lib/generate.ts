// Starter profiles from probe output. Everything here is inference: which
// variable is the page, which surface each variable sits on, which role's
// palette it walks, which way it moves, and what each painted pair is for.
// The output is a profile a person reviews in the Report, not a final word.
import { maxChroma, rgbToOklch, composite, type RGB } from "../../src/engine/color"
import type { ElementKind, Metric } from "../../src/engine/intent"
import type { Expr, Path, Recipe, VarSpec } from "../../src/engine/profile"
import type { Mode, RoleId } from "../../src/engine/settings"
import { formatAs, parseStock, type Format, type Traced } from "./trace"

export type Found = { key: string; paint: Traced; over: Traced[]; prop: string; sources: string[] }
export type ModeData = { stock: Record<string, string>; found: Found[] }

type Pair = Found & { modes: Set<Mode> }
const MODES: Mode[] = ["light", "dark"]
const TEXT_PROPS = new Set(["color", "placeholder", "fill", "stroke"])
const EDGE_PROPS = new Set(["border", "outline", "ring", "inset-ring"])
const CONTROL = /^(input|textfield|select|checkbox|switch|toggle|radio|field)/

const varsOf = (e: Traced): string[] => ("literal" in e ? [] : "v" in e ? [e.v] : "alpha" in e ? varsOf(e.alpha) : e.mix.flatMap(varsOf))
const topVar = (over: Traced[]) => {
  const t = over[over.length - 1]
  return t ? varsOf(t)[0] : undefined
}
const short = (k: string) => k.replace(/@.*$/, "")

const ROLE_NAMES: [RoleId, RegExp][] = [
  ["danger", /(danger|error|critical|negative|destructive|red\b|-red|invalid)/i],
  ["success", /(success|positive|green|valid)/i],
  ["warning", /(warning|caution|attention|yellow|orange|amber|notice)/i],
  ["info", /(info|discovery|informative|informational|cyan|teal)/i],
  ["brand", /(brand|primary|accent|interactive|link|selected|focus|blue|theme|highlight|checked)/i],
]
const SECONDARY = /(muted|secondary|subtle|subdued|tertiary|weak|dimmed|hint|description|variant|soft|low|placeholder)/i

export function generateProfile(def: { id: string; label: string; description?: string; selectors?: { light: string; dark: string } }, data: Record<Mode, ModeData>, meta: Record<string, { name: string; selector: string | null }>) {
  // Merge the two modes' pairs.
  const pairs = new Map<string, Pair>()
  for (const mode of MODES)
    for (const f of data[mode].found) {
      if ([f.paint, ...f.over].some((e) => "literal" in e)) continue
      const p = pairs.get(f.key) ?? { ...f, sources: [], modes: new Set<Mode>() }
      p.modes.add(mode)
      for (const s of f.sources) if (!p.sources.includes(s)) p.sources.push(s)
      pairs.set(f.key, p)
    }
  const all = [...pairs.values()]

  // Stock values per mode, read back as colors.
  const stock = (mode: Mode, k: string) => {
    const v = data[mode].stock[k] ?? data[mode === "light" ? "dark" : "light"].stock[k]
    return v ? parseStock(v) : null
  }
  // Variables that are fully transparent in stock (a "transparent" token) paint
  // nothing: drop pairs that paint them, and look through them in stacks.
  const invisible = (k: string) => MODES.every((m) => (stock(m, k)?.a ?? 1) < 0.02)
  for (let i = all.length - 1; i >= 0; i--) {
    const p = all[i]
    if (varsOf(p.paint).some(invisible)) all.splice(i, 1)
    else p.over = p.over.filter((e) => !varsOf(e).some(invisible))
  }
  const used = new Set(all.flatMap((p) => [...varsOf(p.paint), ...p.over.flatMap(varsOf)]).filter((k) => stock("light", k) || stock("dark", k)))

  // The page: what plain text on the page sits on (the harness puts text@page
  // straight on the page surface); failing that, the bottom of the most stacks.
  const bottoms = new Map<string, number>()
  for (const p of all) {
    const b = p.over[0] && varsOf(p.over[0])[0]
    if (!b) continue
    const weight = p.sources.some((s) => s.startsWith("text@page rest")) ? 1000 : 1
    bottoms.set(b, (bottoms.get(b) ?? 0) + weight)
  }
  const page = [...bottoms.entries()].filter(([k]) => used.has(k)).sort((a, b) => b[1] - a[1])[0]?.[0]
  if (!page) throw new Error(`${def.id}: no page variable found`)

  // A stack that was only a transparent layer sits on the page.
  for (const p of all) if (!p.over.length) p.over = [{ v: page } as Traced]
  used.add(page)

  const L = (mode: Mode, k: string, over?: string): number | null => {
    const s = stock(mode, k)
    if (!s) return null
    if (s.a < 1 && over) {
      const o = stock(mode, over)
      if (o) return rgbToOklch(composite(s.rgb, s.a, o.rgb)).l
    }
    return rgbToOklch(s.rgb).l
  }
  const lch = (k: string) => {
    const s = stock("light", k) ?? stock("dark", k)
    return s ? rgbToOklch(s.rgb) : { l: 0.5, c: 0, h: 0 }
  }
  const translucent = (k: string) => MODES.some((m) => (stock(m, k)?.a ?? 1) < 0.999)

  // Each variable's parent: the surface it's painted over most.
  const parentOf = new Map<string, string>()
  for (const k of used) {
    if (k === page) continue
    const counts = new Map<string, number>()
    for (const p of all) {
      if (!varsOf(p.paint).includes(k)) continue
      const t = topVar(p.over)
      if (t && t !== k && used.has(t)) counts.set(t, (counts.get(t) ?? 0) + p.sources.length)
    }
    parentOf.set(k, [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? page)
  }
  // Break cycles: a variable whose parent chain returns to it hangs off the page.
  for (const k of parentOf.keys()) {
    const seen = new Set([k])
    let p = parentOf.get(k)
    while (p && p !== page) {
      if (seen.has(p)) {
        parentOf.set(k, page)
        break
      }
      seen.add(p)
      p = parentOf.get(p)
    }
  }

  // Palette: the name decides when it says; otherwise chroma and hue.
  const roleOf = (k: string): RoleId => {
    const c = lch(k)
    const darkC = stock("dark", k) ? rgbToOklch(stock("dark", k)!.rgb).c : c.c
    if (c.c < 0.035 && darkC < 0.05) return "neutral"
    const name = short(meta[k]?.name ?? k)
    for (const [role, re] of ROLE_NAMES) if (re.test(name)) return role
    const h = c.h
    if (h < 45 || h > 345) return "danger"
    if (h >= 120 && h < 175) return "success"
    if (h >= 50 && h < 110) return "warning"
    return "brand"
  }

  // Solids: per role, the chromatic background with the most text painted on it.
  const textOver = (k: string) => all.filter((p) => TEXT_PROPS.has(p.prop) && topVar(p.over) === k).reduce((n, p) => n + p.sources.length, 0)
  const solidRole = new Map<string, RoleId>()
  // Only the brand fill becomes the engine's solid (the user's theme color).
  // Status fills stay steps on their role's palette, so they keep the system's
  // own lightness, which its labels are tuned to (daisyUI's dark text on pale red).
  for (const role of ["brand"] as RoleId[]) {
    const cands = [...used].filter((k) => k !== page && roleOf(k) === role && lch(k).c >= 0.08 && !translucent(k) && all.some((p) => p.prop === "background-color" && varsOf(p.paint)[0] === k && "v" in p.paint))
    const best = cands.map((k) => [k, textOver(k)] as const).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1])[0]
    if (best) solidRole.set(best[0], role)
  }
  // Labels that only ever sit on one role's solid.
  const onSolidRole = new Map<string, RoleId>()
  for (const k of used) {
    const texts = all.filter((p) => TEXT_PROPS.has(p.prop) && varsOf(p.paint).includes(k))
    if (!texts.length || all.some((p) => !TEXT_PROPS.has(p.prop) && varsOf(p.paint).includes(k))) continue
    const tops = new Set(texts.map((p) => topVar(p.over)))
    if (tops.size === 1) {
      const t = [...tops][0]!
      if (solidRole.has(t)) onSolidRole.set(k, solidRole.get(t)!)
    }
  }

  const sat = (k: string) => {
    const c = lch(k)
    return c.c / Math.max(1e-4, maxChroma(c.l, c.h))
  }
  const roleRef = new Map<RoleId, number>()
  for (const [k, role] of solidRole) roleRef.set(role, sat(k))

  const pathOf = (k: string): Path => {
    if (k === page) return { kind: "page" }
    if (solidRole.has(k)) return { kind: "solid", role: solidRole.get(k)! }
    // Labels on solids stay steps from their solid, so they keep the system's own
    // polarity and contrast (daisyUI's dark labels on pale status fills).
    const parent = parentOf.get(k) ?? page
    const role = roleOf(k)
    // Per mode: away from the page's polarity, or back toward it. When the
    // variable matches its parent, its pairs say which side it sits on.
    const dirs = MODES.map((m) => {
      const toAway = (d: number) => (m === "light" ? -d : d)
      const v = L(m, k, parent)
      const p = L(m, parent)
      if (v !== null && p !== null && Math.abs(v - p) >= 0.003) return Math.sign(toAway(v - p))
      let votes = 0
      for (const pr of all) {
        if (!pr.modes.has(m) || !varsOf(pr.paint).includes(k)) continue
        const t = topVar(pr.over)
        const lv = L(m, k, t)
        const lt = t ? L(m, t) : null
        if (lv !== null && lt !== null && Math.abs(lv - lt) > 0.02) votes += Math.sign(toAway(lv - lt)) * pr.sources.length
      }
      return Math.sign(votes)
    })
    const one = (d: number) => (d < 0 ? "back" : "away")
    const dir: Path extends infer _ ? "away" | "back" | { light: "away" | "back"; dark: "away" | "back" } : never =
      dirs[0] === dirs[1] || dirs[0] === 0 || dirs[1] === 0 ? one(dirs[0] || dirs[1]) : { light: one(dirs[0]), dark: one(dirs[1]) }
    const ref = roleRef.get(role) ?? Math.max(...[...used].filter((x) => roleOf(x) === role).map(sat), 0.01)
    const chroma = role === "neutral" ? 1 : Math.min(1.2, Math.max(0.1, +(sat(k) / ref).toFixed(2)))
    return { kind: "step", palette: role, from: parent, ...(chroma !== 1 ? { chroma } : {}), ...(dir !== "away" ? { dir } : {}), ...(translucent(k) ? { translucent: "always" as const } : {}) } as Path
  }

  // Order: everything a variable is measured against comes first (its parent,
  // and every surface under the pairs it paints), so its recipes can drive it.
  const deps = new Map<string, Set<string>>()
  for (const k of used) {
    const d = new Set<string>()
    const p = parentOf.get(k)
    if (p) d.add(p)
    for (const pr of all) if (varsOf(pr.paint).includes(k)) for (const o of pr.over.flatMap(varsOf)) if (o !== k && used.has(o)) d.add(o)
    deps.set(k, d)
  }
  const order: string[] = []
  const onStack = new Set<string>()
  const ancestors = (k: string) => {
    const out = new Set<string>()
    for (let p = parentOf.get(k); p && !out.has(p); p = parentOf.get(p)) out.add(p)
    return out
  }
  const visit = (k: string) => {
    if (order.includes(k) || onStack.has(k)) return
    onStack.add(k)
    // The parent chain first; it's acyclic, and a step can't move without its parent.
    const p = parentOf.get(k)
    if (p) visit(p)
    // Then other surfaces, unless they descend from this variable.
    for (const d of deps.get(k) ?? []) if (!ancestors(d).has(k) && ![...onStack].some((s) => ancestors(d).has(s) && s !== d)) visit(d)
    onStack.delete(k)
    order.push(k)
  }
  visit(page)
  for (const k of [...used].sort()) visit(k)
  const paths = new Map(order.map((k) => [k, pathOf(k)]))
  // Labels on solids point at the solid; make sure it comes first.
  const vars: VarSpec[] = order.map((name) => ({ name, path: paths.get(name)! }))

  // Recipes from pairs.
  const fixed = (k: string) => ["page", "solid", "onSolid"].includes(paths.get(k)?.kind ?? "")
  const recipes: Recipe[] = []
  const ids = new Set<string>()
  const humanize = (s: string) => s.replace(/@.*/, "").replace(/-/g, " ")
  const cleanSource = (s: string) => s.replace(/@\w+/, "")
  for (const p of all.sort((a, b) => b.sources.length - a.sources.length)) {
    const paintVar = varsOf(p.paint)[0]
    if (!paintVar || paintVar === page) continue
    if ([...varsOf(p.paint), ...p.over.flatMap(varsOf)].some((v) => !used.has(v))) continue
    const comps = p.sources.map((s) => s.split(" ")[0].split("@")[0])
    const states = new Set(p.sources.map((s) => s.split(" ")[1]))
    const name = short(meta[paintVar]?.name ?? paintVar)
    let element: ElementKind
    let check = fixed(paintVar)
    const top = topVar(p.over)
    if (p.prop === "background-color") {
      element = "alpha" in p.paint || "mix" in p.paint || !states.has("rest") ? "state" : paths.get(paintVar)?.kind === "solid" ? "solid" : "surface"
    } else if (TEXT_PROPS.has(p.prop)) {
      if (p.prop === "placeholder" || /(placeholder|disabled)/i.test(name)) {
        // No contrast floor applies, but the pair still sets the variable.
        element = "state"
      } else if (top && paths.get(top)?.kind === "solid") element = "on-solid"
      else if (top && roleOf(top) !== "neutral" && roleOf(paintVar) !== "neutral") element = "text-on-tint"
      else if (SECONDARY.test(name) || roleOf(paintVar) !== "neutral") element = "text-secondary"
      else element = "text-primary"
    } else if (EDGE_PROPS.has(p.prop)) {
      if ([...states].every((s) => s === "focus") && p.prop !== "border") element = "focus"
      else if (/(focus|ring)/i.test(name)) element = "focus"
      else if (comps.some((c) => CONTROL.test(c)) || /(input|field|control|form|checkbox|switch|toggle)/i.test(name)) element = "border-control"
      else element = "border-decorative"
    } else continue
    const metric: Metric = TEXT_PROPS.has(p.prop) ? "lc" : "dL"
    // An edge painted in the same color as what's under it (a primary button's
    // border) draws nothing; it isn't a separator anyone sees.
    if (EDGE_PROPS.has(p.prop) && top && MODES.every((m) => {
      const a = L(m, paintVar, top)
      const b = L(m, top)
      return a === null || b === null || Math.abs(a - b) < 0.004
    })) continue
    // A translucent layer at the bottom needs the page under it.
    const over: Expr[] = p.over as Expr[]
    const bottom = varsOf(over[0])[0]
    const stackOver = bottom && bottom !== page && translucent(bottom) ? [{ v: page } as Expr, ...over] : over
    let id = `${comps[0]}-${p.prop}`.replace(/[^a-z0-9-]/gi, "-").toLowerCase()
    for (let i = 2; ids.has(id); i++) id = `${comps[0]}-${p.prop}-${i}`
    ids.add(id)
    const stateNote = states.has("rest") ? "" : ` (${[...states].join(", ")})`
    recipes.push({
      id,
      label: `${humanize(comps[0])[0].toUpperCase()}${humanize(comps[0]).slice(1)} ${p.prop === "background-color" ? "background" : p.prop}${stateNote}`,
      source: [...new Set(p.sources.map(cleanSource))].slice(0, 3).join("; ") + (new Set(p.sources.map(cleanSource)).size > 3 ? `; +${new Set(p.sources.map(cleanSource)).size - 3}` : ""),
      element,
      ...(p.modes.size === 1 ? { modes: [...p.modes] } : {}),
      paint: p.paint as Expr,
      over: stackOver,
      metric,
      ...(check ? { check: true } : {}),
    })
  }

  // Reference: stock values, as CSS a solver can read; and each variable's own format for export.
  const reference = {} as Record<Mode, Record<string, string>>
  const formats: Record<string, Format> = {}
  for (const mode of MODES) {
    reference[mode] = {}
    for (const k of order) {
      const s = stock(mode, k)
      if (!s) continue
      reference[mode][k] = s.format === "rgb-channels" ? `rgb(${s.rgb.join(" ")})` : s.a < 1 ? `rgb(${s.rgb.join(" ")} / ${+(s.a * 100).toFixed(1)}%)` : formatAs("color", s.rgb as RGB)
      if (s.format !== "color") formats[k] = s.format
    }
  }
  const scopes = Object.fromEntries(order.filter((k) => meta[k]?.selector).map((k) => [k, { name: meta[k].name, selector: meta[k].selector! }]))
  return { vars, recipes, reference, formats, scopes, page }
}
