import { startTransition, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { cn } from "cn"

/**
 * A tick ruler under a fixed center needle, after the Photos editor. The
 * ruler moves, the needle doesn't, so the value is always read at the same
 * spot under the thumb. Drag for coarse, flick for momentum, arrow keys for
 * single steps. The dot marks the default.
 */
export function Scrubber({
  label,
  value,
  min,
  max,
  step,
  defaultValue,
  format,
  onChange,
  major = 5,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  defaultValue: number
  format: (v: number) => string
  onChange: (v: number) => void
  /** Minor ticks per major tick. */
  major?: number
}) {
  // One tick per step when that stays readable, else the smallest step multiple under 100 ticks.
  const range = max - min
  const tick = [1, 2, 5, 10, 20, 50, 100].map((k) => k * step).find((t) => range / t <= 100) ?? range / 100
  const ticks = Math.round(range / tick)
  // Short ranges still get a ruler long enough to feel like travel.
  const gap = Math.max(9, 280 / ticks)
  const perUnit = gap / tick

  const clamp = (v: number) => Math.min(max, Math.max(min, v))
  const snap = (v: number) => clamp(Math.round((v - min) / step) * step + min)

  const [shown, setShown] = useState(value)
  const drag = useRef<{ x: number; v: number; t: number; vel: number; last: number } | null>(null)
  const anim = useRef(0)
  useEffect(() => {
    if (!drag.current && !anim.current) setShown(value)
  }, [value])
  useEffect(() => () => cancelAnimationFrame(anim.current), [])

  const lastMajor = useRef(Math.round((value - min) / (tick * major)))
  const commit = (raw: number) => {
    const v = snap(raw)
    setShown(clamp(raw))
    // A light tick on the majors, where the hardware allows it (Android; iOS Safari ignores vibrate).
    const m = Math.round((v - min) / (tick * major))
    if (m !== lastMajor.current) {
      lastMajor.current = m
      navigator.vibrate?.(3)
    }
    if (v !== value) startTransition(() => onChange(Number(v.toFixed(6))))
  }

  const down = (e: PointerEvent<HTMLDivElement>) => {
    cancelAnimationFrame(anim.current)
    anim.current = 0
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, v: shown, t: e.timeStamp, vel: 0, last: e.clientX }
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const dt = Math.max(1, e.timeStamp - d.t)
    d.vel = 0.8 * ((e.clientX - d.last) / dt) + 0.2 * d.vel
    d.last = e.clientX
    d.t = e.timeStamp
    commit(d.v - (e.clientX - d.x) / perUnit)
  }
  const up = () => {
    const d = drag.current
    drag.current = null
    if (!d) return
    // Momentum: a flick keeps the ruler gliding and decays, then settles on a step.
    let vel = d.vel
    let cur = shown
    if (Math.abs(vel) < 0.25) return setShown(snap(cur))
    const frame = () => {
      vel *= 0.92
      cur = clamp(cur - (vel * 16) / perUnit)
      commit(cur)
      if (Math.abs(vel) > 0.02 && cur > min && cur < max) anim.current = requestAnimationFrame(frame)
      else {
        anim.current = 0
        setShown(snap(cur))
      }
    }
    anim.current = requestAnimationFrame(frame)
  }
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    const k = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -10, PageUp: 10 }[e.key]
    if (k) commit(value + k * step)
    else if (e.key === "Home") commit(min)
    else if (e.key === "End") commit(max)
    else return
    e.preventDefault()
  }

  const offset = (v: number) => (v - min) * perUnit
  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={format(value)}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onKeyDown={key}
      className="relative h-11 w-full cursor-grab touch-none overflow-hidden select-none outline-none active:cursor-grabbing focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring [mask-image:linear-gradient(to_right,transparent,black_22%,black_78%,transparent)]"
    >
      <div
        className="absolute inset-y-0 left-1/2 will-change-transform"
        style={{ width: ticks * gap + 1, transform: `translateX(${-offset(shown)}px)` }}
      >
        {/* Minor ticks, then majors drawn taller over them. */}
        <div
          className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2"
          style={{ background: `repeating-linear-gradient(to right, var(--muted-foreground) 0 1px, transparent 1px ${gap}px)`, opacity: 0.45 }}
        />
        <div
          className="absolute inset-x-0 top-1/2 h-5 -translate-y-1/2"
          style={{ background: `repeating-linear-gradient(to right, var(--foreground) 0 1px, transparent 1px ${gap * major}px)`, opacity: 0.55 }}
        />
        <span
          className="absolute top-1 size-1.5 -translate-x-1/2 rounded-full bg-foreground/70"
          style={{ left: offset(defaultValue) }}
          aria-hidden
        />
      </div>
      {/* The needle. */}
      <span className="pointer-events-none absolute inset-y-1 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-primary" aria-hidden />
    </div>
  )
}

/** The value arc around a parameter chip: from the default, toward the current value. */
export function ValueRing({ value, min, max, origin, className }: { value: number; min: number; max: number; origin: number; className?: string }) {
  const r = 22
  const C = 2 * Math.PI * r
  const span = max - min || 1
  // Signed share of the full circle, measured from 12 o'clock.
  const t = Math.max(-1, Math.min(1, (value - origin) / span))
  const len = Math.abs(t) * C
  return (
    <svg viewBox="0 0 48 48" className={cn("pointer-events-none absolute inset-0 size-full -rotate-90", className)} aria-hidden>
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${len} ${C}`}
        // Negative values sweep counter-clockwise.
        transform={t < 0 ? "scale(1,-1) translate(0,-48)" : undefined}
      />
    </svg>
  )
}
