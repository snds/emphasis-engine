// Native page: Mantine. Built the Mantine way: AppShell with a header and a
// burger-driven navbar on small screens, Container + Stack + SimpleGrid/Grid
// for layout, Paper stat cards (the ui.mantine.dev StatsGrid pattern), inputs
// with label/description/error props, Group justify="flex-end" for form
// actions, light Alerts with Tabler icons, Table.ScrollContainer with light
// Badges. Color scheme is forceColorScheme on the provider, which writes
// data-mantine-color-scheme on <html>, same as the probe harness. Any color
// written by hand is a Mantine color prop or a --mantine-color-* variable.
import "@mantine/core/styles.css"
import {
  Alert,
  Anchor,
  AppShell,
  Avatar,
  ActionIcon,
  Badge,
  Breadcrumbs,
  Burger,
  Button,
  Card,
  Checkbox,
  Container,
  Grid,
  Group,
  MantineProvider,
  NavLink,
  Paper,
  Radio,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import {
  IconAlertTriangle,
  IconArrowDownRight,
  IconArrowUpRight,
  IconBell,
  IconCircleCheck,
  IconInfoCircle,
  IconXboxX,
} from "@tabler/icons-react"
import { mountNative } from "./kit"
import { ACTIONS, ALERTS, APP, FORM, ORDERS, PAGE, STATS, TABS, TEXT, type Status } from "./scene"

// Mantine has no status variants; status is a color name by convention.
const COLOR: Record<Status, string> = { success: "green", info: "blue", warning: "yellow", danger: "red" }
const ICON: Record<Status, typeof IconInfoCircle> = {
  success: IconCircleCheck,
  info: IconInfoCircle,
  warning: IconAlertTriangle,
  danger: IconXboxX,
}
// StatsGrid pattern: teal up, red down, dimmed when there's no direction.
const TREND: Record<string, "up" | "down" | undefined> = { "+3 this week": "up", "−2 pts": "down" }

function Stats() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }}>
      {STATS.map((s) => {
        const t = TREND[s.delta]
        const Arrow = t === "up" ? IconArrowUpRight : IconArrowDownRight
        return (
          <Paper key={s.label} withBorder p="md" radius="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              {s.label}
            </Text>
            <Text fw={700} fz={28} lh={1.3} mt="xs">
              {s.value}
            </Text>
            <Group gap={4} mt={4}>
              <Text c={t === "up" ? "teal" : t === "down" ? "red" : "dimmed"} fz="sm" fw={500}>
                {s.delta}
              </Text>
              {t && <Arrow size={16} stroke={1.5} color={`var(--mantine-color-${t === "up" ? "teal" : "red"}-text)`} />}
            </Group>
          </Paper>
        )
      })}
    </SimpleGrid>
  )
}

function SettingsForm() {
  return (
    <Card withBorder padding="lg" radius="md" component="form" onSubmit={(e) => e.preventDefault()}>
      <Title order={3}>General</Title>
      <Text c="dimmed" size="sm" mt={4}>
        {PAGE.description}
      </Text>
      <Stack gap="md" mt="lg">
        <TextInput label={FORM.name.label} defaultValue={FORM.name.value} />
        <TextInput
          type="email"
          label={FORM.email.label}
          description={FORM.email.help}
          placeholder={FORM.email.placeholder}
        />
        <TextInput label={FORM.code.label} defaultValue={FORM.code.value} error={FORM.code.error} />
        <Select
          label={FORM.region.label}
          data={FORM.region.options}
          defaultValue={FORM.region.value}
          allowDeselect={false}
        />
        <Switch label={FORM.sync.label} description={FORM.sync.help} defaultChecked={FORM.sync.checked} />
        <Checkbox label={FORM.summary.label} defaultChecked={FORM.summary.checked} />
        <Radio.Group label={FORM.visibility.label} defaultValue={FORM.visibility.value} name="visibility">
          <Stack gap="xs" mt="xs">
            {FORM.visibility.options.map((o) => (
              <Radio key={o.value} value={o.value} label={o.label} />
            ))}
          </Stack>
        </Radio.Group>
      </Stack>
      {/* Mantine form examples: actions in a Group, justify flex-end, submit last. */}
      <Group justify="flex-end" mt="xl">
        <Button variant="default">{ACTIONS.ghost}</Button>
        <Button type="submit">{ACTIONS.primary}</Button>
      </Group>
    </Card>
  )
}

function Page() {
  const [opened, { toggle }] = useDisclosure()
  return (
    <AppShell
      // Static mode: the frame sizes to content, so a fixed header would just sit over the top of a document
      // the host scrolls anyway. Static keeps the same structure without fixed offsets.
      mode="static"
      header={{ height: 56 }}
      navbar={{ width: 260, breakpoint: "sm", collapsed: { mobile: !opened, desktop: true } }}
      padding={0}
    >
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Group gap="lg" wrap="nowrap">
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Toggle navigation" />
              <Text fw={700} fz="lg">
                {APP.product}
              </Text>
              {/* No header-nav component in core; subtle gray Buttons with the active one light is the nearest native. */}
              <Group gap={4} visibleFrom="sm" component="nav" aria-label="Main">
                {APP.nav.map((n) => {
                  const active = n === APP.activeNav
                  return (
                    <Button
                      key={n}
                      component="a"
                      href="#"
                      size="compact-sm"
                      variant={active ? "light" : "subtle"}
                      color={active ? undefined : "gray"}
                      aria-current={active ? "page" : undefined}
                    >
                      {n}
                    </Button>
                  )
                })}
              </Group>
            </Group>
            <Group gap="sm" wrap="nowrap">
              <ActionIcon variant="default" size="lg" radius="md" aria-label="Notifications">
                <IconBell size={18} stroke={1.5} />
              </ActionIcon>
              <Avatar radius="xl" color="initials" name={APP.user.name} />
            </Group>
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        {APP.nav.map((n) => (
          <NavLink key={n} href="#" label={n} active={n === APP.activeNav} />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>
        <Container size="xl" py="xl">
          <Stack gap="xl">
            <Stack gap="sm">
              <Breadcrumbs>
                {APP.breadcrumb.map((b, i) =>
                  i === APP.breadcrumb.length - 1 ? (
                    <Text key={b} size="sm">
                      {b}
                    </Text>
                  ) : (
                    <Anchor key={b} href="#" size="sm">
                      {b}
                    </Anchor>
                  ),
                )}
              </Breadcrumbs>
              <div>
                <Title order={1}>{PAGE.title}</Title>
                <Text c="dimmed" mt={4}>
                  {PAGE.description}
                </Text>
              </div>
            </Stack>

            {/* The tab row wraps on narrow screens rather than scrolling; Mantine's list is flex-wrap by default. */}
            <Tabs defaultValue={TABS[0]}>
              <Tabs.List>
                {TABS.map((t) => (
                  <Tabs.Tab key={t} value={t}>
                    {t}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>

            <Stats />

            <Grid gap="xl">
              <Grid.Col span={{ base: 12, md: 7 }}>
                <SettingsForm />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 5 }}>
                <Stack gap="xl">
                  <Stack gap="sm">
                    {ALERTS.map((a) => {
                      const Icon = ICON[a.status]
                      return (
                        <Alert key={a.status} variant="light" color={COLOR[a.status]} title={a.title} icon={<Icon />}>
                          {a.body}
                        </Alert>
                      )
                    })}
                  </Stack>

                  <Stack gap="sm">
                    <Title order={3}>Actions</Title>
                    {/* filled → light → outline → subtle steps down in emphasis; danger is color="red". */}
                    <Group gap="sm">
                      <Button>{ACTIONS.primary}</Button>
                      <Button variant="light">{ACTIONS.secondary}</Button>
                      <Button variant="outline">{ACTIONS.tertiary}</Button>
                      <Button variant="subtle">{ACTIONS.ghost}</Button>
                      <Button color="red">{ACTIONS.danger}</Button>
                      <Button disabled>{ACTIONS.disabled}</Button>
                    </Group>
                  </Stack>

                  <Stack gap={6}>
                    <Title order={3}>{TEXT.heading}</Title>
                    <Text>{TEXT.primary}</Text>
                    <Text c="dimmed">{TEXT.secondary}</Text>
                    <Text c="var(--mantine-color-disabled-color)">{TEXT.disabled}</Text>
                    <Anchor href="#">{TEXT.link}</Anchor>
                  </Stack>
                </Stack>
              </Grid.Col>
            </Grid>

            <Stack gap="sm">
              <div>
                <Title order={3}>Purchase orders</Title>
                <Text c="dimmed" size="sm">
                  Open orders for this collection.
                </Text>
              </div>
              <Table.ScrollContainer minWidth={600}>
                <Table striped highlightOnHover withTableBorder verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Order</Table.Th>
                      <Table.Th>Style</Table.Th>
                      <Table.Th>Supplier</Table.Th>
                      <Table.Th ta="right">Units</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {ORDERS.map((o) => (
                      <Table.Tr key={o.po}>
                        <Table.Td fw={500}>{o.po}</Table.Td>
                        <Table.Td>{o.style}</Table.Td>
                        <Table.Td>{o.supplier}</Table.Td>
                        <Table.Td ta="right">{o.units}</Table.Td>
                        <Table.Td>
                          <Badge variant="light" color={COLOR[o.status]}>
                            {o.label}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Stack>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}

mountNative("mantine", (m) => (
  <MantineProvider forceColorScheme={m}>
    <Page />
  </MantineProvider>
))
