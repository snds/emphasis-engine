// Native page: Atlassian Design System. Built the Atlassian way: primitives
// (Box, Stack, Inline, Text, Pressable, Anchor) on the 8px space scale,
// design tokens for every color, one primary button per area with the group
// left-aligned and the primary first (single-page form), danger appearance
// for the destructive action, semantic lozenge colors for workflow status,
// section-message colors for the four alerts.
// Tokens load through setGlobalTheme onto <html> (data-color-mode + a
// <style> per theme), so there is no provider div to scope.
//
// Only some @atlaskit packages are installed here: button, textfield,
// toggle, checkbox, icon, primitives, tokens. Tabs, breadcrumbs, heading,
// select, radio, form, section message, lozenge, dynamic table, avatar and
// the navigation shell are not, so those pieces are composed from
// primitives and the tokens those components use. See docs/systems/atlassian.md.
import Button from "@atlaskit/button/default/button"
import IconButton from "@atlaskit/button/icon/button"
import Checkbox from "@atlaskit/checkbox"
import MenuGlyph from "@atlaskit/icon/core/menu"
import NotificationGlyph from "@atlaskit/icon/core/notification"
import PersonAvatarGlyph from "@atlaskit/icon/core/person-avatar"
import StatusErrorGlyph from "@atlaskit/icon/core/status-error"
import StatusInformationGlyph from "@atlaskit/icon/core/status-information"
import StatusSuccessGlyph from "@atlaskit/icon/core/status-success"
import StatusWarningGlyph from "@atlaskit/icon/core/status-warning"
import { Anchor, Box, Inline, Pressable, Stack, Text, media, xcss } from "@atlaskit/primitives"
import Textfield from "@atlaskit/textfield"
import Toggle from "@atlaskit/toggle"
import { token } from "@atlaskit/tokens"
import { setGlobalTheme } from "@atlaskit/tokens/dist/esm/set-global-theme"
import { useState, type ComponentType, type CSSProperties, type ReactNode } from "react"
import { mountNative } from "./kit"
import { ACTIONS, ALERTS, APP, FORM, ORDERS, PAGE, STATS, TABS, TEXT, type Status } from "./scene"

// @atlaskit/icon ships its glyphs as CommonJS only; Vite's interop can hand back
// the module object ({ default: Icon }) instead of the component. Unwrap it.
const glyph = <T,>(m: T): T => ((m as { default?: T }).default ?? m)
const MenuIcon = glyph(MenuGlyph)
const NotificationIcon = glyph(NotificationGlyph)
const PersonAvatarIcon = glyph(PersonAvatarGlyph)
const StatusErrorIcon = glyph(StatusErrorGlyph)
const StatusInformationIcon = glyph(StatusInformationGlyph)
const StatusSuccessIcon = glyph(StatusSuccessGlyph)
const StatusWarningIcon = glyph(StatusWarningGlyph)

// Status → the semantic token family. Lozenge names: success, inprogress, moved, removed.
const TONE = {
  success: { bg: "color.background.success", text: "color.text.success", icon: "color.icon.success", Icon: StatusSuccessIcon },
  info: { bg: "color.background.information", text: "color.text.information", icon: "color.icon.information", Icon: StatusInformationIcon },
  warning: { bg: "color.background.warning", text: "color.text.warning", icon: "color.icon.warning", Icon: StatusWarningIcon },
  danger: { bg: "color.background.danger", text: "color.text.danger", icon: "color.icon.danger", Icon: StatusErrorIcon },
} as const satisfies Record<Status, { bg: string; text: string; icon: string; Icon: ComponentType<never> }>

const styles = {
  bar: xcss({
    display: "flex",
    alignItems: "center",
    gap: "space.200",
    paddingInline: "space.200",
    height: "3.5rem",
    borderBottomWidth: "border.width",
    borderBottomStyle: "solid",
    borderBottomColor: "color.border",
  }),
  menu: xcss({ [media.above.sm]: { display: "none" } }),
  nav: xcss({ flexGrow: 1, minWidth: "0", overflowX: "auto", display: "none", [media.above.sm]: { display: "block" } }),
  main: xcss({
    maxWidth: "1200px",
    marginInline: "auto",
    paddingBlock: "space.400",
    paddingInline: "space.200",
    [media.above.sm]: { paddingInline: "space.400" },
  }),
  // The track is an inset shadow so the scroll container doesn't clip the selected tab's line.
  tabs: xcss({ overflowX: "auto" }),
  tab: xcss({
    paddingBlock: "space.100",
    paddingInline: "space.100",
    color: "color.text.subtle",
    backgroundColor: "color.background.neutral.subtle",
    whiteSpace: "nowrap",
    ":hover": { color: "color.text" },
  }),
  tabSelected: xcss({ color: "color.text.selected", ":hover": { color: "color.text.selected" } }),
  stats: xcss({ display: "grid", gap: "space.200", gridTemplateColumns: "1fr", [media.above.sm]: { gridTemplateColumns: "repeat(3, 1fr)" } }),
  card: xcss({ backgroundColor: "elevation.surface.raised", boxShadow: "elevation.shadow.raised", borderRadius: "radius.large", padding: "space.300" }),
  columns: xcss({ display: "grid", gap: "space.300", gridTemplateColumns: "minmax(0, 1fr)", alignItems: "start", [media.above.md]: { gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" } }),
  message: xcss({ borderRadius: "radius.large", padding: "space.200" }),
  lozenge: xcss({ display: "inline-flex", borderRadius: "radius.small", paddingInline: "space.050" }),
  link: xcss({ color: "color.link", textDecoration: "none", ":hover": { color: "color.link", textDecoration: "underline" } }),
  tableWrap: xcss({ overflowX: "auto" }),
}

// Heading package isn't installed: plain headings set in the typography tokens Heading uses.
const heading = (size: "large" | "medium" | "small" | "xsmall"): CSSProperties => ({
  font: token(`font.heading.${size}`),
  color: token("color.text"),
  margin: 0,
})
const label: CSSProperties = { font: token("font.body.small"), fontWeight: token("font.weight.semibold"), color: token("color.text.subtle") }
const helper: CSSProperties = { font: token("font.body.small"), color: token("color.text.subtlest") }
const th: CSSProperties = {
  ...label,
  textAlign: "start",
  padding: `${token("space.050")} ${token("space.100")}`,
  borderBottom: `${token("border.width.selected")} solid ${token("color.border")}`,
}
const td: CSSProperties = {
  font: token("font.body"),
  color: token("color.text"),
  padding: `${token("space.100")} ${token("space.100")}`,
  borderBottom: `${token("border.width")} solid ${token("color.border")}`,
}

function Field({ id, title, children, help, error }: { id: string; title?: string; children: ReactNode; help?: string; error?: string }) {
  return (
    <Stack space="space.050">
      {title && (
        <label htmlFor={id} style={label}>
          {title}
        </label>
      )}
      {children}
      {help && <span style={helper}>{help}</span>}
      {error && (
        <Inline space="space.050" alignBlock="center">
          <StatusErrorIcon label="Error" color={token("color.icon.danger")} size="small" />
          <Text size="small" color="color.text.danger">
            {error}
          </Text>
        </Inline>
      )}
    </Stack>
  )
}

function Lozenge({ status, children }: { status: Status; children: string }) {
  const t = TONE[status]
  return (
    <Box as="span" xcss={styles.lozenge} backgroundColor={t.bg}>
      <Text size="small" weight="bold" color={t.text}>
        {children}
      </Text>
    </Box>
  )
}

function Page() {
  const [tab, setTab] = useState(TABS[0])
  const inputBox: CSSProperties = {
    font: token("font.body"),
    color: token("color.text"),
    backgroundColor: token("color.background.input"),
    border: `${token("border.width")} solid ${token("color.border.input")}`,
    borderRadius: token("radius.medium"),
    padding: `${token("space.075")} ${token("space.075")}`,
    width: "100%",
  }
  return (
    <Box backgroundColor="elevation.surface" style={{ font: token("font.body") }}>
      {/* Navigation shell isn't installed: product name, subtle buttons with isSelected, icon buttons. */}
      <Box as="header" xcss={styles.bar}>
        {/* Below 48rem the nav collapses behind a menu button, as Atlassian's top nav does. */}
        <Box xcss={styles.menu}>
          <IconButton appearance="subtle" icon={MenuIcon} label="Open navigation" />
        </Box>
        <span style={{ ...heading("xsmall"), whiteSpace: "nowrap" }}>{APP.product}</span>
        <Box as="nav" xcss={styles.nav} aria-label={APP.product}>
          <Inline space="space.050">
            {APP.nav.map((n) => (
              <Button key={n} appearance="subtle" isSelected={n === APP.activeNav}>
                {n}
              </Button>
            ))}
          </Inline>
        </Box>
        <Box style={{ marginInlineStart: "auto" }}>
          <Inline space="space.050">
            <IconButton appearance="subtle" icon={NotificationIcon} label="Notifications" />
            <IconButton appearance="subtle" shape="circle" icon={PersonAvatarIcon} label={APP.user.name} />
          </Inline>
        </Box>
      </Box>

      <Box as="main" xcss={styles.main}>
        <Stack space="space.400">
          <Stack space="space.150">
            <Box as="nav" aria-label="Breadcrumbs">
              <Inline space="space.100" separator={<Text color="color.text.subtlest">/</Text>}>
                {APP.breadcrumb.map((b, i) =>
                  i === APP.breadcrumb.length - 1 ? (
                    <Text key={b} color="color.text.subtle" aria-current="page">
                      {b}
                    </Text>
                  ) : (
                    <Anchor key={b} href="#" xcss={styles.link}>
                      {b}
                    </Anchor>
                  ),
                )}
              </Inline>
            </Box>
            <h1 style={heading("large")}>{PAGE.title}</h1>
            <Text as="p" color="color.text.subtle">
              {PAGE.description}
            </Text>
          </Stack>

          <Box xcss={styles.tabs} style={{ boxShadow: `inset 0 -2px 0 ${token("color.border")}` }}>
            <Inline space="space.100" role="tablist" aria-label="Settings sections">
              {TABS.map((t) => (
                <Pressable
                  key={t}
                  role="tab"
                  aria-selected={t === tab}
                  onClick={() => setTab(t)}
                  xcss={[styles.tab, t === tab && styles.tabSelected]}
                  style={t === tab ? { boxShadow: `inset 0 -2px 0 ${token("color.border.selected")}` } : undefined}
                >
                  <Text weight="medium" color="inherit">
                    {t}
                  </Text>
                </Pressable>
              ))}
            </Inline>
          </Box>

          <Box xcss={styles.stats}>
            {STATS.map((s) => (
              <Box key={s.label} xcss={styles.card}>
                <Stack space="space.050">
                  <Text size="small" weight="semibold" color="color.text.subtle">
                    {s.label}
                  </Text>
                  <span style={heading("large")}>{s.value}</span>
                  <Text size="small" color="color.text.subtlest">
                    {s.delta}
                  </Text>
                </Stack>
              </Box>
            ))}
          </Box>

          <Box xcss={styles.columns}>
            <Box xcss={styles.card}>
              <Stack space="space.200">
                <h2 style={heading("medium")}>General</h2>
                <Field id="name" title={FORM.name.label}>
                  <Textfield id="name" defaultValue={FORM.name.value} />
                </Field>
                <Field id="email" title={FORM.email.label} help={FORM.email.help}>
                  <Textfield id="email" type="email" placeholder={FORM.email.placeholder} />
                </Field>
                <Field id="code" title={FORM.code.label} error={FORM.code.error}>
                  <Textfield id="code" defaultValue={FORM.code.value} isInvalid aria-invalid />
                </Field>
                {/* @atlaskit/select isn't installed: a native select in the input tokens. */}
                <Field id="region" title={FORM.region.label}>
                  <select id="region" defaultValue={FORM.region.value} style={inputBox}>
                    {FORM.region.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </Field>
                <Field id="sync" help={FORM.sync.help}>
                  <Inline space="space.050" alignBlock="center">
                    <Toggle id="sync" defaultChecked={FORM.sync.checked} />
                    <label htmlFor="sync">
                      <Text>{FORM.sync.label}</Text>
                    </label>
                  </Inline>
                </Field>
                <Checkbox label={FORM.summary.label} defaultChecked={FORM.summary.checked} />
                {/* @atlaskit/radio isn't installed: native radios with the selected token as accent. */}
                <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                  <legend style={{ ...label, marginBlockEnd: token("space.050") }}>{FORM.visibility.label}</legend>
                  <Stack space="space.050">
                    {FORM.visibility.options.map((o) => (
                      <Inline key={o.value} as="span" space="space.075" alignBlock="center">
                        <input
                          type="radio"
                          id={`vis-${o.value}`}
                          name="visibility"
                          defaultChecked={o.value === FORM.visibility.value}
                          style={{ accentColor: token("color.background.selected.bold"), margin: 0 }}
                        />
                        <label htmlFor={`vis-${o.value}`}>
                          <Text>{o.label}</Text>
                        </label>
                      </Inline>
                    ))}
                  </Stack>
                </fieldset>
                {/* Single-page form: buttons left-aligned, primary first (furthest toward the alignment). */}
                <Inline space="space.100">
                  <Button appearance="primary">{ACTIONS.primary}</Button>
                  <Button appearance="subtle">{ACTIONS.ghost}</Button>
                </Inline>
              </Stack>
            </Box>

            <Stack space="space.300">
              {/* Section message isn't installed: its anatomy (icon, title, body) in the status tokens. */}
              <Stack space="space.100">
                {ALERTS.map((a) => {
                  const t = TONE[a.status]
                  return (
                    <Box key={a.status} xcss={styles.message} backgroundColor={t.bg} role="status">
                      <Inline space="space.150" alignBlock="start">
                        <t.Icon label={a.status} color={token(t.icon)} />
                        <Stack space="space.050">
                          <span style={heading("xsmall")}>{a.title}</span>
                          <Text>{a.body}</Text>
                        </Stack>
                      </Inline>
                    </Box>
                  )
                })}
              </Stack>

              <Box xcss={styles.card}>
                <Stack space="space.200">
                  <h2 style={heading("medium")}>Actions</h2>
                  <Inline space="space.100" shouldWrap>
                    <Button appearance="primary">{ACTIONS.primary}</Button>
                    <Button appearance="default">{ACTIONS.secondary}</Button>
                    <Button appearance="default">{ACTIONS.tertiary}</Button>
                    <Button appearance="subtle">{ACTIONS.ghost}</Button>
                    <Button appearance="danger">{ACTIONS.danger}</Button>
                    <Button appearance="primary" isDisabled>
                      {ACTIONS.disabled}
                    </Button>
                  </Inline>
                </Stack>
              </Box>

              <Box xcss={styles.card}>
                <Stack space="space.100">
                  <h2 style={heading("medium")}>{TEXT.heading}</h2>
                  <Text as="p">{TEXT.primary}</Text>
                  <Text as="p" color="color.text.subtle">
                    {TEXT.secondary}
                  </Text>
                  <Text as="p" color="color.text.disabled">
                    {TEXT.disabled}
                  </Text>
                  <Anchor href="#" xcss={styles.link}>
                    {TEXT.link}
                  </Anchor>
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Box xcss={styles.card}>
            <Stack space="space.200">
              <Stack space="space.050">
                <h2 style={heading("medium")}>Purchase orders</h2>
                <Text color="color.text.subtle">Open orders for this collection.</Text>
              </Stack>
              {/* Dynamic table isn't installed: a plain table in its header and row tokens. */}
              <Box xcss={styles.tableWrap}>
                <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 560 }}>
                  <thead>
                    <tr>
                      {["Order", "Style", "Supplier", "Units", "Status"].map((h) => (
                        <th key={h} style={th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ORDERS.map((o) => (
                      <tr key={o.po}>
                        <td style={td}>
                          <Anchor href="#" xcss={styles.link}>
                            {o.po}
                          </Anchor>
                        </td>
                        <td style={td}>{o.style}</td>
                        <td style={td}>{o.supplier}</td>
                        <td style={{ ...td, textAlign: "end" }}>{o.units}</td>
                        <td style={td}>
                          <Lozenge status={o.status}>{o.label}</Lozenge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}

// The document's default 8px body margin would frame the surface.
document.body.style.margin = "0"

mountNative("atlassian", () => <Page />, {
  onMode: async (m) => {
    await setGlobalTheme({ colorMode: m })
  },
})
