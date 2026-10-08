import { IconAlertTriangleFilled, IconCheck } from "@tabler/icons-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { hex } from "@/engine/color"
import { buildTier, type TierVar } from "@/engine/shadcn"
import type { Mode } from "@/engine/settings"
import type { System } from "@/engine/system"

const ORDER = [
  "--background", "--card", "--muted", "--secondary", "--sidebar",
  "--foreground", "--muted-foreground", "--primary", "--primary-foreground", "--destructive",
  "--border", "--input", "--ring",
]

const measured = (v: TierVar) => (v.parent ? `Lc ${Math.round(v.lc)} · ΔL ${v.dL.toFixed(3)}` : "")

/** The shadcn component tier: each variable's job, its measured result, and any spec it misses. */
export function ShadcnTable({ sys, mode }: { sys: System; mode: Mode }) {
  const tier = buildTier(sys, mode)
  const misses = ORDER.filter((n) => tier[n].spec && !tier[n].spec!.pass).length
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold">shadcn tokens, {mode} mode</h3>
        <p className="text-sm text-muted-foreground">
          Each variable solved for its own job and measured on the surface it sits on.{" "}
          {misses === 0 ? "Every spec check passes." : `${misses} sit under spec for parity with stock shadcn; Force accessibility lifts them.`}
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variable</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>On</TableHead>
              <TableHead>Measured</TableHead>
              <TableHead>Spec</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ORDER.map((n) => {
              const v = tier[n]
              return (
                <TableRow key={n}>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <span className="size-3.5 rounded-sm border" style={{ background: hex(v.rgb) }} />
                      <code className="font-mono text-xs">{n}</code>
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{v.target}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{v.parent ?? ""}</TableCell>
                  <TableCell className="tabular-nums">{measured(v)}</TableCell>
                  <TableCell>
                    {v.spec ? (
                      <span className="flex items-center gap-1.5 text-xs">
                        {v.spec.pass ? (
                          <IconCheck className="size-3.5 text-muted-foreground" aria-label="Meets spec" />
                        ) : (
                          <IconAlertTriangleFilled className="size-3.5" style={{ color: "var(--destructive)" }} aria-label="Under spec" />
                        )}
                        <span className={v.spec.pass ? "text-muted-foreground" : ""}>
                          {v.spec.achieved} · needs {v.spec.rule}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">n/a</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
