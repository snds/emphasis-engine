// Semantic layer: role × variant × slot × state. Recipes bind slots to
// semantic tokens; state strategies move them. Neither knows about color.
import { composite, hex, rgbToOklch, rgbaCss, toRgb, type RGB } from "./color"
import { deltaL, lc } from "./contrast"
import { ON_FILL_MIN, type Mode, type RoleId, type Settings } from "./settings"
import { solveOverlay, chromaAt } from "./solve"
import { active, solveOnFill, tokenId, type ModeSystem, type System } from "./system"

export type Variant = "primary" | "secondary" | "tertiary" | "ghost"
export type State = "rest" | "hover" | "pressed" | "disabled"
export const VARIANTS: Variant[] = ["primary", "secondary", "tertiary", "ghost"]
export const STATES: State[] = ["rest", "hover", "pressed", "disabled"]
export const BUTTON_ROLES: RoleId[] = ["brand", "neutral", "danger"]

export type Paint = {
  /** CSS for the base background (may be transparent or translucent). */
  bg: string
  /** Optional overlay layer painted over bg (state layer, live ink). */
  overlay?: string
  fg: string
  border?: string
  /** What the viewer sees, for checks. */
  visible: RGB
  labelLc: number
  labelMet: boolean
  /** ΔL from the previous state (hover vs rest, pressed vs hover). */
  delta?: number
  deltaMet?: boolean
}

export type ButtonSpec = Record<State, Paint>

function moveL(rgb: RGB, delta: number, dir: 1 | -1, hue: number, rule?: Parameters<typeof chromaAt>[0]): RGB {
  const o = rgbToOklch(rgb)
  const l = Math.min(1, Math.max(0, o.l + dir * delta))
  const c = rule ? chromaAt(rule, l) : o.c
  return toRgb({ l, c, h: o.c < 0.01 ? hue : o.h })
}

export function buildButton(sys: System, mode: Mode, role: RoleId, variant: Variant): ButtonSpec {
  const s: Settings = sys.settings
  const ms: ModeSystem = sys.modes[mode]
  const r = sys.roles[role]
  const t = (ctx: "text" | "fill" | "stroke" | "surface", lvl: 1 | 2 | 3 | 4 | 5) =>
    active(ms.tokens[tokenId(role, ctx, lvl)], s.layer)
  const n = (ctx: "text" | "fill" | "stroke" | "surface", lvl: 1 | 2 | 3 | 4 | 5) =>
    active(ms.tokens[tokenId("neutral", ctx, lvl)], s.layer)
  const away: 1 | -1 = mode === "light" ? -1 : 1
  const page = ms.bg
  const delta = s.stateDelta
  const sourceRole: RoleId = s.overlaySource === "brand" ? (role === "neutral" ? "brand" : role) : "neutral"
  const ink = ms.tokens[tokenId(sourceRole, "text", 5)].flat.rgb

  const label = (fg: RGB, under: RGB, min = ON_FILL_MIN) => {
    const v = Math.abs(lc(fg, under))
    return { labelLc: v, labelMet: v >= min }
  }

  // A paint for a visible color plus how it is drawn.
  const paint = (bgCss: string, visible: RGB, fg: RGB, extra: Partial<Paint> = {}): Paint => ({
    bg: bgCss,
    fg: hex(fg),
    visible,
    ...label(fg, visible),
    ...extra,
  })

  // Next state from a base, by the configured strategy.
  const nextState = (base: RGB, baseCss: string, steps: number, stepSource?: RGB) => {
    if (s.stateStrategy === "step") {
      const moved = stepSource ?? moveL(base, delta * steps, away, r.named.h)
      return { bg: hex(moved), visible: moved, overlay: undefined as string | undefined }
    }
    const o = solveOverlay(ink, base, delta * steps)
    return { bg: baseCss, visible: o.composite, overlay: rgbaCss(ink, o.alpha) }
  }

  const spec = {} as ButtonSpec
  const disabledBg = n("surface", 2)
  const disabledFg = (under: RGB) => {
    // Disabled labels floor at Lc 30 and are marked as below target.
    const rule = { hue: r.named.h, baseChroma: 0.01, baseL: 0.5, factor: 1, holdSaturation: false }
    let best = under
    for (let i = 0; i <= 100; i++) {
      const l = mode === "light" ? 1 - i / 100 : i / 100
      const rgb = toRgb({ l, c: chromaAt(rule, l), h: r.named.h })
      if (Math.abs(lc(rgb, under)) >= 30) {
        best = rgb
        break
      }
    }
    return best
  }

  if (variant === "primary") {
    const fill = t("fill", 4)
    const fg = (under: RGB) => solveOnFill(under, r.named.h).rgb
    spec.rest = paint(fill.css, fill.rgb, fg(fill.rgb))
    const hover = nextState(fill.rgb, fill.css, 1)
    spec.hover = paint(hover.bg, hover.visible, fg(hover.visible), { overlay: hover.overlay })
    const pressedBase = s.pressedMode === "stacked" ? hover.visible : fill.rgb
    const pressed =
      s.stateStrategy === "step"
        ? nextState(pressedBase, hex(pressedBase), s.pressedMode === "stacked" ? 1 : 2)
        : s.pressedMode === "stacked"
          ? (() => {
              const o = solveOverlay(ink, hover.visible, delta)
              // Stacked: a second layer over the first.
              return {
                bg: fill.css,
                visible: o.composite,
                overlay: `${hover.overlay}, ${rgbaCss(ink, o.alpha)}`,
              }
            })()
          : nextState(fill.rgb, fill.css, 2)
    spec.pressed = paint(pressed.bg, pressed.visible, fg(pressed.visible), { overlay: pressed.overlay })
    spec.disabled = paint(disabledBg.css, disabledBg.rgb, disabledFg(disabledBg.rgb))
  } else if (variant === "secondary") {
    const src =
      s.secondarySource === "role-tint"
        ? ms.tokens[tokenId(role, "surface", 3)]
        : ms.tokens[tokenId("neutral", "surface", 3)]
    const useAlpha = s.secondarySource !== "neutral-flat"
    const css = useAlpha ? rgbaCss(src.alpha.tint, src.alpha.alpha) : hex(src.flat.rgb)
    const vis = useAlpha ? src.alpha.composite : src.flat.rgb
    const fgRgb = role === "neutral" ? n("text", 5).rgb : t("text", 4).rgb
    spec.rest = paint(css, vis, fgRgb)
    const next = (lvl: 4 | 5) => {
      const tk = ms.tokens[tokenId(src.role, "surface", lvl)]
      return useAlpha ? tk.alpha.composite : tk.flat.rgb
    }
    const hover = nextState(vis, css, 1, s.stateStrategy === "step" ? next(4) : undefined)
    spec.hover = paint(hover.bg, hover.visible, fgRgb, { overlay: hover.overlay })
    const pressed =
      s.stateStrategy === "step"
        ? nextState(vis, css, 2, next(5))
        : nextState(s.pressedMode === "stacked" ? hover.visible : vis, s.pressedMode === "stacked" ? hex(hover.visible) : css, s.pressedMode === "stacked" ? 1 : 2)
    spec.pressed = paint(pressed.bg, pressed.visible, fgRgb, { overlay: pressed.overlay })
    spec.disabled = paint(disabledBg.css, disabledBg.rgb, disabledFg(disabledBg.rgb))
  } else {
    // Tertiary (outline) and ghost: no container fill at rest.
    const fgRgb = role === "neutral" ? n("text", 5).rgb : t("text", 4).rgb
    const border = variant === "tertiary" ? t("stroke", 3).css : undefined
    spec.rest = paint("transparent", page, fgRgb, { border })
    const stepSrc = (lvl: 2 | 3) => {
      const tk = ms.tokens[tokenId(sourceRole, "surface", lvl)]
      return s.layer === "alpha" ? tk.alpha.composite : tk.flat.rgb
    }
    const hover =
      s.stateStrategy === "step"
        ? { bg: hex(stepSrc(2)), visible: stepSrc(2), overlay: undefined }
        : (() => {
            const o = solveOverlay(ink, page, delta)
            return { bg: "transparent", visible: o.composite, overlay: rgbaCss(ink, o.alpha) }
          })()
    spec.hover = paint(hover.bg, hover.visible, fgRgb, { border, overlay: hover.overlay })
    const pressed =
      s.stateStrategy === "step"
        ? { bg: hex(stepSrc(3)), visible: stepSrc(3), overlay: undefined }
        : (() => {
            const base = s.pressedMode === "stacked" ? hover.visible : page
            const o = solveOverlay(ink, base, s.pressedMode === "stacked" ? delta : delta * 2)
            const layer = rgbaCss(ink, o.alpha)
            return {
              bg: "transparent",
              visible: o.composite,
              overlay: s.pressedMode === "stacked" ? `${hover.overlay}, ${layer}` : layer,
            }
          })()
    spec.pressed = paint(pressed.bg, pressed.visible, fgRgb, { border, overlay: pressed.overlay })
    spec.disabled = paint("transparent", page, disabledFg(page), {
      border: variant === "tertiary" ? n("stroke", 1).css : undefined,
    })
  }

  // State-delta checks (OKLCH ΔL: APCA clamps differences this small).
  spec.hover.delta = deltaL(spec.hover.visible, spec.rest.visible)
  spec.hover.deltaMet = spec.hover.delta >= delta - 0.006
  spec.pressed.delta = deltaL(spec.pressed.visible, spec.hover.visible)
  spec.pressed.deltaMet = spec.pressed.delta >= delta * 0.5 - 0.006
  // Disabled is the one state allowed under target; it is marked, not passed.
  spec.disabled.labelMet = false
  return spec
}

/** Convert an overlay list into a CSS background-image stack. */
export function overlayImage(overlay?: string): string | undefined {
  if (!overlay) return undefined
  // rgb() strings use spaces, so ", " only ever separates layers.
  return overlay
    .split(", ")
    .map((c) => `linear-gradient(${c}, ${c})`)
    .join(", ")
}

/** Composite check used by tests: overlay over base equals visible. */
export function overlayVisible(base: RGB, ink: RGB, alpha: number): RGB {
  return composite(ink, alpha, base)
}
