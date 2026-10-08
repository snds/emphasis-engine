// Native page: daisyUI 5 on Tailwind 4. Built the daisyUI way: component
// classes (navbar, menu, breadcrumbs, tabs, stats, card, fieldset, validator,
// alert, table, badge) composed with Tailwind utilities for layout and spacing.
// Themes switch with data-theme on <html>, same as the probe harness.
import "./daisyui.css"
import { mountNative } from "./kit"
import { ACTIONS, ALERTS, APP, FORM, ORDERS, PAGE, STATS, TABS, TEXT, type Status } from "./scene"

// daisyUI's status colors: success, info, warning, error.
const COLOR: Record<Status, { alert: string; badge: string }> = {
  success: { alert: "alert-success", badge: "badge-success" },
  info: { alert: "alert-info", badge: "badge-info" },
  warning: { alert: "alert-warning", badge: "badge-warning" },
  danger: { alert: "alert-error", badge: "badge-error" },
}

// The icons daisyUI's alert examples use (Heroicons outline), drawn in currentColor.
const ICON: Record<Status, string> = {
  success: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  info: "m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z",
  warning:
    "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z",
  danger: "m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
}

function Icon({ d }: { d: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 shrink-0" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

function Navbar() {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        {/* daisyUI's responsive navbar: a dropdown menu below lg, a horizontal menu above. */}
        <div className="dropdown lg:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-square" aria-label="Open navigation">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow">
            {APP.nav.map((n) => (
              <li key={n}>
                <a className={n === APP.activeNav ? "menu-active" : undefined}>{n}</a>
              </li>
            ))}
          </ul>
        </div>
        <a className="btn btn-ghost text-xl">{APP.product}</a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {APP.nav.map((n) => (
            <li key={n}>
              <a className={n === APP.activeNav ? "menu-active" : undefined} aria-current={n === APP.activeNav ? "page" : undefined}>
                {n}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="navbar-end">
        <div className="avatar avatar-placeholder" title={APP.user.name}>
          <div className="bg-neutral text-neutral-content w-10 rounded-full">
            <span>{APP.user.initials}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsCard() {
  return (
    <form className="card card-border bg-base-100" onSubmit={(e) => e.preventDefault()} noValidate>
      <div className="card-body">
        <h2 className="card-title">General</h2>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">{FORM.name.label}</legend>
          <input className="input w-full" defaultValue={FORM.name.value} />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">{FORM.email.label}</legend>
          <input type="email" className="input w-full" placeholder={FORM.email.placeholder} />
          <p className="label">{FORM.email.help}</p>
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">{FORM.code.label}</legend>
          {/* validator reacts to :user-invalid or aria-invalid; aria-invalid shows the error state without interaction. */}
          <input className="input validator w-full" defaultValue={FORM.code.value} aria-invalid="true" />
          <p className="validator-hint mt-0">{FORM.code.error}</p>
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">{FORM.region.label}</legend>
          <select className="select w-full" defaultValue={FORM.region.value}>
            {FORM.region.options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Updates</legend>
          <label className="label text-base-content">
            <input type="checkbox" className="toggle toggle-primary" defaultChecked={FORM.sync.checked} />
            {FORM.sync.label}
          </label>
          <p className="label whitespace-normal">{FORM.sync.help}</p>
          <label className="label text-base-content mt-2">
            <input type="checkbox" className="checkbox checkbox-primary" defaultChecked={FORM.summary.checked} />
            {FORM.summary.label}
          </label>
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">{FORM.visibility.label}</legend>
          {FORM.visibility.options.map((o) => (
            <label key={o.value} className="label text-base-content">
              <input type="radio" name="visibility" className="radio radio-primary" value={o.value} defaultChecked={o.value === FORM.visibility.value} />
              {o.label}
            </label>
          ))}
        </fieldset>
        {/* card-actions: right-aligned, the primary action last. */}
        <div className="card-actions justify-end mt-2">
          <button type="button" className="btn btn-ghost">
            {ACTIONS.ghost}
          </button>
          <button type="submit" className="btn btn-primary">
            {ACTIONS.primary}
          </button>
        </div>
      </div>
    </form>
  )
}

function Page() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 p-4 lg:p-8">
        <div>
          <div className="breadcrumbs text-sm">
            <ul>
              {APP.breadcrumb.map((b, i) => (
                <li key={b}>{i === APP.breadcrumb.length - 1 ? <span aria-current="page">{b}</span> : <a>{b}</a>}</li>
              ))}
            </ul>
          </div>
          <h1 className="text-3xl font-bold">{PAGE.title}</h1>
          <p className="text-base-content/70 mt-2">{PAGE.description}</p>
        </div>

        <div role="tablist" className="tabs tabs-border overflow-x-auto flex-nowrap">
          {TABS.map((t, i) => (
            <a key={t} role="tab" aria-selected={i === 0} className={`tab whitespace-nowrap${i === 0 ? " tab-active" : ""}`}>
              {t}
            </a>
          ))}
        </div>

        <div className="stats stats-vertical md:stats-horizontal bg-base-100 border border-base-300 w-full">
          {STATS.map((s) => (
            <div key={s.label} className="stat">
              <div className="stat-title">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-desc">{s.delta}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SettingsCard />
          </div>
          <div className="space-y-6 lg:col-span-5">
            <div className="space-y-3">
              {ALERTS.map((a) => (
                <div key={a.status} role="alert" className={`alert ${COLOR[a.status].alert}`}>
                  <Icon d={ICON[a.status]} />
                  <div>
                    <h3 className="font-bold">{a.title}</h3>
                    <div className="text-sm">{a.body}</div>
                  </div>
                </div>
              ))}
            </div>

            <section>
              <h2 className="text-lg font-semibold mb-3">Actions</h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-primary">
                  {ACTIONS.primary}
                </button>
                <button type="button" className="btn btn-secondary">
                  {ACTIONS.secondary}
                </button>
                <button type="button" className="btn btn-outline btn-primary">
                  {ACTIONS.tertiary}
                </button>
                <button type="button" className="btn btn-ghost">
                  {ACTIONS.ghost}
                </button>
                <button type="button" className="btn btn-error">
                  {ACTIONS.danger}
                </button>
                <button type="button" className="btn btn-primary btn-disabled" tabIndex={-1} aria-disabled="true">
                  {ACTIONS.disabled}
                </button>
              </div>
            </section>

            <section className="space-y-1">
              <h2 className="text-lg font-semibold mb-2">{TEXT.heading}</h2>
              <p>{TEXT.primary}</p>
              <p className="text-base-content/70">{TEXT.secondary}</p>
              <p className="text-base-content/40">{TEXT.disabled}</p>
              <a className="link link-primary">{TEXT.link}</a>
            </section>
          </div>
        </div>

        <section className="card card-border bg-base-100">
          <div className="card-body px-0 pb-2">
            <div className="px-6">
              <h2 className="card-title">Purchase orders</h2>
              <p className="text-sm text-base-content/70">Open orders for this collection.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="table whitespace-nowrap">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Style</th>
                    <th>Supplier</th>
                    <th className="text-right">Units</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ORDERS.map((o) => (
                    <tr key={o.po} className="hover:bg-base-200">
                      <th>{o.po}</th>
                      <td>{o.style}</td>
                      <td>{o.supplier}</td>
                      <td className="text-right">{o.units}</td>
                      <td>
                        <span className={`badge badge-sm ${COLOR[o.status].badge}`}>{o.label}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

mountNative("daisyui", () => <Page />, {
  onMode: (m) => document.documentElement.setAttribute("data-theme", m),
})
