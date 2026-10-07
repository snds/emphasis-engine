import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BUTTON_ROLES, STATES, VARIANTS, buildButton } from "@/engine/components"
import { wcagRatio } from "@/engine/contrast"
import { advancedOverrides, type Mode } from "@/engine/settings"
import { active, type System } from "@/engine/system"

export function ReportView({ sys }: { sys: System }) {
  const layer = sys.settings.layer
  const below = (["light", "dark"] as Mode[]).flatMap((mode) =>
    Object.values(sys.modes[mode].tokens)
      .map((t) => ({ t, a: active(t, layer), mode }))
      .filter(({ a }) => !a.met)
  )
  const overrides = advancedOverrides(sys.settings)
  const states = (["light", "dark"] as Mode[]).flatMap((mode) =>
    BUTTON_ROLES.flatMap((role) =>
      VARIANTS.map((variant) => ({ mode, role, variant, spec: buildButton(sys, mode, role, variant) }))
    )
  )
  const stateIssues = states.filter(
    ({ spec }) => !spec.rest.labelMet || !spec.hover.labelMet || !spec.pressed.labelMet || !spec.hover.deltaMet
  )

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">Contrast report</h2>
        <p className="text-sm text-muted-foreground">
          {below.length === 0
            ? `All ${Object.keys(sys.modes.light.tokens).length * 2} semantic tokens land their targets in both modes.`
            : `${below.length} token${below.length === 1 ? "" : "s"} fall below target. Each is listed with the best value reachable.`}{" "}
          {stateIssues.length === 0 ? "Every button label and state step passes." : `${stateIssues.length} button checks need attention.`}
        </p>
      </section>

      {below.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Best reachable</TableHead>
              <TableHead>WCAG 2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {below.map(({ t, a, mode }) => (
              <TableRow key={mode + t.id}>
                <TableCell className="font-mono text-xs">{t.id}</TableCell>
                <TableCell className="capitalize">{mode}</TableCell>
                <TableCell>{t.target.kind === "lc" ? `Lc ${t.target.value}` : `ΔL ${t.target.value.toFixed(3)}`}</TableCell>
                <TableCell className="tabular-nums">{a.achieved.toFixed(t.target.kind === "lc" ? 1 : 3)}</TableCell>
                <TableCell className="tabular-nums">{wcagRatio(a.rgb, t.surface).toFixed(2)}:1</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Button states</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Button</TableHead>
              <TableHead>Mode</TableHead>
              {STATES.slice(0, 3).map((s) => (
                <TableHead key={s} className="capitalize">
                  {s} label
                </TableHead>
              ))}
              <TableHead>Hover step</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {states.map(({ mode, role, variant, spec }) => (
              <TableRow key={mode + role + variant}>
                <TableCell className="capitalize">
                  {role} {variant}
                </TableCell>
                <TableCell className="capitalize">{mode}</TableCell>
                {(["rest", "hover", "pressed"] as const).map((s) => (
                  <TableCell key={s} className="tabular-nums">
                    <span className={spec[s].labelMet ? "" : "font-semibold text-destructive"}>Lc {spec[s].labelLc.toFixed(0)}</span>
                  </TableCell>
                ))}
                <TableCell className="tabular-nums">
                  <span className={spec.hover.deltaMet ? "" : "font-semibold text-destructive"}>ΔL {spec.hover.delta?.toFixed(3)}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground">
          Labels pass at Lc 60. State steps are measured in OKLCH lightness, because APCA reads differences this small as 0.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Decisions and overrides</h3>
        {overrides.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {overrides.map((o) => (
              <Badge key={o} variant="secondary">
                {o}
              </Badge>
            ))}
          </div>
        )}
        <ul className="flex flex-col gap-2 text-sm">
          {sys.log
            .filter((e) => e.force !== "solver")
            .map((e, i) => (
              <li key={i} className="rounded-md border p-3">
                <span className="font-medium capitalize">{e.force}</span>
                {e.mode ? <span className="text-muted-foreground"> · {e.mode}</span> : null}
                <p className="text-muted-foreground">{e.message}</p>
              </li>
            ))}
          {sys.log.filter((e) => e.force !== "solver").length === 0 && overrides.length === 0 && (
            <li className="text-muted-foreground">No forces collided and no overrides are active.</li>
          )}
        </ul>
      </section>
    </div>
  )
}
