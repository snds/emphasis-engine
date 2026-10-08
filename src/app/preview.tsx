import type { CSSProperties, ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IconAlertOctagonFilled, IconAlertTriangleFilled, IconArrowDownRight, IconArrowUpRight, IconCircleCheckFilled, IconInfoCircleFilled } from "@tabler/icons-react"
import { BUTTON_ROLES, VARIANTS, buildButton, overlayImage, type ButtonSpec } from "@/engine/components"
import { active, tokenId, type System } from "@/engine/system"
import type { Mode, RoleId } from "@/engine/settings"

type Ctx = { sys: System; mode: Mode }
const tk = ({ sys, mode }: Ctx, role: RoleId, ctx: "text" | "fill" | "stroke" | "surface", lvl: 1 | 2 | 3 | 4 | 5) =>
  active(sys.modes[mode].tokens[tokenId(role, ctx, lvl)], sys.settings.layer).css

/** A button painted straight from the component tokens, every state live. */
function EngineButton({ spec, children, disabled }: { spec: ButtonSpec; children: ReactNode; disabled?: boolean }) {
  const st = disabled ? spec.disabled : spec.rest
  const style = {
    "--b-bg": st.bg,
    "--b-fg": st.fg,
    "--b-bd": st.border ?? "transparent",
    "--b-ov": overlayImage(st.overlay) ?? "none",
    "--b-bg-h": spec.hover.bg,
    "--b-fg-h": spec.hover.fg,
    "--b-ov-h": overlayImage(spec.hover.overlay) ?? "none",
    "--b-bg-p": spec.pressed.bg,
    "--b-fg-p": spec.pressed.fg,
    "--b-ov-p": overlayImage(spec.pressed.overlay) ?? "none",
  } as CSSProperties
  return (
    <button
      type="button"
      disabled={disabled}
      style={style}
      className="inline-flex h-8 items-center justify-center rounded-md border border-(--b-bd) bg-(--b-bg) [background-image:var(--b-ov)] px-3 text-sm font-medium whitespace-nowrap text-(--b-fg) outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed enabled:hover:bg-(--b-bg-h) enabled:hover:[background-image:var(--b-ov-h)] enabled:hover:text-(--b-fg-h) enabled:active:bg-(--b-bg-p) enabled:active:[background-image:var(--b-ov-p)] enabled:active:text-(--b-fg-p)"
    >
      {children}
    </button>
  )
}

const ROLE_ACTIONS: Record<string, string> = { brand: "Save changes", neutral: "Duplicate", danger: "Delete" }

function ActionsCard(c: Ctx) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Actions</CardTitle>
        <CardDescription>Role × variant, painted from component tokens. Hover and press to see the state strategy.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="font-normal">Role</th>
              {VARIANTS.map((v) => (
                <th key={v} className="font-normal capitalize">
                  {v}
                </th>
              ))}
              <th className="font-normal">Disabled</th>
            </tr>
          </thead>
          <tbody>
            {BUTTON_ROLES.map((role) => (
              <tr key={role}>
                <td className="pr-3 capitalize text-muted-foreground">{role}</td>
                {VARIANTS.map((v) => (
                  <td key={v} className="pr-2">
                    <EngineButton spec={buildButton(c.sys, c.mode, role, v)}>{ROLE_ACTIONS[role]}</EngineButton>
                  </td>
                ))}
                <td>
                  <EngineButton spec={buildButton(c.sys, c.mode, role, "primary")} disabled>
                    {ROLE_ACTIONS[role]}
                  </EngineButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

function FormCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace settings</CardTitle>
        <CardDescription>Stock shadcn components, reading the exported tokens.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ws-name">Workspace name</Label>
          <Input id="ws-name" defaultValue="Spring 2027 collection" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ws-email">Notification email</Label>
          <Input id="ws-email" placeholder="team@example.com" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="ws-sync">Sync supplier updates</Label>
          <Switch id="ws-sync" defaultChecked />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="ws-terms" defaultChecked />
          <Label htmlFor="ws-terms" className="font-normal">
            Email me a weekly summary
          </Label>
        </div>
        <div className="flex gap-2">
          <Button>Save changes</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}

const STATUS = [
  { role: "success" as const, icon: IconCircleCheckFilled, title: "Samples approved", body: "All six colorways passed lab dip review." },
  { role: "info" as const, icon: IconInfoCircleFilled, title: "New supplier added", body: "Mill 14 can now receive tech packs." },
  { role: "caution" as const, icon: IconAlertTriangleFilled, title: "Costing pending", body: "Two styles are missing trim prices." },
  { role: "danger" as const, icon: IconAlertOctagonFilled, title: "Sync failed", body: "The ERP export stopped at line 212. Retry or contact support." },
]

function StatusCard(c: Ctx) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status</CardTitle>
        <CardDescription>Soft recipe: surface 3, stroke 2, text 5. Status hues follow convention, not brand.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {STATUS.map(({ role, icon: Icon, title, body }) => (
          <div
            key={role}
            role="status"
            className="flex gap-2.5 rounded-md border p-3"
            style={{ background: tk(c, role, "surface", 3), borderColor: tk(c, role, "stroke", 2) }}
          >
            <Icon className="mt-0.5 size-4 shrink-0" style={{ color: tk(c, role, "stroke", 4) }} />
            <div>
              <p className="text-sm font-medium" style={{ color: tk(c, role, "text", 5) }}>
                {title}
              </p>
              <p className="text-sm" style={{ color: tk(c, "neutral", "text", 4) }}>
                {body}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

const ORDERS = [
  { po: "PO-4471", supplier: "Coastline Knits", units: "1,200", status: "success" as const, label: "Shipped" },
  { po: "PO-4472", supplier: "Atelier Nord", units: "640", status: "caution" as const, label: "Delayed" },
  { po: "PO-4473", supplier: "Monsoon Weaving", units: "2,050", status: "info" as const, label: "In production" },
  { po: "PO-4474", supplier: "Ridge Denim", units: "380", status: "danger" as const, label: "Rejected" },
]

function OrdersCard(c: Ctx) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase orders</CardTitle>
        <CardDescription>Row hover uses the muted surface; badges use the status soft recipe.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Units</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ORDERS.map((o) => (
              <TableRow key={o.po}>
                <TableCell className="font-medium">{o.po}</TableCell>
                <TableCell>{o.supplier}</TableCell>
                <TableCell className="text-right tabular-nums">{o.units}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    style={{
                      background: tk(c, o.status, "surface", 3),
                      color: tk(c, o.status, "text", 5),
                      borderColor: tk(c, o.status, "stroke", 1),
                    }}
                  >
                    {o.label}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
const SERIES = [
  [42, 48, 51, 55, 61, 66],
  [30, 33, 31, 36, 40, 39],
  [18, 22, 25, 24, 28, 33],
  [12, 11, 15, 17, 16, 20],
]

function ChartCard(c: Ctx) {
  const ms = c.sys.modes[c.mode]
  const colors = ms.categorical.colors
  const max = 70
  return (
    <Card>
      <CardHeader>
        <CardTitle>Units by category</CardTitle>
        <CardDescription>Categorical series from the spectrum walk, pulled gently toward the brand.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <svg viewBox="0 0 320 150" role="img" aria-label="Grouped bars, four categories over six months" className="w-full">
          {[0, 35, 70].map((v) => (
            <line key={v} x1="24" x2="316" y1={130 - (v / max) * 120} y2={130 - (v / max) * 120} stroke="var(--border)" />
          ))}
          {MONTHS.map((m, i) => (
            <g key={m}>
              {SERIES.map((s, j) => (
                <rect
                  key={j}
                  x={30 + i * 48 + j * 9}
                  y={130 - (s[i] / max) * 120}
                  width="8"
                  height={(s[i] / max) * 120}
                  rx="1.5"
                  fill={colors[j % colors.length].css}
                />
              ))}
              <text x={30 + i * 48 + 18} y="145" textAnchor="middle" fontSize="9" fill="var(--muted-foreground)">
                {m}
              </text>
            </g>
          ))}
        </svg>
        <div className="flex flex-wrap gap-1.5">
          {colors.map((col, i) => (
            <span key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="size-2.5 rounded-sm" style={{ background: col.css }} />
              {i + 1}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md border p-2.5">
            <p className="text-xs text-muted-foreground">Chart trend</p>
            <p className="flex items-center gap-1 font-medium" style={{ color: ms.trend.down.css }}>
              <IconArrowDownRight className="size-4" /> Returns −4.2%
            </p>
            <p className="flex items-center gap-1 font-medium" style={{ color: ms.trend.up.css }}>
              <IconArrowUpRight className="size-4" /> Sell-through +8.1%
            </p>
          </div>
          <div className="rounded-md border p-2.5">
            <p className="text-xs text-muted-foreground">UI status</p>
            <p className="font-medium" style={{ color: tk(c, "danger", "text", 4) }}>
              Export failed
            </p>
            <p className="font-medium" style={{ color: tk(c, "success", "text", 4) }}>
              Export complete
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TypeCard(c: Ctx) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Text emphasis</CardTitle>
        <CardDescription>Neutral text at levels 5 to 2, plus brand link text.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-lg font-semibold" style={{ color: tk(c, "neutral", "text", 5) }}>
          Tech pack review
        </p>
        <p className="text-sm" style={{ color: tk(c, "neutral", "text", 4) }}>
          Body copy sits at high emphasis so long reading stays easy on both modes.
        </p>
        <p className="text-sm" style={{ color: tk(c, "neutral", "text", 3) }}>
          Supporting text drops to medium.
        </p>
        <p className="text-xs" style={{ color: tk(c, "neutral", "text", 2) }}>
          Captions and timestamps use low emphasis, updated 2 hours ago.
        </p>
        <a href="#preview" className="text-sm underline underline-offset-2" style={{ color: tk(c, "brand", "text", 4) }}>
          Open the measurement chart
        </a>
      </CardContent>
    </Card>
  )
}

function SurfacesCard(c: Ctx) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Surfaces</CardTitle>
        <CardDescription>Neutral surface levels 1 to 5, spaced by lightness difference.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1.5">
          {([1, 2, 3, 4, 5] as const).map((l) => (
            <div key={l} className="flex h-9 items-center justify-between rounded-md px-3 text-sm" style={{ background: tk(c, "neutral", "surface", l) }}>
              <span>Level {l}</span>
              <span className="font-mono text-xs text-muted-foreground">{tk(c, "neutral", "surface", l)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TranslucencyCard(c: Ctx) {
  const ms = c.sys.modes[c.mode]
  const bar = tk(c, "neutral", "surface", 3)
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Scroll-behind test</CardTitle>
        <CardDescription>
          {c.sys.settings.layer === "alpha"
            ? "Alpha is on: the toolbar and chips are live ink. Scroll the strip and watch content pass through."
            : "Switch the layer to Alpha to make the toolbar translucent. In Flat it stays solid."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-40 overflow-hidden rounded-md border">
          <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 border-b px-3 py-2" style={{ background: bar, borderColor: tk(c, "neutral", "stroke", 1) }}>
            <span className="text-sm font-medium">Line sheet</span>
            <span className="rounded-sm px-1.5 py-0.5 text-xs" style={{ background: tk(c, "brand", "surface", 4), color: tk(c, "brand", "text", 5) }}>
              12 styles
            </span>
            <span className="ml-auto text-xs" style={{ color: tk(c, "neutral", "text", 3) }}>
              Updated today
            </span>
          </div>
          <div className="h-full overflow-y-auto pt-11">
            <div className="grid grid-cols-6 gap-2 p-3">
              {Array.from({ length: 36 }, (_, i) => (
                <div key={i} className="aspect-square rounded-sm" style={{ background: ms.categorical.colors[i % ms.categorical.colors.length].css }} />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Preview({ sys, mode }: Ctx) {
  const c = { sys, mode }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ActionsCard {...c} />
      <FormCard />
      <StatusCard {...c} />
      <OrdersCard {...c} />
      <ChartCard {...c} />
      <TypeCard {...c} />
      <SurfacesCard {...c} />
      <TranslucencyCard {...c} />
    </div>
  )
}
