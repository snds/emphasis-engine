// Reading an existing theme as a profile's reference. Paste a system's CSS
// (a shadcn globals.css, a Radix custom palette, a Material Theme Builder
// export) and its values become the targets: the solver reads them through
// the system's own recipes, then re-solves for your colors.
import { hex } from "./color"
import { parseCss, type Profile } from "./profile"
import type { Mode } from "./settings"
import { alphaOver } from "./profiles/util"

export type ImportedTheme = {
  /** The text as pasted, kept so it can be edited and re-read. */
  source: string
  /** Values the profile knows, per mode, var() resolved, as CSS. */
  values: Record<Mode, Record<string, string>>
  /** Declarations that were found but couldn't be read as a color. */
  unreadable: string[]
  /** Variables found that the profile doesn't use. */
  ignored: number
}

type Block = { selector: string; body: string; forceDark: boolean }

/** Split CSS into rule blocks, descending into @media dark and @layer, skipping @supports and @theme. */
function blocks(css: string, forceDark = false): Block[] {
  const out: Block[] = []
  let i = 0
  while (i < css.length) {
    const open = css.indexOf("{", i)
    if (open < 0) break
    const prelude = css.slice(i, open).trim()
    let depth = 1
    let j = open + 1
    while (j < css.length && depth > 0) {
      if (css[j] === "{") depth++
      else if (css[j] === "}") depth--
      j++
    }
    const body = css.slice(open + 1, j - 1)
    const at = prelude.match(/@[\w-]+/)?.[0]
    if (at === "@media") {
      if (/prefers-color-scheme:\s*dark/.test(prelude)) out.push(...blocks(body, true))
    } else if (at === "@layer") out.push(...blocks(body, forceDark))
    else if (!at) out.push({ selector: prelude.slice(prelude.lastIndexOf(";") + 1).trim(), body, forceDark })
    // @supports (display-p3 duplicates), @theme (Tailwind mappings), and the rest are skipped.
    i = j
  }
  return out
}

function modeOf(b: Block): Mode | null {
  if (b.forceDark) return "dark"
  const sel = b.selector.toLowerCase()
  if (/contrast/.test(sel)) return null // Material's medium and high contrast variants
  if (/dark/.test(sel)) return "dark"
  if (/:root|\blight\b|light-theme|\.light|html|:host/.test(sel)) return "light"
  return null
}

const GRAY_FAMILY = ["gray", "mauve", "slate", "sage", "olive", "sand"]

/** Radix palettes are named for their color; the profile names them by job. */
function renameRadix(decls: Record<string, string>): Record<string, string> {
  const scales = new Map<string, number>()
  for (const k of Object.keys(decls)) {
    const m = k.match(/^--([a-z]+)-a?(\d{1,2})$/)
    if (m) scales.set(m[1], (scales.get(m[1]) ?? 0) + 1)
  }
  const names = [...scales.keys()]
  const gray = names.includes("gray") ? "gray" : names.find((n) => GRAY_FAMILY.includes(n))
  const accent = names.includes("accent")
    ? "accent"
    : names.filter((n) => n !== gray && n !== "red" && !GRAY_FAMILY.includes(n)).sort((a, b) => scales.get(b)! - scales.get(a)!)[0]
  const map: Record<string, string> = {}
  if (gray) map[gray] = "gray"
  if (accent) map[accent] = "accent"
  if (names.includes("red") && accent !== "red") map.red = "red"
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(decls)) {
    const m = k.match(/^--([a-z]+)-(a?\d{1,2}|contrast)$/)
    if (m && map[m[1]]) out[`--${map[m[1]]}-${m[2]}`] = v
    else out[k] = v
  }
  return out
}

export function parseTheme(source: string, profile: Profile): ImportedTheme {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, "")
  const raw: Record<Mode, Record<string, string>> = { light: {}, dark: {} }
  for (const b of blocks(css)) {
    const mode = modeOf(b)
    if (!mode) continue
    for (const m of b.body.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)) {
      let name = m[1]
      let target = mode
      // Theme Builder's tokens.css puts both modes in :root with -light / -dark suffixes.
      const suffix = name.match(/^(--md-[\w-]+)-(light|dark)$/)
      if (suffix) {
        name = suffix[1]
        target = suffix[2] as Mode
      }
      raw[target][name] = m[2].trim()
    }
  }
  const known = new Set(profile.vars.map((v) => v.name))
  const unreadable: string[] = []
  let ignored = 0
  const values: Record<Mode, Record<string, string>> = { light: {}, dark: {} }
  for (const mode of ["light", "dark"] as Mode[]) {
    let decls = raw[mode]
    if (profile.id === "radix") decls = renameRadix(decls)
    const lookup = (name: string, seen = 0): string | undefined => {
      const v = decls[name] ?? (mode === "dark" ? raw.light[name] : undefined)
      if (!v || seen > 8) return v
      const ref = v.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)$/)
      return ref ? (lookup(ref[1], seen + 1) ?? ref[2]?.trim()) : v
    }
    for (const name of Object.keys(decls)) {
      if (!known.has(name)) {
        ignored++
        continue
      }
      const v = lookup(name)
      if (!v) continue
      try {
        parseCss(v)
        values[mode][name] = v
      } catch {
        unreadable.push(`${mode} ${name}: ${v}`)
      }
    }
  }
  return { source, values, unreadable, ignored }
}

/**
 * The reference a profile solves against: the import laid over stock, per
 * mode. Radix alpha steps missing from the import are derived from its solid
 * steps, the way Radix makes them, so they never come from a different palette.
 */
export function mergedReference(profile: Profile, imported?: ImportedTheme): Record<Mode, Record<string, string>> {
  if (!imported) return profile.reference
  const out = {} as Record<Mode, Record<string, string>>
  for (const mode of ["light", "dark"] as Mode[]) {
    const ref = { ...profile.reference[mode], ...imported.values[mode] }
    if (profile.id === "radix") {
      const page = hex(parseCss(ref["--color-background"]).rgb)
      for (const scale of ["gray", "accent", "red"])
        for (let k = 1; k <= 12; k++) {
          const solid = imported.values[mode][`--${scale}-${k}`]
          if (solid && !imported.values[mode][`--${scale}-a${k}`]) ref[`--${scale}-a${k}`] = alphaOver(hex(parseCss(solid).rgb), page)
        }
      if (imported.values[mode]["--accent-8"] && !imported.values[mode]["--focus-8"]) ref["--focus-8"] = ref["--accent-8"]
    }
    out[mode] = ref
  }
  return out
}

export function withReference(profile: Profile, imported?: ImportedTheme): Profile {
  return imported ? { ...profile, reference: mergedReference(profile, imported) } : profile
}

/** How much of the profile the import covers, per mode. */
export function coverage(profile: Profile, imported: ImportedTheme) {
  const names = profile.vars.filter((v) => v.path.kind !== "alias" && v.path.kind !== "alphaOf" && profile.reference.light[v.name]).map((v) => v.name)
  return Object.fromEntries(
    (["light", "dark"] as Mode[]).map((mode) => {
      const missing = names.filter((n) => !imported.values[mode][n])
      return [mode, { found: names.length - missing.length, total: names.length, missing }]
    }),
  ) as Record<Mode, { found: number; total: number; missing: string[] }>
}

const BRAND_VAR: Record<string, string> = { shadcn: "--primary", radix: "--accent-9", material: "--md-sys-color-primary" }

/** The imported theme's brand color, to use as the Theme pick. */
export function brandOf(profile: Profile, imported: ImportedTheme): string | null {
  const v = imported.values.light[BRAND_VAR[profile.id]]
  return v ? hex(parseCss(v).rgb) : null
}
