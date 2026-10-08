// Native page: Bootstrap 5.3, CSS only (no JS bundle: nothing here needs it
// for static display). Built the Bootstrap way: navbar with a collapse that
// becomes a toggler below lg, container + row/col grid with gutter classes,
// stacked form groups (mb-3, form-label, form-text), server-side validation
// classes, alerts with alert-heading, a responsive table with text-bg badges.
// Dark mode is data-bs-theme on <html>, same as the probe harness.
import "bootstrap/dist/css/bootstrap.min.css"
import { mountNative } from "./kit"
import { ACTIONS, ALERTS, APP, FORM, ORDERS, PAGE, STATS, TABS, TEXT, type Status } from "./scene"

// Bootstrap's contextual variants: status maps to its theme colors of the same meaning.
const VARIANT: Record<Status, "success" | "info" | "warning" | "danger"> = {
  success: "success",
  info: "info",
  warning: "warning",
  danger: "danger",
}

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom">
      <div className="container">
        <a className="navbar-brand fw-semibold" href="#">
          {APP.product}
        </a>
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="main-nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="main-nav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {APP.nav.map((n) => (
              <li className="nav-item" key={n}>
                <a
                  className={`nav-link${n === APP.activeNav ? " active" : ""}`}
                  aria-current={n === APP.activeNav ? "page" : undefined}
                  href="#"
                >
                  {n}
                </a>
              </li>
            ))}
          </ul>
          <span className="navbar-text">{APP.user.name}</span>
        </div>
      </div>
    </nav>
  )
}

function SettingsForm() {
  return (
    <form className="card" onSubmit={(e) => e.preventDefault()} noValidate>
      <div className="card-header">
        <h2 className="h6 mb-0">General</h2>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            {FORM.name.label}
          </label>
          <input id="name" className="form-control" defaultValue={FORM.name.value} />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            {FORM.email.label}
          </label>
          <input
            id="email"
            type="email"
            className="form-control"
            placeholder={FORM.email.placeholder}
            aria-describedby="email-help"
          />
          <div id="email-help" className="form-text">
            {FORM.email.help}
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="code" className="form-label">
            {FORM.code.label}
          </label>
          {/* Server-side validation: .is-invalid shows the sibling .invalid-feedback without .was-validated. */}
          <input
            id="code"
            className="form-control is-invalid"
            defaultValue={FORM.code.value}
            aria-invalid="true"
            aria-describedby="code-feedback"
          />
          <div id="code-feedback" className="invalid-feedback">
            {FORM.code.error}
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="region" className="form-label">
            {FORM.region.label}
          </label>
          <select id="region" className="form-select" defaultValue={FORM.region.value}>
            {FORM.region.options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <div className="form-check form-switch">
            <input
              id="sync"
              className="form-check-input"
              type="checkbox"
              role="switch"
              defaultChecked={FORM.sync.checked}
              aria-describedby="sync-help"
            />
            <label className="form-check-label" htmlFor="sync">
              {FORM.sync.label}
            </label>
          </div>
          <div id="sync-help" className="form-text">
            {FORM.sync.help}
          </div>
        </div>
        <div className="form-check mb-3">
          <input id="summary" className="form-check-input" type="checkbox" defaultChecked={FORM.summary.checked} />
          <label className="form-check-label" htmlFor="summary">
            {FORM.summary.label}
          </label>
        </div>
        <fieldset>
          <legend className="col-form-label pt-0">{FORM.visibility.label}</legend>
          {FORM.visibility.options.map((o) => (
            <div className="form-check" key={o.value}>
              <input
                id={`vis-${o.value}`}
                className="form-check-input"
                type="radio"
                name="visibility"
                value={o.value}
                defaultChecked={o.value === FORM.visibility.value}
              />
              <label className="form-check-label" htmlFor={`vis-${o.value}`}>
                {o.label}
              </label>
            </div>
          ))}
        </fieldset>
      </div>
      {/* Footer actions follow the modal-footer convention: right-aligned, dismissive first, primary last. */}
      <div className="card-footer d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-link">
          {ACTIONS.ghost}
        </button>
        <button type="submit" className="btn btn-primary">
          {ACTIONS.primary}
        </button>
      </div>
    </form>
  )
}

function Page() {
  return (
    <>
      <Navbar />
      <main className="container py-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            {APP.breadcrumb.map((b, i) =>
              i === APP.breadcrumb.length - 1 ? (
                <li key={b} className="breadcrumb-item active" aria-current="page">
                  {b}
                </li>
              ) : (
                <li key={b} className="breadcrumb-item">
                  <a href="#">{b}</a>
                </li>
              ),
            )}
          </ol>
        </nav>
        <h1 className="h2">{PAGE.title}</h1>
        <p className="lead text-body-secondary mb-4">{PAGE.description}</p>

        <ul className="nav nav-tabs mb-4">
          {TABS.map((t, i) => (
            <li className="nav-item" key={t}>
              <a className={`nav-link${i === 0 ? " active" : ""}`} aria-current={i === 0 ? "page" : undefined} href="#">
                {t}
              </a>
            </li>
          ))}
        </ul>

        {/* No stat component in Bootstrap: cards in a row-cols grid are its nearest equivalent. */}
        <div className="row row-cols-1 row-cols-md-3 g-3 mb-4">
          {STATS.map((s) => (
            <div className="col" key={s.label}>
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-subtitle h6 text-body-secondary mb-2">{s.label}</h3>
                  <p className="card-title fs-3 fw-semibold mb-1">{s.value}</p>
                  <p className="card-text small text-body-secondary">{s.delta}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4 mb-4">
          <div className="col-lg-7">
            <SettingsForm />
          </div>
          <div className="col-lg-5">
            {ALERTS.map((a) => (
              <div key={a.status} className={`alert alert-${VARIANT[a.status]}`} role="alert">
                <h4 className="alert-heading h6">{a.title}</h4>
                <p className="mb-0">{a.body}</p>
              </div>
            ))}

            <h2 className="h5 mt-4 mb-3">Actions</h2>
            <div className="d-flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary">
                {ACTIONS.primary}
              </button>
              <button type="button" className="btn btn-secondary">
                {ACTIONS.secondary}
              </button>
              <button type="button" className="btn btn-outline-primary">
                {ACTIONS.tertiary}
              </button>
              <button type="button" className="btn btn-link">
                {ACTIONS.ghost}
              </button>
              <button type="button" className="btn btn-danger">
                {ACTIONS.danger}
              </button>
              <button type="button" className="btn btn-primary" disabled>
                {ACTIONS.disabled}
              </button>
            </div>

            <h2 className="h5 mt-4 mb-2">{TEXT.heading}</h2>
            <p className="mb-1">{TEXT.primary}</p>
            <p className="mb-1 text-body-secondary">{TEXT.secondary}</p>
            <p className="mb-2 text-body-tertiary">{TEXT.disabled}</p>
            <a href="#">{TEXT.link}</a>
          </div>
        </div>

        <h2 className="h5 mb-3">Purchase orders</h2>
        <div className="table-responsive">
          <table className="table table-hover align-middle text-nowrap">
            <caption>Open orders for this collection.</caption>
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Style</th>
                <th scope="col">Supplier</th>
                <th scope="col" className="text-end">
                  Units
                </th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((o) => (
                <tr key={o.po}>
                  <th scope="row">{o.po}</th>
                  <td>{o.style}</td>
                  <td>{o.supplier}</td>
                  <td className="text-end">{o.units}</td>
                  <td>
                    <span className={`badge text-bg-${VARIANT[o.status]}`}>{o.label}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}

mountNative("bootstrap", () => <Page />, {
  onMode: (m) => document.documentElement.setAttribute("data-bs-theme", m),
})
