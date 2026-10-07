import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { hex, parseHex, toRgb } from "@/engine/color"
import { BOUNDS, NEUTRALS, type NeutralId, type Settings } from "@/engine/settings"
import { resolveNeutral } from "@/engine/system"
import { rgbToOklch } from "@/engine/color"
import type { Engine } from "./use-engine"

const THEME_PRESETS = ["#2563eb", "#f40009", "#7c3aed", "#059669", "#ea580c", "#0f172a"]

function Section({ title, children, hint }: { title: string; hint?: string; children: ReactNode }) {
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

function Row({ label, children, htmlFor }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={htmlFor} className="text-sm font-normal">
        {label}
      </Label>
      {children}
    </div>
  )
}

function ColorField({
  id,
  value,
  onChange,
  presets,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  presets?: string[]
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
          className="size-8 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5"
        />
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs" aria-invalid={!valid} />
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
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string
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
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground">{format(value)}</span>
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
        <ToggleGroupItem key={o.value} value={o.value} className="flex-1 text-xs">
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function NeutralPicker({ settings, update }: { settings: Settings; update: Engine["update"] }) {
  const theme = rgbToOklch(parseHex(settings.theme) ?? [37, 99, 235])
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Base neutral">
      {(Object.keys(NEUTRALS) as NeutralId[]).map((id) => {
        const plain = resolveNeutral({ ...settings, neutral: id, themeTint: false }, theme)
        const tinted = resolveNeutral({ ...settings, neutral: id, themeTint: true }, theme)
        // Each neutral shown untinted (left) and tinted (right), at a surface
        // and a text lightness, so the choice is made by looking.
        const chip = (n: { hue: number; chroma: number }, l: number) => hex(toRgb({ l, c: n.chroma * 2.2, h: n.hue }))
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
              <span className="h-5 flex-1" style={{ background: chip(plain, 0.9) }} />
              <span className="h-5 flex-1" style={{ background: chip(tinted, 0.9) }} />
              <span className="h-5 flex-1" style={{ background: chip(plain, 0.45) }} />
              <span className="h-5 flex-1" style={{ background: chip(tinted, 0.45) }} />
            </span>
            {NEUTRALS[id].label}
          </button>
        )
      })}
    </div>
  )
}

export function Controls({ engine }: { engine: Engine }) {
  const { settings: s, update } = engine
  const tier = s.advanced ? "advanced" : "basic"
  const b = (k: keyof typeof BOUNDS) => BOUNDS[k][tier] as readonly [number, number]
  return (
    <div className="flex flex-col">
      <Section title="Colors" hint="Three picks drive the whole system.">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="theme-color">Theme</Label>
          <ColorField id="theme-color" value={s.theme} onChange={(theme) => update({ theme })} presets={THEME_PRESETS} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Base neutral</Label>
          <NeutralPicker settings={s} update={update} />
        </div>
        <Row label="Theme tint" htmlFor="theme-tint">
          <Switch id="theme-tint" checked={s.themeTint} onCheckedChange={(themeTint) => update({ themeTint })} />
        </Row>
        {s.themeTint && (
          <Range
            label="Tint strength"
            value={s.tintStrength}
            min={0.1}
            max={s.advanced ? 1 : 0.6}
            step={0.05}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(tintStrength) => update({ tintStrength })}
          />
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="chart-color">Chart</Label>
          <ColorField id="chart-color" value={s.chart} onChange={(chart) => update({ chart })} />
        </div>
        <Range
          label="Chart series"
          value={s.categoricalCount}
          min={5}
          max={12}
          step={1}
          format={(v) => String(v)}
          onChange={(categoricalCount) => update({ categoricalCount })}
        />
      </Section>
      <Separator />
      <Section title="Rendering" hint="Flat is the base. Alpha keeps every ink translucent.">
        <Choice
          label="Layer"
          value={s.layer}
          onChange={(layer) => update({ layer })}
          options={[
            { value: "flat", label: "Flat" },
            { value: "alpha", label: "Alpha" },
          ]}
        />
        {!s.advanced && (
          <Row label="Tighter hue leash (±2.5°)" htmlFor="tighter">
            <Switch id="tighter" checked={s.tighter} onCheckedChange={(tighter) => update({ tighter })} />
          </Row>
        )}
      </Section>
      <Separator />
      <Section title="Interaction states">
        <Choice
          label="State strategy"
          value={s.stateStrategy}
          onChange={(stateStrategy) => update({ stateStrategy })}
          options={[
            { value: "step", label: "Step" },
            { value: "overlay", label: "Overlay" },
          ]}
        />
        {s.stateStrategy === "overlay" && (
          <Choice
            label="Overlay source"
            value={s.overlaySource}
            onChange={(overlaySource) => update({ overlaySource })}
            options={[
              { value: "neutral", label: "Base ink" },
              { value: "brand", label: "Role ink" },
            ]}
          />
        )}
        <Choice
          label="Pressed"
          value={s.pressedMode}
          onChange={(pressedMode) => update({ pressedMode })}
          options={[
            { value: "stacked", label: "Stack on hover" },
            { value: "from-rest", label: "From rest" },
          ]}
        />
        <div className="flex flex-col gap-1.5">
          <Label>Secondary fill</Label>
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
        </div>
        <Range
          label="State step (ΔL)"
          value={s.stateDelta}
          min={b("stateDelta")[0]}
          max={b("stateDelta")[1]}
          step={0.005}
          format={(v) => v.toFixed(3)}
          onChange={(stateDelta) => update({ stateDelta })}
        />
      </Section>
      <Separator />
      <Section title="Thresholds" hint="Shift every level of a context. Basic clamps at ±5 Lc.">
        {(["text", "fill", "stroke"] as const).map((ctx) => (
          <Range
            key={ctx}
            label={`${ctx[0].toUpperCase()}${ctx.slice(1)} offset`}
            value={s.offsets[ctx]}
            min={b("offset")[0]}
            max={b("offset")[1]}
            step={1}
            format={(v) => `${v > 0 ? "+" : ""}${v} Lc`}
            onChange={(v) => update({ offsets: { ...s.offsets, [ctx]: v } })}
          />
        ))}
        <Range
          label="Surface spacing"
          value={s.surfaceScale}
          min={b("surfaceScale")[0]}
          max={b("surfaceScale")[1]}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(surfaceScale) => update({ surfaceScale })}
        />
      </Section>
      {s.advanced && (
        <>
          <Separator />
          <Section title="Advanced" hint="Every lever the solver pulls. Targets become warnings.">
            <Range
              label="Hue leash"
              value={s.leashDeg}
              min={2}
              max={8}
              step={0.5}
              format={(v) => `±${v}°`}
              onChange={(leashDeg) => update({ leashDeg })}
            />
            <Range
              label="Chroma scale"
              value={s.chromaScale}
              min={b("chromaScale")[0]}
              max={b("chromaScale")[1]}
              step={0.05}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={(chromaScale) => update({ chromaScale })}
            />
            <Row label="Hold saturation" htmlFor="hold-sat">
              <Switch id="hold-sat" checked={s.holdSaturation} onCheckedChange={(holdSaturation) => update({ holdSaturation })} />
            </Row>
            <div className="flex flex-col gap-1.5">
              <Label>Alpha tie-break</Label>
              <Choice
                label="Alpha tie-break"
                value={s.tieBreak}
                onChange={(tieBreak) => update({ tieBreak })}
                options={[
                  { value: "lowest-alpha", label: "Lowest alpha" },
                  { value: "hue-fidelity", label: "Closest to hue" },
                ]}
              />
            </div>
            <Range
              label="Family pull on charts"
              value={s.familyPull}
              min={0}
              max={1}
              step={0.05}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={(familyPull) => update({ familyPull })}
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
