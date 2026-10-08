// The intent contract. The engine's output, independent of any downstream
// design system: what must be true on screen, not which variable holds
// which hex. A system profile translates intent into that system's own
// tokens by working backward through how the system renders them.
//
// An outcome is a rendered pair: an element of some kind, painted over a
// surface, and the requirement the composite has to meet.
import type { RGB } from "./color"
import type { A11y, Context, Level, Mode, RoleId, Settings } from "./settings"
import { targetFor, tokenId, type System } from "./system"
import { inkFor } from "./ink"

/** How a rendered result is measured. */
export type Metric = "lc" | "dL" | "ratio"
export type Requirement = { metric: Metric; min: number; source: "reference" | "engine" | "accessibility" }

/**
 * What a painted thing is for. The kind decides which accessibility floor
 * applies and which engine emphasis level it maps to; systems differ in how
 * they paint each kind, never in what the kind means.
 */
export type ElementKind =
  | "surface"
  | "text-primary"
  | "text-secondary"
  | "text-on-tint"
  | "border-decorative"
  | "border-control"
  | "focus"
  | "state"
  | "solid"
  | "on-solid"

/** Accessibility floors by element kind, and the switch that enforces each. */
export const A11Y_FLOORS: Partial<Record<ElementKind, { key: keyof A11y; req: Omit<Requirement, "source">; rule: string }>> = {
  "text-secondary": { key: "secondaryText", req: { metric: "lc", min: 60 }, rule: "Lc 60 (APCA body text)" },
  "text-on-tint": { key: "secondaryText", req: { metric: "lc", min: 60 }, rule: "Lc 60 (APCA body text)" },
  "border-control": { key: "inputBorders", req: { metric: "ratio", min: 3 }, rule: "3:1 (WCAG 1.4.11)" },
  focus: { key: "focusRing", req: { metric: "ratio", min: 3 }, rule: "3:1 as drawn (WCAG 1.4.11)" },
  solid: { key: "solids", req: { metric: "lc", min: 30 }, rule: "Lc 30 against the page (APCA large solid)" },
}

/** Where the engine's own emphasis model puts each element kind. */
export const ENGINE_LEVEL: Partial<Record<ElementKind, { context: Context; level: Level }>> = {
  "text-primary": { context: "text", level: 5 },
  "text-secondary": { context: "text", level: 3 },
  "text-on-tint": { context: "text", level: 4 },
  "border-decorative": { context: "stroke", level: 1 },
  "border-control": { context: "stroke", level: 2 },
  focus: { context: "stroke", level: 4 },
}

/** A chroma rule a profile can solve along: a role's hue, held saturation or not. */
export type Palette = { hue: number; chroma: number; l: number; holdSaturation: boolean }

export type Intent = {
  mode: Mode
  settings: Settings
  /** Named surfaces the engine decided. Profiles may adopt or re-solve them. */
  surfaces: Record<"page" | "surface-1" | "surface-2" | "surface-3" | "surface-4" | "surface-5", RGB>
  /** Solid fills per role (level 4), already resolved for dark-mode policy. */
  solids: Record<RoleId, RGB>
  /** Maximal-contrast label on each role's solid. */
  onSolid: Record<RoleId, RGB>
  palettes: Record<RoleId, Palette>
  /** Near-black or near-white ink per role, for translucent paths. */
  inks: Record<RoleId, RGB>
  /** Chart series. */
  series: RGB[]
  /** The engine's own requirement for an element kind, if it has an opinion. */
  engine: (kind: ElementKind) => Requirement | null
}

export function buildIntent(sys: System, mode: Mode): Intent {
  const s = sys.settings
  const ms = sys.modes[mode]
  const flat = (id: string) => ms.tokens[id].flat.rgb
  const roles = Object.keys(sys.roles) as RoleId[]
  const by = <T,>(f: (r: RoleId) => T) => Object.fromEntries(roles.map((r) => [r, f(r)])) as Record<RoleId, T>
  return {
    mode,
    settings: s,
    surfaces: {
      page: ms.bg,
      "surface-1": flat("neutral.surface.1"),
      "surface-2": flat("neutral.surface.2"),
      "surface-3": flat("neutral.surface.3"),
      "surface-4": flat("neutral.surface.4"),
      "surface-5": flat("neutral.surface.5"),
    },
    solids: by((r) => flat(tokenId(r, "fill", 4))),
    onSolid: by((r) => ms.onFill[tokenId(r, "fill", 4)].rgb),
    palettes: by((r) => {
      const n = sys.roles[r].named
      return { hue: n.h, chroma: n.c, l: n.l, holdSaturation: r !== "neutral" }
    }),
    inks: by((r) => inkFor(mode, sys.roles[r].named.h, sys.roles[r].named.c, r === "neutral")),
    series: ms.categorical.colors.map((c) => c.rgb),
    engine: (kind) => {
      if (kind === "state") return { metric: "dL", min: s.stateDelta, source: "engine" }
      const at = ENGINE_LEVEL[kind]
      if (!at) return null
      const t = targetFor(s, mode, at.context, at.level)
      return { metric: t.kind === "lc" ? "lc" : "dL", min: t.value, source: "engine" }
    },
  }
}
