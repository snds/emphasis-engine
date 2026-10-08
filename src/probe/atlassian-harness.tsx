// Probe harness: Atlassian Design System. Tokens load through setGlobalTheme onto <html>.
import Button from "@atlaskit/button/new"
import Checkbox from "@atlaskit/checkbox"
import Textfield from "@atlaskit/textfield"
import Toggle from "@atlaskit/toggle"
import { setGlobalTheme } from "@atlaskit/tokens/dist/esm/set-global-theme"
import { col, grid, mount, p, row } from "./kit"

function Set({ w }: { w: string }) {
  const n = p(w)
  return (
    <div style={col}>
      <div style={row}>
        <span {...n("button-primary")} style={{ display: "contents" }}><Button appearance="primary">Button</Button></span>
        <span {...n("button-secondary")} style={{ display: "contents" }}><Button appearance="default">Button</Button></span>
        <span {...n("button-ghost")} style={{ display: "contents" }}><Button appearance="subtle">Button</Button></span>
        <span {...n("button-danger")} style={{ display: "contents" }}><Button appearance="danger">Button</Button></span>
        <span {...n("button-warning")} style={{ display: "contents" }}><Button appearance="warning">Button</Button></span>
      </div>
      <div {...n("input")}><Textfield placeholder="Placeholder" aria-label="Input" /></div>
      <div style={row}>
        <div {...n("checkbox")}><Checkbox label="Check" /></div>
        <div {...n("checkbox-checked")}><Checkbox label="Check" defaultChecked /></div>
        <div {...n("switch")}><Toggle label="t" /></div>
        <div {...n("switch-checked")}><Toggle label="t" defaultChecked /></div>
        <span style={{ background: "var(--ds-background-information)", color: "var(--ds-text-information)", padding: "0 4px", borderRadius: 3 }} {...n("badge")}>Lozenge</span>
      </div>
      <p style={{ color: "var(--ds-text)", margin: 0 }} {...n("text")}>Text</p>
      <p style={{ color: "var(--ds-text-subtle)", margin: 0 }} {...n("text-muted")}>Muted</p>
      <a href="#" style={{ color: "var(--ds-link)" }} {...n("link")}>Link</a>
      <hr style={{ border: 0, borderTop: "1px solid var(--ds-border)", width: "100%" }} {...n("divider")} />
      <div style={{ background: "var(--ds-background-danger)", color: "var(--ds-text-danger)", padding: 8, borderRadius: 3 }} {...n("alert-danger")}>Alert</div>
    </div>
  )
}

mount(
  () => (
    <div style={{ ...grid, background: "var(--ds-surface)", minHeight: "100vh" }}>
      <Set w="page" />
      <div style={{ background: "var(--ds-surface-raised)", boxShadow: "var(--ds-shadow-raised)", borderRadius: 3, padding: 16 }} {...p("page")("card")}>
        <Set w="card" />
      </div>
    </div>
  ),
  { onMode: async (m) => { await setGlobalTheme({ colorMode: m }) } },
)
