// Component probe. Renders each system's real components in headless
// Chromium, sets every color variable to a unique sentinel color, drives real
// hover, press, and keyboard focus, and reads back what each element paints.
// Each painted color is traced to the variable (and opacity, or mix) that
// produced it, and to the surfaces underneath.
//
// Hand-written profiles are diffed against what the components paint.
// Generated profiles are built from it.
//
//   npm run probe [ids...]
//
// Writes src/engine/profiles/probes/<id>.json (hand), src/engine/profiles/generated/<id>.json
// (generated), and docs/probes/<id>.md.
import { spawn } from "node:child_process"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { chromium, type Page } from "playwright"
import type { Expr, Profile } from "../src/engine/profile"
import { HAND_PROFILES } from "../src/engine/profiles/hand"
import type { Mode } from "../src/engine/settings"
import { applySentinels, discoverVars, readVars, restoreSentinels, sampleRoot, stillness, type FoundVar, type Sample } from "./probe-lib/browser"
import { generateProfile, type Found, type ModeData } from "./probe-lib/generate"
import { formatAs, key, parseComputed, parseStock, sentinels, stack, trace, type Format, type Traced } from "./probe-lib/trace"
import { SYSTEM, SYSTEMS, type SystemDef } from "./systems"

const PORT = 5199
const BASE = `http://localhost:${PORT}`
const MODES: Mode[] = ["light", "dark"]

async function setMode(page: Page, mode: Mode) {
  await page.evaluate(async (m) => {
    if (window.__probe) await window.__probe.setMode(m)
    else {
      document.documentElement.classList.toggle("dark", m === "dark")
      document.documentElement.classList.toggle("light", m === "light")
    }
  }, mode)
  await page.waitForTimeout(250)
  await page.evaluate(stillness)
}

async function sampleAll(page: Page) {
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
    // Hit-testing only sees the viewport; bring the root into it first.
    await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: "center" }), sel)
    await take("rest")
    const box = await page.locator(sel).first().boundingBox()
    if (!box || box.width === 0) continue
    await page.mouse.move(box.x + Math.min(box.width / 2, 24), box.y + box.height / 2)
    await page.waitForTimeout(60)
    await take("hover")
    await page.mouse.down()
    await page.waitForTimeout(60)
    await take("pressed")
    await page.mouse.up()
    await page.mouse.move(0, 0)
    // Keyboard modality first, so programmatic focus shows focus-visible.
    await page.keyboard.press("Shift")
    await page.evaluate((s) => {
      const el = document.querySelector(s) as HTMLElement | null
      const target = el?.matches("button, input, a, [tabindex]") ? el : (el?.querySelector("button, input, a, [tabindex]") as HTMLElement | null) ?? el
      target?.focus()
    }, sel)
    await page.waitForTimeout(60)
    await take("focus")
  }
  return all
}

/** A seeded shuffle, so the second sentinel pass is different but repeatable. */
function shuffle<T>(xs: T[]): T[] {
  const out = [...xs]
  let seed = 0x9e3779b9
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    const j = seed % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Two traces name the same variables in the same shape, with amounts within sampling noise. */
function same(a: Traced, b: Traced): boolean {
  if ("literal" in a || "literal" in b) return false
  if ("v" in a || "v" in b) return "v" in a && "v" in b && a.v === b.v
  if ("alpha" in a || "alpha" in b) return "alpha" in a && "alpha" in b && Math.abs(a.k - b.k) <= 0.02 && same(a.alpha, b.alpha)
  return "mix" in a && "mix" in b && Math.abs(a.k - b.k) <= 0.06 && same(a.mix[0], b.mix[0]) && same(a.mix[1], b.mix[1])
}

async function probeSystem(def: SystemDef, hand?: Profile) {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: hand ? 1600 : 1280, height: 1600 }, reducedMotion: "reduce" })
  // tsx keeps function names with a helper that doesn't exist in the page.
  await page.addInitScript(() => ((window as unknown as { __name: (f: unknown) => unknown }).__name = (f) => f))
  const errors: string[] = []
  page.on("pageerror", (e) => errors.push(e.message))
  // Hand profiles are diffed against their harness. Generated profiles are built from the
  // native page: the same components, layout, and content the app shows, every one of them.
  await page.goto(hand ? `${BASE}/probe/${def.id}.html` : `${BASE}/native/${def.id}.html?probe`)
  await page.waitForTimeout(3000)

  // Discover variables in both modes, then read their stock values.
  const found = new Map<string, FoundVar>()
  const rootSelectors = new Set<string>()
  for (const mode of MODES) {
    await setMode(page, mode)
    const d = await page.evaluate(discoverVars, { prefix: def.prefix.source, exclude: def.exclude?.source ?? null })
    for (const v of d.vars) found.set(v.key, v)
    for (const r of d.rootSelectors) rootSelectors.add(r)
  }
  if (hand) for (const v of hand.vars) if (!found.has(v.name)) found.set(v.name, { key: v.name, name: v.name, selector: null })
  const rootNames = new Set([...found.values()].filter((v) => !v.selector).map((v) => v.name))
  // A component selector that redefines a root variable is the same variable there, not a new one.
  // Remaps (a component pointing the variable at another one) are left alone.
  const redefs = [...found.values()].filter((v) => v.selector && rootNames.has(v.name) && !v.remap).map((v) => ({ name: v.name, selector: v.selector! }))
  let vars = [...found.values()].filter((v) => !v.selector || !rootNames.has(v.name))
  const stock = {} as Record<Mode, Record<string, string>>
  for (const mode of MODES) {
    await setMode(page, mode)
    stock[mode] = await page.evaluate(readVars, vars)
  }
  const handNames = new Set(hand?.vars.map((v) => v.name) ?? [])
  vars = vars.filter((v) => handNames.has(v.key) || MODES.some((m) => stock[m][v.key] && parseStock(stock[m][v.key])))
  const keys = vars.map((v) => v.key).sort()
  if (process.env.PROBE_DEBUG) console.log(def.id, "found", found.size, "root", rootNames.size, "kept", keys.length, keys.slice(0, 12), Object.entries(stock.light).slice(0, 5))
  const sent = sentinels(keys)
  // A second, shuffled assignment. A traced color counts only if both passes trace it to the
  // same variables: a build-time literal (Bootstrap's link hover) can land near a blend of two
  // sentinels by chance once, but not under two unrelated assignments.
  const sentB = sentinels(shuffle(keys))
  const format = (k: string): Format => (MODES.map((m) => stock[m][k] && parseStock(stock[m][k])?.format).find(Boolean) as Format) ?? "color"

  const result = {} as Record<Mode, { samples: number; found: Found[]; rejected: number }>
  const pass = async (assign: typeof sent) => {
    await page.evaluate(applySentinels, {
      values: vars.map((v) => ({ key: v.key, name: v.name, selector: v.selector, value: formatAs(format(v.key), assign.get(v.key)!) })),
      scopedRedefs: redefs,
      rootSelectors: [...rootSelectors],
    })
    await page.waitForTimeout(200)
    const samples = await sampleAll(page)
    await page.evaluate(restoreSentinels)
    return samples
  }
  // Backgrounds, outer rings, and outlines paint over what's behind the box;
  // text, borders, and inset rings over the box's own background.
  const traced = (s: Sample, assign: typeof sent) => {
    const p = parseComputed(s.color)
    if (!p || p.a * s.opacity < 0.005) return null // invisible: a state layer at rest
    const paint = trace({ rgb: p.rgb, a: p.a * s.opacity }, assign)
    if ("literal" in paint) return null
    const outside = s.prop === "background-color" || s.prop === "ring" || s.prop === "outline"
    const under = outside ? s.backdrop : [s.ownBg, ...s.backdrop].filter(Boolean)
    const over = stack(under, assign)
    if (!over.length) return null
    return { paint, over }
  }
  const sampleId = (s: Sample & { state: string }) => `${s.probe}|${s.state}|${s.path}|${s.pseudo}|${s.prop}`
  for (const mode of MODES) {
    await setMode(page, mode)
    const samples = await pass(sent)
    await setMode(page, mode)
    const second = new Map((await pass(sentB)).map((s) => [sampleId(s), s]))

    // Collapse samples into pairs: one per (paint, stack), with every source that produced it.
    const map = new Map<string, Found>()
    let rejected = 0
    for (const s of samples) {
      const a = traced(s, sent)
      if (!a) continue
      const twin = second.get(sampleId(s))
      const b = twin && traced(twin, sentB)
      // Same variables in both passes; alpha and mix amounts within sampling noise.
      if (process.env.PROBE_TRACE && s.probe.includes(process.env.PROBE_TRACE))
        console.log(mode, s.state, s.prop, s.path, "A:", key(a.paint), "|", a.over.map(key).join(" > "), " B:", b ? `${key(b.paint)} | ${b.over.map(key).join(" > ")}` : twin ? "untraceable" : "missing")
      if (!b || !same(a.paint, b.paint) || a.over.length !== b.over.length || a.over.some((e, i) => !same(e, b.over[i]))) {
        rejected++
        continue
      }
      const { paint, over } = a
      const k = `${key(paint)} | ${over.map(key).join(" > ")}`
      const src = `${s.probe} ${s.state} ${s.prop}`
      // One pair per property too: a color as a checkbox's focus outline and the same color as a
      // button's fill over the same surface are different jobs.
      const f = map.get(`${k} #${s.prop}`) ?? { key: k, paint, over, prop: s.prop, sources: [] }
      if (!f.sources.includes(src)) f.sources.push(src)
      map.set(`${k} #${s.prop}`, f)
    }
    result[mode] = { samples: samples.length, rejected, found: [...map.values()].sort((a, b) => b.sources.length - a.sources.length) }
    if (process.env.PROBE_DEBUG) {
      console.log(mode, "samples", samples.length, "pairs", map.size)
      const lit = samples.slice(0, 400).filter((x) => x.probe.startsWith("text@page")).map((x) => [x.prop, x.color, x.backdrop.slice(0, 3)])
      console.log(JSON.stringify(lit.slice(0, 4)))
    }
  }
  await browser.close()
  // Source order across the page's stylesheets, as discovery met each rule.
  const meta = Object.fromEntries(vars.map((v, i) => [v.key, { name: v.name, selector: v.selector, order: i }]))
  return { keys, stock, result, meta, errors }
}

// ── Diff against a hand-written profile ─────────────────────────────────────

/** A hand recipe's key, with the stack trimmed to its topmost opaque layer, as the probe sees it. */
const recipeKey = (paint: Expr, over: Expr[]) => {
  let from = 0
  over.forEach((e, i) => {
    if ("v" in e) from = i
  })
  return `${key(paint)} | ${over.slice(from).map(key).join(" > ")}`
}
/** Opacity compares to a hundredth; 8-bit compositing jitters the third place. */
const loose = (k: string) => k.replace(/\/(\d\.\d+)/g, (_, a) => `/${(+a).toFixed(2)}`)
/** Aliases read as the variable they mirror. */
function canon(profile: Profile, k: string) {
  const alias = Object.fromEntries(profile.vars.flatMap((v) => (v.path.kind === "alias" ? [[v.name, v.path.of]] : [])))
  const root = (n: string): string => (alias[n] ? root(alias[n]) : n)
  return loose(k).replace(/--[\w-]+/g, (n) => root(n))
}

function diff(profile: Profile, mode: Mode, found: Found[]) {
  const norm = (k: string) => canon(profile, k)
  const seen = new Set(found.map((f) => norm(f.key)))
  // Convention recipes state intent, not a component paint.
  const hand = profile.recipes.filter((r) => (!r.modes || r.modes.includes(mode)) && !r.convention)
  const observed = hand.filter((r) => seen.has(norm(recipeKey(r.paint, r.over)))).map((r) => r.id)
  const unobserved = hand.filter((r) => !observed.includes(r.id)).map((r) => ({ id: r.id, key: recipeKey(r.paint, r.over), source: r.source }))
  const handKeys = new Set(hand.map((r) => norm(recipeKey(r.paint, r.over))))
  const candidates = found.filter((f) => !handKeys.has(norm(f.key)))
  const paintOf = (k: string) => k.split(" | ")[0]
  const seenPaints = new Set(found.map((f) => paintOf(norm(f.key))))
  const elsewhere = unobserved.filter((u) => seenPaints.has(paintOf(norm(u.key)))).map((u) => u.id)
  return { observed, unobserved, candidates, elsewhere }
}

function handReport(profile: Profile, o: { probedAt: string; source: string; variables: number; modes: Record<string, ReturnType<typeof diff> & { samples: number; recipes: number }> }) {
  const lines = [
    `# Probe: ${profile.label}`,
    "",
    `Probed ${o.probedAt} from ${o.source}. ${o.variables} color variables set to sentinel colors; real hover, press, and keyboard focus; every painted color traced back to its variable, opacity, or mix, and to the surfaces underneath.`,
    "",
  ]
  for (const [mode, m] of Object.entries(o.modes)) {
    lines.push(`## ${mode[0].toUpperCase()}${mode.slice(1)} mode`, "")
    lines.push(`${m.samples} samples collapsed to ${m.recipes} distinct pairs. ${m.observed.length} of ${m.observed.length + m.unobserved.length} profile recipes observed exactly; ${m.elsewhere.length} more had their paint observed over a different surface.`, "")
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

// Raw probe results are cached, so the generator can be re-run without a browser:
//   npm run probe -- --cached carbon antd
const CACHE = "node_modules/.cache/probe"

async function main() {
  const argv = process.argv.slice(2)
  const cached = argv.includes("--cached")
  const named = argv.filter((a) => !a.startsWith("--"))
  const ids = named.length ? named : SYSTEMS.map((s) => s.id)
  const vite = spawn("npx", cached ? ["true"] : ["vite", "--port", String(PORT), "--strictPort"], { stdio: "ignore" })
  try {
    for (let i = 0; i < 60 && !cached; i++) {
      try {
        if ((await fetch(BASE)).ok) break
      } catch {
        /* not up yet */
      }
      await new Promise((r) => setTimeout(r, 500))
    }
    for (const dir of ["src/engine/profiles/probes", "src/engine/profiles/generated", "docs/probes"]) mkdirSync(dir, { recursive: true })
    const pkg = JSON.parse(readFileSync("package.json", "utf8"))
    const version = (name: string) => pkg.devDependencies[name] ?? pkg.dependencies[name] ?? ""
    for (const id of ids) {
      const def = SYSTEM[id]
      if (!def) throw new Error(`Unknown system ${id}`)
      const t0 = Date.now()
      const hand = HAND_PROFILES[id]
      const raw = cached
        ? (JSON.parse(readFileSync(`${CACHE}/${id}.json`, "utf8")) as Awaited<ReturnType<typeof probeSystem>>)
        : await probeSystem(def, hand)
      if (!cached) {
        mkdirSync(CACHE, { recursive: true })
        writeFileSync(`${CACHE}/${id}.json`, JSON.stringify(raw))
      }
      const { keys, stock, result, meta, errors } = raw
      const probedAt = new Date().toISOString().slice(0, 10)
      const source = def.pkg.startsWith("this") ? def.pkg : `${def.pkg} ${version(def.pkg)}`
      if (hand) {
        const modes = Object.fromEntries(MODES.map((m) => [m, { samples: result[m].samples, recipes: result[m].found.length, ...diff(hand, m, result[m].found) }]))
        const out = {
          profile: id,
          probedAt,
          source,
          variables: keys.length,
          modes: Object.fromEntries(Object.entries(modes).map(([m, d]) => [m, { ...d, candidates: d.candidates.map((c) => ({ key: c.key, prop: c.prop, sources: c.sources })) }])),
        }
        writeFileSync(`src/engine/profiles/probes/${id}.json`, JSON.stringify(out, null, 1))
        writeFileSync(`docs/probes/${id}.md`, handReport(hand, { probedAt, source, variables: keys.length, modes }))
        const l = modes.light
        console.log(`${id}: ${keys.length} vars · observed ${l.observed.length}/${l.observed.length + l.unobserved.length} · candidates ${l.candidates.length} · ${((Date.now() - t0) / 1000).toFixed(0)}s`)
      } else {
        const data = Object.fromEntries(MODES.map((m) => [m, { stock: stock[m], found: result[m].found }])) as Record<Mode, ModeData>
        const g = generateProfile(def, data, meta)
        const profile = {
          id,
          label: def.label,
          description: def.description ?? "",
          selectors: def.selectors ?? { light: ":root", dark: ".dark" },
          generated: { probedAt, source, docs: def.docs, page: g.page, samples: { light: result.light.samples, dark: result.dark.samples } },
          ...(def.json ? { json: def.json } : {}),
          formats: g.formats,
          scopes: g.scopes,
          vars: g.vars,
          recipes: g.recipes,
          reference: g.reference,
        }
        writeFileSync(`src/engine/profiles/generated/${id}.json`, JSON.stringify(profile, null, 1))
        writeFileSync(`docs/probes/${id}.md`, generatedReport(profile))
        console.log(`${id}: ${keys.length} vars found, ${g.vars.length} used · ${g.recipes.length} recipes · page ${g.page} · ${errors.length} page errors · ${((Date.now() - t0) / 1000).toFixed(0)}s`)
      }
    }
  } finally {
    vite.kill()
  }
}

function generatedReport(p: { id: string; label: string; generated: { probedAt: string; source: string; page: string; samples: Record<string, number> }; vars: Profile["vars"]; recipes: Profile["recipes"] }) {
  const byKind = new Map<string, number>()
  for (const r of p.recipes) byKind.set(r.element, (byKind.get(r.element) ?? 0) + 1)
  const fixed = p.vars.filter((v) => v.path.kind !== "step")
  const lines = [
    `# Generated profile: ${p.label}`,
    "",
    `Generated ${p.generated.probedAt} from ${p.generated.source}. ${p.generated.samples.light} light and ${p.generated.samples.dark} dark samples; ${p.vars.length} variables and ${p.recipes.length} recipes inferred. Review in the app's Report.`,
    "",
    `- Page: \`${p.generated.page}\``,
    ...fixed.filter((v) => v.path.kind !== "page").map((v) => `- \`${v.name}\`: ${v.path.kind === "solid" ? "the engine's" : "label on the engine's"} ${(v.path as { role: string }).role} solid`),
    "",
    "| Element kind | Recipes |",
    "| --- | --- |",
    ...[...byKind.entries()].map(([k, n]) => `| ${k} | ${n} |`),
    "",
    "## Variables",
    "",
    "| Variable | Path |",
    "| --- | --- |",
    ...p.vars.map((v) => `| \`${v.name}\` | ${JSON.stringify(v.path).replace(/\|/g, "\\|")} |`),
    "",
  ]
  return lines.join("\n")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
