// Probe harness: Coinbase Design System (web). Theme colors are CSS variables
// the ThemeProvider writes inline on its element.
import { Button } from "@coinbase/cds-web/buttons"
import { Checkbox, Switch, TextInput } from "@coinbase/cds-web/controls"
import { Tag } from "@coinbase/cds-web/tag"
import { Divider } from "@coinbase/cds-web/layout"
import { Link, Text } from "@coinbase/cds-web/typography"
import { ThemeProvider } from "@coinbase/cds-web/system"
import { defaultTheme } from "@coinbase/cds-web/themes/defaultTheme"
import { col, grid, mount, p, row } from "./kit"

function Set({ w }: { w: string }) {
  const n = p(w)
  return (
    <div style={col}>
      <div style={row}>
        <Button variant="primary" {...n("button-primary")}>Button</Button>
        <Button variant="secondary" {...n("button-secondary")}>Button</Button>
        <Button variant="tertiary" {...n("button-outline")}>Button</Button>
        <Button variant="secondary" transparent {...n("button-ghost")}>Button</Button>
        <Button variant="negative" {...n("button-danger")}>Button</Button>
      </div>
      <div {...n("input")}><TextInput label="Label" placeholder="Placeholder" /></div>
      <div style={row}>
        <div {...n("checkbox")}><Checkbox>Check</Checkbox></div>
        <div {...n("checkbox-checked")}><Checkbox checked onChange={() => {}}>Check</Checkbox></div>
        <div {...n("switch")}><Switch>Toggle</Switch></div>
        <div {...n("switch-checked")}><Switch checked onChange={() => {}}>Toggle</Switch></div>
        <div {...n("badge")}><Tag intent="informational">Tag</Tag></div>
      </div>
      <Text font="body" {...n("text")}>Text</Text>
      <Text font="body" color="fgMuted" {...n("text-muted")}>Muted</Text>
      <Link href="#" {...n("link")}>Link</Link>
      <div {...n("divider")}><Divider /></div>
      <div style={{ background: "var(--color-bgNegativeWash)", color: "var(--color-fgNegative)", padding: 8, borderRadius: 8 }} {...n("alert-danger")}>Alert</div>
    </div>
  )
}

mount(
  (m) => (
    <ThemeProvider theme={defaultTheme} activeColorScheme={m}>
      <div style={{ ...grid, background: "var(--color-bg)", minHeight: "100vh" }}>
        <Set w="page" />
        <div style={{ background: "var(--color-bgAlternate)", borderRadius: 16, padding: 16 }} {...p("page")("card")}>
          <Set w="card" />
        </div>
      </div>
    </ThemeProvider>
  ),
  { scopes: () => Array.from(document.querySelectorAll(`.${defaultTheme.id}`)) },
)
