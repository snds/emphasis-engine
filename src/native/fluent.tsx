// Native page: Microsoft Fluent 2 (React v9). Built the Fluent way: a light
// app bar, Fluent's 4px spacing ramp and type ramp (Title/Subtitle/Body/
// Caption), Cards on a neutral background-2 canvas, Fields that carry label,
// hint and validation, one primary button placed first in its group, tint
// Badges for status, MessageBars for the four intents.
// Tokens are CSS variables that FluentProvider writes on its own root div;
// light/dark is the theme object handed to the provider.
// Fluent has no danger button appearance: destructive actions are neutral
// buttons that open a confirmation dialog, so "Delete workspace" is a
// secondary button with a delete icon.
import {
  Avatar,
  Badge,
  Body1,
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
  Button,
  Caption1,
  Card,
  CardHeader,
  Checkbox,
  Field,
  FluentProvider,
  Input,
  Link,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Radio,
  RadioGroup,
  Select,
  Subtitle1,
  Subtitle2,
  Switch,
  Tab,
  TabList,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  Title1,
  Title2,
  makeStyles,
  tokens,
  webDarkTheme,
  webLightTheme,
  type BadgeProps,
  type MessageBarIntent,
} from "@fluentui/react-components"
import { Alert20Regular, Delete20Regular } from "@fluentui/react-icons"
import { mountNative } from "./kit"
import { ACTIONS, ALERTS, APP, FORM, ORDERS, PAGE, STATS, TABS, TEXT, type Status } from "./scene"

const BADGE: Record<Status, BadgeProps["color"]> = {
  success: "success",
  info: "informative",
  warning: "warning",
  danger: "danger",
}
const INTENT: Record<Status, MessageBarIntent> = {
  success: "success",
  info: "info",
  warning: "warning",
  danger: "error",
}

// Fluent styles with Griffel (makeStyles) and its token object, not literal values.
const useStyles = makeStyles({
  canvas: {
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground1,
  },
  bar: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalL,
    paddingInline: tokens.spacingHorizontalL,
    height: "48px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
  product: { whiteSpace: "nowrap" },
  nav: {
    flex: 1,
    minWidth: 0,
    overflowX: "auto",
    scrollbarWidth: "none",
  },
  barEnd: { display: "flex", alignItems: "center", gap: tokens.spacingHorizontalS },
  main: {
    maxWidth: "1200px",
    marginInline: "auto",
    paddingBlock: tokens.spacingVerticalXXL,
    paddingInline: tokens.spacingHorizontalXXL,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXL,
    "@media (max-width: 639px)": { paddingInline: tokens.spacingHorizontalL },
  },
  head: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalS },
  // Title components rendered as h1/h2 keep the browser's heading margins; Fluent's ramp sets none.
  heading: { margin: 0 },
  secondary: { color: tokens.colorNeutralForeground2 },
  disabled: { color: tokens.colorNeutralForegroundDisabled },
  tabs: { overflowX: "auto", scrollbarWidth: "none" },
  stats: {
    display: "grid",
    gap: tokens.spacingHorizontalL,
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  },
  stat: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalXS },
  columns: {
    display: "grid",
    gap: tokens.spacingHorizontalXL,
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    alignItems: "start",
    "@media (max-width: 899px)": { gridTemplateColumns: "minmax(0, 1fr)" },
  },
  form: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalL },
  stack: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalM },
  buttons: { display: "flex", flexWrap: "wrap", gap: tokens.spacingHorizontalS },
  tableWrap: { overflowX: "auto" },
  table: { minWidth: "560px" },
})

function Page() {
  const s = useStyles()
  return (
    <div className={s.canvas}>
      {/* App bar: Fluent ships no app-header component; this is its tokens, TabList, Button and Avatar. */}
      <header className={s.bar}>
        <Subtitle2 className={s.product}>{APP.product}</Subtitle2>
        <nav className={s.nav} aria-label={APP.product}>
          <TabList size="small" defaultSelectedValue={APP.activeNav}>
            {APP.nav.map((n) => (
              <Tab key={n} value={n}>
                {n}
              </Tab>
            ))}
          </TabList>
        </nav>
        <div className={s.barEnd}>
          <Button appearance="subtle" icon={<Alert20Regular />} aria-label="Notifications" />
          <Avatar name={APP.user.name} initials={APP.user.initials} size={32} />
        </div>
      </header>

      <main className={s.main}>
        <div className={s.head}>
          <Breadcrumb aria-label="Breadcrumb">
            {APP.breadcrumb.map((b, i) => {
              const last = i === APP.breadcrumb.length - 1
              return [
                <BreadcrumbItem key={b}>
                  <BreadcrumbButton href={last ? undefined : "#"} current={last}>
                    {b}
                  </BreadcrumbButton>
                </BreadcrumbItem>,
                last ? null : <BreadcrumbDivider key={`${b}-d`} />,
              ]
            })}
          </Breadcrumb>
          <Title1 as="h1" className={s.heading}>{PAGE.title}</Title1>
          <Body1 className={s.secondary}>{PAGE.description}</Body1>
        </div>

        <div className={s.tabs}>
          <TabList defaultSelectedValue={TABS[0]} aria-label="Settings sections">
            {TABS.map((t) => (
              <Tab key={t} value={t}>
                {t}
              </Tab>
            ))}
          </TabList>
        </div>

        <div className={s.stats}>
          {STATS.map((st) => (
            <Card key={st.label}>
              <div className={s.stat}>
                <Caption1 className={s.secondary}>{st.label}</Caption1>
                <Title2>{st.value}</Title2>
                <Caption1 className={s.secondary}>{st.delta}</Caption1>
              </div>
            </Card>
          ))}
        </div>

        <div className={s.columns}>
          <Card>
            <CardHeader header={<Subtitle1 as="h2" className={s.heading}>General</Subtitle1>} />
            <div className={s.form}>
              <Field label={FORM.name.label}>
                <Input defaultValue={FORM.name.value} />
              </Field>
              <Field label={FORM.email.label} hint={FORM.email.help}>
                <Input type="email" placeholder={FORM.email.placeholder} />
              </Field>
              <Field label={FORM.code.label} validationState="error" validationMessage={FORM.code.error}>
                <Input defaultValue={FORM.code.value} />
              </Field>
              <Field label={FORM.region.label}>
                <Select defaultValue={FORM.region.value}>
                  {FORM.region.options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </Select>
              </Field>
              <Field hint={FORM.sync.help}>
                <Switch label={FORM.sync.label} defaultChecked={FORM.sync.checked} />
              </Field>
              <Checkbox label={FORM.summary.label} defaultChecked={FORM.summary.checked} />
              <Field label={FORM.visibility.label}>
                <RadioGroup defaultValue={FORM.visibility.value}>
                  {FORM.visibility.options.map((o) => (
                    <Radio key={o.value} value={o.value} label={o.label} />
                  ))}
                </RadioGroup>
              </Field>
              {/* Fluent: the primary action leads the group (left in LTR). */}
              <div className={s.buttons}>
                <Button appearance="primary">{ACTIONS.primary}</Button>
                <Button>{ACTIONS.ghost}</Button>
              </div>
            </div>
          </Card>

          <div className={s.stack}>
            {ALERTS.map((a) => (
              <MessageBar key={a.status} intent={INTENT[a.status]} layout="multiline">
                <MessageBarBody>
                  <MessageBarTitle>{a.title}</MessageBarTitle>
                  {a.body}
                </MessageBarBody>
              </MessageBar>
            ))}

            <Card>
              <CardHeader header={<Subtitle1 as="h2" className={s.heading}>Actions</Subtitle1>} />
              <div className={s.buttons}>
                <Button appearance="primary">{ACTIONS.primary}</Button>
                <Button appearance="secondary">{ACTIONS.secondary}</Button>
                <Button appearance="outline">{ACTIONS.tertiary}</Button>
                <Button appearance="subtle">{ACTIONS.ghost}</Button>
                <Button appearance="secondary" icon={<Delete20Regular />}>
                  {ACTIONS.danger}
                </Button>
                <Button appearance="primary" disabled>
                  {ACTIONS.disabled}
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader header={<Subtitle1 as="h2" className={s.heading}>{TEXT.heading}</Subtitle1>} />
              <div className={s.stat}>
                <Body1>{TEXT.primary}</Body1>
                <Body1 className={s.secondary}>{TEXT.secondary}</Body1>
                <Body1 className={s.disabled}>{TEXT.disabled}</Body1>
                <Link href="#">{TEXT.link}</Link>
              </div>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader
            header={<Subtitle1 as="h2" className={s.heading}>Purchase orders</Subtitle1>}
            description={<Caption1 className={s.secondary}>Open orders for this collection.</Caption1>}
          />
          <div className={s.tableWrap}>
            <Table aria-label="Purchase orders" className={s.table}>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Order</TableHeaderCell>
                  <TableHeaderCell>Style</TableHeaderCell>
                  <TableHeaderCell>Supplier</TableHeaderCell>
                  <TableHeaderCell>Units</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ORDERS.map((o) => (
                  <TableRow key={o.po}>
                    <TableCell>
                      <Text weight="semibold">{o.po}</Text>
                    </TableCell>
                    <TableCell>{o.style}</TableCell>
                    <TableCell>{o.supplier}</TableCell>
                    <TableCell>{o.units}</TableCell>
                    <TableCell>
                      <Badge appearance="tint" color={BADGE[o.status]}>
                        {o.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
    </div>
  )
}

// The document's default 8px body margin would frame the provider in white.
document.body.style.margin = "0"

mountNative(
  "fluent",
  (mode) => (
    <FluentProvider theme={mode === "dark" ? webDarkTheme : webLightTheme}>
      <Page />
    </FluentProvider>
  ),
  { scopes: () => Array.from(document.querySelectorAll(".fui-FluentProvider")) },
)
