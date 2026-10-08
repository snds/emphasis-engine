// Native page: GitHub Primer. Built the GitHub way: dark global Header,
// PageLayout with a content column and an end pane, PageHeader with
// breadcrumbs and an UnderlineNav, a settings form of FormControls with the
// save button bottom-left and cancel to its right, Banners for status, a
// DataTable with Labels, and a "Danger zone" box like GitHub's repo settings.
// Mode is Primer's ThemeProvider colorMode plus the data-color-mode attributes
// the primitives CSS keys on (BaseStyles repeats them on its own div).
import "@primer/primitives/dist/css/functional/themes/light.css"
import "@primer/primitives/dist/css/functional/themes/dark.css"
import "@primer/primitives/dist/css/primitives.css"
import {
  Banner,
  BaseStyles,
  Breadcrumbs,
  Button,
  Checkbox,
  FormControl,
  Header,
  Heading,
  Label,
  Link,
  PageHeader,
  PageLayout,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeProvider,
  ToggleSwitch,
  UnderlineNav,
} from "@primer/react"
import { Card, DataTable, Hidden, Table } from "@primer/react/experimental"
import { BellIcon, CopyIcon, EyeIcon, PackageIcon } from "@primer/octicons-react"
import { mountNative, type Mode } from "./kit"
import { ACTIONS, ALERTS, APP, FORM, ORDERS, PAGE, STATS, TABS, TEXT, type Status } from "./scene"

// Primer's functional color roles: accent is informational, attention is warning.
const LABEL: Record<Status, "success" | "accent" | "attention" | "danger"> = {
  success: "success",
  info: "accent",
  warning: "attention",
  danger: "danger",
}
const BANNER: Record<Status, "success" | "info" | "warning" | "critical"> = {
  success: "success",
  info: "info",
  warning: "warning",
  danger: "critical",
}

type Order = (typeof ORDERS)[number] & { id: string }
const rows: Order[] = ORDERS.map((o) => ({ ...o, id: o.po }))

// Section headings follow GitHub settings: a subtitle-sized heading over a muted rule.
function SectionHeading({ children, id }: { children: string; id?: string }) {
  return (
    <div style={{ borderBottom: "var(--borderWidth-thin) solid var(--borderColor-muted)", paddingBottom: "var(--base-size-8)" }}>
      <Heading as="h2" variant="medium" id={id}>
        {children}
      </Heading>
    </div>
  )
}

function AppHeader() {
  return (
    <Header>
      <Header.Item>
        <Header.Link href="#" style={{ gap: "var(--base-size-8)" }}>
          <PackageIcon size={24} />
          <span>{APP.product}</span>
        </Header.Link>
      </Header.Item>
      <Hidden when="narrow">
        <Stack direction="horizontal" gap="normal" align="center">
          {APP.nav.map((n) => (
            <Header.Link key={n} href="#" aria-current={n === APP.activeNav ? "page" : undefined}>
              {n}
            </Header.Link>
          ))}
        </Stack>
      </Hidden>
      <Header.Item full />
      <Header.Item>
        <Header.Link href="#" aria-label="Notifications">
          <BellIcon size={16} />
        </Header.Link>
      </Header.Item>
      <Header.Item style={{ marginRight: 0 }}>
        <Header.Link href="#">{APP.user.initials}</Header.Link>
      </Header.Item>
    </Header>
  )
}

function SettingsForm() {
  return (
    <Stack as="form" gap="normal" onSubmit={(e: React.FormEvent) => e.preventDefault()}>
      <SectionHeading>General</SectionHeading>
      <FormControl>
        <FormControl.Label>{FORM.name.label}</FormControl.Label>
        <TextInput defaultValue={FORM.name.value} block />
      </FormControl>
      <FormControl>
        <FormControl.Label>{FORM.email.label}</FormControl.Label>
        <TextInput type="email" placeholder={FORM.email.placeholder} block />
        <FormControl.Caption>{FORM.email.help}</FormControl.Caption>
      </FormControl>
      <FormControl>
        <FormControl.Label>{FORM.code.label}</FormControl.Label>
        <TextInput defaultValue={FORM.code.value} validationStatus="error" />
        <FormControl.Validation variant="error">{FORM.code.error}</FormControl.Validation>
      </FormControl>
      <FormControl>
        <FormControl.Label>{FORM.region.label}</FormControl.Label>
        <Select defaultValue={FORM.region.value}>
          {FORM.region.options.map((o) => (
            <Select.Option key={o} value={o}>
              {o}
            </Select.Option>
          ))}
        </Select>
      </FormControl>
      {/* Primer's ToggleSwitch pattern: label and caption beside the switch, linked by id. */}
      <Stack direction="horizontal" justify="space-between" align="start" gap="normal">
        <Stack gap="none">
          <Text id="sync-label" weight="semibold" size="medium">
            {FORM.sync.label}
          </Text>
          <Text id="sync-caption" size="small" style={{ color: "var(--fgColor-muted)" }}>
            {FORM.sync.help}
          </Text>
        </Stack>
        <ToggleSwitch aria-labelledby="sync-label" aria-describedby="sync-caption" defaultChecked={FORM.sync.checked} size="small" />
      </Stack>
      <FormControl>
        <Checkbox defaultChecked={FORM.summary.checked} />
        <FormControl.Label>{FORM.summary.label}</FormControl.Label>
      </FormControl>
      <RadioGroup name="visibility">
        <RadioGroup.Label>{FORM.visibility.label}</RadioGroup.Label>
        {FORM.visibility.options.map((o) => (
          <FormControl key={o.value}>
            <Radio value={o.value} defaultChecked={o.value === FORM.visibility.value} />
            <FormControl.Label>{o.label}</FormControl.Label>
          </FormControl>
        ))}
      </RadioGroup>
      {/* Primer saving pattern: submit bottom-left, primary; cancel to its right, secondary. */}
      <Stack direction="horizontal" gap="condensed">
        <Button type="submit" variant="primary">
          {ACTIONS.primary}
        </Button>
        <Button>{ACTIONS.ghost}</Button>
      </Stack>
    </Stack>
  )
}

function Orders() {
  return (
    <Table.Container>
      <Table.Title as="h2" id="orders">
        Purchase orders
      </Table.Title>
      <Table.Subtitle as="p" id="orders-sub">
        Open orders for this collection.
      </Table.Subtitle>
      {/* DataTable wraps itself in a scrollable overflow region, so narrow screens scroll the table, not the page. */}
      <DataTable
          aria-labelledby="orders"
          aria-describedby="orders-sub"
          data={rows}
          columns={[
            { header: "Order", field: "po", rowHeader: true },
            { header: "Style", field: "style" },
            { header: "Supplier", field: "supplier" },
            { header: "Units", field: "units", align: "end" },
            {
              header: "Status",
              field: "label",
              renderCell: (r) => <Label variant={LABEL[r.status]}>{r.label}</Label>,
            },
          ]}
        />
    </Table.Container>
  )
}

function Page() {
  return (
    <>
      <AppHeader />
      <PageLayout containerWidth="xlarge" padding="normal" columnGap="normal" rowGap="normal">
        <PageLayout.Header>
          <Breadcrumbs>
            {APP.breadcrumb.map((b, i) => (
              <Breadcrumbs.Item key={b} href="#" selected={i === APP.breadcrumb.length - 1}>
                {b}
              </Breadcrumbs.Item>
            ))}
          </Breadcrumbs>
          <PageHeader role="banner" aria-label={PAGE.title}>
            <PageHeader.TitleArea>
              <PageHeader.Title as="h1">{PAGE.title}</PageHeader.Title>
            </PageHeader.TitleArea>
            {/* Page-level actions sit right of the title; GitHub keeps the primary action last. */}
            <PageHeader.Actions>
              <Button variant="invisible" leadingVisual={EyeIcon}>
                {ACTIONS.tertiary}
              </Button>
              <Button leadingVisual={CopyIcon}>{ACTIONS.secondary}</Button>
            </PageHeader.Actions>
            <PageHeader.Description>
              <Text style={{ color: "var(--fgColor-muted)" }}>{PAGE.description}</Text>
            </PageHeader.Description>
            <PageHeader.Navigation>
              <UnderlineNav aria-label="Settings sections">
                {TABS.map((t, i) => (
                  <UnderlineNav.Item key={t} href="#" aria-current={i === 0 ? "page" : undefined}>
                    {t}
                  </UnderlineNav.Item>
                ))}
              </UnderlineNav>
            </PageHeader.Navigation>
          </PageHeader>
        </PageLayout.Header>

        <PageLayout.Content as="div">
          <Stack gap="spacious">
            <Stack direction={{ narrow: "vertical", regular: "horizontal" }} gap="normal">
              {STATS.map((s) => (
                <div key={s.label} style={{ flex: 1, minWidth: 0 }}>
                  <Card padding="normal">
                    <Stack gap="tight">
                      <Text size="small" weight="semibold" style={{ color: "var(--fgColor-muted)" }}>
                        {s.label}
                      </Text>
                      <Heading as="h3" variant="large">
                        {s.value}
                      </Heading>
                      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                        {s.delta}
                      </Text>
                    </Stack>
                  </Card>
                </div>
              ))}
            </Stack>
            <SettingsForm />
            <Orders />
          </Stack>
        </PageLayout.Content>

        <PageLayout.Pane position="end" aria-label="Status and actions">
          <Stack gap="spacious">
            <Stack gap="condensed">
              {ALERTS.map((a) => (
                <Banner key={a.status} variant={BANNER[a.status]} title={a.title} description={a.body} layout="compact" />
              ))}
            </Stack>

            <Stack gap="normal">
              <SectionHeading>Actions</SectionHeading>
              {/* Primer has no outline button; invisible is its lowest-emphasis variant. */}
              <Stack direction="horizontal" gap="condensed" wrap="wrap">
                <Button variant="primary">{ACTIONS.primary}</Button>
                <Button>{ACTIONS.secondary}</Button>
                <Button variant="invisible" leadingVisual={EyeIcon}>
                  {ACTIONS.tertiary}
                </Button>
                <Button variant="invisible">{ACTIONS.ghost}</Button>
                <Button variant="danger">{ACTIONS.danger}</Button>
                <Button variant="primary" disabled>
                  {ACTIONS.disabled}
                </Button>
              </Stack>
            </Stack>

            <Stack gap="condensed">
              <SectionHeading>{TEXT.heading}</SectionHeading>
              <Text as="p" style={{ margin: 0, color: "var(--fgColor-default)" }}>
                {TEXT.primary}
              </Text>
              <Text as="p" style={{ margin: 0, color: "var(--fgColor-muted)" }}>
                {TEXT.secondary}
              </Text>
              <Text as="p" style={{ margin: 0, color: "var(--fgColor-disabled)" }}>
                {TEXT.disabled}
              </Text>
              <Link href="#" inline>
                {TEXT.link}
              </Link>
            </Stack>

            {/* GitHub repo settings: destructive actions live in a danger-bordered box. */}
            <Stack gap="condensed">
              <Heading as="h2" variant="medium" style={{ color: "var(--fgColor-default)" }}>
                Danger zone
              </Heading>
              <div
                style={{
                  border: "var(--borderWidth-thin) solid var(--borderColor-danger-emphasis)",
                  borderRadius: "var(--borderRadius-medium)",
                  padding: "var(--base-size-16)",
                }}
              >
                <Stack gap="condensed" align="start">
                  <Text weight="semibold">{ACTIONS.danger}</Text>
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    Once you delete a workspace, there is no going back.
                  </Text>
                  <Button variant="danger">{ACTIONS.danger}</Button>
                </Stack>
              </div>
            </Stack>
          </Stack>
        </PageLayout.Pane>
      </PageLayout>
    </>
  )
}

function setMode(m: Mode) {
  const h = document.documentElement
  h.setAttribute("data-color-mode", m)
  h.setAttribute("data-light-theme", "light")
  h.setAttribute("data-dark-theme", "dark")
}

mountNative(
  "primer",
  (m) => (
    <ThemeProvider colorMode={m === "dark" ? "night" : "day"}>
      <BaseStyles style={{ background: "var(--bgColor-default)" }}>
        <Page />
      </BaseStyles>
    </ThemeProvider>
  ),
  {
    onMode: setMode,
    scopes: () => [document.documentElement, ...Array.from(document.querySelectorAll("[data-color-mode]"))],
  },
)
