import { IconAlertTriangleFilled, IconCheck } from "@tabler/icons-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { hex } from "@/engine/color"
import { fmt, type Outcome } from "@/engine/profile"
import { solveOutput } from "@/engine/outputs"
import type { Mode } from "@/engine/settings"
import type { System } from "@/engine/system"

const SOURCE_LABEL = { reference: "stock", engine: "engine", accessibility: "forced" } as const

function Pair({ o }: { o: Outcome }) {
  return (
    <span className="relative inline-flex h-5 w-9 shrink-0 items-center justify-center rounded-sm border" style={{ background: hex(o.bg) }}>
      <span className="size-2.5 rounded-[2px]" style={{ background: hex(o.fg) }} />
    </span>
  )
}

/** Every shadcn recipe as rendered: what it paints, on what, the target, and the result. */
export function ShadcnTable({ sys, mode }: { sys: System; mode: Mode }) {
  const res = solveOutput(sys, sys.settings.output, mode)
  const unmet = res.outcomes.filter((o) => !o.recipe.check && !o.met).length
  const under = res.outcomes.filter((o) => o.spec && !o.spec.pass).length
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold">{res.profile.label} recipes, {mode} mode</h3>
        <p className="text-sm text-muted-foreground">
          Each row is a pair {res.profile.label}'s components render, with the system's own opacities and mixes applied. The variables are solved so every row meets its target.{" "}
          {unmet === 0 ? "All targets met." : `${unmet} can't be met with one value per variable; shown in red.`}{" "}
          {under > 0 && `${under} sit under an accessibility floor; Force accessibility lifts them.`}
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pair</TableHead>
              <TableHead>Recipe</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Rendered</TableHead>
              <TableHead>Accessibility</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {res.outcomes.map((o) => (
              <TableRow key={o.recipe.id}>
                <TableCell>
                  <span className="flex items-center gap-2">
                    <Pair o={o} />
                    <span>{o.recipe.label}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <code className="font-mono text-[11px] text-muted-foreground">{o.recipe.source}</code>
                </TableCell>
                <TableCell className="text-xs tabular-nums text-muted-foreground">
                  {o.recipe.check
                    ? "reported only"
                    : o.checks.map((c) => `${fmt(c.req.metric, c.req.min)} (${SOURCE_LABEL[c.req.source]})`).join(" + ")}
                </TableCell>
                <TableCell className="tabular-nums">
                  <span className={!o.recipe.check && !o.met ? "font-semibold text-destructive" : ""}>
                    {(o.checks.length ? o.checks : [{ req: { metric: o.recipe.metric }, achieved: o.achieved }])
                      .map((c) => fmt(c.req.metric, c.achieved))
                      .filter((v, i, all) => all.indexOf(v) === i)
                      .join(" · ")}
                    {o.capped && <span className="text-muted-foreground"> max</span>}
                  </span>
                </TableCell>
                <TableCell>
                  {o.spec ? (
                    <span className="flex items-center gap-1.5 text-xs">
                      {o.spec.pass ? (
                        <IconCheck className="size-3.5 text-muted-foreground" aria-label="Meets floor" />
                      ) : (
                        <IconAlertTriangleFilled className="size-3.5" style={{ color: "var(--destructive)" }} aria-label="Under floor" />
                      )}
                      <span className={o.spec.pass ? "text-muted-foreground" : ""}>
                        {fmt(o.spec.metric, o.spec.achieved)} · needs {o.spec.rule}
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">n/a</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
