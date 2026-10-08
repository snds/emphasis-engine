// Native page: IBM Carbon. Built the Carbon way: UI shell header, 16-column
// grid, productive type, square corners, right-aligned button set with the
// primary action last, low-contrast inline notifications, DataTable with tags.
// Themes are zone classes on <html>: white for light, g100 for dark. The shell
// header stays in the page's zone; a g100 zone inside a light page would be
// re-themed by the solved values anyway (see docs/systems/carbon.md).
import "@carbon/styles/css/styles.css"
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonSet,
  Checkbox,
  Column,
  DataTable,
  Grid,
  Header,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderMenuItem,
  HeaderName,
  HeaderNavigation,
  InlineNotification,
  Link,
  RadioButton,
  RadioButtonGroup,
  Select,
  SelectItem,
  Stack,
  Tab,
  TabList,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  TextInput,
  Tile,
  Toggle,
} from "@carbon/react"
import { Notification, UserAvatar } from "@carbon/icons-react"
import { mountNative } from "./kit"
import {
  ACTIONS,
  ALERTS,
  APP,
  FORM,
  ORDERS,
  PAGE,
  STATS,
  TABS,
  TEXT,
  type Status,
} from "./scene"

// Carbon's tag colors are hue names; status meaning maps onto them by convention.
const TAG: Record<Status, "green" | "blue" | "warm-gray" | "red"> = {
  success: "green",
  info: "blue",
  warning: "warm-gray",
  danger: "red",
}
const KIND: Record<Status, "success" | "info" | "warning" | "error"> = {
  success: "success",
  info: "info",
  warning: "warning",
  danger: "error",
}

function Page() {
  // Carbon stacks a button set on small breakpoints rather than squeezing two full-width buttons.
  const narrow = matchMedia("(max-width: 671px)").matches
  const headers = [
    { key: "po", header: "Order" },
    { key: "style", header: "Style" },
    { key: "supplier", header: "Supplier" },
    { key: "units", header: "Units" },
    { key: "status", header: "Status" },
  ]
  const rows = ORDERS.map((o) => ({ id: o.po, ...o }))
  return (
    <>
      <Header aria-label={APP.product}>
        <HeaderName href="#" prefix="">
          {APP.product}
        </HeaderName>
        <HeaderNavigation aria-label={APP.product}>
          {APP.nav.map((n) => (
            <HeaderMenuItem key={n} href="#" isActive={n === APP.activeNav}>
              {n}
            </HeaderMenuItem>
          ))}
        </HeaderNavigation>
        <HeaderGlobalBar>
          <HeaderGlobalAction aria-label="Notifications">
            <Notification size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label={APP.user.name} tooltipAlignment="end">
            <UserAvatar size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>
      <main style={{ paddingTop: "3rem", background: "var(--cds-background)" }}>
        <Grid style={{ paddingBlock: "2rem" }}>
          <Column sm={4} md={8} lg={16} style={{ marginBottom: "2rem" }}>
            <Stack gap={5}>
              <Breadcrumb noTrailingSlash>
                {APP.breadcrumb.map((b, i) => (
                  <BreadcrumbItem
                    key={b}
                    href="#"
                    isCurrentPage={i === APP.breadcrumb.length - 1}
                  >
                    {b}
                  </BreadcrumbItem>
                ))}
              </Breadcrumb>
              <div>
                <h1
                  className="cds--type-productive-heading-05"
                  style={{ color: "var(--cds-text-primary)" }}
                >
                  {PAGE.title}
                </h1>
                <p
                  className="cds--type-body-01"
                  style={{
                    color: "var(--cds-text-secondary)",
                    marginTop: "0.5rem",
                  }}
                >
                  {PAGE.description}
                </p>
              </div>
              {/* Carbon's tab list scrolls itself; the wrapper keeps its off-screen tabs from widening the page. */}
              <div style={{ overflow: "hidden" }}>
                <Tabs>
                  <TabList aria-label="Settings sections">
                    {TABS.map((t) => (
                      <Tab key={t}>{t}</Tab>
                    ))}
                  </TabList>
                </Tabs>
              </div>
            </Stack>
          </Column>

          {STATS.map((s) => (
            <Column
              key={s.label}
              sm={4}
              md={8}
              lg={4}
              style={{ marginBottom: "1rem" }}
            >
              <Tile>
                <p
                  className="cds--type-label-01"
                  style={{ color: "var(--cds-text-secondary)" }}
                >
                  {s.label}
                </p>
                <p
                  className="cds--type-productive-heading-04"
                  style={{ color: "var(--cds-text-primary)" }}
                >
                  {s.value}
                </p>
                <p
                  className="cds--type-helper-text-01"
                  style={{ color: "var(--cds-text-helper)" }}
                >
                  {s.delta}
                </p>
              </Tile>
            </Column>
          ))}
          <Column sm={0} md={0} lg={4} />

          <Column sm={4} md={8} lg={8} style={{ marginBottom: "2rem" }}>
            <Tile>
              <Stack gap={6}>
                <h2
                  className="cds--type-productive-heading-03"
                  style={{ color: "var(--cds-text-primary)" }}
                >
                  General
                </h2>
                <TextInput
                  id="name"
                  labelText={FORM.name.label}
                  defaultValue={FORM.name.value}
                />
                <TextInput
                  id="email"
                  labelText={FORM.email.label}
                  placeholder={FORM.email.placeholder}
                  helperText={FORM.email.help}
                />
                <TextInput
                  id="code"
                  labelText={FORM.code.label}
                  defaultValue={FORM.code.value}
                  invalid
                  invalidText={FORM.code.error}
                />
                <Select
                  id="region"
                  labelText={FORM.region.label}
                  defaultValue={FORM.region.value}
                >
                  {FORM.region.options.map((o) => (
                    <SelectItem key={o} value={o} text={o} />
                  ))}
                </Select>
                <Toggle
                  id="sync"
                  labelText={FORM.sync.label}
                  labelA="Off"
                  labelB="On"
                  defaultToggled={FORM.sync.checked}
                />
                <Checkbox
                  id="summary"
                  labelText={FORM.summary.label}
                  defaultChecked={FORM.summary.checked}
                />
                <RadioButtonGroup
                  legendText={FORM.visibility.label}
                  name="visibility"
                  defaultSelected={FORM.visibility.value}
                >
                  {FORM.visibility.options.map((o) => (
                    <RadioButton
                      key={o.value}
                      id={`vis-${o.value}`}
                      labelText={o.label}
                      value={o.value}
                    />
                  ))}
                </RadioButtonGroup>
              </Stack>
            </Tile>
            {/* Carbon: buttons fill the bottom edge of the container, secondary left, primary right. */}
            <ButtonSet stacked={narrow}>
              <Button kind="secondary">{ACTIONS.ghost}</Button>
              <Button kind="primary">{ACTIONS.primary}</Button>
            </ButtonSet>
          </Column>

          <Column sm={4} md={8} lg={8} style={{ marginBottom: "2rem" }}>
            <Stack gap={3}>
              {ALERTS.map((a) => (
                <InlineNotification
                  key={a.status}
                  kind={KIND[a.status]}
                  title={a.title}
                  subtitle={a.body}
                  lowContrast
                  hideCloseButton
                />
              ))}
            </Stack>
            <div style={{ marginTop: "2rem" }}>
              <h2
                className="cds--type-productive-heading-03"
                style={{
                  color: "var(--cds-text-primary)",
                  marginBottom: "1rem",
                }}
              >
                Actions
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <Button kind="primary">{ACTIONS.primary}</Button>
                <Button kind="secondary">{ACTIONS.secondary}</Button>
                <Button kind="tertiary">{ACTIONS.tertiary}</Button>
                <Button kind="ghost">{ACTIONS.ghost}</Button>
                <Button kind="danger">{ACTIONS.danger}</Button>
                <Button kind="primary" disabled>
                  {ACTIONS.disabled}
                </Button>
              </div>
            </div>
            <div style={{ marginTop: "2rem" }}>
              <h2
                className="cds--type-productive-heading-03"
                style={{
                  color: "var(--cds-text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                {TEXT.heading}
              </h2>
              <p
                className="cds--type-body-01"
                style={{ color: "var(--cds-text-primary)" }}
              >
                {TEXT.primary}
              </p>
              <p
                className="cds--type-body-01"
                style={{ color: "var(--cds-text-secondary)" }}
              >
                {TEXT.secondary}
              </p>
              <p
                className="cds--type-body-01"
                style={{ color: "var(--cds-text-disabled)" }}
              >
                {TEXT.disabled}
              </p>
              <Link href="#">{TEXT.link}</Link>
            </div>
          </Column>

          <Column sm={4} md={8} lg={16}>
            <DataTable rows={rows} headers={headers}>
              {({
                rows,
                headers,
                getTableProps,
                getHeaderProps,
                getRowProps,
              }) => (
                <TableContainer
                  title="Purchase orders"
                  description="Open orders for this collection."
                >
                  {/* Narrow screens scroll the table sideways inside its container, not the page. */}
                  <div style={{ overflowX: "auto" }}>
                    <Table {...getTableProps()}>
                      <TableHead>
                        <TableRow>
                          {headers.map((h) => {
                            const { key, ...props } = getHeaderProps({
                              header: h,
                            })
                            return (
                              <TableHeader key={key} {...props}>
                                {h.header}
                              </TableHeader>
                            )
                          })}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((r) => {
                          const o = ORDERS.find((x) => x.po === r.id)!
                          const { key, ...props } = getRowProps({ row: r })
                          return (
                            <TableRow key={key} {...props}>
                              <TableCell>{o.po}</TableCell>
                              <TableCell>{o.style}</TableCell>
                              <TableCell>{o.supplier}</TableCell>
                              <TableCell>{o.units}</TableCell>
                              <TableCell>
                                <Tag type={TAG[o.status]} size="sm">
                                  {o.label}
                                </Tag>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </TableContainer>
              )}
            </DataTable>
          </Column>
        </Grid>
      </main>
    </>
  )
}

mountNative("carbon", () => <Page />, {
  onMode: (m) => {
    document.documentElement.className =
      m === "dark" ? "cds--g100" : "cds--white"
  },
})
