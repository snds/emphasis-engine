// The phone layout, after the Photos editor: the canvas owns the screen,
// tools live in the thumb zone. A floating tab bar picks a tool group, a
// row of parameter chips picks one lever, and the slot above the tab bar
// adjusts that one lever (a scrubber, a short option row, or a switch).
// Anything that doesn't fit one lever at a time opens in a sheet.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  IconAccessible,
  IconAdjustmentsHorizontal,
  IconBorderOuter,
  IconBrightnessHalf,
  IconChartDots,
  IconCircleHalf2,
  IconClick,
  IconColorSwatch,
  IconDots,
  IconDroplet,
  IconFocus2,
  IconHandFinger,
  IconLayersSubtract,
  IconLetterT,
  IconMoon,
  IconPalette,
  IconSquareToggle,
  IconStack2,
  IconSun,
  IconTarget,
  IconTextSize,
  IconBoxMultiple,
  IconArrowsDiff,
  IconStairs,
  IconSquareHalf,
  type Icon,
} from "@tabler/icons-react"
import { cn } from "cn"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { Controls, THEME_PRESETS, worstFor, type Outputs, type SectionId } from "./controls"
import { Scrubber, ValueRing } from "./scrubber"
import { SystemSheetButton } from "./system-picker"
import { hexFromLsh, lshFromHex } from "./tune"
import type { Engine } from "./use-engine"
import { BOUNDS, DEFAULT_SETTINGS, NEUTRALS, type A11y, type Mode, type NeutralId, type Settings } from "@/engine/settings"
import { solveOutput } from "@/engine/outputs"
import { fmt } from "@/engine/profile"
import { resolveNeutral } from "@/engine/system"
import { hex, parseHex, rgbToOklch, toRgb } from "@/engine/color"

type Option<T> = { value: T; label: string; swatch?: string }

type Param =
  | {
      kind: "scrub"
      id: string
      label: string
      icon: Icon
      value: number
      min: number
      max: number
      step: number
      defaultValue: number
      format: (v: number) => string
      onChange: (v: number) => void
      major?: number
      /** Color at a share t of the range, drawn as a strip under the ticks. */
      track?: (t: number) => string
    }
  | { kind: "choice"; id: string; label: string; icon: Icon; value: string; options: Option<string>[]; onChange: (v: string) => void; note?: string }
  | { kind: "multi"; id: string; label: string; icon: Icon; value: string[]; options: Option<string>[]; onChange: (v: string[]) => void; note?: string }
  | { kind: "toggle"; id: string; label: string; icon: Icon; value: boolean; onChange: (v: boolean) => void; note: string; status?: ReactNode }
  | { kind: "sheet"; id: string; label: string; icon: Icon; section: SectionId; title: string }

type Tool = { id: string; label: string; icon: Icon; params: Param[] }

const pct = (v: number) => `${Math.round(v * 100)}%`
const signedLc = (v: number) => `${v > 0 ? "+" : ""}${v} Lc`

/** Status lines for a Force accessibility switch: weakest pair per mode. */
function A11yStatus({ out, k }: { out: Outputs; k: keyof A11y }) {
  const rows = worstFor(out, k)
  if (!rows.length) return <>No pairs of this kind in this system, so there's nothing to force.</>
  return (
    <>
      {rows.map(({ mode, worst, failing, total }) => (
        <span key={mode} className="mr-3 inline-block capitalize tabular-nums">
          {mode} {failing ? `${failing}/${total} under` : "pass"} · {fmt(worst.spec!.metric, worst.spec!.achieved)}
        </span>
      ))}
    </>
  )
}

function useTools(engine: Engine, out: Outputs): Tool[] {
  const { settings: s, update } = engine
  const d = DEFAULT_SETTINGS
  // Gray picks have no hue; keep the last one so scrubbing saturation back up returns to it.
  const [lastHue, setLastHue] = useState(264)
  const lsh = lshFromHex(s.theme, lastHue)
  const dl = lshFromHex(d.theme)
  const setLsh = (patch: Partial<typeof lsh>) => {
    // Remember the hue while it's meaningful, so scrubbing through gray and back keeps it.
    const next = { ...lsh, ...patch }
    if (next.s > 0.02) setLastHue(next.h)
    update({ theme: hexFromLsh(next) })
  }
  const tier = s.advanced ? "advanced" : "basic"
  const b = (k: keyof typeof BOUNDS) => BOUNDS[k][tier] as readonly [number, number]
  const a11y = (k: keyof A11y, id: string, label: string, icon: Icon, note: string): Param => ({
    kind: "toggle",
    id,
    label,
    icon,
    value: s.a11y[k],
    onChange: (v) => update({ a11y: { ...s.a11y, [k]: v } }),
    note,
    status: <A11yStatus out={out} k={k} />,
  })

  return [
    {
      id: "color",
      label: "Color",
      icon: IconPalette,
      params: [
        { kind: "scrub", id: "hue", label: "Hue", icon: IconColorSwatch, value: Math.round(lsh.h), min: 0, max: 360, step: 1, defaultValue: Math.round(dl.h), format: (v) => `${Math.round(v)}°`, onChange: (h) => setLsh({ h }), major: 6, track: (t) => hexFromLsh({ ...lsh, s: Math.max(lsh.s, 0.6), h: t * 360 }) },
        { kind: "scrub", id: "lightness", label: "Lightness", icon: IconBrightnessHalf, value: lsh.l, min: 0.2, max: 0.95, step: 0.005, defaultValue: dl.l, format: pct, onChange: (l) => setLsh({ l }), track: (t) => hexFromLsh({ ...lsh, l: 0.2 + t * 0.75 }) },
        { kind: "scrub", id: "saturation", label: "Saturation", icon: IconDroplet, value: lsh.s, min: 0, max: 1, step: 0.01, defaultValue: dl.s, format: pct, onChange: (v) => setLsh({ s: v }), track: (t) => hexFromLsh({ ...lsh, s: t }) },
        {
          kind: "choice",
          id: "presets",
          label: "Presets",
          icon: IconCircleHalf2,
          value: s.theme.toLowerCase(),
          options: THEME_PRESETS.map((p) => ({ value: p, label: p, swatch: p })),
          onChange: (theme) => update({ theme }),
          note: "Starting colors. Fine-tune with hue, lightness, and saturation.",
        },
        {
          kind: "choice",
          id: "neutral",
          label: "Neutral",
          icon: IconSquareHalf,
          value: s.neutral,
          options: (Object.keys(NEUTRALS) as NeutralId[]).map((id) => ({ value: id, label: NEUTRALS[id].label })),
          onChange: (neutral) => update({ neutral: neutral as NeutralId }),
          note: "The gray family for surfaces, borders, and body text.",
        },
        {
          // Zero means off, so one lever covers the switch and its strength.
          kind: "scrub",
          id: "tint",
          label: "Tint",
          icon: IconDroplet,
          value: s.themeTint ? s.tintStrength : 0,
          min: 0,
          max: s.advanced ? 1 : 0.6,
          step: 0.05,
          defaultValue: d.themeTint ? d.tintStrength : 0,
          format: (v) => (v < 0.05 ? "Off" : pct(v)),
          onChange: (v) => update(v < 0.05 ? { themeTint: false } : { themeTint: true, tintStrength: v }),
          // The neutral at each strength, chroma exaggerated 3x so a lean of a few thousandths is visible on a phone.
          track: (t) => {
            const n = resolveNeutral({ ...s, themeTint: t > 0, tintStrength: t * (s.advanced ? 1 : 0.6) }, rgbToOklch(parseHex(s.theme) ?? [37, 99, 235]))
            return hex(toRgb({ l: 0.7, c: n.chroma * 3, h: n.hue }))
          },
        },
        {
          kind: "choice",
          id: "dark-solid",
          label: "Dark solid",
          icon: IconMoon,
          value: s.darkSolid.mode,
          options: [
            { value: "lift", label: "Lift" },
            { value: "match", label: "Match light" },
            { value: "custom", label: "Custom" },
          ],
          onChange: (mode) =>
            update({
              darkSolid:
                mode === "custom" && s.darkSolid.mode !== "custom"
                  ? { mode, l: Math.max(0.3, lsh.l - 0.06), s: lsh.s * 0.85 }
                  : { ...s.darkSolid, mode: mode as Settings["darkSolid"]["mode"] },
            }),
          note: "The primary fill in dark mode. Lift raises it for contrast; Match keeps the light color.",
        },
        a11y("solids", "a11y-solids", "Solids", IconAccessible, "Force accessibility: lifts any dark solid under APCA's Lc 30 large-solid floor, by lightness alone."),
        { kind: "scrub", id: "series", label: "Series", icon: IconChartDots, value: s.categoricalCount, min: 5, max: 12, step: 1, defaultValue: d.categoricalCount, format: String, onChange: (categoricalCount) => update({ categoricalCount }) },
        { kind: "sheet", id: "all-colors", label: "All", icon: IconDots, section: "colors", title: "Colors" },
      ],
    },
    {
      id: "render",
      label: "Render",
      icon: IconStack2,
      params: [
        {
          kind: "choice",
          id: "layer",
          label: "Layer",
          icon: IconLayersSubtract,
          value: s.layer,
          options: [
            { value: "ink", label: "Ink" },
            { value: "flat", label: "Flat" },
            { value: "alpha", label: "Alpha" },
          ],
          onChange: (layer) => update({ layer: layer as Settings["layer"] }),
          note: "Ink keeps emphasis translucent and checked on every guard surface.",
        },
        ...(s.layer === "ink"
          ? [
              {
                kind: "multi",
                id: "guards",
                label: "Guards",
                icon: IconBoxMultiple,
                value: s.inkGuards,
                options: (["page", "card", "muted", "hover", "selected"] as const).map((g) => ({ value: g, label: g[0].toUpperCase() + g.slice(1) })),
                onChange: (v) => v.length && update({ inkGuards: v as Settings["inkGuards"] }),
                note: "Every ink level must pass on each surface picked here.",
              } satisfies Param,
            ]
          : []),
        s.advanced
          ? { kind: "scrub", id: "leash", label: "Leash", icon: IconArrowsDiff, value: s.leashDeg, min: 2, max: 8, step: 0.5, defaultValue: d.leashDeg, format: (v) => `±${v}°`, onChange: (leashDeg) => update({ leashDeg }) }
          : { kind: "toggle", id: "tighter", label: "Leash", icon: IconArrowsDiff, value: s.tighter, onChange: (tighter) => update({ tighter }), note: "Tighter hue leash: limits brand hue drift to ±2.5° instead of ±5°." },
        ...(s.advanced
          ? [
              { kind: "scrub", id: "chroma", label: "Chroma", icon: IconDroplet, value: s.chromaScale, min: b("chromaScale")[0], max: b("chromaScale")[1], step: 0.05, defaultValue: d.chromaScale, format: pct, onChange: (chromaScale: number) => update({ chromaScale }), track: (t) => hexFromLsh({ ...lsh, s: Math.min(1, lsh.s * (b("chromaScale")[0] + t * (b("chromaScale")[1] - b("chromaScale")[0]))) }) } satisfies Param,
              { kind: "sheet", id: "advanced", label: "Advanced", icon: IconDots, section: "advanced", title: "Advanced" } satisfies Param,
            ]
          : [{ kind: "sheet", id: "all-render", label: "All", icon: IconDots, section: "rendering", title: "Rendering" } satisfies Param]),
      ],
    },
    {
      // The system itself is picked from the header; this tool holds what's read from it.
      id: "targets",
      label: "Targets",
      icon: IconTarget,
      params: [
        {
          kind: "choice",
          id: "targets",
          label: "Targets",
          icon: IconTarget,
          value: s.targetSource,
          options: [
            { value: "reference", label: s.imports?.[s.output] ? "Match import" : "Match stock" },
            { value: "engine", label: "Engine emphasis" },
          ],
          onChange: (v) => update({ targetSource: v as Settings["targetSource"] }),
          note: "Match stock reproduces what the system renders, for your colors. Engine emphasis uses this tool's levels.",
        },
        a11y("inputBorders", "a11y-borders", "Borders", IconBorderOuter, "Force accessibility: every control border reaches 3:1 (WCAG 1.4.11)."),
        a11y("secondaryText", "a11y-text", "Text", IconLetterT, "Force accessibility: secondary text and labels on tints reach Lc 60 on every surface."),
        a11y("focusRing", "a11y-focus", "Focus", IconFocus2, "Force accessibility: the focus ring, as drawn, reaches 3:1."),
        { kind: "sheet", id: "all-targets", label: "All", icon: IconDots, section: "output", title: "Targets and accessibility" },
      ],
    },
    {
      id: "states",
      label: "States",
      icon: IconHandFinger,
      params: [
        { kind: "scrub", id: "step", label: "Step", icon: IconStairs, value: s.stateDelta, min: b("stateDelta")[0], max: b("stateDelta")[1], step: 0.005, defaultValue: d.stateDelta, format: (v) => `ΔL ${v.toFixed(3)}`, onChange: (stateDelta) => update({ stateDelta }) },
        {
          kind: "choice",
          id: "strategy",
          label: "Strategy",
          icon: IconClick,
          value: s.stateStrategy,
          options: [
            { value: "step", label: "Step" },
            { value: "overlay", label: "Overlay" },
          ],
          onChange: (v) => update({ stateStrategy: v as Settings["stateStrategy"] }),
          note: "Step swaps to the next solved color. Overlay adds a translucent tint layer.",
        },
        ...(s.stateStrategy === "overlay"
          ? [
              {
                kind: "choice",
                id: "overlay",
                label: "Overlay",
                icon: IconLayersSubtract,
                value: s.overlaySource,
                options: [
                  { value: "neutral", label: "Base ink" },
                  { value: "brand", label: "Role ink" },
                ],
                onChange: (v) => update({ overlaySource: v as Settings["overlaySource"] }),
              } satisfies Param,
            ]
          : []),
        {
          kind: "choice",
          id: "pressed",
          label: "Pressed",
          icon: IconHandFinger,
          value: s.pressedMode,
          options: [
            { value: "stacked", label: "Stack on hover" },
            { value: "from-rest", label: "From rest" },
          ],
          onChange: (v) => update({ pressedMode: v as Settings["pressedMode"] }),
        },
        {
          kind: "choice",
          id: "secondary",
          label: "Secondary",
          icon: IconSquareHalf,
          value: s.secondarySource,
          options: [
            { value: "neutral-flat", label: "Gray" },
            { value: "neutral-alpha", label: "Base alpha" },
            { value: "role-tint", label: "Role tint" },
          ],
          onChange: (v) => update({ secondarySource: v as Settings["secondarySource"] }),
          note: "The fill secondary buttons use.",
        },
        {
          kind: "choice",
          id: "neutral-primary",
          label: "Neutral",
          icon: IconCircleHalf2,
          value: s.neutralPrimary,
          options: [
            { value: "light", label: "Light fill" },
            { value: "solid", label: "Solid gray" },
          ],
          onChange: (v) => update({ neutralPrimary: v as Settings["neutralPrimary"] }),
          note: "The main neutral button.",
        },
      ],
    },
    {
      id: "levels",
      label: "Levels",
      icon: IconAdjustmentsHorizontal,
      params: [
        ...(["text", "fill", "stroke"] as const).map(
          (ctx) =>
            ({
              kind: "scrub",
              id: `offset-${ctx}`,
              label: ctx[0].toUpperCase() + ctx.slice(1),
              icon: ctx === "text" ? IconTextSize : ctx === "fill" ? IconSquareToggle : IconBorderOuter,
              value: s.offsets[ctx],
              min: b("offset")[0],
              max: b("offset")[1],
              step: 1,
              defaultValue: d.offsets[ctx],
              format: signedLc,
              onChange: (v) => update({ offsets: { ...s.offsets, [ctx]: v } }),
            }) satisfies Param,
        ),
        { kind: "scrub", id: "surface", label: "Surfaces", icon: IconStack2, value: s.surfaceScale, min: b("surfaceScale")[0], max: b("surfaceScale")[1], step: 0.05, defaultValue: d.surfaceScale, format: pct, onChange: (surfaceScale) => update({ surfaceScale }) },
        { kind: "sheet", id: "ramps", label: "Ramps", icon: IconStairs, section: "thresholds", title: "Thresholds" },
      ],
    },
  ]
}

const changed = (p: Param) =>
  p.kind === "scrub" ? Math.abs(p.value - p.defaultValue) > p.step / 2 : false

/** A parameter: icon in a circle, label under. The arc shows how far it sits from its default. */
function Chip({ p, selected, onSelect }: { p: Param; selected: boolean; onSelect: () => void }) {
  const on = p.kind === "toggle" && p.value
  return (
    <button
      type="button"
      data-param={p.id}
      onClick={onSelect}
      aria-pressed={p.kind === "toggle" ? p.value : selected}
      aria-label={p.kind === "toggle" ? `${p.label}: ${p.value ? "on" : "off"}` : p.label}
      className="flex w-16 shrink-0 snap-center flex-col items-center gap-1 outline-none"
    >
      <span
        className={cn(
          "relative flex size-12 items-center justify-center rounded-full border text-[11px] font-medium tabular-nums transition-colors",
          on ? "border-transparent bg-foreground text-background" : "bg-background/60",
          selected && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
          "[button:focus-visible_&]:ring-2 [button:focus-visible_&]:ring-ring",
        )}
      >
        {selected && p.kind === "scrub" ? p.format(p.value).replace(/ Lc$/, "").replace(/^ΔL /, "") : <p.icon className="size-5" stroke={1.75} />}
        {p.kind === "scrub" && changed(p) && <ValueRing value={p.value} min={p.min} max={p.max} origin={p.defaultValue} />}
      </span>
      <span className={cn("max-w-full truncate text-[11px]", selected ? "font-medium text-foreground" : "text-muted-foreground")}>{p.label}</span>
    </button>
  )
}

function Options({ p }: { p: Extract<Param, { kind: "choice" | "multi" }> }) {
  const ref = useRef<HTMLDivElement>(null)
  // Keep the picked option in view when the row is wider than the screen.
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("[aria-checked=true]")?.scrollIntoView({ inline: "center", block: "nearest" })
  }, [p.id])
  const picked = (v: string) => (p.kind === "multi" ? p.value.includes(v) : p.value === v)
  return (
    <div
      ref={ref}
      role={p.kind === "multi" ? "group" : "radiogroup"}
      aria-label={p.label}
      className="flex h-11 snap-x items-center gap-2 overflow-x-auto px-4 [scrollbar-width:none]"
    >
      {p.options.map((o) => (
        <button
          key={o.value}
          type="button"
          role={p.kind === "multi" ? "checkbox" : "radio"}
          aria-checked={picked(o.value)}
          aria-label={o.swatch ? `Use ${o.label}` : undefined}
          onClick={() =>
            p.kind === "multi"
              ? p.onChange(picked(o.value) ? p.value.filter((v) => v !== o.value) : [...p.value, o.value])
              : p.onChange(o.value)
          }
          className={cn(
            "flex h-9 shrink-0 snap-center items-center gap-1.5 rounded-full border px-3.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "aria-checked:border-transparent aria-checked:bg-foreground aria-checked:text-background",
            o.swatch && "size-9 justify-center px-0",
          )}
        >
          {o.swatch ? <span className="size-6 rounded-full" style={{ background: o.swatch }} /> : o.label}
        </button>
      ))}
    </div>
  )
}

/** The slot above the tab bar: whatever adjusts the selected parameter. */
function Slot({ p }: { p: Param }) {
  if (p.kind === "scrub") return <Scrubber key={p.id} {...p} />
  if (p.kind === "choice" || p.kind === "multi") return <Options p={p} />
  if (p.kind === "toggle")
    return (
      <div className="flex min-h-11 items-center gap-3 px-4">
        <div className="min-w-0 flex-1 text-xs text-muted-foreground">
          <p className="text-foreground">{p.note}</p>
          {p.status && <p className="mt-0.5">{p.status}</p>}
        </div>
        <Switch checked={p.value} onCheckedChange={p.onChange} aria-label={p.label} />
      </div>
    )
  return null
}

/**
 * The tool dock: chips, slot, and a floating tab bar. Tapping the active tab
 * folds the tray away so the canvas gets the whole screen.
 */
export function MobileDock({ engine }: { engine: Engine }) {
  const { sys, settings: s } = engine
  const out = useMemo<Outputs>(
    () => ({ light: solveOutput(sys, s.output, "light"), dark: solveOutput(sys, s.output, "dark") }),
    [sys, s.output],
  )
  const tools = useTools(engine, out)
  const [toolId, setToolId] = useState("color")
  const [open, setOpen] = useState(true)
  // Each tool remembers its own lever, the way Photos keeps your place per tab.
  const [picked, setPicked] = useState<Record<string, string>>({})
  const [sheet, setSheet] = useState<Extract<Param, { kind: "sheet" }> | null>(null)
  const tool = tools.find((t) => t.id === toolId)!
  const firstLever = tool.params.find((p) => p.kind !== "sheet")!
  const param = tool.params.find((p) => p.id === picked[tool.id] && p.kind !== "sheet") ?? firstLever

  const chipsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    chipsRef.current?.querySelector<HTMLElement>(`[data-param="${param.id}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" })
  }, [param.id, toolId])

  // Publish the dock's height so the canvas can pad its scroll end above it.
  const dockRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = dockRef.current
    if (!el) return
    const ro = new ResizeObserver(() => document.documentElement.style.setProperty("--dock-h", `${el.offsetHeight}px`))
    ro.observe(el)
    return () => {
      ro.disconnect()
      document.documentElement.style.removeProperty("--dock-h")
    }
  }, [])

  const select = (p: Param) => {
    if (p.kind === "sheet") return setSheet(p)
    // A toggle chip flips on tap, like Photos' Auto, and becomes the selected lever so its note says what changed.
    if (p.kind === "toggle") p.onChange(!p.value)
    setPicked((m) => ({ ...m, [tool.id]: p.id }))
  }

  const value =
    param.kind === "scrub" ? param.format(param.value) : param.kind === "choice" ? (param.options.find((o) => o.value === param.value)?.label ?? "") : param.kind === "toggle" ? (param.value ? "On" : "Off") : `${param.kind === "multi" ? param.value.length : ""} on`

  return (
    <>
      <div ref={dockRef} className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/85 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
        {open && (
          <div className="pt-2" role="region" aria-label={`${tool.label} tools`}>
            <div className="flex h-5 items-baseline justify-center gap-2 px-4 text-[11px] tracking-wide uppercase">
              <span className="font-medium text-muted-foreground">{param.label}</span>
              <span className="font-semibold tabular-nums normal-case">{param.kind === "choice" && param.options[0]?.swatch ? "" : value}</span>
              {param.kind === "scrub" && changed(param) && (
                <button type="button" className="-my-2 px-2 py-2 font-medium text-primary normal-case" onClick={() => param.onChange(param.defaultValue)}>
                  Reset
                </button>
              )}
            </div>
            {"note" in param && param.note && param.kind !== "toggle" && (
              <p className="mx-auto max-w-md truncate px-4 text-center text-[11px] text-muted-foreground">{param.note}</p>
            )}
            <div className="py-1.5">
              <Slot p={param} />
            </div>
            <div ref={chipsRef} className="flex snap-x gap-1 overflow-x-auto px-[calc(50%-2rem)] pt-1 pb-2 [scrollbar-width:none]">
              {tool.params.map((p) => (
                <Chip key={p.id} p={p} selected={p.id === param.id} onSelect={() => select(p)} />
              ))}
            </div>
          </div>
        )}
        <nav aria-label="Tools" className="flex justify-center px-3 pt-2">
          <div className="flex w-full max-w-md items-stretch rounded-full border bg-muted/70 p-1 shadow-sm">
            {tools.map((t) => {
              const active = t.id === toolId
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  aria-expanded={active ? open : undefined}
                  onClick={() => (active ? setOpen((o) => !o) : (setToolId(t.id), setOpen(true)))}
                  className={cn(
                    "relative flex min-h-11 flex-1 flex-col items-center justify-center rounded-full text-[11px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
                  )}
                >
                  {/* The caret: which tool the tray belongs to, and whether it's folded. */}
                  {active && (
                    <span
                      className={cn("absolute -top-2 size-0 border-x-4 border-x-transparent transition-transform", open ? "border-b-4 border-b-primary" : "border-t-4 border-t-primary")}
                      aria-hidden
                    />
                  )}
                  <t.icon className="size-5" stroke={1.75} />
                  {t.label}
                </button>
              )
            })}
          </div>
        </nav>
      </div>
      <Drawer open={!!sheet} onOpenChange={(o) => !o && setSheet(null)} snapPoints={[0.55, 1]}>
        {sheet && (
          <DrawerContent title={sheet.title}>
            <Controls engine={engine} only={[sheet.section]} />
          </DrawerContent>
        )}
      </Drawer>
    </>
  )
}

/** Settings that don't belong to a tool: the app's own switches. */
export function MoreSheet({
  open,
  onOpenChange,
  engine,
  themeApp,
  setThemeApp,
  onCredits,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  engine: Engine
  themeApp: boolean
  setThemeApp: (v: boolean) => void
  onCredits: () => void
}) {
  const { settings: s, update, reset } = engine
  const row = "flex min-h-12 items-center justify-between gap-4 px-4"
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent title="Options">
        <div className="flex flex-col divide-y">
          <div className={row}>
            <Label htmlFor="m-advanced" className="flex flex-col items-start gap-0.5 font-normal">
              <span className="text-sm font-medium">Advanced</span>
              <span className="text-xs text-muted-foreground">Every solver lever. Broken targets become warnings.</span>
            </Label>
            <Switch id="m-advanced" checked={s.advanced} onCheckedChange={(advanced) => update({ advanced })} />
          </div>
          <div className={row}>
            <Label htmlFor="m-theme-app" className="flex flex-col items-start gap-0.5 font-normal">
              <span className="text-sm font-medium">Theme this app</span>
              <span className="text-xs text-muted-foreground">The tool's own interface wears your theme.</span>
            </Label>
            <Switch id="m-theme-app" checked={themeApp} onCheckedChange={setThemeApp} />
          </div>
          <button type="button" className={cn(row, "text-left text-sm text-destructive")} onClick={() => (reset(), onOpenChange(false))}>
            Reset to defaults
          </button>
          <button type="button" className={cn(row, "text-left text-sm")} onClick={() => (onCredits(), onOpenChange(false))}>
            Credits and licenses
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export type View = "preview" | "grid" | "report" | "export" | "credits"

/**
 * The phone header: mode, hold-to-compare, options. Under it, the view
 * switcher, the way Photos keeps its secondary tools in a row up top.
 */
export function MobileHeader({
  engine,
  mode,
  setMode,
  view,
  setView,
  onCompare,
  onMore,
}: {
  engine: Engine
  mode: Mode
  setMode: (m: Mode) => void
  view: View
  setView: (v: View) => void
  onCompare: (on: boolean) => void
  onMore: () => void
}) {
  const icon = "inline-flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted"
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="flex items-center gap-1 pr-1 pl-4">
        {/* The title is the output system: tap to switch systems or import a theme. */}
        <h1 className="mr-auto min-w-0">
          <SystemSheetButton engine={engine} />
        </h1>
        <button
          type="button"
          className={cn(icon, "select-none [-webkit-touch-callout:none]")}
          aria-label="Hold to compare with defaults"
          title="Hold to compare with defaults"
          onPointerDown={() => onCompare(true)}
          onPointerUp={() => onCompare(false)}
          onPointerLeave={() => onCompare(false)}
          onPointerCancel={() => onCompare(false)}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={(e) => e.key === " " && (e.preventDefault(), onCompare(true))}
          onKeyUp={(e) => e.key === " " && onCompare(false)}
        >
          <IconSquareHalf className="size-5" stroke={1.75} />
        </button>
        <button
          type="button"
          className={icon}
          aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
          onClick={() => setMode(mode === "light" ? "dark" : "light")}
        >
          {mode === "light" ? <IconSun className="size-5" stroke={1.75} /> : <IconMoon className="size-5" stroke={1.75} />}
        </button>
        <button type="button" className={icon} aria-label="Options" onClick={onMore}>
          <IconDots className="size-5" stroke={1.75} />
        </button>
      </div>
      <div role="tablist" aria-label="View" className="flex gap-1 px-4 pb-2">
        {(["preview", "grid", "report", "export"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className="h-8 flex-1 rounded-full text-xs font-medium text-muted-foreground capitalize outline-none focus-visible:ring-2 focus-visible:ring-ring aria-selected:bg-foreground aria-selected:text-background"
          >
            {v}
          </button>
        ))}
      </div>
    </header>
  )
}
