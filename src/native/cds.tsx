// Native page: Coinbase Design System (@coinbase/cds-web). Built the CDS way:
// layout from Box/VStack/HStack/Grid with theme spacing, type from the Text*
// components, color only through palette props (color="fgMuted",
// background="bgAlternate"). The ThemeProvider writes every --color-* variable
// inline on its own root div, so that div is a scope the kit overrides.
// CDS has no breadcrumb and no success banner; see docs/systems/cds.md for
// what was composed or substituted.
import "@coinbase/cds-web/globalStyles"
import "@coinbase/cds-web/defaultFontStyles"
import "@coinbase/cds-icons/fonts/web/icon-font.css"
import { useState } from "react"
import { Select } from "@coinbase/cds-web/alpha/select"
import { Banner } from "@coinbase/cds-web/banner"
import { Button, IconButton } from "@coinbase/cds-web/buttons"
import { ContentCard, ContentCardBody, ContentCardHeader } from "@coinbase/cds-web/cards"
import { Checkbox, RadioGroup, Switch, TextInput } from "@coinbase/cds-web/controls"
import { Box, Divider, HStack, VStack } from "@coinbase/cds-web/layout"
import { Avatar } from "@coinbase/cds-web/media"
import { NavigationBar, NavLink } from "@coinbase/cds-web/navigation"
import { SectionHeader } from "@coinbase/cds-web/section-header"
import { ThemeProvider } from "@coinbase/cds-web/system"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@coinbase/cds-web/tables"
import { Tabs } from "@coinbase/cds-web/tabs"
import { Tag } from "@coinbase/cds-web/tag"
import { defaultTheme } from "@coinbase/cds-web/themes/defaultTheme"
import { Link, TextBody, TextHeadline, TextLabel1, TextLabel2, TextTitle1, TextTitle2 } from "@coinbase/cds-web/typography"
import { mountNative } from "./kit"
import { ACTIONS, ALERTS, APP, FORM, ORDERS, PAGE, STATS, TABS, TEXT, type Status } from "./scene"

// Tag hues by status. CDS tags carry status by color scheme at low emphasis.
const TAG: Record<Status, "green" | "blue" | "yellow" | "red"> = {
  success: "green",
  info: "blue",
  warning: "yellow",
  danger: "red",
}
// Banner has informational, warning, error (and promotional, which is brand).
// There is no positive banner: success uses informational with the positive icon color.
const BANNER: Record<Status, { variant: "informational" | "warning" | "error"; icon: "circleCheckmark" | "info" | "warning" | "error"; iconColor?: "fgPositive" }> = {
  success: { variant: "informational", icon: "circleCheckmark", iconColor: "fgPositive" },
  info: { variant: "informational", icon: "info" },
  warning: { variant: "warning", icon: "warning" },
  danger: { variant: "error", icon: "error" },
}

function Header() {
  return (
    <NavigationBar
      background="bg"
      borderedBottom
      paddingX={3}
      accessibilityLabel={APP.product}
      start={<TextHeadline as="span">{APP.product}</TextHeadline>}
      end={
        <HStack gap={1} alignItems="center">
          <IconButton name="bell" accessibilityLabel="Notifications" transparent />
          <Avatar name={APP.user.name} alt={APP.user.name} size="l" />
        </HStack>
      }
    >
      {/* Primary nav links: hidden on phones, where the page title carries the context. */}
      <HStack as="ul" gap={3} alignItems="center" display={{ base: "flex", phone: "none" }} style={{ listStyle: "none" }}>
        {APP.nav.map((n) => (
          <li key={n}>
            <NavLink href="#" active={n === APP.activeNav}>
              {n}
            </NavLink>
          </li>
        ))}
      </HStack>
    </NavigationBar>
  )
}

// No Breadcrumb in CDS: composed from Link and TextLabel2 with a muted separator.
function Breadcrumb() {
  return (
    <HStack as="nav" aria-label="Breadcrumb" gap={1} alignItems="center" flexWrap="wrap">
      {APP.breadcrumb.map((b, i) => {
        const last = i === APP.breadcrumb.length - 1
        return (
          <HStack key={b} gap={1} alignItems="center">
            {last ? (
              <TextLabel2 as="span" color="fg" aria-current="page">
                {b}
              </TextLabel2>
            ) : (
              <>
                <Link href="#" font="label2">
                  {b}
                </Link>
                <TextLabel2 as="span" color="fgMuted" aria-hidden>
                  /
                </TextLabel2>
              </>
            )}
          </HStack>
        )
      })}
    </HStack>
  )
}

function SettingsForm() {
  const [region, setRegion] = useState<string | null>(FORM.region.value)
  const [regionOpen, setRegionOpen] = useState(false)
  const [sync, setSync] = useState(FORM.sync.checked)
  const [summary, setSummary] = useState(FORM.summary.checked)
  const [visibility, setVisibility] = useState(FORM.visibility.value)
  return (
    <Box bordered borderRadius={400} padding={3} background="bg" as="section">
      <VStack gap={3}>
        <SectionHeader title="General" description="Name, contact, and sharing for this workspace." paddingX={0} paddingY={0} />
        <TextInput label={FORM.name.label} defaultValue={FORM.name.value} />
        <TextInput label={FORM.email.label} placeholder={FORM.email.placeholder} helperText={FORM.email.help} type="email" />
        <TextInput label={FORM.code.label} defaultValue={FORM.code.value} variant="negative" helperText={FORM.code.error} />
        <Select
          label={FORM.region.label}
          value={region}
          onChange={setRegion}
          open={regionOpen}
          setOpen={setRegionOpen}
          options={FORM.region.options.map((o) => ({ value: o, label: o }))}
        />
        <VStack gap={0.5}>
          <Switch checked={sync} onChange={() => setSync((s) => !s)}>
            {FORM.sync.label}
          </Switch>
          <TextLabel2 as="p" color="fgMuted">
            {FORM.sync.help}
          </TextLabel2>
        </VStack>
        <Checkbox checked={summary} onChange={() => setSummary((s) => !s)}>
          {FORM.summary.label}
        </Checkbox>
        <RadioGroup
          name="visibility"
          label={<TextHeadline as="span">{FORM.visibility.label}</TextHeadline>}
          value={visibility}
          onChange={(v) => setVisibility(v ?? visibility)}
          options={Object.fromEntries(FORM.visibility.options.map((o) => [o.value, o.label]))}
        />
        <Divider />
        {/* CDS dialogs and forms: right-aligned, transparent secondary Cancel beside the one primary action. */}
        <HStack gap={1} justifyContent="flex-end" flexWrap="wrap">
          <Button variant="secondary" transparent>
            {ACTIONS.ghost}
          </Button>
          <Button variant="primary">{ACTIONS.primary}</Button>
        </HStack>
      </VStack>
    </Box>
  )
}

function Page() {
  const tabs = TABS.map((t) => ({ id: t, label: t }))
  const [tab, setTab] = useState<(typeof tabs)[number] | null>(tabs[0])
  return (
    <Box background="bg" display="block">
      <Header />
      <Box as="main" display="block" paddingX={{ base: 4, phone: 2 }} paddingY={4} maxWidth={1280} style={{ marginInline: "auto" }}>
        <VStack gap={4}>
          <VStack gap={2}>
            <Breadcrumb />
            <VStack gap={1}>
              <TextTitle1 as="h1">{PAGE.title}</TextTitle1>
              <TextBody as="p" color="fgMuted">
                {PAGE.description}
              </TextBody>
            </VStack>
            {/* Tabs lays out its own row; the wrapper scrolls it on phones instead of widening the page. */}
            <Box overflow="auto" borderedBottom>
              <Tabs tabs={tabs} activeTab={tab} onChange={setTab} accessibilityLabel="Settings sections" gap={3} />
            </Box>
          </VStack>

          <Box display="grid" gap={2} gridTemplateColumns={{ base: "repeat(3, minmax(0, 1fr))", phone: "minmax(0, 1fr)" }}>
            {STATS.map((s) => (
              <ContentCard key={s.label} bordered background="bgAlternate" minWidth={0} maxWidth="none">
                <ContentCardHeader title={<TextLabel1 as="h3" color="fgMuted">{s.label}</TextLabel1>} />
                <ContentCardBody>
                  <VStack gap={0.5}>
                    <TextTitle2 as="p" tabularNumbers>
                      {s.value}
                    </TextTitle2>
                    <TextLabel2 as="p" color="fgMuted">
                      {s.delta}
                    </TextLabel2>
                  </VStack>
                </ContentCardBody>
              </ContentCard>
            ))}
          </Box>

          <Box display="grid" gap={4} alignItems="start" gridTemplateColumns={{ base: "minmax(0, 5fr) minmax(0, 7fr)", tablet: "minmax(0, 1fr)", phone: "minmax(0, 1fr)" }}>
            <SettingsForm />
            <VStack gap={4}>
              <VStack gap={2} as="section">
                <SectionHeader title="Status" paddingX={0} paddingY={0} />
                {ALERTS.map((a) => (
                  <Banner
                    key={a.status}
                    variant={BANNER[a.status].variant}
                    styleVariant="inline"
                    startIcon={BANNER[a.status].icon}
                    startIconColor={BANNER[a.status].iconColor}
                    startIconActive
                    title={a.title}
                    showDismiss={false}
                    borderRadius={400}
                  >
                    {a.body}
                  </Banner>
                ))}
              </VStack>

              <VStack gap={2} as="section">
                <SectionHeader title="Actions" paddingX={0} paddingY={0} />
                <HStack gap={1} flexWrap="wrap">
                  <Button variant="primary">{ACTIONS.primary}</Button>
                  <Button variant="secondary">{ACTIONS.secondary}</Button>
                  <Button variant="tertiary">{ACTIONS.tertiary}</Button>
                  <Button variant="secondary" transparent>
                    {ACTIONS.ghost}
                  </Button>
                  <Button variant="negative">{ACTIONS.danger}</Button>
                  <Button variant="primary" disabled>
                    {ACTIONS.disabled}
                  </Button>
                </HStack>
              </VStack>

              <VStack gap={1} as="section">
                <SectionHeader title={TEXT.heading} paddingX={0} paddingY={0} />
                <TextBody as="p" color="fg">
                  {TEXT.primary}
                </TextBody>
                <TextBody as="p" color="fgMuted">
                  {TEXT.secondary}
                </TextBody>
                <TextBody as="p" color="fgMuted" disabled>
                  {TEXT.disabled}
                </TextBody>
                <Link href="#" font="body">
                  {TEXT.link}
                </Link>
              </VStack>
            </VStack>
          </Box>

          <VStack gap={2} as="section">
            <SectionHeader title="Purchase orders" description="Open orders for this collection." paddingX={0} paddingY={0} />
            {/* Wide tables scroll inside their own container on phones. */}
            <Box overflow="auto" bordered borderRadius={400}>
              <Table variant="ruled" cellSpacing={{ outer: { paddingX: 2, paddingY: 1.5 } }}>
                <TableHeader>
                  <TableRow>
                    <TableCell title="Order" />
                    <TableCell title="Style" />
                    <TableCell title="Supplier" />
                    <TableCell title="Units" justifyContent="flex-end" />
                    <TableCell title="Status" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ORDERS.map((o) => (
                    <TableRow key={o.po}>
                      <TableCell title={o.po} />
                      <TableCell title={o.style} />
                      <TableCell title={o.supplier} />
                      <TableCell title={o.units} justifyContent="flex-end" />
                      <TableCell>
                        <Tag colorScheme={TAG[o.status]} emphasis="low">
                          {o.label}
                        </Tag>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </VStack>
        </VStack>
      </Box>
    </Box>
  )
}

mountNative(
  "cds",
  (m) => (
    <ThemeProvider theme={defaultTheme} activeColorScheme={m}>
      <Page />
    </ThemeProvider>
  ),
  { scopes: () => Array.from(document.querySelectorAll(`.${defaultTheme.id}`)) },
)
