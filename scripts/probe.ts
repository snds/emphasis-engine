// Component probe. Renders each system's real components in headless
// Chromium, sets every color variable to a unique sentinel color, drives
// real hover, press, and keyboard focus, and reads back what each element
// actually paints. Each painted color is traced back to the variable (and
// opacity, or mix) that produced it, and to the surfaces underneath. The
// result is a recipe list generated from the components themselves, diffed
// against the hand-written profile.
//
//   npx tsx scripts/probe.ts [shadcn|radix|material ...]
//
// Writes src/engine/profiles/probes/<id>.json and docs/probes/<id>.md.
import { spawn } from "node:child_process"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { chromium, type Page } from "playwright"
import { hex, maxChroma, rgbToOklch, toRgb, type RGB } from "../src/engine/color"
import type { Expr, Profile } from "../src/engine/profile"
import { PROFILES, type ProfileId } from "../src/engine/profiles"
import type { Mode } from "../src/engine/settings"

const PORT = 5199
const BASE = `http://localhost:${PORT}`

// Which custom properties count as color variables for each system.
const PREFIX: Record<ProfileId, RegExp> = {
  shadcn: /^--(background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|chart-\d|sidebar)(-[\w-]+)?$/,
  radix: /^--(accent|gray|red|color|focus)-[\w-]+$/,
  material: /^--md-sys-color-[\w-]+$/,
}

// ── Browser side ────────────────────────────────────────────────────────────

type Sample = {
  probe: string
  path: string
  pseudo: string
  prop: string
  color: string
  opacity: number
  ownBg: string
  backdrop: string[]
}

/** Runs in the page: sample every painted color under one probe root. */
function sampleRoot(sel: string): Sample[] {
  const root = document.querySelector(sel)
  if (!root) return []
  const probe = root.getAttribute("data-probe")!
  const out: Sample[] = []
  const parentOf = (el: Element): Element | null =>
    el.parentElement ?? ((el.getRootNode() as ShadowRoot).host as Element | undefined) ?? null
  const opacityOf = (el: Element) => {
    let o = 1
    for (let e: Element | null = el; e; e = parentOf(e)) o *= +getComputedStyle(e).opacity || 0
    return o
  }
  /** Every element under a point, topmost first, descending into shadow roots. */
  const deepStack = (x: number, y: number): Element[] => {
    const expand = (scope: Document | ShadowRoot, seen: Set<Element>): Element[] => {
      const out: Element[] = []
      for (const e of scope.elementsFromPoint(x, y)) {
        if (seen.has(e)) continue
        seen.add(e)
        if (e.shadowRoot) out.push(...expand(e.shadowRoot, seen))
        out.push(e)
      }
      return out
    }
    return expand(document, new Set())
  }
  const bgsOf = (e: Element) => {
    const out: string[] = []
    // Topmost first: an element's ::after and ::before paint above its own background.
    for (const pseudo of ["::after", "::before", ""]) {
      const cs = getComputedStyle(e, pseudo || null)
      if (pseudo && (cs.content === "none" || cs.content === "normal")) continue
      const bg = cs.backgroundColor
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent" && +cs.opacity > 0) out.push(bg)
    }
    return out
  }
  /**
   * What's painted under an element: the hit-test stack at its center, below
   * it. That catches siblings drawn underneath (Material draws button
   * containers and state layers as siblings), not only ancestors.
   */
  const backdropOf = (el: Element) => {
    const r = el.getBoundingClientRect()
    const stack = deepStack(r.x + r.width / 2, r.y + r.height / 2)
    const at = stack.indexOf(el)
    const below = at >= 0 ? stack.slice(at + 1) : stack.filter((e) => !el.contains(e) && e !== el && !(e.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING) )
    const list: string[] = []
    for (const e of below) {
      if (e === el || el.contains(e)) continue
      list.push(...bgsOf(e))
      if (list.length > 14) break
    }
    return list
  }
  const visible = (el: Element) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none"
  }
  const visit = (el: Element, path: string) => {
    if (el !== root && el.hasAttribute("data-probe")) return
    if (!visible(el)) return
    const ownBg = getComputedStyle(el).backgroundColor
    const backdrop = backdropOf(el)
    const opacity = opacityOf(el)
    for (const pseudo of ["", "::before", "::after"]) {
      const cs = getComputedStyle(el, pseudo || null)
      if (pseudo && (cs.content === "none" || cs.content === "normal") && cs.display === "none") continue
      if (pseudo && cs.content === "none") continue
      const push = (prop: string, color: string, op = opacity) => {
        if (!color || color === "rgba(0, 0, 0, 0)" || color === "transparent") return
        out.push({ probe, path, pseudo, prop, color, opacity: op * (pseudo ? +cs.opacity : 1), ownBg: pseudo ? ownBg : (prop === "background-color" ? "" : ownBg), backdrop: pseudo ? [ownBg, ...backdrop].filter((c) => c !== "rgba(0, 0, 0, 0)") : backdrop })
      }
      push("background-color", cs.backgroundColor)
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())
      if (!pseudo && (hasText || el.tagName === "INPUT")) push("color", cs.color)
      if (!pseudo && el.tagName === "INPUT") push("placeholder", getComputedStyle(el, "::placeholder").color)
      if (!pseudo && el instanceof SVGElement) {
        if (cs.fill !== "none") push("fill", cs.fill)
        if (cs.stroke !== "none") push("stroke", cs.stroke)
      }
      const sides = ["top", "right", "bottom", "left"].filter(
        (s) => parseFloat(cs.getPropertyValue(`border-${s}-width`)) > 0 && cs.getPropertyValue(`border-${s}-style`) !== "none",
      )
      for (const c of new Set(sides.map((s) => cs.getPropertyValue(`border-${s}-color`)))) push("border", c)
      if (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) push("outline", cs.outlineColor)
      if (cs.boxShadow && cs.boxShadow !== "none") {
        // Rings and hairlines only: zero blur, a spread. Elevation shadows are skipped.
        for (const layer of cs.boxShadow.split(/,(?![^(]*\))/)) {
          const color = layer.match(/(rgba?|oklab|oklch|color)\([^)]*\)/)?.[0]
          const nums = layer.replace(/(rgba?|oklab|oklch|color)\([^)]*\)/, "").match(/-?[\d.]+px/g)?.map(parseFloat) ?? []
          const [, , blur = 0, spread = 0] = nums
          if (color && blur === 0 && spread > 0) push(layer.includes("inset") ? "inset-ring" : "ring", color)
        }
      }
    }
    const kids = [...((el as HTMLElement).shadowRoot?.children ?? []), ...el.children]
    kids.forEach((k, i) => visit(k, `${path}>${k.tagName.toLowerCase()}${i}`))
  }
  visit(root, root.tagName.toLowerCase())
  return out
}

// ── Node side: reading colors back ──────────────────────────────────────────

type Paint = { rgb: RGB; a: number }

function parseComputed(css: string): Paint | null {
  css = css.trim()
  let m = css.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/)
  if (m) return { rgb: [+m[1], +m[2], +m[3]], a: m[4] === undefined ? 1 : +m[4] }
  m = css.match(/^color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([\d.]+))?\)$/)
  if (m) return { rgb: [+m[1], +m[2], +m[3]].map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255)) as RGB, a: m[4] === undefined ? 1 : +m[4] }
  m = css.match(/^oklab\(([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([\d.]+))?\)$/)
  if (m) {
    const [l, A, B] = [+m[1], +m[2], +m[3]]
    return { rgb: toRgb({ l, c: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 }), a: m[4] === undefined ? 1 : +m[4] }
  }
  m = css.match(/^oklch\(([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([\d.]+))?\)$/)
  if (m) return { rgb: toRgb({ l: +m[1], c: +m[2], h: +m[3] }), a: m[4] === undefined ? 1 : +m[4] }
  return null
}

/**
 * Distinct, in-gamut sentinel colors. Four lightness bands with hues spaced
 * evenly inside each band, so no two sentinels sit closer than one band step
 * or one hue step; a small mix (5%) can never land on a different sentinel.
 */
function sentinels(names: string[]): Map<string, RGB> {
  const out = new Map<string, RGB>()
  const bands = [0.4, 0.54, 0.68, 0.82]
  const perBand = Math.ceil(names.length / bands.length)
  names.forEach((n, i) => {
    const band = i % bands.length
    const slot = Math.floor(i / bands.length)
    const h = (slot * (360 / perBand) + band * (90 / perBand)) % 360
    const l = bands[band]
    out.set(n, toRgb({ l, c: Math.min(0.13, maxChroma(l, h) * 0.9), h }))
  })
  return out
}

const dist = (a: RGB, b: RGB) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]))

function mixOklch(a: RGB, b: RGB, k: number): RGB {
  const oa = rgbToOklch(a)
  const ob = rgbToOklch(b)
  let d = ob.h - oa.h
  if (d > 180) d -= 360
  if (d < -180) d += 360
  return toRgb({ l: oa.l + (ob.l - oa.l) * k, c: oa.c + (ob.c - oa.c) * k, h: (oa.h + d * k + 360) % 360 })
}

/** Trace a painted color back to the expression that made it. */
function trace(p: Paint, sent: Map<string, RGB>): Expr | { literal: string } {
  const round = (a: number) => Math.round(a * 1000) / 1000
  let best: [string, number] | null = null
  for (const [n, rgb] of sent) {
    const d = dist(rgb, p.rgb)
    if (!best || d < best[1]) best = [n, d]
  }
  if (best && best[1] <= 1) return p.a < 0.999 ? { alpha: { v: best[0] }, k: round(p.a) } : { v: best[0] }
  // A blend of two variables: try every pair, solving for the mix amount on lightness.
  if (p.a >= 0.999) {
    const L = rgbToOklch(p.rgb).l
    let pick: { a: string; b: string; k: number; d: number } | null = null
    for (const [na, ra] of sent)
      for (const [nb, rb] of sent) {
        if (na === nb) continue
        const la = rgbToOklch(ra).l
        const lb = rgbToOklch(rb).l
        if (Math.abs(lb - la) < 0.02) continue
        const k = (L - la) / (lb - la)
        if (k <= 0.005 || k >= 0.5) continue
        const d = dist(mixOklch(ra, rb, k), p.rgb)
        if (d <= 3 && (!pick || d < pick.d)) {
          // Designers write whole percents; snap when the snapped amount still lands.
          const k2 = Math.round(k * 100) / 100
          pick = dist(mixOklch(ra, rb, k2), p.rgb) <= 3 ? { a: na, b: nb, k: k2, d } : { a: na, b: nb, k: round(k), d }
        }
      }
    if (pick) return { mix: [{ v: pick.a }, { v: pick.b }], k: pick.k, space: "oklch" }
  }
  return { literal: p.a < 0.999 ? `${hex(p.rgb)}@${round(p.a)}` : hex(p.rgb) }
}

type Traced = Expr | { literal: string }
const key = (e: Traced): string =>
  "literal" in e ? e.literal : "v" in e ? e.v : "alpha" in e ? `${key(e.alpha)}/${e.k}` : `mix(${key(e.mix[0])},${key(e.mix[1])},${e.k})`

/** The opaque stack under an element, bottom to top, as expressions. */
function stack(colors: string[], sent: Map<string, RGB>): Traced[] {
  const out: Traced[] = []
  for (const c of colors) {
    const p = parseComputed(c)
    if (!p || p.a <= 0.001) continue
    out.unshift(trace(p, sent))
    if (p.a >= 0.999) break
  }
  return out
}

// ── Running a system ────────────────────────────────────────────────────────

type Found = { key: string; paint: Traced; over: Traced[]; prop: string; sources: string[] }

async function discoverVars(page: Page, prefix: RegExp, profile: Profile): Promise<string[]> {
  const names: string[] = await page.evaluate(() => {
    const out = new Set<string>()
    const scan = (rules: CSSRuleList) => {
      for (const r of Array.from(rules)) {
        if ("cssRules" in r && (r as CSSGroupingRule).cssRules) scan((r as CSSGroupingRule).cssRules)
        if ("style" in r) for (const p of Array.from((r as CSSStyleRule).style)) if (p.startsWith("--")) out.add(p)
      }
    }
    for (const s of Array.from(document.styleSheets)) {
      try {
        scan(s.cssRules)
      } catch {
        /* cross-origin sheet */
      }
    }
    return [...out]
  })
  const set = new Set([...profile.vars.map((v) => v.name), ...names.filter((n) => prefix.test(n))])
  return [...set].sort()
}

async function applySentinels(page: Page, id: ProfileId, sent: Map<string, RGB>, mode: Mode) {
  const decl = [...sent].map(([n, rgb]) => `${n}: ${hex(rgb)}`).join("; ")
  await page.evaluate(
    ({ decl, mode, id }) => {
      const html = document.documentElement
      html.classList.toggle("dark", mode === "dark")
      html.classList.toggle("light", mode === "light")
      // Radix scopes its variables to the Theme element; the rest read from the root.
      const targets = id === "radix" ? Array.from(document.querySelectorAll<HTMLElement>(".radix-themes")) : [html]
      for (const t of targets) t.setAttribute("style", decl)
      const still = "*,*::before,*::after{transition:none!important;animation:none!important}"
      const style = document.getElementById("probe-still") ?? document.head.appendChild(Object.assign(document.createElement("style"), { id: "probe-still" }))
      style.textContent = still
      // Shadow roots don't see document styles; stop their transitions too.
      const sheet = new CSSStyleSheet()
      sheet.replaceSync(still)
      const walk = (n: Element) => {
        if (n.shadowRoot && !n.shadowRoot.adoptedStyleSheets.includes(sheet)) {
          n.shadowRoot.adoptedStyleSheets = [...n.shadowRoot.adoptedStyleSheets, sheet]
          Array.from(n.shadowRoot.children).forEach(walk)
        }
        Array.from(n.children).forEach(walk)
      }
      walk(document.documentElement)
    },
    { decl, mode, id },
  )
  await page.waitForTimeout(150)
}

async function probeSystem(id: ProfileId) {
  const profile = PROFILES[id]
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1600, height: 1400 }, reducedMotion: "reduce" })
  // tsx keeps function names with a helper that doesn't exist in the page.
  await page.addInitScript(() => ((window as unknown as { __name: (f: unknown) => unknown }).__name = (f) => f))
  await page.goto(`${BASE}/probe/${id}.html`)
  await page.waitForTimeout(1500)
  const names = await discoverVars(page, PREFIX[id], profile)
  const sent = sentinels(names)
  const result: Record<Mode, { samples: number; found: Found[] }> = { light: { samples: 0, found: [] }, dark: { samples: 0, found: [] } }

  for (const mode of ["light", "dark"] as Mode[]) {
    await applySentinels(page, id, sent, mode)
    const roots: string[] = await page.evaluate(() => Array.from(document.querySelectorAll("[data-probe]")).map((e) => e.getAttribute("data-probe")!))
    const all: (Sample & { state: string })[] = []
    for (const name of roots) {
      const sel = `[data-probe="${name}"]`
      const take = async (state: string) => {
        const s = (await page.evaluate(sampleRoot, sel)) as Sample[]
        all.push(...s.map((x) => ({ ...x, state })))
      }
      await page.mouse.move(0, 0)
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
      await take("rest")
      const box = await page.locator(sel).boundingBox()
      if (!box) continue
      const cx = box.x + Math.min(box.width / 2, 24)
      const cy = box.y + box.height / 2
      await page.mouse.move(cx, cy)
      await page.waitForTimeout(60)
      await take("hover")
      await page.mouse.down()
      await page.waitForTimeout(60)
      await take("pressed")
      await page.mouse.up()
      await page.mouse.move(0, 0)
      // Keyboard modality first, so programmatic focus shows focus-visible.
      await page.keyboard.press("Shift")
      await page.evaluate((s) => (document.querySelector(s) as HTMLElement | null)?.focus(), sel)
      await page.waitForTimeout(60)
      await take("focus")
    }
    result[mode].samples = all.length

    // Collapse samples into recipes: one per (paint, stack), with every source that produced it.
    const map = new Map<string, Found>()
    for (const s of all) {
      const p = parseComputed(s.color)
      if (!p) continue
      // Invisible paints (a state layer at rest) aren't pairs anyone sees.
      if (p.a * s.opacity < 0.005) continue
      const paint = trace({ rgb: p.rgb, a: p.a * s.opacity }, sent)
      if ("literal" in paint) continue
      // Backgrounds, outer rings, and outlines paint over what's behind the box; text,
      // borders, and inset rings paint over the box's own background.
      const outside = s.prop === "background-color" || s.prop === "ring" || s.prop === "outline"
      const under = outside ? s.backdrop : [s.ownBg, ...s.backdrop].filter(Boolean)
      const over = stack(under, sent)
      if (!over.length) continue
      const k = `${key(paint)} | ${over.map(key).join(" > ")}`
      const src = `${s.probe.split("@")[0]} ${s.state} ${s.prop}`
      const f = map.get(k) ?? { key: k, paint, over, prop: s.prop, sources: [] }
      if (!f.sources.includes(src)) f.sources.push(src)
      map.set(k, f)
    }
    result[mode].found = [...map.values()].sort((a, b) => b.sources.length - a.sources.length)
  }
  await browser.close()
  return { names, result }
}

// ── Diff against the hand-written profile ───────────────────────────────────

/** A hand recipe's key, with the stack trimmed to its topmost opaque layer, as the probe sees it. */
const recipeKey = (paint: Expr, over: Expr[]) => {
  let from = 0
  over.forEach((e, i) => {
    if ("v" in e) from = i
  })
  return `${key(paint)} | ${over.slice(from).map(key).join(" > ")}`
}
/** Keys compare with opacity rounded to a hundredth; 8-bit compositing jitters the third place. */
const loose = (k: string) => k.replace(/\/(\d\.\d+)/g, (_, a) => `/${(+a).toFixed(2)}`)

/** Aliases read as the variable they mirror (--card-foreground is --foreground in this profile). */
function canon(profile: Profile, k: string) {
  const alias = Object.fromEntries(profile.vars.flatMap((v) => (v.path.kind === "alias" ? [[v.name, v.path.of]] : [])))
  const root = (n: string): string => (alias[n] ? root(alias[n]) : n)
  return loose(k).replace(/--[\w-]+/g, (n) => root(n))
}

function diff(profile: Profile, mode: Mode, found: Found[]) {
  // Convention recipes (a scale step on the page) describe intent, not a component paint.
  const loose_ = loose
  const loose2 = (k: string) => canon(profile, loose_(k))
  const seen = new Set(found.map((f) => loose2(f.key)))
  const hand = profile.recipes.filter((r) => (!r.modes || r.modes.includes(mode)) && !r.convention)
  const observed = hand.filter((r) => seen.has(loose2(recipeKey(r.paint, r.over)))).map((r) => r.id)
  const unobserved = hand.filter((r) => !observed.includes(r.id)).map((r) => ({ id: r.id, key: recipeKey(r.paint, r.over), source: r.source }))
  const handKeys = new Set(hand.map((r) => loose2(recipeKey(r.paint, r.over))))
  const candidates = found.filter((f) => !handKeys.has(loose2(f.key)))
  // Same paint seen, but only over other surfaces: the recipe's paint is right; its surface wasn't in the harness.
  const paintOf = (k: string) => k.split(" | ")[0]
  const seenPaints = new Set(found.map((f) => paintOf(loose2(f.key))))
  const elsewhere = unobserved.filter((u) => seenPaints.has(paintOf(loose2(u.key)))).map((u) => u.id)
  return { observed, unobserved, candidates, elsewhere }
}

async function main() {
  const ids = (process.argv.slice(2).length ? process.argv.slice(2) : ["shadcn", "radix", "material"]) as ProfileId[]
  const vite = spawn("npx", ["vite", "--port", String(PORT), "--strictPort"], { stdio: "ignore" })
  try {
    for (let i = 0; i < 60; i++) {
      try {
        if ((await fetch(BASE)).ok) break
      } catch {
        /* not up yet */
      }
      await new Promise((r) => setTimeout(r, 500))
    }
    mkdirSync("src/engine/profiles/probes", { recursive: true })
    mkdirSync("docs/probes", { recursive: true })
    const pkg = JSON.parse(readFileSync("package.json", "utf8"))
    for (const id of ids) {
      const t0 = Date.now()
      const { names, result } = await probeSystem(id)
      const profile = PROFILES[id]
      const out = {
        profile: id,
        probedAt: new Date().toISOString().slice(0, 10),
        source:
          id === "shadcn" ? "this app's preset components (b1sABueby, Base UI)" : id === "radix" ? `@radix-ui/themes ${pkg.devDependencies["@radix-ui/themes"]}` : `@material/web ${pkg.devDependencies["@material/web"]}`,
        variables: names.length,
        modes: Object.fromEntries(
          (["light", "dark"] as Mode[]).map((m) => {
            const d = diff(profile, m, result[m].found)
            return [m, { samples: result[m].samples, recipes: result[m].found.length, observed: d.observed, elsewhere: d.elsewhere, unobserved: d.unobserved, candidates: d.candidates.map((c) => ({ key: c.key, prop: c.prop, sources: c.sources })) }]
          }),
        ),
      }
      writeFileSync(`src/engine/profiles/probes/${id}.json`, JSON.stringify(out, null, 1))
      writeFileSync(`docs/probes/${id}.md`, report(profile, out))
      const l = out.modes.light as { observed: string[]; unobserved: unknown[]; candidates: unknown[] }
      console.log(`${id}: ${names.length} vars · light observed ${l.observed.length}, unobserved ${l.unobserved.length}, candidates ${l.candidates.length} · ${((Date.now() - t0) / 1000).toFixed(0)}s`)
    }
  } finally {
    vite.kill()
  }
}

type Out = {
  profile: string
  probedAt: string
  source: string
  variables: number
  modes: Record<string, { samples: number; recipes: number; observed: string[]; elsewhere: string[]; unobserved: { id: string; key: string; source: string }[]; candidates: { key: string; prop: string; sources: string[] }[] }>
}

function report(profile: Profile, o: Out): string {
  const lines = [
    `# Probe: ${profile.label}`,
    "",
    `Probed ${o.probedAt} from ${o.source}. ${o.variables} color variables set to sentinel colors; real hover, press, and keyboard focus; every painted color traced back to its variable, opacity, or mix, and to the surfaces underneath.`,
    "",
  ]
  for (const [mode, m] of Object.entries(o.modes)) {
    const hand = m.observed.length + m.unobserved.length
    lines.push(`## ${mode[0].toUpperCase()}${mode.slice(1)} mode`, "")
    lines.push(
      `${m.samples} samples collapsed to ${m.recipes} distinct pairs. ${m.observed.length} of ${hand} profile recipes observed exactly; ${m.elsewhere.length} more had their paint observed over a different surface.`,
      "",
    )
    if (m.unobserved.length) {
      lines.push("### Profile recipes not observed", "", "| Recipe | Pair | Written from | Paint seen elsewhere |", "| --- | --- | --- | --- |")
      for (const u of m.unobserved) lines.push(`| ${u.id} | \`${u.key}\` | ${u.source.replace(/\|/g, "\\|")} | ${m.elsewhere.includes(u.id) ? "yes" : ""} |`)
      lines.push("")
    }
    if (m.candidates.length) {
      lines.push("### Pairs the components paint that the profile doesn't list", "", "| Pair | Seen in |", "| --- | --- |")
      for (const c of m.candidates.slice(0, 60)) lines.push(`| \`${c.key}\` | ${c.sources.slice(0, 4).join(", ")}${c.sources.length > 4 ? `, +${c.sources.length - 4}` : ""} |`)
      if (m.candidates.length > 60) lines.push(`| … ${m.candidates.length - 60} more | |`)
      lines.push("")
    }
  }
  return lines.join("\n")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
