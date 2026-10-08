import { hex, type RGB } from "@/engine/color"
import type { ElementKind } from "@/engine/intent"
import { profileFor, solveOutput } from "@/engine/outputs"
import { fmt, parseCss, render, type Paint, type Recipe } from "@/engine/profile"
import { PROFILES } from "@/engine/profiles"
import type { Mode } from "@/engine/settings"
import type { System } from "@/engine/system"

const GROUPS: { kind: ElementKind; label: string }[] = [
  { kind: "surface", label: "Surfaces" },
  { kind: "solid", label: "Solid fills" },
  { kind: "text-primary", label: "Primary text" },
  { kind: "text-secondary", label: "Secondary text" },
  { kind: "text-on-tint", label: "Text on tints" },
  { kind: "on-solid", label: "Labels on solids" },
  { kind: "border-control", label: "Control borders" },
  { kind: "border-decorative", label: "Separators" },
  { kind: "focus", label: "Focus" },
  { kind: "state", label: "States and tints" },
]

const isText = (r: Recipe) => r.metric === "lc"
// Labels end with the painted property: "Button outline border (hover)".
const isEdge = (r: Recipe) => / (border|ring|inset-ring|outline)( \(|$)/.test(r.label) || r.element.startsWith("border") || r.element === "focus"

function Tile({ r, fg, bg }: { r: Recipe; fg: RGB; bg: RGB }) {
  return (
    <span className="flex h-9 w-20 items-center justify-center rounded-md border" style={{ background: hex(bg) }}>
      {isText(r) ? (
        <span className="text-sm font-medium" style={{ color: hex(fg) }}>
          Aa
        </span>
      ) : isEdge(r) ? (
        <span className="h-5 w-12 rounded-sm" style={{ boxShadow: `inset 0 0 0 2px ${hex(fg)}` }} />
      ) : (
        <span className="h-5 w-12 rounded-sm" style={{ background: hex(fg) }} />
      )}
    </span>
  )
}

/**
 * For systems this app doesn't ship components for: every pair the system's
 * components paint, drawn twice, with its stock theme and with your colors,
 * from the probe's own recipes.
 */
export function RecipeBoard({ sys, mode, id }: { sys: System; mode: Mode; id: string }) {
  const p = PROFILES[id]
  const imported = !!sys.settings.imports?.[id]
  const ref = profileFor(sys, id).reference[mode]
  const stock: Record<string, Paint> = Object.fromEntries(Object.entries(ref).map(([k, v]) => [k, parseCss(v)]))
  const solved = solveOutput(sys, id, mode)
  const byId = new Map(solved.outcomes.map((o) => [o.recipe.id, o]))
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold">{p.label}</h2>
        <p className="text-sm text-muted-foreground">
          {p.description} Every pair below is one the real components paint, found by the probe
          {p.generated ? ` (${p.generated.source}, ${p.generated.probedAt})` : ""}: {imported ? "your imported theme" : "stock"} on the left, your colors solved
          through the same pair on the right.
        </p>
      </div>
      {GROUPS.map(({ kind, label }) => {
        const list = solved.outcomes.filter((o) => o.recipe.element === kind)
        const seen = new Set<string>()
        const rows = list.filter((o) => (seen.has(o.recipe.label) ? false : (seen.add(o.recipe.label), true))).slice(0, 12)
        if (!rows.length) return null
        return (
          <section key={kind} className="flex flex-col gap-2">
            <h3 className="text-xs font-medium text-muted-foreground">{label}</h3>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-x-3 gap-y-1.5 text-sm">
              {rows.map((o) => {
                const r = o.recipe
                let st: { fg: RGB; bg: RGB } | null = null
                try {
                  st = render(r, stock)
                } catch {
                  st = null
                }
                const out = byId.get(r.id)!
                return (
                  <div key={r.id} className="contents">
                    <span className="truncate" title={r.source}>
                      {r.label}
                    </span>
                    {st ? <Tile r={r} fg={st.fg} bg={st.bg} /> : <span className="w-20" />}
                    <Tile r={r} fg={out.fg} bg={out.bg} />
                    <span className="w-20 text-right text-xs text-muted-foreground tabular-nums">{fmt(r.metric, out.achieved)}</span>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
