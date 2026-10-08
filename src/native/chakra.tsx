// Native page: Chakra UI v3. Built the Chakra way: style props on layout
// primitives (Container, Flex, Stack, SimpleGrid, Grid), semantic color tokens
// (fg, fg.muted, bg.panel, border) for anything written by hand, recipe
// variants with colorPalette for every colored component, Card + Stat for
// metrics, Field for labels/helper/error text, Alert by status, Table with
// subtle Badges. Light/dark is the .dark / .light class on <html>, same as the
// probe harness. ChakraProvider renders no wrapper element, so no scopes.
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Breadcrumb,
  Button,
  Card,
  ChakraProvider,
  Checkbox,
  Container,
  Field,
  Fieldset,
  Flex,
  Grid,
  HStack,
  Heading,
  IconButton,
  Input,
  Link,
  NativeSelect,
  RadioGroup,
  SimpleGrid,
  Stack,
  Stat,
  Switch,
  Table,
  Tabs,
  Text,
  Wrap,
  defaultSystem,
} from "@chakra-ui/react"
import { IconBell } from "@tabler/icons-react"
import { Fragment } from "react"
import { mountNative } from "./kit"
import { ACTIONS, ALERTS, APP, FORM, ORDERS, PAGE, STATS, TABS, TEXT, type Status } from "./scene"

// Chakra's Alert statuses carry their own palettes (success green, info blue,
// warning orange, error red). Badges take the same palettes so status reads alike.
const ALERT: Record<Status, "success" | "info" | "warning" | "error"> = {
  success: "success",
  info: "info",
  warning: "warning",
  danger: "error",
}
const PALETTE: Record<Status, string> = { success: "green", info: "blue", warning: "orange", danger: "red" }

// Stat trend: Chakra ships Up/Down indicators; a delta with no direction gets none.
const TREND: Record<string, "up" | "down" | undefined> = { "+3 this week": "up", "−2 pts": "down" }

function Header() {
  return (
    <Box as="header" bg="bg.panel" borderBottomWidth="1px" borderColor="border">
      <Container maxW="7xl">
        <Flex h="14" align="center" gap="6">
          <Heading as="span" size="md" fontWeight="semibold" color="fg">
            {APP.product}
          </Heading>
          {/* Chakra has no app-nav component; plain Links in an HStack is how its docs and templates build one. */}
          <HStack as="nav" gap="5" hideBelow="md" aria-label="Main">
            {APP.nav.map((n) => {
              const active = n === APP.activeNav
              return (
                <Link
                  key={n}
                  href="#"
                  variant="plain"
                  textStyle="sm"
                  fontWeight={active ? "semibold" : "medium"}
                  color={active ? "fg" : "fg.muted"}
                  aria-current={active ? "page" : undefined}
                >
                  {n}
                </Link>
              )
            })}
          </HStack>
          <HStack gap="2" ms="auto">
            <IconButton aria-label="Notifications" variant="ghost" size="sm">
              <IconBell />
            </IconButton>
            <Avatar.Root size="sm">
              <Avatar.Fallback name={APP.user.name} />
            </Avatar.Root>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}

function SettingsForm() {
  return (
    <Card.Root as="form" onSubmit={(e) => e.preventDefault()}>
      <Card.Header>
        <Card.Title>General</Card.Title>
        <Card.Description>{PAGE.description}</Card.Description>
      </Card.Header>
      <Card.Body>
        <Stack gap="5">
          <Field.Root>
            <Field.Label>{FORM.name.label}</Field.Label>
            <Input defaultValue={FORM.name.value} />
          </Field.Root>
          <Field.Root>
            <Field.Label>{FORM.email.label}</Field.Label>
            <Input type="email" placeholder={FORM.email.placeholder} />
            <Field.HelperText>{FORM.email.help}</Field.HelperText>
          </Field.Root>
          <Field.Root invalid>
            <Field.Label>{FORM.code.label}</Field.Label>
            <Input defaultValue={FORM.code.value} />
            <Field.ErrorText>{FORM.code.error}</Field.ErrorText>
          </Field.Root>
          <Field.Root>
            <Field.Label>{FORM.region.label}</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field defaultValue={FORM.region.value}>
                {FORM.region.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
          <Field.Root>
            <Switch.Root defaultChecked={FORM.sync.checked}>
              <Switch.HiddenInput />
              <Switch.Control />
              <Switch.Label>{FORM.sync.label}</Switch.Label>
            </Switch.Root>
            <Field.HelperText>{FORM.sync.help}</Field.HelperText>
          </Field.Root>
          <Checkbox.Root defaultChecked={FORM.summary.checked}>
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>{FORM.summary.label}</Checkbox.Label>
          </Checkbox.Root>
          <Fieldset.Root>
            <Fieldset.Legend>{FORM.visibility.label}</Fieldset.Legend>
            <Fieldset.Content>
              <RadioGroup.Root defaultValue={FORM.visibility.value} name="visibility">
                <Stack gap="2">
                  {FORM.visibility.options.map((o) => (
                    <RadioGroup.Item key={o.value} value={o.value}>
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText>{o.label}</RadioGroup.ItemText>
                    </RadioGroup.Item>
                  ))}
                </Stack>
              </RadioGroup.Root>
            </Fieldset.Content>
          </Fieldset.Root>
        </Stack>
      </Card.Body>
      {/* Chakra's card form examples: actions in the footer, end-aligned, primary last. */}
      <Card.Footer justifyContent="flex-end" gap="3">
        <Button variant="ghost">{ACTIONS.ghost}</Button>
        <Button type="submit" variant="solid">
          {ACTIONS.primary}
        </Button>
      </Card.Footer>
    </Card.Root>
  )
}

function Page() {
  return (
    <Box bg="bg" color="fg">
      <Header />
      <Container maxW="7xl" py={{ base: "6", md: "10" }}>
        <Stack gap="8">
          <Stack gap="4">
            <Breadcrumb.Root size="sm">
              <Breadcrumb.List>
                {APP.breadcrumb.map((b, i) =>
                  i === APP.breadcrumb.length - 1 ? (
                    <Breadcrumb.Item key={b}>
                      <Breadcrumb.CurrentLink>{b}</Breadcrumb.CurrentLink>
                    </Breadcrumb.Item>
                  ) : (
                    <Fragment key={b}>
                      <Breadcrumb.Item>
                        <Breadcrumb.Link href="#">{b}</Breadcrumb.Link>
                      </Breadcrumb.Item>
                      <Breadcrumb.Separator />
                    </Fragment>
                  ),
                )}
              </Breadcrumb.List>
            </Breadcrumb.Root>
            <Stack gap="1">
              <Heading as="h1" size={{ base: "2xl", md: "3xl" }}>
                {PAGE.title}
              </Heading>
              <Text color="fg.muted">{PAGE.description}</Text>
            </Stack>
          </Stack>

          <Tabs.Root defaultValue={TABS[0]} variant="line">
            {/* The list scrolls itself on narrow screens instead of widening the page. */}
            <Tabs.List overflowX="auto">
              {TABS.map((t) => (
                <Tabs.Trigger key={t} value={t} flexShrink="0">
                  {t}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs.Root>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
            {STATS.map((s) => (
              <Card.Root key={s.label} size="sm">
                <Card.Body>
                  <Stat.Root>
                    <Stat.Label>{s.label}</Stat.Label>
                    <Stat.ValueText>{s.value}</Stat.ValueText>
                    <Stat.HelpText>
                      {TREND[s.delta] === "up" && <Stat.UpIndicator />}
                      {TREND[s.delta] === "down" && <Stat.DownIndicator />}
                      {s.delta}
                    </Stat.HelpText>
                  </Stat.Root>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>

          <Grid templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 3fr) minmax(0, 2fr)" }} gap="8">
            <SettingsForm />
            <Stack gap="8">
              <Stack gap="3">
                {ALERTS.map((a) => (
                  <Alert.Root key={a.status} status={ALERT[a.status]}>
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>{a.title}</Alert.Title>
                      <Alert.Description>{a.body}</Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                ))}
              </Stack>

              <Stack gap="3">
                <Heading as="h2" size="md">
                  Actions
                </Heading>
                {/* Variants step down in emphasis: solid, subtle, outline, ghost. Danger is the red palette. */}
                <Wrap gap="3">
                  <Button variant="solid">{ACTIONS.primary}</Button>
                  <Button variant="subtle">{ACTIONS.secondary}</Button>
                  <Button variant="outline">{ACTIONS.tertiary}</Button>
                  <Button variant="ghost">{ACTIONS.ghost}</Button>
                  <Button variant="solid" colorPalette="red">
                    {ACTIONS.danger}
                  </Button>
                  <Button variant="solid" disabled>
                    {ACTIONS.disabled}
                  </Button>
                </Wrap>
              </Stack>

              <Stack gap="2">
                <Heading as="h2" size="md">
                  {TEXT.heading}
                </Heading>
                <Text color="fg">{TEXT.primary}</Text>
                <Text color="fg.muted">{TEXT.secondary}</Text>
                <Text color="fg.subtle">{TEXT.disabled}</Text>
                <Link href="#" variant="underline" colorPalette="blue" alignSelf="start">
                  {TEXT.link}
                </Link>
              </Stack>
            </Stack>
          </Grid>

          <Stack gap="3">
            <Stack gap="1">
              <Heading as="h2" size="lg">
                Purchase orders
              </Heading>
              <Text color="fg.muted" textStyle="sm">
                Open orders for this collection.
              </Text>
            </Stack>
            <Table.ScrollArea borderWidth="1px" borderColor="border" rounded="md">
              <Table.Root size="sm" interactive minW="xl">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Order</Table.ColumnHeader>
                    <Table.ColumnHeader>Style</Table.ColumnHeader>
                    <Table.ColumnHeader>Supplier</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">Units</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {ORDERS.map((o) => (
                    <Table.Row key={o.po}>
                      <Table.Cell fontWeight="medium">{o.po}</Table.Cell>
                      <Table.Cell>{o.style}</Table.Cell>
                      <Table.Cell>{o.supplier}</Table.Cell>
                      <Table.Cell textAlign="end">{o.units}</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={PALETTE[o.status]}>{o.label}</Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

mountNative(
  "chakra",
  () => (
    <ChakraProvider value={defaultSystem}>
      <Page />
    </ChakraProvider>
  ),
  {
    onMode: (m) => {
      document.documentElement.classList.toggle("dark", m === "dark")
      document.documentElement.classList.toggle("light", m === "light")
    },
  },
)
