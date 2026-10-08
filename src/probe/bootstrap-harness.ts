// Probe harness: Bootstrap 5.3, CSS only. Dark mode is data-bs-theme on <html>.
import "bootstrap/dist/css/bootstrap.min.css"
import { plain } from "./kit"

const set = (w: string) => `
<div class="d-flex flex-column gap-3">
  <div class="d-flex flex-wrap gap-2">
    <button class="btn btn-primary" data-probe="button-primary@${w}">Button</button>
    <button class="btn btn-secondary" data-probe="button-secondary@${w}">Button</button>
    <button class="btn btn-outline-primary" data-probe="button-outline@${w}">Button</button>
    <button class="btn btn-link" data-probe="button-ghost@${w}">Button</button>
    <button class="btn btn-danger" data-probe="button-danger@${w}">Button</button>
  </div>
  <input class="form-control" placeholder="Placeholder" data-probe="input@${w}" />
  <div class="d-flex gap-3 align-items-center">
    <input class="form-check-input" type="checkbox" data-probe="checkbox@${w}" />
    <input class="form-check-input" type="checkbox" checked data-probe="checkbox-checked@${w}" />
    <div class="form-check form-switch"><input class="form-check-input" type="checkbox" role="switch" data-probe="switch@${w}" /></div>
    <div class="form-check form-switch"><input class="form-check-input" type="checkbox" role="switch" checked data-probe="switch-checked@${w}" /></div>
    <span class="badge text-bg-primary" data-probe="badge@${w}">Badge</span>
    <span class="badge text-bg-secondary" data-probe="badge-secondary@${w}">Badge</span>
  </div>
  <ul class="nav nav-tabs" data-probe="tabs@${w}">
    <li class="nav-item"><a class="nav-link active" href="#">Active</a></li>
    <li class="nav-item"><a class="nav-link" href="#" data-probe="tab-inactive@${w}">Inactive</a></li>
  </ul>
  <p class="mb-0" data-probe="text@${w}">Text</p>
  <p class="mb-0 text-body-secondary" data-probe="text-muted@${w}">Muted</p>
  <a href="#" data-probe="link@${w}">Link</a>
  <hr class="my-1" data-probe="divider@${w}" />
  <div class="alert alert-danger mb-0" data-probe="alert-danger@${w}">Alert</div>
  <div class="alert alert-primary mb-0" data-probe="alert-info@${w}">Alert</div>
</div>`

document.getElementById("root")!.innerHTML = `
<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:24px">
  ${set("page")}
  <div class="card" data-probe="card@page"><div class="card-body">${set("card")}</div></div>
</div>`
plain((m) => document.documentElement.setAttribute("data-bs-theme", m))
