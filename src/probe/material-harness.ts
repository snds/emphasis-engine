// Probe harness: stock Material Web components (Lit, shadow DOM).
import "@material/web/all.js"

const set = (where: string) => `
  <div style="display:flex;flex-direction:column;gap:12px">
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <md-filled-button data-probe="button-filled@${where}">Button</md-filled-button>
      <md-filled-tonal-button data-probe="button-tonal@${where}">Button</md-filled-tonal-button>
      <md-outlined-button data-probe="button-outlined@${where}">Button</md-outlined-button>
      <md-text-button data-probe="button-text@${where}">Button</md-text-button>
    </div>
    <md-outlined-text-field label="Label" data-probe="textfield@${where}"></md-outlined-text-field>
    <md-filled-text-field label="Label" data-probe="textfield-filled@${where}"></md-filled-text-field>
    <div style="display:flex;gap:8px">
      <md-fab variant="primary" label="FAB" data-probe="fab-primary@${where}"></md-fab>
      <md-fab variant="secondary" label="FAB" data-probe="fab-secondary@${where}"></md-fab>
      <md-fab variant="tertiary" label="FAB" data-probe="fab-tertiary@${where}"></md-fab>
      <md-assist-chip label="Chip" data-probe="chip@${where}"></md-assist-chip>
    </div>
    <div style="display:flex;gap:12px;align-items:center">
      <md-checkbox data-probe="checkbox@${where}"></md-checkbox>
      <md-checkbox checked data-probe="checkbox-checked@${where}"></md-checkbox>
      <md-switch data-probe="switch@${where}"></md-switch>
      <md-switch selected data-probe="switch-checked@${where}"></md-switch>
    </div>
    <md-divider data-probe="divider@${where}"></md-divider>
    <md-list><md-list-item data-probe="list-item@${where}" type="button">Item</md-list-item></md-list>
    <div style="color:var(--md-sys-color-on-surface)" data-probe="text@${where}">Text</div>
    <div style="color:var(--md-sys-color-on-surface-variant)" data-probe="text-muted@${where}">Muted</div>
  </div>`

document.getElementById("root")!.innerHTML = `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:24px;background:var(--md-sys-color-surface);font-family:sans-serif" data-surface="page">
    ${set("page")}
    <div style="background:var(--md-sys-color-surface-container-low);border-radius:12px;padding:16px" data-probe="card@page">${set("card")}</div>
  </div>`
