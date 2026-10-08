import { useState } from "react"
import { IconAlertTriangleFilled, IconCheck } from "@tabler/icons-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { hex } from "@/engine/color"
import { CONTEXTS, LEVELS, LEVEL_NAMES, ROLES, type Context, type Mode, type RoleId } from "@/engine/settings"
import { active, tokenId, type System } from "@/engine/system"

function Sample({ context, css, onFill }: { context: Context; css: string; onFill?: string }) {
  if (context === "text") return <span className="text-2xl font-semibold leading-none" style={{ color: css }}>Aa</span>
  if (context === "fill")
    return (
      <span className="flex h-8 w-full items-center justify-center rounded-md text-xs font-medium" style={{ background: css, color: onFill }}>
        {onFill ? "Label" : ""}
      </span>
    )
  if (context === "stroke")
    return (
      <span className="flex h-8 w-full items-center justify-center gap-2">
        <span className="size-7 rounded-md border-2" style={{ borderColor: css }} />
        <span className="h-0.5 flex-1 rounded-full" style={{ background: css }} />
      </span>
    )
  return <span className="h-8 w-full rounded-md" style={{ background: css }} />
}

export function GridView({ sys, mode }: { sys: System; mode: Mode }) {
  const [role, setRole] = useState<RoleId>("brand")
  const ms = sys.modes[mode]
  const layer = sys.settings.layer
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Emphasis grid</h2>
          <p className="text-sm text-muted-foreground">
            Each cell is solved against the page background in {mode} mode, {layer === "alpha" ? "as live alpha ink" : "as flat color"}.
          </p>
        </div>
        <ToggleGroup aria-label="Role" variant="outline" size="sm" spacing={0} value={[role]} onValueChange={(v) => v[0] && setRole(v[0] as RoleId)}>
          {ROLES.map((r) => (
            <ToggleGroupItem key={r} value={r} className="capitalize">
              {r}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="overflow-x-auto rounded-lg border" style={{ background: hex(ms.bg) }}>
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="w-28 p-3 font-medium">Context</th>
              {LEVELS.map((l) => (
                <th key={l} className="p-3 font-medium">
                  {l} <span className="font-normal capitalize text-muted-foreground">{LEVEL_NAMES[l]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CONTEXTS.map((ctx) => (
              <tr key={ctx} className="border-b last:border-0">
                <th scope="row" className="p-3 text-left align-top font-medium capitalize">
                  {ctx}
                </th>
                {LEVELS.map((lvl) => {
                  const t = ms.tokens[tokenId(role, ctx, lvl)]
                  const a = active(t, layer)
                  const on = ms.onFill[t.id]
                  const isLc = t.target.kind === "lc"
                  return (
                    <td key={lvl} className="p-3 align-top">
                      <div className="flex flex-col gap-2">
                        <Sample context={ctx} css={a.css} onFill={on?.css} />
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-semibold tabular-nums">
                            {isLc ? a.achieved.toFixed(0) : a.achieved.toFixed(3)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            of {isLc ? `Lc ${t.target.value}` : `ΔL ${t.target.value.toFixed(3)}`}
                          </span>
                          {a.met ? (
                            <IconCheck className="ml-auto size-4 text-muted-foreground" aria-label="Target met" />
                          ) : (
                            <IconAlertTriangleFilled className="ml-auto size-4" aria-label="Below target" style={{ color: "var(--destructive)" }} />
                          )}
                        </div>
                        <span className="truncate font-mono text-[11px] text-muted-foreground" title={a.css}>
                          {a.css}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {a.method}
                          {on ? ` · label Lc ${Math.abs(on.lc).toFixed(0)}` : ""}
                        </span>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold">Chart series</h3>
          <p className="mb-3 text-sm text-muted-foreground">
            Closest neighbors are ΔE {ms.categorical.minNeighborDeltaE.toFixed(3)} apart. Every series clears Lc 30.
          </p>
          <div className="flex flex-wrap gap-2">
            {ms.categorical.colors.map((c, i) => (
              <div key={i} className="flex w-16 flex-col gap-1">
                <span className="h-10 rounded-md" style={{ background: c.css }} />
                <span className="text-xs tabular-nums">Lc {Math.abs(c.lc).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold">Status vs. chart trend</h3>
          <p className="mb-3 text-sm text-muted-foreground">Same hue family, different job. Trend colors run quieter.</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {(
              [
                ["Error", tokenId("danger", "fill", 4), "Trend down", "down"],
                ["Success", tokenId("success", "fill", 4), "Trend up", "up"],
                ["Warning", tokenId("warning", "fill", 4), "Trend warning", "warn"],
              ] as const
            ).map(([a, id, b, k]) => (
              <div key={id} className="contents">
                <div className="flex items-center gap-2">
                  <span className="size-6 rounded-md" style={{ background: active(ms.tokens[id], layer).css }} />
                  {a}
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-6 rounded-md" style={{ background: ms.trend[k].css }} />
                  {b}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
