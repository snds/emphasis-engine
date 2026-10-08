import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { hex } from "@/engine/color"
import { LEVEL_NAMES, ROLES, type Level, type Mode, type RoleId } from "@/engine/settings"
import { tokenId, type System } from "@/engine/system"

const ROWS: { ctx: "text" | "stroke" | "fill"; levels: Level[] }[] = [
  { ctx: "text", levels: [1, 2, 3, 4, 5] },
  { ctx: "stroke", levels: [1, 2, 3, 4, 5] },
  { ctx: "fill", levels: [1, 2, 3] },
]

/** Every ink level's real result on every guard surface, per mode. */
export function SurfaceMatrix({ sys, mode }: { sys: System; mode: Mode }) {
  const [role, setRole] = useState<RoleId>("neutral")
  const ms = sys.modes[mode]
  const guards = ms.guards
  let total = 0
  let capped = 0
  let failed = 0
  for (const r of ROLES)
    for (const { ctx, levels } of ROWS)
      for (const l of levels)
        for (const c of ms.tokens[tokenId(r, ctx, l)].ink?.checks ?? []) {
          total++
          if (!c.met) failed++
          else if (c.capped) capped++
        }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Surface check, {mode} mode</h3>
          <p className="text-sm text-muted-foreground">
            {failed === 0
              ? `All ${total} ink checks pass across ${guards.length} surfaces.`
              : `${failed} of ${total} ink checks fall short.`}
            {capped > 0 && ` ${capped} sit at the surface's ceiling: full-strength ink, and nothing could reach higher there.`}
          </p>
        </div>
        <ToggleGroup
          aria-label="Role"
          variant="outline"
          size="sm"
          spacing={0}
          value={[role]}
          onValueChange={(v) => v[0] && setRole(v[0] as RoleId)}
        >
          {ROLES.map((r) => (
            <ToggleGroupItem key={r} value={r} className="text-xs capitalize">
              {r}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ink</TableHead>
              <TableHead>Alpha</TableHead>
              <TableHead>Target</TableHead>
              {guards.map((g) => (
                <TableHead key={g.label}>
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded-sm border" style={{ background: hex(g.rgb) }} />
                    {g.label}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.flatMap(({ ctx, levels }) =>
              levels.map((l) => {
                const t = ms.tokens[tokenId(role, ctx, l)]
                const ink = t.ink
                if (!ink) return null
                const isLc = t.target.kind === "lc"
                return (
                  <TableRow key={ctx + l}>
                    <TableCell className="capitalize">
                      {ctx} {l} <span className="text-muted-foreground">{LEVEL_NAMES[l]}</span>
                    </TableCell>
                    <TableCell className="tabular-nums">{Math.round(ink.alpha * 100)}%</TableCell>
                    <TableCell className="tabular-nums">
                      {isLc ? `Lc ${Math.round(t.target.value)}` : `ΔL ${t.target.value.toFixed(3)}`}
                    </TableCell>
                    {ink.checks.map((c) => (
                      <TableCell key={c.label} className="tabular-nums">
                        <span className="flex items-center gap-1.5">
                          <span className="size-3 rounded-sm" style={{ background: hex(c.visible) }} />
                          <span className={!c.met ? "font-semibold text-destructive" : c.capped ? "text-muted-foreground" : ""}>
                            {isLc ? Math.round(c.achieved) : c.achieved.toFixed(3)}
                            {c.capped && c.met ? " max" : ""}
                          </span>
                        </span>
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
            <TableRow>
              <TableCell>Hover overlay</TableCell>
              <TableCell className="tabular-nums">{Math.round(ms.overlay.hover.alpha * 100)}%</TableCell>
              <TableCell className="tabular-nums">ΔL {sys.settings.stateDelta.toFixed(3)}</TableCell>
              {guards.map((g) => {
                const c = ms.overlay.hover.checks.find((x) => x.label === g.label)
                return (
                  <TableCell key={g.label} className="tabular-nums text-muted-foreground">
                    {c ? c.achieved.toFixed(3) : "n/a"}
                  </TableCell>
                )
              })}
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        Each cell is the ink composited over that surface. "max" means the target is beyond what any ink reaches on that surface; the
        ink is at full strength there. Soft fills are checked on page, card, and muted; the hover overlay on the base surfaces.
      </p>
    </section>
  )
}
