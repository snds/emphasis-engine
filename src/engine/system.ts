// Generators + the emphasis grid. Three picks in, one solved system per
// mode out. Hue is decided first under the force priority, then locked.
import {
  deltaE,
  hex,
  hueDelta,
  hueToward,
  parseHex,
  rgbToOklch,
  rgbaCss,
  toRgb,
  type Oklch,
  type RGB,
} from "./color"
import { lc } from "./contrast"
import {
  BASE_TARGETS,
  CONTEXTS,
  LEVELS,
  NEUTRALS,
  ON_FILL_MIN,
  ON_FILL_PREFERRED,
  SOLID_FLOOR,
  ROLES,
  STATUS_ANCHORS,
  STATUS_ROLES,
  effectiveLeash,
  type Context,
  type Level,
  type Mode,
  type RoleId,
  type Settings,
  type Target,
} from "./settings"
import { solveAlpha, solveFlat, type AlphaResult, type ChromaRule, type Direction, type FlatResult } from "./solve"

export type LogEntry = {
  force: "semantic convention" | "brand identity" | "family coherence" | "categorical distinctness" | "solver"
  mode?: Mode
  message: string
}

export type Role = {
  id: RoleId
  label: string
  /** Named anchor color after force resolution. */
  named: Oklch
  namedRgb: RGB
}

export type Token = {
  id: string
  role: RoleId
  context: Context
  level: Level
  mode: Mode
  target: Target
  surface: RGB
  flat: FlatResult
  alpha: AlphaResult
  /** True when the role's named color already landed this level's band. */
  anchored: boolean
}

/** What a token paints in the active layer. */
export function active(t: Token, layer: Settings["layer"]) {
  if (layer === "alpha") {
    return {
      css: rgbaCss(t.alpha.tint, t.alpha.alpha),
      rgb: t.alpha.composite,
      achieved: t.alpha.achieved,
      met: t.alpha.met,
      method: t.alpha.method as string,
    }
  }
  return {
    css: hex(t.flat.rgb),
    rgb: t.flat.rgb,
    achieved: t.flat.achieved,
    met: t.flat.met,
    method: t.anchored ? "flat · anchored" : "flat",
  }
}

export type OnFill = { rgb: RGB; css: string; lc: number; met: boolean; preferredMet: boolean }

export type Categorical = {
  colors: { color: Oklch; rgb: RGB; css: string; lc: number }[]
  minNeighborDeltaE: number
}

export type ModeSystem = {
  mode: Mode
  bg: RGB
  tokens: Record<string, Token>
  onFill: Record<string, OnFill>
  categorical: Categorical
  trend: Record<"up" | "down" | "warn" | "flat", { rgb: RGB; css: string }>
}

export type System = {
  settings: Settings
  roles: Record<RoleId, Role>
  modes: Record<Mode, ModeSystem>
  log: LogEntry[]
}

export const tokenId = (role: RoleId, context: Context, level: Level) => `${role}.${context}.${level}`

const ROLE_LABELS: Record<RoleId, string> = {
  brand: "Brand",
  neutral: "Neutral",
  danger: "Danger",
  success: "Success",
  warning: "Warning",
  caution: "Caution",
  info: "Info",
}

function parseColor(input: string, fallback: string): Oklch {
  return rgbToOklch(parseHex(input) ?? parseHex(fallback)!)
}

/** Base neutral, optionally pulled toward the theme hue (Theme tint). */
export function resolveNeutral(s: Settings, theme: Oklch): { hue: number; chroma: number } {
  const n = NEUTRALS[s.neutral]
  if (!s.themeTint || theme.c < 0.02) return { hue: n.hue, chroma: n.chroma }
  const strength = Math.min(1, Math.max(0, s.tintStrength))
  if (n.chroma === 0) return { hue: theme.h, chroma: 0.014 * strength }
  const d = Math.abs(hueDelta(theme.h, n.hue))
  return { hue: hueToward(n.hue, theme.h, d * strength), chroma: n.chroma + 0.006 * strength }
}

function resolveRoles(s: Settings, log: LogEntry[]): Record<RoleId, Role> {
  const theme = parseColor(s.theme, "#2563eb")
  const neutral = resolveNeutral(s, theme)
  const roles = {} as Record<RoleId, Role>
  const mk = (id: RoleId, named: Oklch): Role => ({
    id,
    label: ROLE_LABELS[id],
    named,
    namedRgb: toRgb(named),
  })
  roles.brand = mk("brand", theme)
  roles.neutral = mk("neutral", { l: 0.55, c: neutral.chroma, h: neutral.hue })

  for (const id of STATUS_ROLES) {
    const a = STATUS_ANCHORS[id]
    let h = a.h
    // Force 1 beats force 2: a brand sitting on a status hue does not get
    // to own it. The status hue steps away within its own 10° leash.
    const d = hueDelta(theme.h, a.h)
    if (theme.c > 0.08 && Math.abs(d) < 20) {
      h = (a.h - Math.sign(d || 1) * 10 + 360) % 360
      log.push({
        force: "semantic convention",
        message: `Brand hue ${theme.h.toFixed(0)}° sits within 20° of ${a.label.toLowerCase()} (${a.h}°). ${a.label} moved to ${h.toFixed(0)}° to stay distinct. Pair ${a.label.toLowerCase()} states with an icon.`,
      })
    }
    roles[id] = mk(id, { l: a.l, c: a.c, h })
  }
  return roles
}

const CHROMA_FACTOR: Record<Context, number> = { fill: 1, text: 0.9, stroke: 0.8, surface: 0.4 }

function ruleFor(role: Role, context: Context, s: Settings): ChromaRule {
  const isNeutral = role.id === "neutral"
  return {
    hue: role.named.h,
    baseChroma: role.named.c * (isNeutral ? 1 : s.chromaScale),
    baseL: role.named.l,
    factor: isNeutral ? 1 : CHROMA_FACTOR[context],
    holdSaturation: !isNeutral && s.holdSaturation,
  }
}

export function targetFor(s: Settings, mode: Mode, context: Context, level: Level): Target {
  const base = BASE_TARGETS[mode][context][level - 1]
  if (base.kind === "dL") return { kind: "dL", value: base.value * s.surfaceScale }
  const offset = context === "surface" ? 0 : s.offsets[context as "text" | "fill" | "stroke"]
  return { kind: "lc", value: Math.max(5, base.value + offset) }
}

function backgroundFor(mode: Mode, role: Role): RGB {
  const c = role.named.c
  return mode === "light"
    ? toRgb({ l: 0.995, c: c * 0.4, h: role.named.h })
    : toRgb({ l: 0.17, c: c * 0.9, h: role.named.h })
}

export function solveOnFill(fill: RGB, hue: number): OnFill {
  const rule: ChromaRule = { hue, baseChroma: 0.03, baseL: 0.5, factor: 1, holdSaturation: false }
  const metric = { kind: "lc" as const, value: ON_FILL_PREFERRED }
  const dark = solveFlat(rule, fill, metric, "darker")
  const light = solveFlat(rule, fill, metric, "lighter")
  const pick = light.achieved >= dark.achieved ? light : dark
  return {
    rgb: pick.rgb,
    css: hex(pick.rgb),
    lc: lc(pick.rgb, fill),
    met: pick.achieved >= ON_FILL_MIN,
    preferredMet: pick.achieved >= ON_FILL_PREFERRED,
  }
}

function buildCategorical(s: Settings, roles: Record<RoleId, Role>, mode: Mode, bg: RGB, log: LogEntry[]): Categorical {
  const chart = parseColor(s.chart, "#06b6d4")
  const theme = roles.brand.named
  const n = Math.round(Math.min(12, Math.max(5, s.categoricalCount)))
  // Chart chroma ceiling follows the brand's saturation (C ÷ L), not its raw
  // chroma, so a deep brand still gets colorful charts.
  const ceiling = Math.min(0.19, Math.max(0.12, (theme.c / Math.max(0.05, theme.l)) * 0.5))
  const baseL = mode === "light" ? 0.62 : 0.72
  const dir: Direction = mode === "light" ? "darker" : "lighter"
  const colors: Categorical["colors"] = []
  for (let i = 0; i < n; i++) {
    const walk = (chart.h + (i * 360) / n) % 360
    // Family coherence: a short pull toward the brand hue, capped so it can
    // never collapse the even spacing (max 10° at full pull).
    const h = i === 0 ? chart.h : hueToward(walk, theme.h, 10 * s.familyPull)
    const l = n >= 8 && i % 2 === 1 ? baseL + (mode === "light" ? -0.07 : 0.06) : baseL
    let color: Oklch = { l, c: Math.min(i === 0 ? chart.c : 0.15, ceiling), h }
    let rgb = toRgb(color)
    // Every series must read as a large non-text object: Lc 30 floor.
    if (Math.abs(lc(rgb, bg)) < 30) {
      const fix = solveFlat(
        { hue: h, baseChroma: color.c, baseL: l, factor: 1, holdSaturation: false },
        bg,
        { kind: "lc", value: 30 },
        dir
      )
      color = fix.color
      rgb = fix.rgb
    }
    colors.push({ color: rgbToOklch(rgb), rgb, css: hex(rgb), lc: lc(rgb, bg) })
  }
  let min = Infinity
  for (let i = 0; i < colors.length; i++) {
    const next = colors[(i + 1) % colors.length]
    min = Math.min(min, deltaE(colors[i].color, next.color))
  }
  if (min < 0.08) {
    log.push({
      force: "categorical distinctness",
      mode,
      message: `Closest neighboring chart colors are ΔE ${min.toFixed(3)} apart (target ≥ 0.08). Reduce family pull or series count.`,
    })
  }
  return { colors, minNeighborDeltaE: min }
}

function buildMode(s: Settings, roles: Record<RoleId, Role>, mode: Mode, log: LogEntry[]): ModeSystem {
  const bg = backgroundFor(mode, roles.neutral)
  const dir: Direction = mode === "light" ? "darker" : "lighter"
  const leash = effectiveLeash(s)
  const tokens: Record<string, Token> = {}
  const onFill: Record<string, OnFill> = {}

  for (const roleId of ROLES) {
    const role = roles[roleId]
    for (const context of CONTEXTS) {
      const rule = ruleFor(role, context, s)
      for (const level of LEVELS) {
        const target = targetFor(s, mode, context, level)
        let flat = solveFlat(rule, bg, target, dir)
        // Anchor snapping (brand identity): if the named color already sits
        // inside this level's band, it is the answer. Nobody wants a brand
        // button that is almost the brand.
        let anchored = false
        let cellTarget: Target = target
        if (context === "fill" && target.kind === "lc") {
          const signed = lc(role.namedRgb, bg)
          const rightSide = dir === "darker" ? signed > 0 : signed < 0
          const next = level < 5 ? targetFor(s, mode, context, (level + 1) as Level).value : target.value + 15
          if (rightSide && Math.abs(signed) >= target.value && Math.abs(signed) < next) {
            flat = { color: role.named, rgb: role.namedRgb, achieved: Math.abs(signed), met: true }
            anchored = true
          } else if (level === 4 && s.trueSolids) {
            // True solids (the Radix step 9 move): the solid fill keeps the
            // named color in both modes. It only moves, by lightness alone and
            // at full chroma, when it can't clear the large-solid floor.
            cellTarget = { kind: "lc", value: SOLID_FLOOR }
            if (rightSide && Math.abs(signed) >= SOLID_FLOOR) {
              flat = { color: role.named, rgb: role.namedRgb, achieved: Math.abs(signed), met: true }
            } else {
              const full: ChromaRule = { hue: role.named.h, baseChroma: role.named.c, baseL: role.named.l, factor: 1, holdSaturation: true }
              flat = solveFlat(full, bg, cellTarget, dir)
            }
            anchored = true
          }
        }
        const alpha = solveAlpha({
          flat,
          bg,
          metric: cellTarget,
          hue: role.named.h,
          leashDeg: leash,
          tieBreak: s.tieBreak,
          named: role.namedRgb,
        })
        const id = tokenId(roleId, context, level)
        tokens[id] = { id, role: roleId, context, level, mode, target: cellTarget, surface: bg, flat, alpha, anchored }
        if (!flat.met) {
          log.push({
            force: "solver",
            mode,
            message: `${id} cannot reach ${cellTarget.kind === "lc" ? "Lc " + cellTarget.value : "ΔL " + cellTarget.value.toFixed(3)}; best is ${flat.achieved.toFixed(cellTarget.kind === "lc" ? 1 : 3)} at the end of the lightness range.`,
          })
        }
        if (context === "fill" && level >= 3) {
          const fillRgb = s.layer === "alpha" ? alpha.composite : flat.rgb
          onFill[id] = solveOnFill(fillRgb, role.named.h)
        }
      }
    }
  }

  const categorical = buildCategorical(s, roles, mode, bg, log)
  // Chart-trend siblings: same hue family as UI status, quieter chroma, so
  // a falling metric never reads as an outage.
  const catL = mode === "light" ? 0.6 : 0.72
  const sib = (r: Role) => {
    const rgb = toRgb({ l: catL, c: r.named.c * 0.55, h: r.named.h })
    return { rgb, css: hex(rgb) }
  }
  const trend = {
    up: sib(roles.success),
    down: sib(roles.danger),
    warn: sib(roles.warning),
    flat: { rgb: tokens[tokenId("neutral", "stroke", 3)].flat.rgb, css: hex(tokens[tokenId("neutral", "stroke", 3)].flat.rgb) },
  }
  return { mode, bg, tokens, onFill, categorical, trend }
}

export function generate(s: Settings): System {
  const log: LogEntry[] = []
  const roles = resolveRoles(s, log)
  if (!s.themeTint) {
    log.push({ force: "family coherence", message: "Theme tint is off: base neutrals ignore the theme hue." })
  }
  const modes = {
    light: buildMode(s, roles, "light", log),
    dark: buildMode(s, roles, "dark", log),
  }
  return { settings: s, roles, modes, log }
}
