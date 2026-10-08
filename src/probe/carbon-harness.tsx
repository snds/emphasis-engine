// Probe harness: IBM Carbon (React). Themes are zone classes; white for light, g100 for dark.
import "@carbon/styles/css/styles.css"
import { Button, Checkbox, InlineNotification, Link, Tab, TabList, Tabs, Tag, TextInput, Tile, Toggle } from "@carbon/react"
import { col, grid, mount, p, row } from "./kit"

function Set({ w }: { w: string }) {
  const n = p(w)
  return (
    <div style={col}>
      <div style={row}>
        <Button kind="primary" {...n("button-primary")}>Button</Button>
        <Button kind="secondary" {...n("button-secondary")}>Button</Button>
        <Button kind="tertiary" {...n("button-outline")}>Button</Button>
        <Button kind="ghost" {...n("button-ghost")}>Button</Button>
        <Button kind="danger" {...n("button-danger")}>Button</Button>
      </div>
      <TextInput id={`ti-${w}`} labelText="Label" placeholder="Placeholder" {...n("input")} />
      <div style={row}>
        <Checkbox id={`cb-${w}`} labelText="Check" {...n("checkbox")} />
        <Checkbox id={`cbc-${w}`} labelText="Check" defaultChecked {...n("checkbox-checked")} />
        <Toggle id={`tg-${w}`} labelText="" hideLabel {...n("switch")} />
        <Toggle id={`tgc-${w}`} labelText="" hideLabel defaultToggled {...n("switch-checked")} />
        <Tag type="blue" {...n("badge")}>Tag</Tag>
        <Tag type="gray" {...n("badge-neutral")}>Tag</Tag>
      </div>
      <Tabs>
        <TabList aria-label="Tabs" {...n("tabs")}>
          <Tab>Active</Tab>
          <Tab {...n("tab-inactive")}>Inactive</Tab>
        </TabList>
      </Tabs>
      <p style={{ color: "var(--cds-text-primary)" }} {...n("text")}>Text</p>
      <p style={{ color: "var(--cds-text-secondary)" }} {...n("text-muted")}>Muted</p>
      <Link href="#" {...n("link")}>Link</Link>
      <hr style={{ border: 0, borderTop: "1px solid var(--cds-border-subtle-01)", width: "100%" }} {...n("divider")} />
      <InlineNotification kind="error" title="Alert" subtitle="Detail" hideCloseButton lowContrast {...n("alert-danger")} />
      <InlineNotification kind="info" title="Alert" subtitle="Detail" hideCloseButton lowContrast {...n("alert-info")} />
    </div>
  )
}

mount(
  () => (
    <div style={{ ...grid, background: "var(--cds-background)", minHeight: "100vh" }}>
      <Set w="page" />
      <Tile {...p("page")("card")}>
        <Set w="card" />
      </Tile>
    </div>
  ),
  { onMode: (m) => { document.documentElement.className = m === "dark" ? "cds--g100" : "cds--white" } },
)
