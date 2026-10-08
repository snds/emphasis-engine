import { useRef } from "react"
import { Slider } from "@/components/ui/slider"
import { hex, maxChroma, parseHex, rgbToOklch, toRgb } from "@/engine/color"
import { InfoTip } from "./info-tip"

/**
 * Perceptual color sliders. Lightness and hue are OKLCH. Saturation is
 * chroma as a share of the most the gamut allows at that lightness and hue,
 * so moving lightness never drains saturation or shifts hue the way an HSV
 * picker does, and saturation never clips.
 */
export type Lsh = { l: number; s: number; h: number }

export function lshFromHex(value: string, fallbackHue = 264): Lsh {
  const rgb = parseHex(value) ?? [37, 99, 235]
  const o = rgbToOklch(rgb)
  const max = maxChroma(o.l, o.h)
  return {
    l: o.l,
    s: max > 0 ? Math.min(1, o.c / max) : 0,
    h: o.c < 0.01 ? fallbackHue : o.h,
  }
}

export function hexFromLsh({ l, s, h }: Lsh): string {
  return hex(toRgb({ l, c: s * maxChroma(l, h), h }))
}

function gradient(stops: (t: number) => string, n = 14) {
  return `linear-gradient(to right, ${Array.from({ length: n }, (_, i) => stops(i / (n - 1))).join(", ")})`
}

function TuneRow({
  label,
  tip,
  value,
  min,
  max,
  step,
  display,
  track,
  onChange,
}: {
  label: string
  tip: string
  value: number
  min: number
  max: number
  step: number
  display: string
  track: string
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-0.5 text-muted-foreground">
          {label}
          <InfoTip label={label}>{tip}</InfoTip>
        </span>
        <span className="text-muted-foreground tabular-nums">{display}</span>
      </div>
      <Slider
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : (v as number))}
        trackStyle={{ backgroundImage: track }}
      />
    </div>
  )
}

/** Lightness, saturation, and hue sliders for one color, painted with their own ranges. */
export function LshSliders({
  value,
  onChange,
  showHue = true,
  idPrefix,
}: {
  value: Lsh
  onChange: (v: Lsh) => void
  showHue?: boolean
  idPrefix: string
}) {
  const { l, s, h } = value
  return (
    <div
      className="flex flex-col gap-2.5 rounded-md border p-2.5"
      id={`${idPrefix}-tune`}
    >
      <TuneRow
        label="Lightness"
        tip="Darker or lighter, keeping hue and saturation."
        value={l * 100}
        min={5}
        max={98}
        step={0.5}
        display={`${(l * 100).toFixed(1)}%`}
        track={gradient((t) => hexFromLsh({ l: 0.05 + t * 0.93, s, h }))}
        onChange={(v) => onChange({ l: v / 100, s, h })}
      />
      <TuneRow
        label="Saturation"
        tip="Muted to vivid. 100% is the most this lightness and hue allow."
        value={s * 100}
        min={0}
        max={100}
        step={0.5}
        display={`${Math.round(s * 100)}%`}
        track={gradient((t) => hexFromLsh({ l, s: t, h }))}
        onChange={(v) => onChange({ l, s: v / 100, h })}
      />
      {showHue && (
        <TuneRow
          label="Hue"
          tip="The color itself, in OKLCH degrees."
          value={h}
          min={0}
          max={360}
          step={0.5}
          display={`${h.toFixed(1)}°`}
          track={gradient(
            (t) => hexFromLsh({ l, s: Math.max(s, 0.6), h: t * 360 }),
            24
          )}
          onChange={(v) => onChange({ l, s, h: v })}
        />
      )}
    </div>
  )
}

/** Theme tuner: keeps the hue through grays so dragging saturation to 0 and back doesn't lose it. */
export function ThemeTune({
  theme,
  onChange,
}: {
  theme: string
  onChange: (hex: string) => void
}) {
  const lastHue = useRef(264)
  const v = lshFromHex(theme, lastHue.current)
  if (v.s > 0.02) lastHue.current = v.h
  return (
    <LshSliders
      idPrefix="theme"
      value={v}
      onChange={(n) => {
        lastHue.current = n.h
        onChange(hexFromLsh(n))
      }}
    />
  )
}
