// Native page: Ant Design. Built the ant.design way: Layout with a dark
// Header carrying a horizontal Menu, Breadcrumb above a content area on the
// layout background, 24-column Row/Col grid, Cards for grouping, Statistic for
// numbers, a vertical Form with the submit button first and left-aligned,
// Alerts with icons, and a Table with preset status Tags.
// Theme is ConfigProvider with CSS variables on (key "probe", unhashed), so
// tokens are custom properties on the `.probe` scope, exactly as in the probe.
// Ant Design's own reset (body margin, box-sizing); the docs recommend it alongside CSS-in-JS.
import "antd/dist/reset.css"
import {
  Alert,
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  ConfigProvider,
  Flex,
  Form,
  Grid,
  Input,
  Layout,
  Menu,
  Radio,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  theme,
} from "antd"
import type { TableColumnsType } from "antd"
import { mountNative } from "./kit"
import { ACTIONS, ALERTS, APP, FORM, ORDERS, PAGE, STATS, TABS, TEXT, type Status } from "./scene"

const { Header, Content, Footer } = Layout
const { Title, Paragraph, Text, Link } = Typography

// Ant Design's preset status colors for Tag and its Alert types.
const TAG: Record<Status, string> = { success: "success", info: "processing", warning: "warning", danger: "error" }
const ALERT: Record<Status, "success" | "info" | "warning" | "error"> = {
  success: "success",
  info: "info",
  warning: "warning",
  danger: "error",
}

type Order = (typeof ORDERS)[number]
const columns: TableColumnsType<Order> = [
  { title: "Order", dataIndex: "po", key: "po" },
  { title: "Style", dataIndex: "style", key: "style" },
  { title: "Supplier", dataIndex: "supplier", key: "supplier" },
  { title: "Units", dataIndex: "units", key: "units", align: "right" },
  {
    title: "Status",
    key: "status",
    render: (_, o) => <Tag color={TAG[o.status]}>{o.label}</Tag>,
  },
]

function Page() {
  const screens = Grid.useBreakpoint()
  // ant.design's top-nav layout pads content 48px; drop to 16px on phones.
  const gutter = screens.md ? 48 : 16
  return (
    <Layout className="probe">
      <Header style={{ display: "flex", alignItems: "center", gap: 24, paddingInline: gutter }}>
        <Text strong style={{ color: "var(--ant-color-text-light-solid)", fontSize: "var(--ant-font-size-lg)", whiteSpace: "nowrap" }}>
          {APP.product}
        </Text>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[APP.activeNav]}
          items={APP.nav.map((n) => ({ key: n, label: n }))}
          style={{ flex: 1, minWidth: 0 }}
        />
        <Avatar>{APP.user.initials}</Avatar>
      </Header>

      <Content style={{ paddingInline: gutter }}>
        <Breadcrumb style={{ margin: "16px 0" }} items={APP.breadcrumb.map((b, i) => ({ title: i === APP.breadcrumb.length - 1 ? b : <a href="#">{b}</a> }))} />
        <Flex vertical gap={24}>
          <div>
            <Title level={2} style={{ marginTop: 0 }}>
              {PAGE.title}
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {PAGE.description}
            </Paragraph>
          </div>
          <Tabs items={TABS.map((t) => ({ key: t, label: t }))} style={{ marginBottom: -16 }} />

          <Row gutter={[16, 16]}>
            {STATS.map((s) => (
              <Col key={s.label} xs={24} sm={8}>
                <Card variant="borderless">
                  <Statistic title={s.label} value={s.value} />
                  <Text type="secondary">{s.delta}</Text>
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={14}>
              <Card title="General" variant="borderless">
                <Form
                  layout="vertical"
                  initialValues={{
                    name: FORM.name.value,
                    code: FORM.code.value,
                    region: FORM.region.value,
                    sync: FORM.sync.checked,
                    summary: FORM.summary.checked,
                    visibility: FORM.visibility.value,
                  }}
                >
                  <Form.Item label={FORM.name.label} name="name">
                    <Input />
                  </Form.Item>
                  <Form.Item label={FORM.email.label} name="email" extra={FORM.email.help}>
                    <Input type="email" placeholder={FORM.email.placeholder} />
                  </Form.Item>
                  <Form.Item label={FORM.code.label} name="code" validateStatus="error" help={FORM.code.error}>
                    <Input />
                  </Form.Item>
                  <Form.Item label={FORM.region.label} name="region">
                    <Select options={FORM.region.options.map((o) => ({ value: o, label: o }))} />
                  </Form.Item>
                  <Form.Item label={FORM.sync.label} name="sync" valuePropName="checked" extra={FORM.sync.help}>
                    <Switch />
                  </Form.Item>
                  <Form.Item name="summary" valuePropName="checked">
                    <Checkbox>{FORM.summary.label}</Checkbox>
                  </Form.Item>
                  <Form.Item label={FORM.visibility.label} name="visibility">
                    <Radio.Group options={FORM.visibility.options} />
                  </Form.Item>
                  {/* ant.design forms: the submit button sits under the fields, left-aligned, primary first. */}
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Space>
                      <Button type="primary" htmlType="submit">
                        {ACTIONS.primary}
                      </Button>
                      <Button>{ACTIONS.ghost}</Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Flex vertical gap={24}>
                <Flex vertical gap={8}>
                  {ALERTS.map((a) => (
                    <Alert key={a.status} type={ALERT[a.status]} title={a.title} description={a.body} showIcon />
                  ))}
                </Flex>

                <Card title="Actions" variant="borderless">
                  {/* Order of importance, left to right: Ant Design puts lesser actions to the right. */}
                  <Space wrap>
                    <Button type="primary">{ACTIONS.primary}</Button>
                    <Button>{ACTIONS.secondary}</Button>
                    <Button type="dashed">{ACTIONS.tertiary}</Button>
                    <Button type="text">{ACTIONS.ghost}</Button>
                    <Button type="link">{TEXT.link}</Button>
                    <Button type="primary" danger>
                      {ACTIONS.danger}
                    </Button>
                    <Button type="primary" disabled>
                      {ACTIONS.disabled}
                    </Button>
                  </Space>
                </Card>

                <Card title={TEXT.heading} variant="borderless">
                  <Flex vertical gap={4}>
                    <Text>{TEXT.primary}</Text>
                    <Text type="secondary">{TEXT.secondary}</Text>
                    <Text disabled>{TEXT.disabled}</Text>
                    <Link href="#">{TEXT.link}</Link>
                  </Flex>
                </Card>
              </Flex>
            </Col>
          </Row>

          <Card title="Purchase orders" variant="borderless" styles={{ body: { paddingTop: 0 } }}>
            <Paragraph type="secondary">Open orders for this collection.</Paragraph>
            <Table<Order> rowKey="po" columns={columns} dataSource={ORDERS} pagination={false} scroll={{ x: "max-content" }} />
          </Card>
        </Flex>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        <Text type="secondary">{APP.product}</Text>
      </Footer>
    </Layout>
  )
}

mountNative(
  "antd",
  (m) => (
    <ConfigProvider theme={{ algorithm: m === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm, cssVar: { key: "probe" }, hashed: false }}>
      <Page />
    </ConfigProvider>
  ),
  { scopes: () => Array.from(document.querySelectorAll(".probe")) },
)
