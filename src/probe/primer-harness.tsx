// Probe harness: GitHub Primer (React) on Primer Primitives CSS variables.
import "@primer/primitives/dist/css/functional/themes/light.css"
import "@primer/primitives/dist/css/functional/themes/dark.css"
import "@primer/primitives/dist/css/primitives.css"
import { BaseStyles, Button, Checkbox, Flash, Label, Link, ThemeProvider, TextInput, ToggleSwitch, UnderlineNav } from "@primer/react"
import { col, grid, mount, p, row } from "./kit"

function Set({ w }: { w: string }) {
  const n = p(w)
  return (
    <div style={col}>
      <div style={row}>
        <Button variant="primary" {...n("button-primary")}>Button</Button>
        <Button variant="default" {...n("button-secondary")}>Button</Button>
        <Button variant="invisible" {...n("button-ghost")}>Button</Button>
        <Button variant="danger" {...n("button-danger")}>Button</Button>
      </div>
      <TextInput placeholder="Placeholder" aria-label="Input" {...n("input")} />
      <div style={row}>
        <Checkbox aria-label="c" {...n("checkbox")} />
        <Checkbox aria-label="c" defaultChecked {...n("checkbox-checked")} />
        <ToggleSwitch aria-labelledby="x" size="small" {...n("switch")} />
        <ToggleSwitch aria-labelledby="x" size="small" defaultChecked {...n("switch-checked")} />
        <Label variant="accent" {...n("badge")}>Label</Label>
        <Label {...n("badge-neutral")}>Label</Label>
      </div>
      <UnderlineNav aria-label="Tabs" {...n("tabs")}>
        <UnderlineNav.Item aria-current="page">Active</UnderlineNav.Item>
        <UnderlineNav.Item {...n("tab-inactive")}>Inactive</UnderlineNav.Item>
      </UnderlineNav>
      <p style={{ color: "var(--fgColor-default)", margin: 0 }} {...n("text")}>Text</p>
      <p style={{ color: "var(--fgColor-muted)", margin: 0 }} {...n("text-muted")}>Muted</p>
      <Link href="#" {...n("link")}>Link</Link>
      <hr style={{ border: 0, borderTop: "1px solid var(--borderColor-muted)", width: "100%" }} {...n("divider")} />
      <Flash variant="danger" {...n("alert-danger")}>Alert</Flash>
      <Flash {...n("alert-info")}>Alert</Flash>
    </div>
  )
}

mount(
  (m) => (
    <ThemeProvider colorMode={m === "dark" ? "night" : "day"}>
      <BaseStyles>
        <div style={{ ...grid, background: "var(--bgColor-default)", minHeight: "100vh" }}>
          <Set w="page" />
          <div style={{ background: "var(--bgColor-muted)", border: "1px solid var(--borderColor-default)", borderRadius: 6, padding: 16 }} {...p("page")("card")}>
            <Set w="card" />
          </div>
        </div>
      </BaseStyles>
    </ThemeProvider>
  ),
  {
    onMode: (m) => {
      const h = document.documentElement
      h.setAttribute("data-color-mode", m)
      h.setAttribute("data-light-theme", "light")
      h.setAttribute("data-dark-theme", "dark")
    },
    scopes: () => [document.documentElement, ...Array.from(document.querySelectorAll("[data-color-mode]"))],
  },
)
