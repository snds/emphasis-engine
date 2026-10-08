// Probe harness: Ant Design v6 with CSS variables on. Tokens live on the ConfigProvider scope.
import { Alert, Button, Card, Checkbox, ConfigProvider, Divider, Input, Switch, Tabs, Tag, Typography, theme } from "antd"
import { col, grid, mount, p, row } from "./kit"

function Set({ w }: { w: string }) {
  const n = p(w)
  return (
    <div style={col}>
      <div style={row}>
        <Button type="primary" {...n("button-primary")}>Button</Button>
        <Button {...n("button-secondary")}>Button</Button>
        <Button type="dashed" {...n("button-outline")}>Button</Button>
        <Button type="text" {...n("button-ghost")}>Button</Button>
        <Button type="primary" danger {...n("button-danger")}>Button</Button>
      </div>
      <Input placeholder="Placeholder" {...n("input")} />
      <div style={row}>
        <Checkbox {...n("checkbox")} />
        <Checkbox defaultChecked {...n("checkbox-checked")} />
        <Switch {...n("switch")} />
        <Switch defaultChecked {...n("switch-checked")} />
        <Tag color="processing" {...n("badge")}>Tag</Tag>
        <Tag {...n("badge-neutral")}>Tag</Tag>
      </div>
      <div {...n("tabs")}><Tabs items={[{ key: "a", label: "Active" }, { key: "b", label: "Inactive" }]} /></div>
      <Typography.Text {...n("text")}>Text</Typography.Text>
      <Typography.Text type="secondary" {...n("text-muted")}>Muted</Typography.Text>
      <Typography.Link href="#" {...n("link")}>Link</Typography.Link>
      <div {...n("divider")}><Divider /></div>
      <Alert type="error" title="Alert" {...n("alert-danger")} />
      <Alert type="info" title="Alert" {...n("alert-info")} />
    </div>
  )
}

mount(
  (m) => (
    <ConfigProvider theme={{ algorithm: m === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm, cssVar: { key: "probe" }, hashed: false }}>
      <div className="probe" style={{ ...grid, background: "var(--ant-color-bg-layout)", minHeight: "100vh" }}>
        <Set w="page" />
        <Card {...p("page")("card")}>
          <Set w="card" />
        </Card>
      </div>
    </ConfigProvider>
  ),
  { scopes: () => Array.from(document.querySelectorAll(".probe")) },
)
