// System profiles and the solver that works backward through them.
//
// A profile describes a downstream design system as data:
//   - its variables, and the path each one can move along (a lightness walk
//     from a parent, a translucent ink, a fixed engine value, an alias);
//   - its recipes: how its components turn variables into what's on screen,
//     including opacity modifiers and color mixes, read from component source;
//   - a reference theme, read through those same recipes to get the targets
//     the system renders today.
//
// The solver picks each variable's value so every recipe it paints meets its
// requirement: the weakest value that satisfies all of them, the same
// max-over-constraints rule the ink model uses for guard surfaces. Nothing
// is added on top of the system; the system's own recipes are the layer.
import {
  composite,
  hex,
  parseHex,
  rgbToOklch,
  rgbaCss,
  toRgb,
  type Oklch,
  type RGB,
} from "./color"
import { deltaL, lc, wcagRatio } from "./contrast"
import {
  A11Y_FLOORS,
  type ElementKind,
  type Intent,
  type Metric,
  type Requirement,
} from "./intent"
import type { A11y, Mode, RoleId } from "./settings"
import { chromaAt, type ChromaRule } from "./solve"

/** A paint expression, mirroring what the system's CSS does. */
export type Expr =
  | { v: string }
  /** Opacity modifier: Tailwind's color-mix(in oklab, X k, transparent). */
  | { alpha: Expr; k: number }
  /** A real blend of two colors: color-mix(in space, a, b k). */
  | { mix: [Expr, Expr]; k: number; space: "oklch" | "oklab" }

export type Recipe = {
  id: string
  label: string
  /** The class or rule this was read from, so it can be checked against source. */
  source: string
  element: ElementKind
  modes?: Mode[]
  paint: Expr
  /** What it sits on, bottom to top. */
  over: Expr[]
  /** How the reference is read for this pair. */
  metric: Metric
  /** Reported only; never drives a solve (its variable is fixed elsewhere). */
  check?: boolean
  /**
   * Compare against another render instead of the surface underneath: a
   * hover measured against its rest state, bottom to top.
   */
  against?: Expr[]
  /**
   * Variables this recipe also constrains beyond what it paints: a fixed
   * state layer over a color constrains that color. The color is held only
   * to what its painted partner could reach at the end of its path.
   */
  alsoDrives?: string[]
  /** States the system's convention rather than a specific component paint; the probe doesn't look for it. */
  convention?: boolean
}

export type SurfaceKey = keyof Intent["surfaces"]
export type Path =
  | { kind: "page" }
  /** Lightness walk away from a parent variable along a role's palette. */
  | {
      kind: "step"
      palette: RoleId
      from: string
      chroma?: number
      /**
       * Ink alpha over the parent instead: true when the layer allows
       * translucency, "always" for systems whose scale is translucent by design.
       */
      translucent?: boolean | "always"
      /**
       * Which way to walk. Away from the page polarity (default), back toward
       * it, or toward whichever end gives the parent more contrast (labels).
       */
      dir?: Dir | Partial<Record<Mode, Dir>>
      /** Under engine targets, adopt this engine surface as-is. */
      engineSurface?: Partial<Record<Mode, SurfaceKey>>
    }
  | { kind: "solid"; role: RoleId }
  | { kind: "onSolid"; role: RoleId }
  | { kind: "alias"; of: string }
  /** The exact translucent form of another variable over a surface (Radix alpha scales). */
  | { kind: "alphaOf"; of: string; over: string }
  | { kind: "series"; index: number }

type Dir = "away" | "back" | "contrast"

export type VarSpec = { name: string; path: Path; note?: string }

export type Profile = {
  id: string
  label: string
  /** One line on how the system turns tokens into color. */
  description: string
  /** CSS selectors the system uses for each mode. */
  selectors: Record<Mode, string>
  /** Variables in solve order: parents before children. */
  vars: VarSpec[]
  recipes: Recipe[]
  /** The system's stock theme, as its own CSS values. */
  reference: Record<Mode, Record<string, string>>
  /** Set on profiles built by the probe from the system's own components. */
  generated?: { probedAt: string; source: string; docs?: string; page: string; samples: Record<string, number> }
  /** Systems themed through a JS object export JSON keyed by token name. */
  json?: { strip: string; camel?: boolean; note: string }
  /** Variables the system stores as bare channels ("212 100% 47%"), written back that way. */
  formats?: Record<string, "color" | "hsl-channels" | "rgb-channels">
  /** Variables defined on a component selector rather than the root: key → name and selector. */
  scopes?: Record<string, { name: string; selector: string }>
}

export type Paint = { rgb: RGB; a: number }

export type Check = { req: Requirement; achieved: number; met: boolean }
export type Outcome = {
  recipe: Recipe
  /** Rendered paint and the surface under it. */
  fg: RGB
  bg: RGB
  achieved: number
  checks: Check[]
  met: boolean
  /** Met only in the sense that its variable is at the end of its range. */
  capped: boolean
  /** The accessibility floor for this element kind, whether or not it is forced. */
  spec?: {
    key: keyof A11y
    rule: string
    achieved: number
    metric: Metric
    pass: boolean
  }
}

export type ProfileResult = {
  profile: Profile
  mode: Mode
  values: Record<string, Paint & { css: string }>
  outcomes: Outcome[]
}

// ── Color reading ───────────────────────────────────────────────────────────

/** Parse the CSS a system ships: oklch() with optional alpha, hex, rgb(). */
function hslToRgb(h: number, s: number, l: number): RGB {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}

export function parseCss(css: string): Paint {
  css = css.trim().replace(/(\d)deg\b/g, "$1")
  let m = css.match(
    /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)(%?))?\s*\)$/
  )
  if (m) {
    const l = m[2] ? +m[1] / 100 : +m[1]
    const a = m[5] === undefined ? 1 : m[6] ? +m[5] / 100 : +m[5]
    return { rgb: toRgb({ l, c: +m[3], h: +m[4] }), a }
  }
  m = css.match(
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+)(%?))?\s*\)$/
  )
  if (m)
    return {
      rgb: [+m[1], +m[2], +m[3]],
      a: m[4] === undefined ? 1 : m[5] ? +m[4] / 100 : +m[4],
    }
  // hsl(), and shadcn v3's bare channels ("222.2 84% 4.9%").
  m = css.match(/^(?:hsla?\(\s*)?([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%(?:\s*[,/]\s*([\d.]+)(%?))?\s*\)?$/)
  if (m) {
    const a = m[4] === undefined ? 1 : m[5] ? +m[4] / 100 : +m[4]
    return { rgb: hslToRgb(+m[1], +m[2] / 100, +m[3] / 100), a }
  }
  m = css.match(/^#([0-9a-f]{6})([0-9a-f]{2})$/i)
  if (m) return { rgb: parseHex("#" + m[1])!, a: parseInt(m[2], 16) / 255 }
  const h = parseHex(css)
  if (h) return { rgb: h, a: 1 }
  throw new Error(`Unreadable color: ${css}`)
}

function mixOklch(a: Oklch, b: Oklch, k: number): Oklch {
  // Shorter-arc hue interpolation; achromatic sides take the other's hue.
  let ha = a.h
  let hb = b.h
  if (a.c < 1e-4) ha = hb
  if (b.c < 1e-4) hb = ha
  let d = hb - ha
  if (d > 180) d -= 360
  if (d < -180) d += 360
  return {
    l: a.l + (b.l - a.l) * k,
    c: a.c + (b.c - a.c) * k,
    h: (ha + d * k + 360) % 360,
  }
}

function mixOklab(a: Oklch, b: Oklch, k: number): Oklch {
  const toLab = (o: Oklch) => [
    o.l,
    o.c * Math.cos((o.h * Math.PI) / 180),
    o.c * Math.sin((o.h * Math.PI) / 180),
  ]
  const [l1, a1, b1] = toLab(a)
  const [l2, a2, b2] = toLab(b)
  const L = l1 + (l2 - l1) * k
  const A = a1 + (a2 - a1) * k
  const B = b1 + (b2 - b1) * k
  return {
    l: L,
    c: Math.hypot(A, B),
    h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360,
  }
}

export function evalExpr(e: Expr, values: Record<string, Paint>): Paint {
  if ("v" in e) {
    const p = values[e.v]
    if (!p) throw new Error(`Unsolved variable ${e.v}`)
    return p
  }
  if ("alpha" in e) {
    const p = evalExpr(e.alpha, values)
    return { rgb: p.rgb, a: p.a * e.k }
  }
  const [a, b] = e.mix.map((x) => evalExpr(x, values))
  const oa = rgbToOklch(a.rgb)
  const ob = rgbToOklch(b.rgb)
  const m = e.space === "oklch" ? mixOklch(oa, ob, e.k) : mixOklab(oa, ob, e.k)
  return { rgb: toRgb(m), a: a.a + (b.a - a.a) * e.k }
}

export const exprVars = (e: Expr): string[] =>
  "v" in e ? [e.v] : "alpha" in e ? exprVars(e.alpha) : e.mix.flatMap(exprVars)

const recipeVars = (r: Recipe) => [
  ...exprVars(r.paint),
  ...r.over.flatMap(exprVars),
  ...(r.against ?? []).flatMap(exprVars),
]

/** Flatten a stack of paints onto one opaque color, bottom to top. */
function flatten(stack: Paint[]): RGB {
  let out: RGB = stack[0].rgb
  for (const p of stack.slice(1)) out = composite(p.rgb, p.a, out)
  return out
}

export function measure(metric: Metric, fg: RGB, bg: RGB): number {
  return metric === "lc"
    ? Math.abs(lc(fg, bg))
    : metric === "dL"
      ? deltaL(fg, bg)
      : wcagRatio(fg, bg)
}

/** What a recipe renders, given variable values. */
export function render(r: Recipe, values: Record<string, Paint>) {
  const under = flatten(r.over.map((e) => evalExpr(e, values)))
  const p = evalExpr(r.paint, values)
  const bg = r.against
    ? flatten(r.against.map((e) => evalExpr(e, values)))
    : under
  return { fg: composite(p.rgb, p.a, under), bg }
}

const appliesTo = (r: Recipe, mode: Mode) => !r.modes || r.modes.includes(mode)

/**
 * The translucent form of a solid over a background: the lowest alpha whose
 * ink, composited over the background, lands on the solid. Radix derives its
 * alpha scales the same way; it keeps the solid's hue and chroma.
 */
export function translucentOf(s: RGB, b: RGB): Paint {
  let a = 0
  for (let i = 0; i < 3; i++) {
    const d = s[i] - b[i]
    a = Math.max(a, d > 0 ? d / (255 - b[i] || 1) : d < 0 ? -d / (b[i] || 1) : 0)
  }
  a = Math.min(1, Math.max(Math.ceil(a * 1000) / 1000, 0.001))
  const ink = s.map((c, i) => Math.round(Math.min(255, Math.max(0, b[i] + (c - b[i]) / a)))) as RGB
  return { rgb: ink, a }
}

// ── Requirements ────────────────────────────────────────────────────────────

/** Read the reference theme through its own recipes: the outcomes it renders today. */
export function readReference(
  profile: Profile,
  mode: Mode
): Record<string, number> {
  const ref = Object.fromEntries(
    Object.entries(profile.reference[mode]).map(([k, v]) => [k, parseCss(v)])
  )
  const out: Record<string, number> = {}
  for (const r of profile.recipes) {
    if (!appliesTo(r, mode)) continue
    if (recipeVars(r).some((v) => !ref[v])) continue
    const { fg, bg } = render(r, ref)
    out[r.id] = measure(r.metric, fg, bg)
  }
  return out
}

/**
 * Which way each reference pair points: the paint lighter (+1) or darker (-1)
 * than what's under it. Contrast metrics are unsigned, so without this a
 * white label on a blue button and a black one would both pass.
 */
export function readPolarity(profile: Profile, mode: Mode): Record<string, 1 | -1> {
  const ref = Object.fromEntries(Object.entries(profile.reference[mode]).map(([k, v]) => [k, parseCss(v)]))
  const out: Record<string, 1 | -1> = {}
  for (const r of profile.recipes) {
    if (!appliesTo(r, mode) || recipeVars(r).some((v) => !ref[v])) continue
    const { fg, bg } = render(r, ref)
    const d = rgbToOklch(fg).l - rgbToOklch(bg).l
    if (Math.abs(d) > 0.02) out[r.id] = d > 0 ? 1 : -1
  }
  return out
}

/** A measure that counts as negative when the pair points the wrong way. */
function signed(metric: Metric, fg: RGB, bg: RGB, polarity?: 1 | -1) {
  const v = measure(metric, fg, bg)
  if (!polarity) return v
  const d = rgbToOklch(fg).l - rgbToOklch(bg).l
  return Math.abs(d) > 0.005 && Math.sign(d) !== polarity ? -v : v
}

function requirementsFor(
  r: Recipe,
  intent: Intent,
  reference: Record<string, number>
): Requirement[] {
  const reqs: Requirement[] = []
  const s = intent.settings
  const engine = s.targetSource === "engine" ? intent.engine(r.element) : null
  // An engine target replaces the reference read, measured in its own metric.
  if (engine) reqs.push(engine)
  else if (reference[r.id] !== undefined)
    reqs.push({ metric: r.metric, min: reference[r.id], source: "reference" })
  const floor = A11Y_FLOORS[r.element]
  if (floor && s.a11y[floor.key])
    reqs.push({ ...floor.req, source: "accessibility" })
  return reqs
}

// ── Solve ───────────────────────────────────────────────────────────────────

export function solveProfile(profile: Profile, intent: Intent): ProfileResult {
  const { mode, settings: s } = intent
  const reference = readReference(profile, mode)
  const polarity = readPolarity(profile, mode)
  const recipes = profile.recipes.filter((r) => appliesTo(r, mode))
  const byName = Object.fromEntries(profile.vars.map((v) => [v.name, v]))
  const values: Record<string, Paint> = {}
  // Aliases and alpha forms resolve to the variable they derive from, so a
  // recipe painting --focus-8 or --gray-a7 drives --accent-8 or --gray-7.
  const derivedFrom = Object.fromEntries(
    profile.vars.flatMap((v) => (v.path.kind === "alias" || v.path.kind === "alphaOf" ? [[v.name, v.path]] : [])),
  ) as Record<string, Extract<Path, { kind: "alias" | "alphaOf" }>>
  const root = (n: string): string => (derivedFrom[n] ? root(derivedFrom[n].of) : n)
  const derivedOf = (n: string) => profile.vars.filter((v) => derivedFrom[v.name] && root(v.name) === n).map((v) => v.name)
  const derive = (name: string, vals: Record<string, Paint>): Paint => {
    const d = derivedFrom[name]
    const src = derivedFrom[d.of] ? derive(d.of, vals) : vals[d.of]
    return d.kind === "alias" ? src : translucentOf(src.rgb, vals[d.over].rgb)
  }
  // Variables that reached the end of their path and still fell short.
  const capped = new Set<string>()

  /** How a step variable moves: its candidate at distance t from its parent, and how far it can go. */
  const walker = (spec: VarSpec, parent: Paint) => {
    const p = spec.path as Extract<Path, { kind: "step" }>
    const pal = intent.palettes[p.palette]
    const rule: ChromaRule = { hue: pal.hue, baseChroma: pal.chroma, baseL: pal.l, factor: p.chroma ?? 1, holdSaturation: pal.holdSaturation }
    const translucent = p.translucent === "always" || (p.translucent === true && s.layer !== "flat")
    const parentL = rgbToOklch(parent.rgb).l
    const pageAway = mode === "light" ? -1 : 1
    // A direction can differ by mode (white text over a white page in light
    // mode, over a dark one in dark mode).
    const dir = typeof p.dir === "object" ? (p.dir[mode] ?? "away") : p.dir
    const away =
      dir === "back"
        ? -pageAway
        : dir === "contrast"
          ? Math.abs(lc([255, 255, 255], parent.rgb)) >= Math.abs(lc([0, 0, 0], parent.rgb))
            ? 1
            : -1
          : pageAway
    const candidate = (t: number): Paint => {
      if (translucent) return { rgb: away < 0 ? intent.inkPair[p.palette].dark : intent.inkPair[p.palette].light, a: t }
      const l = Math.min(1, Math.max(0, parentL + away * t))
      return { rgb: toRgb({ l, c: chromaAt(rule, l), h: pal.hue }), a: 1 }
    }
    const hi = translucent ? 1 : away < 0 ? parentL : 1 - parentL
    return { candidate, hi, translucent }
  }

  /**
   * The best a later variable could do: the far end of its path. A recipe
   * that constrains a variable it doesn't paint (a fixed state layer over a
   * color) holds that color only to what its painted partner can reach.
   */
  const extreme = (name: string, vals: Record<string, Paint>): Paint | null => {
    const spec = byName[name]
    if (spec?.path.kind !== "step" || !vals[spec.path.from]) return null
    const w = walker(spec, vals[spec.path.from])
    return w.candidate(w.hi)
  }

  /**
   * Solve one step variable against its recipes. In relax passes every other
   * variable already has a value, so recipes the first pass had to defer
   * (cycles in a generated profile) drive it too.
   */
  const solveStep = (spec: VarSpec, relax: boolean) => {
    const p = spec.path as Extract<Path, { kind: "step" }>
    // Solved, derivable from something solved, or (for alsoDrives) a later step whose parent is this variable.
    const known = (v: string): boolean => {
      if (values[v] || root(v) === spec.name) return true
      const d = derivedFrom[v]
      return !!d && known(d.of) && (d.kind === "alias" || known(d.over))
    }
    const later = (v: string) => byName[v]?.path.kind === "step" && (byName[v].path as { from: string }).from === spec.name
    const drivers = recipes.filter((r) => {
      if (r.check) return false
      if (exprVars(r.paint).some((v) => root(v) === spec.name)) return relax || recipeVars(r).every(known)
      if (r.alsoDrives?.includes(spec.name)) return recipeVars(r).every((v) => known(v) || later(v))
      return false
    })
    const reqs = drivers.map((r) => ({ r, reqs: requirementsFor(r, intent, reference) }))
    // A parent not solved yet (a cycle a generated profile couldn't order) falls back to the page.
    const w = walker(spec, values[p.from] ?? Object.values(values)[0])
    // How close a candidate comes: the worst requirement's margin, in units of its metric's range.
    const SCALE: Record<Metric, number> = { lc: 100, dL: 1, ratio: 20 }
    const score = (t: number) => {
      const c = w.candidate(t)
      const vals: Record<string, Paint> = { ...values, [spec.name]: c }
      for (const d of derivedOf(spec.name)) vals[d] = derive(d, vals)
      let worst = Infinity
      for (const { r, reqs: rq } of reqs) {
        if (recipeVars(r).some((x) => !vals[x] && !derivedFrom[x])) continue
        for (const x of recipeVars(r)) if (!vals[x] && derivedFrom[x]) vals[x] = derive(x, vals)
        const { fg, bg } = render(r, vals)
        for (const q of rq) worst = Math.min(worst, (signed(q.metric, fg, bg, polarity[r.id]) - q.min) / SCALE[q.metric])
      }
      return worst
    }
    const ok = (t: number) => {
      const c = w.candidate(t)
      const vals: Record<string, Paint> = { ...values, [spec.name]: c }
      for (const d of derivedOf(spec.name)) vals[d] = derive(d, vals)
      for (const { r } of reqs)
        for (const x of recipeVars(r)) {
          if (vals[x]) continue
          if (derivedFrom[x]) vals[x] = derive(x, vals)
          else {
            const e = extreme(x, vals)
            if (e) vals[x] = e
          }
        }
      return reqs.every(({ r, reqs }) => {
        const { fg, bg } = render(r, vals)
        return reqs.every((q) => signed(q.metric, fg, bg, polarity[r.id]) >= q.min - 1e-6)
      })
    }
    let t = w.hi
    if (ok(w.hi)) {
      let lo = 0
      for (let i = 0; i < 24; i++) {
        const mid = (lo + t) / 2
        if (ok(mid)) t = mid
        else lo = mid
      }
      capped.delete(spec.name)
    } else {
      // Pairs pointing both ways (a focus ring lighter than a button but darker
      // than the page) make the feasible range an interval, not a ray. Scan for it.
      const n = 48
      let found = -1
      for (let i = 1; i <= n; i++) if (ok((w.hi * i) / n)) {
        found = i
        break
      }
      if (found > 0) {
        let lo = (w.hi * (found - 1)) / n
        t = (w.hi * found) / n
        for (let i = 0; i < 20; i++) {
          const mid = (lo + t) / 2
          if (ok(mid)) t = mid
          else lo = mid
        }
        capped.delete(spec.name)
      } else {
        // Nothing satisfies every pair (the engine's colors moved a neighbor):
        // take the closest compromise rather than the end of the range.
        capped.add(spec.name)
        let best = w.hi
        let bestScore = -Infinity
        for (let i = 0; i <= 64; i++) {
          const tt = (w.hi * i) / 64
          const sc = score(tt)
          if (sc > bestScore + 1e-9) {
            bestScore = sc
            best = tt
          }
        }
        t = best
      }
    }
    // Translucent values ship rounded up to whole percents, like a designer would write them.
    // A layer the targets don't need at all ships fully transparent, not at 1%.
    if (w.translucent) t = t < 0.005 ? 0 : Math.min(1, Math.ceil(t * 100 - 1e-9) / 100)
    return w.candidate(t)
  }

  const stepVars: VarSpec[] = []
  for (const spec of profile.vars) {
    const p = spec.path
    if (p.kind === "page") {
      // Reference targets keep the system's own page lightness, in the engine's neutral.
      const ref = profile.reference[mode][spec.name]
      if (s.targetSource === "reference" && ref) {
        const l = rgbToOklch(parseCss(ref).rgb).l
        const n = intent.palettes.neutral
        values[spec.name] = { rgb: toRgb({ l, c: n.chroma * 0.55, h: n.hue }), a: 1 }
      } else values[spec.name] = { rgb: intent.surfaces.page, a: 1 }
    } else if (p.kind === "solid") values[spec.name] = { rgb: intent.solids[p.role], a: 1 }
    else if (p.kind === "onSolid") values[spec.name] = { rgb: intent.onSolid[p.role], a: 1 }
    else if (p.kind === "alias" || p.kind === "alphaOf") values[spec.name] = derive(spec.name, values)
    else if (p.kind === "series") values[spec.name] = { rgb: intent.series[p.index % intent.series.length], a: 1 }
    else {
      const surfaceKey = s.targetSource === "engine" ? p.engineSurface?.[mode] : undefined
      if (surfaceKey) {
        values[spec.name] = { rgb: intent.surfaces[surfaceKey], a: 1 }
        continue
      }
      values[spec.name] = solveStep(spec, false)
      stepVars.push(spec)
    }
  }

  // Relax: generated profiles can carry cycles (text over a fill that is itself
  // measured against that text). Re-solve each step against all of its recipes
  // until nothing moves.
  if (profile.generated) {
    for (let pass = 0; pass < 6; pass++) {
      let moved = 0
      for (const spec of stepVars) {
        const before = values[spec.name]
        const next = solveStep(spec, true)
        moved = Math.max(moved, Math.abs(rgbToOklch(next.rgb).l - rgbToOklch(before.rgb).l), Math.abs(next.a - before.a))
        values[spec.name] = next
        for (const d of derivedOf(spec.name)) values[d] = derive(d, values)
      }
      if (moved < 1e-3) break
    }
  }

  const outcomes: Outcome[] = recipes.map((r) => {
    const { fg, bg } = render(r, values)
    const reqs = requirementsFor(r, intent, reference)
    const checks = reqs.map((req) => {
      const achieved = signed(req.metric, fg, bg, polarity[r.id])
      return {
        req,
        achieved,
        met: achieved >= req.min - 0.005 * (req.metric === "lc" ? 100 : 1),
      }
    })
    // Short only because its variable ran out of range: nothing could reach further.
    const isCapped = !checks.every((c) => c.met) && exprVars(r.paint).some((v) => capped.has(root(v)))
    const floor = A11Y_FLOORS[r.element]
    const specAch = floor ? measure(floor.req.metric, fg, bg) : 0
    return {
      recipe: r,
      fg,
      bg,
      achieved: measure(r.metric, fg, bg),
      checks,
      met: checks.every((c) => c.met) || isCapped,
      capped: isCapped,
      spec: floor
        ? {
            key: floor.key,
            rule: floor.rule,
            achieved: specAch,
            metric: floor.req.metric,
            pass:
              specAch >=
              floor.req.min - (floor.req.metric === "lc" ? 0.5 : 0.005),
          }
        : undefined,
    }
  })

  const css = (v: Paint) => (v.a >= 1 ? hex(v.rgb) : rgbaCss(v.rgb, v.a))
  return {
    profile,
    mode,
    values: Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, { ...v, css: css(v) }])
    ),
    outcomes,
  }
}

/** Format an outcome number in its own metric. */
export function fmt(metric: Metric, n: number): string {
  return metric === "lc"
    ? `Lc ${Math.round(n)}`
    : metric === "dL"
      ? `ΔL ${n.toFixed(3)}`
      : `${n.toFixed(2)}:1`
}
