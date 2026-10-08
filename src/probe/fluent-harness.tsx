// Probe harness: Microsoft Fluent 2 (React v9). Tokens live on the FluentProvider element.
import {
  Badge, Button, Card, Checkbox, Divider, FluentProvider, Input, Link, MessageBar, MessageBarBody, Switch, Tab, TabList, Text, webDarkTheme, webLightTheme,
} from "@fluentui/react-components"
import { col, grid, mount, p, row } from "./kit"

function Set({ w }: { w: string }) {
  const n = p(w)
  return (
    <div style={col}>
      <div style={row}>
        <Button appearance="primary" {...n("button-primary")}>Button</Button>
        <Button appearance="secondary" {...n("button-secondary")}>Button</Button>
        <Button appearance="outline" {...n("button-outline")}>Button</Button>
        <Button appearance="subtle" {...n("button-ghost")}>Button</Button>
        <Button appearance="transparent" {...n("button-transparent")}>Button</Button>
      </div>
      <Input placeholder="Placeholder" {...n("input")} />
      <div style={row}>
        <Checkbox {...n("checkbox")} />
        <Checkbox defaultChecked {...n("checkbox-checked")} />
        <Switch {...n("switch")} />
        <Switch defaultChecked {...n("switch-checked")} />
        <Badge {...n("badge")}>Badge</Badge>
        <Badge appearance="tint" {...n("badge-tint")}>Badge</Badge>
      </div>
      <TabList defaultSelectedValue="a" {...n("tabs")}>
        <Tab value="a">Active</Tab>
        <Tab value="b" {...n("tab-inactive")}>Inactive</Tab>
      </TabList>
      <Text {...n("text")}>Text</Text>
      <Text style={{ color: "var(--colorNeutralForeground3)" }} {...n("text-muted")}>Muted</Text>
      <Link href="#" {...n("link")}>Link</Link>
      <Divider {...n("divider")} />
      <MessageBar intent="error" {...n("alert-danger")}><MessageBarBody>Alert</MessageBarBody></MessageBar>
      <MessageBar intent="info" {...n("alert-info")}><MessageBarBody>Alert</MessageBarBody></MessageBar>
    </div>
  )
}

mount(
  (m) => (
    <FluentProvider theme={m === "dark" ? webDarkTheme : webLightTheme}>
      <div style={{ ...grid, background: "var(--colorNeutralBackground2)", minHeight: "100vh" }}>
        <Set w="page" />
        <Card {...p("page")("card")}>
          <Set w="card" />
        </Card>
      </div>
    </FluentProvider>
  ),
  { scopes: () => Array.from(document.querySelectorAll(".fui-FluentProvider")) },
)
