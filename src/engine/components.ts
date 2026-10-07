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

export function buildButton(sys: System, mode: Mode, role: RoleId, variant: Variant): ButtonSpec {
  const s: Settings = sys.settings
  const ms: ModeSystem = sys.modes[mode]
  const r = sys.roles[role]
  const t = (ctx: "text" | "fill" | "stroke" | "surface", lvl: 1 | 2 | 3 | 4 | 5) =>
    active(ms.tokens[tokenId(role, ctx, lvl)], s.layer)
  const n = (ctx: "text" | "fill" | "stroke" | "surface", lvl: 1 | 2 | 3 | 4 | 5) =>
    active(ms.tokens[tokenId("neutral", ctx, lvl)], s.layer)
  const page = ms.bg
  const delta = s.stateDelta
  const awayFromPage: 1 | -1 = mode === "light" ? -1 : 1
  const sourceRole: RoleId = s.overlaySource === "brand" ? (role === "neutral" ? "brand" : role) : "neutral"
  // Overlay inks of both polarities. A state darkens with dark ink and
  // lightens with light ink, whatever the page mode.
  const darkInk = sys.modes.light.tokens[tokenId(sourceRole, "text", 5)].flat.rgb
  const lightInk = sys.modes.dark.tokens[tokenId(sourceRole, "text", 5)].flat.rgb

  const label = (fg: RGB, under: RGB, min = ON_FILL_MIN) => {
    const v = Math.abs(lc(fg, under))
    return { labelLc: v, labelMet: v >= min }
  }

  const paint = (bgCss: string, visible: RGB, fg: RGB, extra: Partial<Paint> = {}): Paint => ({
    bg: bgCss,
    fg: hex(fg),
    visible,
    ...label(fg, visible),
    ...extra,
  })

  type Step = { bg: string; visible: RGB; overlay?: string }

  /**
   * Hover and pressed from a rest paint. Every state moves the container
   * AWAY from its label by the configured step, so a state change can never
   * cost label contrast. Step re-solves the color; Overlay adds live ink.
   */
  const chain = (restCss: string, rest: RGB, dir: 1 | -1, chroma?: { c: number; h: number }) => {
    const ink = dir < 0 ? darkInk : lightInk
    const move = (from: RGB, k: number): RGB => {
      const o = rgbToOklch(from)
      const l = Math.min(1, Math.max(0, o.l + dir * delta * k))
      const c = chroma ? chroma.c : o.c
      const h = chroma ? chroma.h : o.c < 0.01 ? r.named.h : o.h
      return toRgb({ l, c, h })
    }
    if (s.stateStrategy === "step") {
      const hv = move(rest, 1)
      const pr = s.pressedMode === "stacked" ? move(hv, 1) : move(rest, 2)
      return {
        hover: { bg: hex(hv), visible: hv } as Step,
        pressed: { bg: hex(pr), visible: pr } as Step,
      }
    }
    const h1 = solveOverlay(ink, rest, delta)
    const hover: Step = { bg: restCss, visible: h1.composite, overlay: rgbaCss(ink, h1.alpha) }
    let pressed: Step
    if (s.pressedMode === "stacked") {
      const p2 = solveOverlay(ink, h1.composite, delta)
      pressed = { bg: restCss, visible: p2.composite, overlay: `${hover.overlay}, ${rgbaCss(ink, p2.alpha)}` }
    } else {
      const p2 = solveOverlay(ink, rest, delta * 2)
      pressed = { bg: restCss, visible: p2.composite, overlay: rgbaCss(ink, p2.alpha) }
    }
    return { hover, pressed }
  }

  const spec = {} as ButtonSpec
  const disabledBg = n("surface", 2)
  const disabledFg = (under: RGB) => {
    // Disabled labels floor at Lc 30 and are marked as below target.
    const rule = { hue: r.named.h, baseChroma: 0.01, baseL: 0.5, factor: 1, holdSaturation: false }
    for (let i = 0; i <= 100; i++) {
      const l = mode === "light" ? 1 - i / 100 : i / 100
      const rgb = toRgb({ l, c: chromaAt(rule, l), h: r.named.h })
      if (Math.abs(lc(rgb, under)) >= 30) return rgb
    }
    return under
  }

  if (variant === "primary") {
    const fill = t("fill", 4)
    const fg = (under: RGB) => solveOnFill(under, r.named.h).rgb
    const restFg = fg(fill.rgb)
    // Away from the label: a light label means states darken, even in dark mode.
    const dir: 1 | -1 = rgbToOklch(restFg).l > rgbToOklch(fill.rgb).l ? -1 : 1
    const st = chain(fill.css, fill.rgb, dir)
    spec.rest = paint(fill.css, fill.rgb, restFg)
    spec.hover = paint(st.hover.bg, st.hover.visible, fg(st.hover.visible), { overlay: st.hover.overlay })
    spec.pressed = paint(st.pressed.bg, st.pressed.visible, fg(st.pressed.visible), { overlay: st.pressed.overlay })
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
    const st = chain(css, vis, awayFromPage)
    spec.rest = paint(css, vis, fgRgb)
    spec.hover = paint(st.hover.bg, st.hover.visible, fgRgb, { overlay: st.hover.overlay })
    spec.pressed = paint(st.pressed.bg, st.pressed.visible, fgRgb, { overlay: st.pressed.overlay })
    spec.disabled = paint(disabledBg.css, disabledBg.rgb, disabledFg(disabledBg.rgb))
  } else {
    // Tertiary (outline) and ghost: no container fill at rest. Step states
    // borrow the source surface's tint so hovers read as the right family.
    const fgRgb = role === "neutral" ? n("text", 5).rgb : t("text", 4).rgb
    const border = variant === "tertiary" ? t("stroke", 3).css : undefined
    const tint = rgbToOklch(ms.tokens[tokenId(sourceRole, "surface", 3)].flat.rgb)
    const st = chain("transparent", page, awayFromPage, { c: tint.c, h: tint.h })
    spec.rest = paint("transparent", page, fgRgb, { border })
    spec.hover = paint(st.hover.bg, st.hover.visible, fgRgb, { border, overlay: st.hover.overlay })
    spec.pressed = paint(st.pressed.bg, st.pressed.visible, fgRgb, { border, overlay: st.pressed.overlay })
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
