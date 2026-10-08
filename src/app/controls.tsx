import { useMemo, useState, type ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { hex, parseHex, toRgb } from "@/engine/color"
import {
  BOUNDS,
  NEUTRALS,
  RAMPS,
  ROLES,
  withRole,
  type Context,
  type NeutralId,
  type Ramp,
  type RoleId,
  type RoleOverride,
  type Settings,
} from "@/engine/settings"
import { resolveNeutral, targetFor } from "@/engine/system"
import { rgbToOklch } from "@/engine/color"
import type { Engine } from "./use-engine"
import { InfoTip } from "./info-tip"
import { LshSliders, ThemeTune, lshFromHex } from "./tune"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { buildTier, type Tier } from "@/engine/shadcn"
import type { A11y, Mode } from "@/engine/settings"
import {
  IconAlertTriangleFilled,
  IconCheck,
  IconEaseIn,
  IconEaseInOut,
  IconEaseOut,
  IconSlash,
  IconStairs,
  type Icon,
} from "@tabler/icons-react"

const THEME_PRESETS = [
  "#1447e6",
  "#2563eb",
  "#f40009",
  "#7c3aed",
  "#059669",
  "#ea580c",
  "#0f172a",
]

function Section({
  title,
  children,
  hint,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 px-4 py-4">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

/** A control's label with its info tip beside it. */
function FieldLabel({
  label,
  tip,
  htmlFor,
  strong = true,
}: {
  label: string
  tip: string
  htmlFor?: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center gap-0.5">
      <Label htmlFor={htmlFor} className={strong ? "" : "text-sm font-normal"}>
        {label}
      </Label>
      <InfoTip label={label}>{tip}</InfoTip>
    </div>
  )
}

function Row({
  label,
  tip,
  children,
  htmlFor,
}: {
  label: string
  tip: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <FieldLabel label={label} tip={tip} htmlFor={htmlFor} strong={false} />
      {children}
    </div>
  )
}

/** Labeled block for controls that sit under their label. */
function Field({
  label,
  tip,
  htmlFor,
  children,
}: {
  label: string
  tip: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel label={label} tip={tip} htmlFor={htmlFor} />
      {children}
    </div>
  )
}

function ColorField({
  id,
  value,
  onChange,
  presets,
  disabled,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  presets?: string[]
  disabled?: boolean
}) {
  const valid = parseHex(value)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label="Pick color"
          value={valid ? hex(valid) : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="size-8 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs"
          aria-invalid={!valid}
          disabled={disabled}
        />
      </div>
      {presets && (
        <div className="flex gap-1.5">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              aria-label={`Use ${p}`}
              onClick={() => onChange(p)}
              className="size-5 rounded-full ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring aria-pressed:ring-2 aria-pressed:ring-foreground/60"
              aria-pressed={value.toLowerCase() === p}
              style={{ background: p }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Range({
  label,
  tip,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string
  tip: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <FieldLabel label={label} tip={tip} strong={false} />
        <span className="text-muted-foreground tabular-nums">
          {format(value)}
        </span>
      </div>
      <Slider
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={[Math.min(max, Math.max(min, value))]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : (v as number))}
      />
      <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

function Choice<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  label: string
}) {
  return (
    <ToggleGroup
      aria-label={label}
      variant="outline"
      size="sm"
      spacing={0}
      value={[value]}
      onValueChange={(v) => v[0] && onChange(v[0] as T)}
      className="w-full"
    >
      {options.map((o) => (
        <ToggleGroupItem
          key={o.value}
          value={o.value}
          className="flex-1 text-xs"
        >
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

const RAMP_META: Record<Ramp, { label: string; icon: Icon; note: string }> = {
  stepped: { label: "Stepped", icon: IconStairs, note: "APCA landmark values" },
  linear: { label: "Linear", icon: IconSlash, note: "Even steps" },
  "ease-in": {
    label: "Ease in",
    icon: IconEaseIn,
    note: "Tight low levels, wide top",
  },
  "ease-out": {
    label: "Ease out",
    icon: IconEaseOut,
    note: "Wide low levels, tight top",
  },
  "ease-in-out": {
    label: "Ease in-out",
    icon: IconEaseInOut,
    note: "Tight at both ends",
  },
}

/** Ramp picker: icon toggle group, each item tipped with the levels it yields. */
function RampGroup({
  label,
  value,
  onChange,
  preview,
}: {
  label: string
  value: Ramp
  onChange: (r: Ramp) => void
  preview: (r: Ramp) => string
}) {
  return (
    <ToggleGroup
      aria-label={label}
      variant="outline"
      size="sm"
      spacing={0}
      value={[value]}
      onValueChange={(v) => v[0] && onChange(v[0] as Ramp)}
      className="w-full"
    >
      {RAMPS.map((ramp) => {
        const { label: name, icon: RampIcon, note } = RAMP_META[ramp]
        return (
          <Tooltip key={ramp}>
            <TooltipTrigger
              render={
                <ToggleGroupItem
                  value={ramp}
                  aria-label={name}
                  className="flex-1"
                />
              }
            >
              <RampIcon />
            </TooltipTrigger>
            <TooltipContent className="flex-col items-start gap-0.5">
              <span className="font-medium">
                {name}: {note}
              </span>
              <span className="tabular-nums opacity-80">
                Light mode levels: {preview(ramp)}
              </span>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </ToggleGroup>
  )
}

/** Light-mode levels a context would get under a ramp, for tooltips. */
function previewLevels(settings: Settings, context: Context, ramp: Ramp) {
  const sim = { ...settings, ramps: { ...settings.ramps, [context]: ramp } }
  return ([1, 2, 3, 4, 5] as const)
    .map((l) => {
      const t = targetFor(sim, "light", context, l)
      return t.kind === "lc"
        ? Math.round(t.value).toString()
        : t.value.toFixed(3)
    })
    .join(", ")
}

function RampPicker({
  context,
  settings,
  update,
}: {
  context: Context
  settings: Settings
  update: Engine["update"]
}) {
  return (
    <RampGroup
      label={`${context} ramp`}
      value={settings.ramps[context]}
      onChange={(r) => update({ ramps: { ...settings.ramps, [context]: r } })}
      preview={(r) => previewLevels(settings, context, r)}
    />
  )
}

const CTX_LABEL: Record<Context, string> = {
  text: "Text",
  fill: "Fill",
  stroke: "Stroke",
  surface: "Surface",
}

/** Advanced: per-role thresholds that inherit global until changed. */
function RoleOverrides({
  settings: s,
  update,
  offsetBounds,
}: {
  settings: Settings
  update: Engine["update"]
  offsetBounds: readonly [number, number]
}) {
  const [role, setRole] = useState<RoleId>("danger")
  const o: RoleOverride = s.roleOverrides[role] ?? {}
  const eff = withRole(s, role)
  const set = (next: RoleOverride) =>
    update({ roleOverrides: { ...s.roleOverrides, [role]: next } })
  const count =
    Object.keys(o.ramps ?? {}).length +
    Object.keys(o.offsets ?? {}).length +
    (o.surfaceScale !== undefined ? 1 : 0)
  const mark = (on: boolean) =>
    on ? (
      <span className="text-[11px] font-medium text-primary">Overridden</span>
    ) : null
  return (
    <div className="flex flex-col gap-3">
      <FieldLabel
        label="Role overrides"
        tip="Give one role its own offsets and ramps. Unchanged values inherit the global thresholds."
      />
      <ToggleGroup
        aria-label="Role"
        variant="outline"
        size="sm"
        spacing={1}
        value={[role]}
        onValueChange={(v) => v[0] && setRole(v[0] as RoleId)}
        className="w-full flex-wrap"
      >
        {ROLES.map((r) => {
          const has =
            !!s.roleOverrides[r] &&
            Object.values(s.roleOverrides[r]!).some(
              (x) =>
                x !== undefined &&
                (typeof x !== "object" ||
                  (x !== null && Object.keys(x).length > 0))
            )
          return (
            <ToggleGroupItem key={r} value={r} className="text-xs capitalize">
              {r}
              {has && (
                <span
                  className="size-1.5 rounded-full bg-primary"
                  aria-label="has overrides"
                />
              )}
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {count
            ? `${count} override${count === 1 ? "" : "s"} on ${role}`
            : `${role[0].toUpperCase()}${role.slice(1)} inherits global`}
        </span>
        {count > 0 && (
          <Button variant="ghost" size="xs" onClick={() => set({})}>
            Reset to global
          </Button>
        )}
      </div>
      {(["text", "fill", "stroke"] as const).map((ctx) => (
        <div key={ctx} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            {mark(
              o.offsets?.[ctx] !== undefined || o.ramps?.[ctx] !== undefined
            )}
          </div>
          <Range
            label={`${CTX_LABEL[ctx]} offset`}
            tip={`Raises or lowers every ${ctx} target for this role only.`}
            value={eff.offsets[ctx]}
            min={offsetBounds[0]}
            max={offsetBounds[1]}
            step={1}
            format={(v) => `${v > 0 ? "+" : ""}${v} Lc`}
            onChange={(v) => set({ ...o, offsets: { ...o.offsets, [ctx]: v } })}
          />
          <RampGroup
            label={`${role} ${ctx} ramp`}
            value={eff.ramps[ctx]}
            onChange={(r) => set({ ...o, ramps: { ...o.ramps, [ctx]: r } })}
            preview={(r) => previewLevels(eff, ctx, r)}
          />
        </div>
      ))}
      <div className="flex flex-col gap-2">
        {mark(o.surfaceScale !== undefined || o.ramps?.surface !== undefined)}
        <Range
          label="Surface spacing"
          tip="Surface level spacing for this role only."
          value={eff.surfaceScale}
          min={0.5}
          max={1.8}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => set({ ...o, surfaceScale: v })}
        />
        <RampGroup
          label={`${role} surface ramp`}
          value={eff.ramps.surface}
          onChange={(r) => set({ ...o, ramps: { ...o.ramps, surface: r } })}
          preview={(r) => previewLevels(eff, "surface", r)}
        />
      </div>
    </div>
  )
}

function NeutralPicker({
  settings,
  update,
}: {
  settings: Settings
  update: Engine["update"]
}) {
  const theme = rgbToOklch(parseHex(settings.theme) ?? [37, 99, 235])
  return (
    <div
      className="grid grid-cols-3 gap-2"
      role="radiogroup"
      aria-label="Base neutral"
    >
      {(Object.keys(NEUTRALS) as NeutralId[]).map((id) => {
        const plain = resolveNeutral(
          { ...settings, neutral: id, themeTint: false },
          theme
        )
        const tinted = resolveNeutral(
          { ...settings, neutral: id, themeTint: true },
          theme
        )
        // Each neutral shown untinted (left) and tinted (right), at a surface
        // and a text lightness, so the choice is made by looking.
        const chip = (n: { hue: number; chroma: number }, l: number) =>
          hex(toRgb({ l, c: n.chroma * 2.2, h: n.hue }))
        const selected = settings.neutral === id
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => update({ neutral: id })}
            className="flex flex-col items-start gap-1.5 rounded-md border p-1.5 text-left text-xs transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring aria-checked:border-foreground/50 aria-checked:bg-accent"
          >
            <span className="flex w-full overflow-hidden rounded-sm">
              <span
                className="h-5 flex-1"
                style={{ background: chip(plain, 0.9) }}
              />
              <span
                className="h-5 flex-1"
                style={{ background: chip(tinted, 0.9) }}
              />
              <span
                className="h-5 flex-1"
                style={{ background: chip(plain, 0.45) }}
              />
              <span
                className="h-5 flex-1"
                style={{ background: chip(tinted, 0.45) }}
              />
            </span>
            {NEUTRALS[id].label}
          </button>
        )
      })}
    </div>
  )
}

type Tiers = Record<Mode, Tier>

/** Every spec check one Force accessibility switch governs, in both modes. */
function checksFor(tiers: Tiers, key: keyof A11y) {
  const out: { mode: Mode; name: string; rule: string; achieved: string; pass: boolean }[] = []
  for (const mode of ["light", "dark"] as Mode[])
    for (const v of Object.values(tiers[mode]))
      if (v.spec?.a11y === key) out.push({ mode, name: v.name, ...v.spec })
  return out
}

/**
 * Force accessibility, placed beside the control whose parity value can drop
 * under a spec. Shows what the spec asks and where each mode lands.
 */
function A11yToggle({
  k,
  settings,
  update,
  tiers,
  tip,
}: {
  k: keyof A11y
  settings: Settings
  update: Engine["update"]
  tiers: Tiers
  tip: string
}) {
  const checks = checksFor(tiers, k)
  const failing = checks.filter((c) => !c.pass)
  const on = settings.a11y[k]
  const id = `a11y-${k}`
  return (
    <div className="flex flex-col gap-1 rounded-md border border-dashed px-2.5 py-2">
      <div className="flex items-center justify-between gap-3">
        <FieldLabel label="Force accessibility" tip={tip} htmlFor={id} strong={false} />
        <Switch
          id={id}
          size="sm"
          checked={on}
          onCheckedChange={(v) => update({ a11y: { ...settings.a11y, [k]: v } })}
        />
      </div>
      <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
        {checks.map((c) => (
          <li key={c.mode + c.name} className="flex items-center gap-1.5">
            {c.pass ? (
              <IconCheck className="size-3.5 shrink-0" aria-label="Meets spec" />
            ) : (
              <IconAlertTriangleFilled className="size-3.5 shrink-0" style={{ color: "var(--destructive)" }} aria-label="Under spec" />
            )}
            <span className="capitalize">{c.mode}</span>
            <code className="font-mono text-[11px]">{c.name.replace(/^--/, "")}</code>
            <span className="ml-auto tabular-nums">{c.achieved}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-muted-foreground">
        {failing.length ? `Under spec: ${checks[0].rule}.` : `Meets ${checks[0].rule}.`}
      </p>
    </div>
  )
}

/** A read-only measurement row: what a shadcn variable lands at in each mode. */
function Readout({ label, tip, light, dark }: { label: string; tip: string; light: string; dark: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <FieldLabel label={label} tip={tip} strong={false} />
      <span className="text-xs text-muted-foreground tabular-nums">
        {light} · {dark}
      </span>
    </div>
  )
}

export function Controls({ engine }: { engine: Engine }) {
  const { settings: s, update, sys } = engine
  const tiers = useMemo<Tiers>(() => ({ light: buildTier(sys, "light"), dark: buildTier(sys, "dark") }), [sys])
  const tier = s.advanced ? "advanced" : "basic"
  const b = (k: keyof typeof BOUNDS) =>
    BOUNDS[k][tier] as readonly [number, number]
  return (
    <div className="flex flex-col">
      <Section title="Colors" hint="Three picks drive the whole system.">
        <Field
          label="Theme"
          tip="Your brand color. Drives primary actions, focus, and links."
          htmlFor="theme-color"
        >
          <ColorField
            id="theme-color"
            value={s.theme}
            onChange={(theme) => update({ theme })}
            presets={THEME_PRESETS}
          />
          <ThemeTune theme={s.theme} onChange={(theme) => update({ theme })} />
        </Field>
        <Field
          label="Dark-mode solid"
          tip="The primary fill in dark mode. Lift raises it for contrast. Match keeps the light color. Custom sets it directly."
        >
          <Choice
            label="Dark-mode solid"
            value={s.darkSolid.mode}
            onChange={(mode) =>
              update({
                darkSolid:
                  mode === "custom" && s.darkSolid.mode !== "custom"
                    ? {
                        mode,
                        l: Math.max(0.3, lshFromHex(s.theme).l - 0.06),
                        s: lshFromHex(s.theme).s * 0.85,
                      }
                    : { ...s.darkSolid, mode },
              })
            }
            options={[
              { value: "lift", label: "Lift" },
              { value: "match", label: "Match light" },
              { value: "custom", label: "Custom" },
            ]}
          />
          {s.darkSolid.mode === "custom" && (
            <LshSliders
              idPrefix="dark-solid"
              showHue={false}
              value={{
                l: s.darkSolid.l,
                s: s.darkSolid.s,
                h: lshFromHex(s.theme).h,
              }}
              onChange={(v) =>
                update({ darkSolid: { mode: "custom", l: v.l, s: v.s } })
              }
            />
          )}
          {s.darkSolid.mode !== "lift" && (
            <A11yToggle
              k="solids"
              settings={s}
              update={update}
              tiers={tiers}
              tip="shadcn's dark primary sits near Lc 12 against the page. On: any dark solid under APCA's Lc 30 large-solid floor is lifted by lightness alone, keeping hue and saturation."
            />
          )}
        </Field>
        <Field
          label="Base neutral"
          tip="The gray family for surfaces, borders, and body text."
        >
          <NeutralPicker settings={s} update={update} />
        </Field>
        <Row
          label="Theme tint"
          tip="Leans the neutrals slightly toward the theme hue."
          htmlFor="theme-tint"
        >
          <Switch
            id="theme-tint"
            checked={s.themeTint}
            onCheckedChange={(themeTint) => update({ themeTint })}
          />
        </Row>
        {s.themeTint && (
          <Range
            label="Tint strength"
            tip="How far the neutrals lean toward the theme hue."
            value={s.tintStrength}
            min={0.1}
            max={s.advanced ? 1 : 0.6}
            step={0.05}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(tintStrength) => update({ tintStrength })}
          />
        )}
        <Field
          label="Chart"
          tip="Seed color for the chart palette."
          htmlFor="chart-color"
        >
          <ColorField
            id="chart-color"
            value={s.chartUseTheme ? s.theme : s.chart}
            onChange={(chart) => update({ chart })}
            disabled={s.chartUseTheme}
          />
        </Field>
        <Row
          label="Use theme color"
          tip="Seeds the chart palette from the theme color instead of a separate pick."
          htmlFor="chart-use-theme"
        >
          <Switch
            id="chart-use-theme"
            checked={s.chartUseTheme}
            onCheckedChange={(chartUseTheme) => update({ chartUseTheme })}
          />
        </Row>
        <Range
          label="Chart series"
          tip="How many distinct chart colors to generate."
          value={s.categoricalCount}
          min={5}
          max={12}
          step={1}
          format={(v) => String(v)}
          onChange={(categoricalCount) => update({ categoricalCount })}
        />
      </Section>
      <Separator />
      <Section
        title="Rendering"
        hint="Ink keeps emphasis translucent and checked on every surface."
      >
        <Field
          label="Layer"
          tip="Ink: text, strokes, soft fills, and states are translucent ink that passes on every guard surface. Flat and Alpha solve against the page only."
        >
          <Choice
            label="Layer"
            value={s.layer}
            onChange={(layer) => update({ layer })}
            options={[
              { value: "ink", label: "Ink" },
              { value: "flat", label: "Flat" },
              { value: "alpha", label: "Alpha" },
            ]}
          />
        </Field>
        {s.layer === "ink" && (
          <Field
            label="Guard surfaces"
            tip="Every ink level must pass on each surface picked here. More surfaces, slightly stronger inks."
          >
            <ToggleGroup
              aria-label="Guard surfaces"
              variant="outline"
              size="sm"
              spacing={1}
              multiple
              value={s.inkGuards}
              onValueChange={(v) => v.length && update({ inkGuards: v as Settings["inkGuards"] })}
              className="w-full flex-wrap"
            >
              {(["page", "card", "muted", "hover", "selected"] as const).map((g) => (
                <ToggleGroupItem key={g} value={g} className="text-xs capitalize">
                  {g}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
        )}
        {!s.advanced && (
          <Row
            label="Tighter hue leash"
            tip="Limits brand hue drift to ±2.5° instead of ±5°."
            htmlFor="tighter"
          >
            <Switch
              id="tighter"
              checked={s.tighter}
              onCheckedChange={(tighter) => update({ tighter })}
            />
          </Row>
        )}
      </Section>
      <Separator />
      <Section
        title="shadcn tokens"
        hint="The exported shadcn variables, each solved for its own job. Tuned to match stock shadcn."
      >
        <Readout
          label="Separators"
          tip="--border: card and table edges, dividers. A lightness step from the card, the way shadcn draws them. Decorative, so no contrast spec applies."
          light={`ΔL ${tiers.light["--border"].dL.toFixed(3)}`}
          dark={`ΔL ${tiers.dark["--border"].dL.toFixed(3)}`}
        />
        <Readout
          label="Field borders"
          tip="--input: text fields, selects, and dark-mode outline buttons. shadcn draws them as faint as separators. Light-mode outline buttons use --border."
          light={`${tiers.light["--input"].spec?.achieved}`}
          dark={`${tiers.dark["--input"].spec?.achieved}`}
        />
        <A11yToggle
          k="inputBorders"
          settings={s}
          update={update}
          tiers={tiers}
          tip="WCAG 1.4.11 asks 3:1 for the edge that identifies a control. On: field borders step until they pass on both page and card. Outline buttons and fields tinted with --input get a little stronger too."
        />
        <Readout
          label="Muted text"
          tip="--muted-foreground: descriptions, captions, placeholders. Matches shadcn: Lc 75 in light mode, Lc 50 in dark."
          light={`Lc ${Math.round(tiers.light["--muted-foreground"].lc)}`}
          dark={`Lc ${Math.round(tiers.dark["--muted-foreground"].lc)}`}
        />
        <A11yToggle
          k="secondaryText"
          settings={s}
          update={update}
          tiers={tiers}
          tip="APCA asks Lc 60 for body text. shadcn's dark muted text and dark destructive text sit under it. On: both reach Lc 60 on card and on muted."
        />
        <Readout
          label="Focus ring"
          tip="--ring: neutral, drawn by the components at 50% opacity, 3px wide."
          light={`${tiers.light["--ring"].spec?.achieved}`}
          dark={`${tiers.dark["--ring"].spec?.achieved}`}
        />
        <A11yToggle
          k="focusRing"
          settings={s}
          update={update}
          tiers={tiers}
          tip="WCAG 1.4.11 asks 3:1 for a focus indicator. Measured as drawn: the ring at 50% over the card. On: the ring steps until the drawn ring passes."
        />
      </Section>
      <Separator />
      <Section title="Interaction states">
        <Field
          label="State strategy"
          tip="Step swaps to the next solved color. Overlay adds a translucent tint layer."
        >
          <Choice
            label="State strategy"
            value={s.stateStrategy}
            onChange={(stateStrategy) => update({ stateStrategy })}
            options={[
              { value: "step", label: "Step" },
              { value: "overlay", label: "Overlay" },
            ]}
          />
        </Field>
        {s.stateStrategy === "overlay" && (
          <Field
            label="Overlay source"
            tip="Tint states with the base neutral or the button's own color."
          >
            <Choice
              label="Overlay source"
              value={s.overlaySource}
              onChange={(overlaySource) => update({ overlaySource })}
              options={[
                { value: "neutral", label: "Base ink" },
                { value: "brand", label: "Role ink" },
              ]}
            />
          </Field>
        )}
        <Field
          label="Pressed"
          tip="Build pressed on top of hover, or step straight from rest."
        >
          <Choice
            label="Pressed"
            value={s.pressedMode}
            onChange={(pressedMode) => update({ pressedMode })}
            options={[
              { value: "stacked", label: "Stack on hover" },
              { value: "from-rest", label: "From rest" },
            ]}
          />
        </Field>
        <Field label="Secondary fill" tip="The fill secondary buttons use.">
          <Choice
            label="Secondary fill"
            value={s.secondarySource}
            onChange={(secondarySource) => update({ secondarySource })}
            options={[
              { value: "neutral-flat", label: "Gray" },
              { value: "neutral-alpha", label: "Base alpha" },
              { value: "role-tint", label: "Role tint" },
            ]}
          />
        </Field>
        <Field
          label="Neutral primary"
          tip="The main neutral button: light gray with dark text, or solid gray with light text."
        >
          <Choice
            label="Neutral primary"
            value={s.neutralPrimary}
            onChange={(neutralPrimary) => update({ neutralPrimary })}
            options={[
              { value: "light", label: "Light fill, dark text" },
              { value: "solid", label: "Solid gray" },
            ]}
          />
        </Field>
        <Range
          label="State step (ΔL)"
          tip="How much lightness changes on hover and press."
          value={s.stateDelta}
          min={b("stateDelta")[0]}
          max={b("stateDelta")[1]}
          step={0.005}
          format={(v) => v.toFixed(3)}
          onChange={(stateDelta) => update({ stateDelta })}
        />
      </Section>
      <Separator />
      <Section
        title="Thresholds"
        hint="Offset shifts every level. Ramp sets how the levels spread between the ends."
      >
        {(["text", "fill", "stroke"] as const).map((ctx) => (
          <div key={ctx} className="flex flex-col gap-2">
            <Range
              label={`${ctx[0].toUpperCase()}${ctx.slice(1)} offset`}
              tip={`Raises or lowers every ${ctx} contrast target.`}
              value={s.offsets[ctx]}
              min={b("offset")[0]}
              max={b("offset")[1]}
              step={1}
              format={(v) => `${v > 0 ? "+" : ""}${v} Lc`}
              onChange={(v) => update({ offsets: { ...s.offsets, [ctx]: v } })}
            />
            <RampPicker context={ctx} settings={s} update={update} />
          </div>
        ))}
        <Range
          label="Surface spacing"
          tip="How far apart the surface levels sit in lightness."
          value={s.surfaceScale}
          min={b("surfaceScale")[0]}
          max={b("surfaceScale")[1]}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(surfaceScale) => update({ surfaceScale })}
        />
        <RampPicker context="surface" settings={s} update={update} />
      </Section>
      {s.advanced && (
        <>
          <Separator />
          <Section
            title="Advanced"
            hint="Every lever the solver pulls. Targets become warnings."
          >
            <Range
              label="Hue leash"
              tip="The most the solver may shift a color's hue."
              value={s.leashDeg}
              min={2}
              max={8}
              step={0.5}
              format={(v) => `±${v}°`}
              onChange={(leashDeg) => update({ leashDeg })}
            />
            <Range
              label="Chroma scale"
              tip="Scales color intensity across every role."
              value={s.chromaScale}
              min={b("chromaScale")[0]}
              max={b("chromaScale")[1]}
              step={0.05}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={(chromaScale) => update({ chromaScale })}
            />
            <Row
              label="True-color solid fills"
              tip="Keeps solid buttons the exact picked color when contrast allows."
              htmlFor="true-solids"
            >
              <Switch
                id="true-solids"
                checked={s.trueSolids}
                onCheckedChange={(trueSolids) => update({ trueSolids })}
              />
            </Row>
            <Row
              label="Hold saturation"
              tip="Keeps colors vivid as they get lighter or darker."
              htmlFor="hold-sat"
            >
              <Switch
                id="hold-sat"
                checked={s.holdSaturation}
                onCheckedChange={(holdSaturation) => update({ holdSaturation })}
              />
            </Row>
            <Field
              label="Alpha tie-break"
              tip="When several alphas fit: most transparent, or closest to the picked hue."
            >
              <Choice
                label="Alpha tie-break"
                value={s.tieBreak}
                onChange={(tieBreak) => update({ tieBreak })}
                options={[
                  { value: "lowest-alpha", label: "Lowest alpha" },
                  { value: "hue-fidelity", label: "Closest to hue" },
                ]}
              />
            </Field>
            <Range
              label="Family pull on charts"
              tip="Nudges chart colors toward the brand hue."
              value={s.familyPull}
              min={0}
              max={1}
              step={0.05}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={(familyPull) => update({ familyPull })}
            />
            <Separator />
            <RoleOverrides
              settings={s}
              update={update}
              offsetBounds={BOUNDS.offset.advanced}
            />
          </Section>
        </>
      )}
      <div className="px-4 pb-6">
        <Button variant="ghost" size="sm" onClick={engine.reset}>
          Reset to defaults
        </Button>
      </div>
    </div>
  )
}
