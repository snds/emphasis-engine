// Native page: Radix Themes. Built the Radix way: one root Theme, layout from
// Container / Flex / Grid / Box with responsive props on the 1-9 space scale,
// Heading and Text sizes for type, Card for grouped content, TabNav for app
// navigation, Tabs for sections, Callout for status messages, Table with soft
// Badges for row status. Form actions sit at the end, cancel (soft gray)
// before the solid primary, as in the Radix Themes dialog and form examples.
//
// Light/dark is a class on <html>: the Theme inherits it (appearance="inherit").
// Radix writes its variables on the .radix-themes element, so that's a scope.
// Radix Themes has no breadcrumb; it's composed from Link and Text.
import "@radix-ui/themes/styles.css"
import {
  Avatar,
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Checkbox,
  Container,
  Flex,
  Grid,
  Heading,
  IconButton,
  Link,
  RadioGroup,
  Select,
  Separator,
  Switch,
  TabNav,
  Table,
  Tabs,
  Text,
  TextField,
  Theme,
} from "@radix-ui/themes"
import { IconAlertTriangle, IconBell, IconCircleCheck, IconCircleX, IconInfoCircle } from "@tabler/icons-react"
import type { ReactNode } from "react"
import { mountNative } from "./kit"
import { ACTIONS, ALERTS, APP, FORM, ORDERS, PAGE, STATS, TABS, TEXT, type Status } from "./scene"

// Radix colors are scales; status takes the conventional hue per meaning.
const COLOR: Record<Status, "green" | "blue" | "amber" | "red"> = {
  success: "green",
  info: "blue",
  warning: "amber",
  danger: "red",
}
const icon = { size: 16, stroke: 2 }
const ICON: Record<Status, ReactNode> = {
  success: <IconCircleCheck {...icon} />,
  info: <IconInfoCircle {...icon} />,
  warning: <IconAlertTriangle {...icon} />,
  danger: <IconCircleX {...icon} />,
}

function Field({ label, htmlFor, children, help }: { label: string; htmlFor: string; children: ReactNode; help?: ReactNode }) {
  return (
    <Flex direction="column" gap="1">
      <Text as="label" htmlFor={htmlFor} size="2" weight="medium">
        {label}
      </Text>
      {children}
      {help}
    </Flex>
  )
}

function Header() {
  return (
    <Box>
      <Flex align="center" gap="4" px={{ initial: "4", md: "6" }} py="3">
        <Heading as="h1" size="4" weight="bold" style={{ whiteSpace: "nowrap" }}>
          {APP.product}
        </Heading>
        <Box flexGrow="1" />
        <IconButton variant="ghost" color="gray" aria-label="Notifications">
          <IconBell {...icon} />
        </IconButton>
        <Avatar size="2" radius="full" fallback={APP.user.initials} aria-label={APP.user.name} />
      </Flex>
      {/* TabNav is Radix's link navigation; the box lets it scroll sideways on a phone. */}
      <Box px={{ initial: "2", md: "4" }} style={{ overflowX: "auto" }}>
        <TabNav.Root aria-label={APP.product}>
          {APP.nav.map((n) => (
            <TabNav.Link key={n} href="#" active={n === APP.activeNav}>
              {n}
            </TabNav.Link>
          ))}
        </TabNav.Root>
      </Box>
    </Box>
  )
}

function Settings() {
  return (
    <Card size={{ initial: "2", sm: "3" }}>
      <Flex direction="column" gap="5">
        <Heading as="h2" size="4">
          General
        </Heading>
        <Field label={FORM.name.label} htmlFor="name">
          <TextField.Root id="name" defaultValue={FORM.name.value} />
        </Field>
        <Field
          label={FORM.email.label}
          htmlFor="email"
          help={
            <Text size="1" color="gray">
              {FORM.email.help}
            </Text>
          }
        >
          <TextField.Root id="email" type="email" placeholder={FORM.email.placeholder} />
        </Field>
        {/* No invalid state in Radix Themes: a red soft field plus red helper text is the documented pattern. */}
        <Field
          label={FORM.code.label}
          htmlFor="code"
          help={
            <Text size="1" color="red" id="code-error">
              {FORM.code.error}
            </Text>
          }
        >
          <TextField.Root id="code" defaultValue={FORM.code.value} color="red" variant="soft" aria-invalid aria-describedby="code-error" />
        </Field>
        <Field label={FORM.region.label} htmlFor="region">
          <Select.Root defaultValue={FORM.region.value}>
            <Select.Trigger id="region" />
            <Select.Content>
              {FORM.region.options.map((o) => (
                <Select.Item key={o} value={o}>
                  {o}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Field>
        <Flex direction="column" gap="1">
          <Text as="label" size="2">
            <Flex gap="2" align="center">
              <Switch defaultChecked={FORM.sync.checked} />
              {FORM.sync.label}
            </Flex>
          </Text>
          <Text size="1" color="gray">
            {FORM.sync.help}
          </Text>
        </Flex>
        <Text as="label" size="2">
          <Flex gap="2" align="center">
            <Checkbox defaultChecked={FORM.summary.checked} />
            {FORM.summary.label}
          </Flex>
        </Text>
        <Flex direction="column" gap="2" role="group" aria-labelledby="vis-label">
          <Text id="vis-label" size="2" weight="medium">
            {FORM.visibility.label}
          </Text>
          <RadioGroup.Root defaultValue={FORM.visibility.value} name="visibility" aria-labelledby="vis-label">
            {FORM.visibility.options.map((o) => (
              <RadioGroup.Item key={o.value} value={o.value}>
                {o.label}
              </RadioGroup.Item>
            ))}
          </RadioGroup.Root>
        </Flex>
        <Separator size="4" />
        <Flex gap="3" justify="end" wrap="wrap">
          <Button variant="soft" color="gray">
            {ACTIONS.ghost}
          </Button>
          <Button>{ACTIONS.primary}</Button>
        </Flex>
      </Flex>
    </Card>
  )
}

function Page() {
  return (
    <>
      <Header />
      <Separator size="4" />
      <Container size="4" px={{ initial: "4", md: "6" }} py={{ initial: "5", md: "7" }}>
        <Flex direction="column" gap="6">
          <Flex direction="column" gap="3">
            <Flex gap="2" align="center" wrap="wrap" asChild>
              <nav aria-label="Breadcrumb">
                {APP.breadcrumb.map((b, i) =>
                  i < APP.breadcrumb.length - 1 ? (
                    <Flex key={b} gap="2" align="center">
                      <Link href="#" size="2" color="gray">
                        {b}
                      </Link>
                      <Text size="2" color="gray" aria-hidden>
                        /
                      </Text>
                    </Flex>
                  ) : (
                    <Text key={b} size="2" aria-current="page">
                      {b}
                    </Text>
                  ),
                )}
              </nav>
            </Flex>
            <Heading as="h1" size={{ initial: "7", md: "8" }}>
              {PAGE.title}
            </Heading>
            <Text as="p" size="3" color="gray">
              {PAGE.description}
            </Text>
          </Flex>

          <Box style={{ overflowX: "auto" }}>
            <Tabs.Root defaultValue={TABS[0]}>
              <Tabs.List>
                {TABS.map((t) => (
                  <Tabs.Trigger key={t} value={t}>
                    {t}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
            </Tabs.Root>
          </Box>

          <Grid columns={{ initial: "1", sm: "3" }} gap="4">
            {STATS.map((s) => (
              <Card key={s.label}>
                <Flex direction="column" gap="1">
                  <Text size="2" color="gray">
                    {s.label}
                  </Text>
                  <Text size="7" weight="bold">
                    {s.value}
                  </Text>
                  <Text size="1" color="gray">
                    {s.delta}
                  </Text>
                </Flex>
              </Card>
            ))}
          </Grid>

          <Grid columns={{ initial: "1", md: "2" }} gap="6" align="start">
            <Settings />
            <Flex direction="column" gap="6">
              <Flex direction="column" gap="3">
                {ALERTS.map((a) => (
                  <Callout.Root key={a.status} color={COLOR[a.status]} role={a.status === "danger" ? "alert" : "status"}>
                    <Callout.Icon>{ICON[a.status]}</Callout.Icon>
                    <Callout.Text>
                      <Text weight="bold">{a.title}.</Text> {a.body}
                    </Callout.Text>
                  </Callout.Root>
                ))}
              </Flex>
              <Flex direction="column" gap="3">
                <Heading as="h2" size="4">
                  Actions
                </Heading>
                {/* Radix ranks emphasis by variant: solid, soft, outline, ghost. Danger is a color, not a variant. */}
                <Flex gap="3" wrap="wrap" align="center">
                  <Button variant="solid">{ACTIONS.primary}</Button>
                  <Button variant="soft">{ACTIONS.secondary}</Button>
                  <Button variant="outline">{ACTIONS.tertiary}</Button>
                  <Button variant="ghost" mx="2">
                    {ACTIONS.ghost}
                  </Button>
                  <Button variant="solid" color="red">
                    {ACTIONS.danger}
                  </Button>
                  <Button disabled>{ACTIONS.disabled}</Button>
                </Flex>
              </Flex>
              <Flex direction="column" gap="2">
                <Heading as="h2" size="4">
                  {TEXT.heading}
                </Heading>
                <Text as="p" size="3">
                  {TEXT.primary}
                </Text>
                <Text as="p" size="3" color="gray">
                  {TEXT.secondary}
                </Text>
                {/* Radix has no disabled text color prop; its disabled controls use gray-a8. */}
                <Text as="p" size="3" style={{ color: "var(--gray-a8)" }}>
                  {TEXT.disabled}
                </Text>
                <Text as="p" size="3">
                  <Link href="#">{TEXT.link}</Link>
                </Text>
              </Flex>
            </Flex>
          </Grid>

          <Flex direction="column" gap="3">
            <Box>
              <Heading as="h2" size="5">
                Purchase orders
              </Heading>
              <Text as="p" size="2" color="gray">
                Open orders for this collection.
              </Text>
            </Box>
            {/* Table.Root wraps itself in a ScrollArea, so wide rows scroll inside it. */}
            <Table.Root variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Order</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Style</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Supplier</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell justify="end">Units</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {ORDERS.map((o) => (
                  <Table.Row key={o.po} style={{ whiteSpace: "nowrap" }}>
                    <Table.RowHeaderCell>{o.po}</Table.RowHeaderCell>
                    <Table.Cell>{o.style}</Table.Cell>
                    <Table.Cell>{o.supplier}</Table.Cell>
                    <Table.Cell justify="end">{o.units}</Table.Cell>
                    <Table.Cell>
                      <Badge color={COLOR[o.status]} variant="soft">
                        {o.label}
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Flex>
        </Flex>
      </Container>
    </>
  )
}

// Radix Themes leaves the UA body margin alone; the app shell starts flush.
document.body.style.margin = "0"

mountNative(
  "radix",
  () => (
    <Theme accentColor="blue" grayColor="gray">
      <Page />
    </Theme>
  ),
  {
    onMode: (m) => {
      document.documentElement.classList.toggle("dark", m === "dark")
      document.documentElement.classList.toggle("light", m === "light")
    },
    scopes: () => Array.from(document.querySelectorAll(".radix-themes")),
  },
)
