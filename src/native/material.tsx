// Native page: Material 3 via @material/web. Built the M3 way: small top app
// bar on surface, window-size-class margins (16dp compact, 24dp medium and up),
// two panes at expanded width, outlined text fields with supporting text,
// settings switch as a list item, filled button for the one primary action at
// the trailing end, tabs for sections, a navigation bar for destinations.
//
// @material/web ships no app bar, alert, table, or breadcrumb. The app bar and
// the table are composed from M3 color roles and type scale, following the
// top-app-bar-small and data-table component tokens in the package. Status
// messages use the labs cards. There is no breadcrumb in M3; it's left out.
//
// @material/web doesn't ship a theme: components carry the light baseline as
// var() fallbacks, so a dark page needs the app to set --md-sys-color-* itself.
// The stock scheme here is read from the package's own token source (the
// v0.192 sys-color map and reference palette), light on :root, dark on .dark.
import "@material/web/button/filled-button.js"
import "@material/web/button/filled-tonal-button.js"
import "@material/web/button/outlined-button.js"
import "@material/web/button/text-button.js"
import "@material/web/checkbox/checkbox.js"
import "@material/web/divider/divider.js"
import "@material/web/icon/icon.js"
import "@material/web/iconbutton/icon-button.js"
import "@material/web/labs/card/filled-card.js"
import "@material/web/labs/card/outlined-card.js"
import "@material/web/labs/navigationbar/navigation-bar.js"
import "@material/web/labs/navigationtab/navigation-tab.js"
import "@material/web/list/list.js"
import "@material/web/list/list-item.js"
import "@material/web/radio/radio.js"
import "@material/web/select/outlined-select.js"
import "@material/web/select/select-option.js"
import "@material/web/switch/switch.js"
import "@material/web/tabs/primary-tab.js"
import "@material/web/tabs/tabs.js"
import "@material/web/textfield/outlined-text-field.js"
import { styles as typescale } from "@material/web/typography/md-typescale-styles.js"
import paletteSrc from "@material/web/tokens/versions/v0_192/_md-ref-palette.scss?raw"
import sysSrc from "@material/web/tokens/versions/v0_192/_md-sys-color.scss?raw"
import {
  IconAlertTriangle,
  IconBell,
  IconBuildingFactory2,
  IconChartBar,
  IconCircleCheck,
  IconCircleX,
  IconHanger,
  IconHome,
  IconInfoCircle,
  IconLayersSubtract,
  IconUserCircle,
} from "@tabler/icons-react"
import type { ReactNode } from "react"
import { mountNative } from "./kit"
import { ACTIONS, ALERTS, APP, FORM, ORDERS, PAGE, STATS, TABS, TEXT, type Status } from "./scene"

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      [tag: `md-${string}`]: import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, unknown>
    }
  }
}

// --- Stock scheme, from the package's token source --------------------------

function baseline() {
  const flat = (s: string) => s.replace(/\s+/g, " ")
  const palette = new Map(
    [...flat(paletteSrc).matchAll(/'([\w-]+)': if\(\$exclude-hardcoded-values, null, (#[0-9a-f]+)\)/gi)].map((m) => [m[1], m[2]]),
  )
  const scheme = (fn: string) => {
    const body = flat(sysSrc).split(`@function ${fn}`)[1]?.split("@function")[0] ?? ""
    return [...body.matchAll(/'([\w-]+)': map\.get\(\$deps, 'md-ref-palette', '([\w-]+)'\)/g)]
      .filter((m) => palette.has(m[2]))
      .map((m) => `--md-sys-color-${m[1]}:${palette.get(m[2])};`)
      .join("")
  }
  const style = document.createElement("style")
  style.id = "md-baseline"
  style.textContent = `:root{${scheme("values-light")}}:root.dark{${scheme("values-dark")}}`
  document.head.prepend(style)
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, typescale.styleSheet!]
}
baseline()

// Layout and the composed pieces. Every color is an M3 role.
const CSS = `
:root{--md-ref-typeface-brand:Roboto,system-ui,sans-serif;--md-ref-typeface-plain:Roboto,system-ui,sans-serif}
html,body{margin:0;background:var(--md-sys-color-surface);color:var(--md-sys-color-on-surface);font-family:var(--md-ref-typeface-plain)}
.app-bar{display:flex;align-items:center;gap:4px;height:64px;padding:0 4px 0 16px;background:var(--md-sys-color-surface);color:var(--md-sys-color-on-surface)}
.app-bar h1{flex:1;margin:0}
.app-bar md-icon-button{color:var(--md-sys-color-on-surface-variant)}
.body{display:flex;flex-direction:column;gap:24px;padding:8px 16px 24px}
.panes{display:grid;grid-template-columns:1fr;gap:24px}
.stats{display:grid;grid-template-columns:1fr;gap:12px}
.stack{display:flex;flex-direction:column}
.g8{gap:8px}.g12{gap:12px}.g16{gap:16px}.g24{gap:24px}
.card-body{padding:16px}
.row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}
.muted{color:var(--md-sys-color-on-surface-variant)}
.disabled-text{color:var(--md-sys-color-on-surface);opacity:.38}
label.choice{display:flex;align-items:center;gap:4px;color:var(--md-sys-color-on-surface)}
md-list{background:transparent;padding:0}
md-list-item{--md-list-item-leading-space:0;--md-list-item-trailing-space:0}
md-outlined-text-field,md-outlined-select{width:100%}
.danger{--md-filled-button-container-color:var(--md-sys-color-error);--md-filled-button-label-text-color:var(--md-sys-color-on-error);--md-filled-button-hover-label-text-color:var(--md-sys-color-on-error);--md-filled-button-focus-label-text-color:var(--md-sys-color-on-error);--md-filled-button-pressed-label-text-color:var(--md-sys-color-on-error);--md-filled-button-hover-state-layer-color:var(--md-sys-color-on-error);--md-filled-button-pressed-state-layer-color:var(--md-sys-color-on-error)}
.status{display:flex;gap:16px;align-items:flex-start;padding:16px}
md-icon>svg{fill:none}
.status md-icon{flex:none}
.status-danger{--md-filled-card-container-color:var(--md-sys-color-error-container);color:var(--md-sys-color-on-error-container)}
.status-danger .muted{color:var(--md-sys-color-on-error-container)}
.status-quiet{--md-filled-card-container-color:var(--md-sys-color-surface-container-high)}
.status-quiet md-icon{color:var(--md-sys-color-on-surface-variant)}
.table-wrap{overflow-x:auto;border:1px solid var(--md-sys-color-outline-variant);border-radius:4px;background:var(--md-sys-color-surface)}
table{border-collapse:collapse;width:100%;min-width:560px}
th{height:56px;padding:0 16px;text-align:left;color:var(--md-sys-color-on-surface-variant);border-bottom:1px solid var(--md-sys-color-outline-variant)}
td{height:52px;padding:0 16px;white-space:nowrap;color:var(--md-sys-color-on-surface);border-bottom:1px solid var(--md-sys-color-outline-variant)}
tr:last-child td{border-bottom:0}
.num{text-align:right}
.cell-status{display:flex;align-items:center;gap:8px}
.cell-status md-icon{--md-icon-size:18px;color:var(--md-sys-color-on-surface-variant)}
.cell-status.danger-text,.cell-status.danger-text md-icon{color:var(--md-sys-color-error)}
a.link{color:var(--md-sys-color-primary);text-underline-offset:2px}
md-tabs{background:transparent}
md-navigation-bar{position:static}
@media (min-width:600px){.body{padding:8px 24px 24px}.app-bar{padding:0 12px 0 24px}.stats{grid-template-columns:repeat(3,1fr)}}
@media (min-width:840px){.panes{grid-template-columns:1fr 1fr}}
`

// --- Pieces -------------------------------------------------------------------

const Icon = ({ children, slot }: { children: ReactNode; slot?: string }) => <md-icon slot={slot}>{children}</md-icon>
const svg = { size: 24, stroke: 1.75 }

const STATUS_ICON: Record<Status, ReactNode> = {
  success: <IconCircleCheck {...svg} />,
  info: <IconInfoCircle {...svg} />,
  warning: <IconAlertTriangle {...svg} />,
  danger: <IconCircleX {...svg} />,
}

const NAV_ICON = [IconHome, IconHanger, IconLayersSubtract, IconBuildingFactory2, IconChartBar]

function AppBar() {
  return (
    <header className="app-bar">
      <h1 className="md-typescale-title-large">{APP.product}</h1>
      <md-icon-button aria-label="Notifications">
        <Icon>
          <IconBell {...svg} />
        </Icon>
      </md-icon-button>
      <md-icon-button aria-label={APP.user.name}>
        <Icon>
          <IconUserCircle {...svg} />
        </Icon>
      </md-icon-button>
    </header>
  )
}

function Settings() {
  return (
    <md-outlined-card>
      <div className="card-body stack g24">
        <h2 className="md-typescale-title-large" style={{ margin: 0 }}>
          General
        </h2>
        <md-outlined-text-field label={FORM.name.label} value={FORM.name.value} />
        <md-outlined-text-field
          label={FORM.email.label}
          type="email"
          placeholder={FORM.email.placeholder}
          supporting-text={FORM.email.help}
        />
        <md-outlined-text-field label={FORM.code.label} value={FORM.code.value} error={true} error-text={FORM.code.error} />
        <md-outlined-select label={FORM.region.label}>
          {FORM.region.options.map((o) => (
            <md-select-option key={o} value={o} selected={o === FORM.region.value}>
              <div slot="headline">{o}</div>
            </md-select-option>
          ))}
        </md-outlined-select>
        <md-list>
          <md-list-item>
            <div slot="headline">{FORM.sync.label}</div>
            <div slot="supporting-text">{FORM.sync.help}</div>
            <md-switch slot="end" selected={FORM.sync.checked} aria-label={FORM.sync.label} />
          </md-list-item>
        </md-list>
        <label className="choice md-typescale-body-large">
          <md-checkbox touch-target="wrapper" checked={FORM.summary.checked} />
          {FORM.summary.label}
        </label>
        <div role="radiogroup" aria-labelledby="vis-label" className="stack g8">
          <span id="vis-label" className="md-typescale-title-small muted">
            {FORM.visibility.label}
          </span>
          {FORM.visibility.options.map((o) => (
            <label key={o.value} className="choice md-typescale-body-large">
              <md-radio touch-target="wrapper" name="visibility" value={o.value} checked={o.value === FORM.visibility.value} />
              {o.label}
            </label>
          ))}
        </div>
        {/* M3: actions sit at the trailing edge, the filled button last. */}
        <div className="actions">
          <md-text-button>{ACTIONS.ghost}</md-text-button>
          <md-filled-button>{ACTIONS.primary}</md-filled-button>
        </div>
      </div>
    </md-outlined-card>
  )
}

function Alerts() {
  return (
    <div className="stack g12">
      {ALERTS.map((a) => (
        <md-filled-card key={a.status} role={a.status === "danger" ? "alert" : "status"} class={a.status === "danger" ? "status-danger" : "status-quiet"}>
          <div className="status">
            <Icon>{STATUS_ICON[a.status]}</Icon>
            <div className="stack" style={{ gap: 4 }}>
              <span className="md-typescale-title-small">{a.title}</span>
              <span className="md-typescale-body-medium muted">{a.body}</span>
            </div>
          </div>
        </md-filled-card>
      ))}
    </div>
  )
}

function Actions() {
  return (
    <section className="stack g16">
      <h2 className="md-typescale-title-large" style={{ margin: 0 }}>
        Actions
      </h2>
      {/* Emphasis order: filled, tonal, outlined, text. Danger is a filled button pointed at the error role. */}
      <div className="row">
        <md-filled-button>{ACTIONS.primary}</md-filled-button>
        <md-filled-tonal-button>{ACTIONS.secondary}</md-filled-tonal-button>
        <md-outlined-button>{ACTIONS.tertiary}</md-outlined-button>
        <md-text-button>{ACTIONS.ghost}</md-text-button>
        <md-filled-button class="danger">{ACTIONS.danger}</md-filled-button>
        <md-filled-button disabled={true}>{ACTIONS.disabled}</md-filled-button>
      </div>
    </section>
  )
}

function TextEmphasis() {
  return (
    <section className="stack g8">
      <h2 className="md-typescale-title-large" style={{ margin: 0 }}>
        {TEXT.heading}
      </h2>
      <span className="md-typescale-body-large">{TEXT.primary}</span>
      <span className="md-typescale-body-large muted">{TEXT.secondary}</span>
      <span className="md-typescale-body-large disabled-text">{TEXT.disabled}</span>
      <a href="#" className="link md-typescale-body-large">
        {TEXT.link}
      </a>
    </section>
  )
}

function Orders() {
  return (
    <section className="stack g16">
      <div className="stack" style={{ gap: 4 }}>
        <h2 className="md-typescale-title-large" style={{ margin: 0 }}>
          Purchase orders
        </h2>
        <span className="md-typescale-body-medium muted">Open orders for this collection.</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr className="md-typescale-title-small">
              <th>Order</th>
              <th>Style</th>
              <th>Supplier</th>
              <th className="num">Units</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="md-typescale-body-medium">
            {ORDERS.map((o) => (
              <tr key={o.po}>
                <td>{o.po}</td>
                <td>{o.style}</td>
                <td>{o.supplier}</td>
                <td className="num">{o.units}</td>
                <td>
                  <span className={`cell-status${o.status === "danger" ? " danger-text" : ""}`}>
                    <Icon>{STATUS_ICON[o.status]}</Icon>
                    {o.label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Page() {
  return (
    <>
      <style>{CSS}</style>
      <AppBar />
      <main className="body">
        <div className="stack g8">
          <h1 className="md-typescale-headline-medium" style={{ margin: 0 }}>
            {PAGE.title}
          </h1>
          <p className="md-typescale-body-large muted" style={{ margin: 0 }}>
            {PAGE.description}
          </p>
        </div>
        <div className="stack">
          <md-tabs aria-label="Settings sections">
            {TABS.map((t, i) => (
              <md-primary-tab key={t} active={i === 0}>
                {t}
              </md-primary-tab>
            ))}
          </md-tabs>
        </div>
        <div className="stats">
          {STATS.map((s) => (
            <md-outlined-card key={s.label}>
              <div className="card-body stack" style={{ gap: 4 }}>
                <span className="md-typescale-label-large muted">{s.label}</span>
                <span className="md-typescale-headline-medium">{s.value}</span>
                <span className="md-typescale-body-small muted">{s.delta}</span>
              </div>
            </md-outlined-card>
          ))}
        </div>
        <div className="panes">
          <Settings />
          <div className="stack g24">
            <Alerts />
            <md-divider />
            <Actions />
            <md-divider />
            <TextEmphasis />
          </div>
        </div>
        <Orders />
      </main>
      {/* Destinations: M3's navigation bar. @material/web has no inline rail or standard drawer for wider windows. */}
      <md-navigation-bar active-index={APP.nav.indexOf(APP.activeNav)} aria-label={APP.product}>
        {APP.nav.map((n, i) => {
          const I = NAV_ICON[i]
          return (
            <md-navigation-tab key={n} label={n}>
              <Icon slot="active-icon">
                <I {...svg} />
              </Icon>
              <Icon slot="inactive-icon">
                <I {...svg} />
              </Icon>
            </md-navigation-tab>
          )
        })}
      </md-navigation-bar>
    </>
  )
}

mountNative("material", () => <Page />, {
  onMode: (m) => {
    document.documentElement.classList.toggle("dark", m === "dark")
    document.documentElement.classList.toggle("light", m === "light")
  },
})
