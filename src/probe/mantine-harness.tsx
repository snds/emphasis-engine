// Probe harness: Mantine. Color scheme is data-mantine-color-scheme on <html>.
import "@mantine/core/styles.css"
import { Alert, Anchor, Badge, Button, Card, Checkbox, Divider, MantineProvider, Switch, Tabs, Text, TextInput } from "@mantine/core"
import { col, grid, mount, p, row } from "./kit"

function Set({ w }: { w: string }) {
  const n = p(w)
  return (
    <div style={col}>
      <div style={row}>
        <Button variant="filled" {...n("button-primary")}>Button</Button>
        <Button variant="light" {...n("button-secondary")}>Button</Button>
        <Button variant="outline" {...n("button-outline")}>Button</Button>
        <Button variant="subtle" {...n("button-ghost")}>Button</Button>
        <Button variant="filled" color="red" {...n("button-danger")}>Button</Button>
        <Button variant="default" {...n("button-neutral")}>Button</Button>
      </div>
      <TextInput placeholder="Placeholder" {...n("input")} />
      <div style={row}>
        <Checkbox {...n("checkbox")} />
        <Checkbox defaultChecked {...n("checkbox-checked")} />
        <Switch {...n("switch")} />
        <Switch defaultChecked {...n("switch-checked")} />
        <Badge {...n("badge")}>Badge</Badge>
        <Badge variant="light" color="gray" {...n("badge-neutral")}>Badge</Badge>
      </div>
      <Tabs defaultValue="a">
        <Tabs.List {...n("tabs")}>
          <Tabs.Tab value="a">Active</Tabs.Tab>
          <Tabs.Tab value="b" {...n("tab-inactive")}>Inactive</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <Text {...n("text")}>Text</Text>
      <Text c="dimmed" {...n("text-muted")}>Muted</Text>
      <Anchor href="#" {...n("link")}>Link</Anchor>
      <Divider {...n("divider")} />
      <Alert color="red" title="Alert" {...n("alert-danger")} />
      <Alert color="blue" title="Alert" {...n("alert-info")} />
    </div>
  )
}

mount(
  (m) => (
    <MantineProvider forceColorScheme={m}>
      <div style={{ ...grid, background: "var(--mantine-color-body)", minHeight: "100vh" }}>
        <Set w="page" />
        <Card withBorder {...p("page")("card")}>
          <Set w="card" />
        </Card>
      </div>
    </MantineProvider>
  ),
)
