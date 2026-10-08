// Probe harness: daisyUI 5, prebuilt CSS. Themes switch with data-theme on <html>.
import "daisyui/daisyui.css"
import { plain } from "./kit"

const set = (w: string) => `
<div style="display:flex;flex-direction:column;gap:12px">
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <button class="btn btn-primary" data-probe="button-primary@${w}">Button</button>
    <button class="btn btn-secondary" data-probe="button-secondary@${w}">Button</button>
    <button class="btn btn-outline btn-primary" data-probe="button-outline@${w}">Button</button>
    <button class="btn btn-ghost" data-probe="button-ghost@${w}">Button</button>
    <button class="btn btn-error" data-probe="button-danger@${w}">Button</button>
    <button class="btn" data-probe="button-neutral@${w}">Button</button>
  </div>
  <input class="input" placeholder="Placeholder" data-probe="input@${w}" />
  <div style="display:flex;gap:12px;align-items:center">
    <input type="checkbox" class="checkbox" data-probe="checkbox@${w}" />
    <input type="checkbox" class="checkbox checkbox-primary" checked data-probe="checkbox-checked@${w}" />
    <input type="checkbox" class="toggle" data-probe="switch@${w}" />
    <input type="checkbox" class="toggle toggle-primary" checked data-probe="switch-checked@${w}" />
    <span class="badge badge-primary" data-probe="badge@${w}">Badge</span>
    <span class="badge" data-probe="badge-neutral@${w}">Badge</span>
  </div>
  <div role="tablist" class="tabs tabs-border" data-probe="tabs@${w}">
    <a role="tab" class="tab tab-active">Active</a>
    <a role="tab" class="tab" data-probe="tab-inactive@${w}">Inactive</a>
  </div>
  <p data-probe="text@${w}">Text</p>
  <p class="text-base-content/60" style="color:color-mix(in oklab, var(--color-base-content) 60%, transparent)" data-probe="text-muted@${w}">Muted</p>
  <a class="link link-primary" data-probe="link@${w}">Link</a>
  <div class="divider" data-probe="divider@${w}"></div>
  <div role="alert" class="alert alert-error" data-probe="alert-danger@${w}">Alert</div>
  <div role="alert" class="alert alert-info" data-probe="alert-info@${w}">Alert</div>
</div>`

document.getElementById("root")!.innerHTML = `
<div class="bg-base-100" style="display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:24px;min-height:100vh;background:var(--color-base-100)">
  ${set("page")}
  <div class="card bg-base-200" style="background:var(--color-base-200)" data-probe="card@page"><div class="card-body">${set("card")}</div></div>
</div>`
plain((m) => document.documentElement.setAttribute("data-theme", m))
