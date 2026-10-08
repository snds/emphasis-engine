// Systems the probe knows. Hand profiles are verified against their
// components; generated ones are built from what the components paint.
export type SystemDef = {
  id: string
  label: string
  kind: "hand" | "generated"
  /** Custom properties that count as this system's color variables. */
  prefix: RegExp
  exclude?: RegExp
  /** npm package the harness renders, for the report. */
  pkg: string
  description?: string
  docs?: string
  /** CSS selectors for each mode in the CSS export. */
  selectors?: { light: string; dark: string }
  /** Systems themed through a JS object export JSON keyed by token name instead of CSS. */
  json?: { strip: string; camel?: boolean; note: string }
}

export const SYSTEMS: SystemDef[] = [
  { id: "shadcn", label: "shadcn/ui", kind: "hand", pkg: "this app's preset (b1sABueby)", prefix: /^--(background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|chart-\d|sidebar)(-[\w-]+)?$/ },
  { id: "radix", label: "Radix Themes", kind: "hand", pkg: "@radix-ui/themes", prefix: /^--(accent|gray|red|color|focus)-[\w-]+$/ },
  { id: "material", label: "Material 3", kind: "hand", pkg: "@material/web", prefix: /^--md-sys-color-[\w-]+$/ },
  {
    id: "bootstrap",
    label: "Bootstrap",
    kind: "generated",
    pkg: "bootstrap",
    prefix: /^--bs-/,
    description: "Root variables for page, text, and borders; each component class carries its own variables (--bs-btn-bg on .btn-primary).",
    docs: "https://getbootstrap.com/docs/5.3/customize/css-variables/",
    selectors: { light: ':root, [data-bs-theme="light"]', dark: '[data-bs-theme="dark"]' },
  },
  {
    id: "carbon",
    label: "IBM Carbon",
    kind: "generated",
    pkg: "@carbon/react",
    prefix: /^--cds-/,
    description: "Role tokens (layer, field, border, text, interactive) set per theme zone: white, g10, g90, g100.",
    docs: "https://carbondesignsystem.com/elements/color/tokens/",
    selectors: { light: ":root, .cds--white", dark: ".cds--g100" },
  },
  {
    id: "fluent",
    label: "Fluent 2",
    kind: "generated",
    pkg: "@fluentui/react-components",
    prefix: /^--color[A-Z]/,
    description: "Alias tokens (neutral, brand, status) per state, written by FluentProvider from a theme object.",
    docs: "https://react.fluentui.dev/?path=/docs/theme-color--docs",
    selectors: { light: ".fui-FluentProvider", dark: ".fui-FluentProvider" },
    json: { strip: "--", note: "Pass as a partial theme to FluentProvider: { ...webLightTheme, ...light }." },
  },
  {
    id: "primer",
    label: "GitHub Primer",
    kind: "generated",
    pkg: "@primer/react",
    prefix: /^--(fgColor|bgColor|borderColor|button|control|focus|underlineNav|label|counter)-/,
    description: "Functional tokens (fgColor, bgColor, borderColor) plus component tokens for buttons and controls.",
    docs: "https://primer.style/foundations/primitives/color",
    selectors: { light: '[data-color-mode="light"][data-light-theme="light"]', dark: '[data-color-mode="dark"][data-dark-theme="dark"]' },
  },
  {
    id: "atlassian",
    label: "Atlassian",
    kind: "generated",
    pkg: "@atlaskit/tokens",
    prefix: /^--ds-(text|link|icon|border|background|surface|interaction|blanket|skeleton)/,
    description: "Design tokens by role and emphasis (background.brand.bold, text.subtle), with hovered and pressed variants.",
    docs: "https://atlassian.design/foundations/color",
    selectors: { light: 'html[data-color-mode="light"]', dark: 'html[data-color-mode="dark"]' },
  },
  {
    id: "antd",
    label: "Ant Design",
    kind: "generated",
    pkg: "antd",
    prefix: /^--ant-color/,
    description: "Map tokens derived from seed tokens by an algorithm; components read them as CSS variables.",
    docs: "https://ant.design/docs/react/customize-theme",
    selectors: { light: ".ant-light", dark: ".ant-dark" },
    json: { strip: "--ant-", camel: true, note: "Pass as ConfigProvider theme.token; the light and dark sets go with defaultAlgorithm and darkAlgorithm." },
  },
  {
    id: "chakra",
    label: "Chakra UI",
    kind: "generated",
    pkg: "@chakra-ui/react",
    prefix: /^--chakra-colors-/,
    exclude: /-(50|100|200|300|400|500|600|700|800|900|950)$/,
    description: "Semantic tokens (bg, fg, border, and per-palette solid, subtle, muted, fg) over raw palettes.",
    docs: "https://chakra-ui.com/docs/theming/semantic-tokens",
    selectors: { light: ":root, .light", dark: ".dark" },
  },
  {
    id: "mantine",
    label: "Mantine",
    kind: "generated",
    pkg: "@mantine/core",
    prefix: /^--mantine-(color-|primary-color)/,
    exclude: /-\d$/,
    description: "Per-color variants (filled, light, outline, text) and body, text, dimmed, and default colors.",
    docs: "https://mantine.dev/styles/css-variables/",
    selectors: { light: ':root[data-mantine-color-scheme="light"]', dark: ':root[data-mantine-color-scheme="dark"]' },
  },
  {
    id: "daisyui",
    label: "daisyUI",
    kind: "generated",
    pkg: "daisyui",
    prefix: /^--color-/,
    description: "A handful of theme colors (base-100 to 300, primary, secondary, accent, neutral, status) with matching content colors.",
    docs: "https://daisyui.com/docs/themes/",
    selectors: { light: ':root, [data-theme="light"]', dark: '[data-theme="dark"]' },
  },
  {
    id: "cds",
    label: "Coinbase CDS",
    kind: "generated",
    pkg: "@coinbase/cds-web",
    prefix: /^--color-/,
    description: "Semantic color tokens (bg, fg, line, and their variants) written inline by ThemeProvider from a theme object.",
    docs: "https://cds.coinbase.com/getting-started/theming",
    json: { strip: "--color-", note: "Merge into the theme's lightColor and darkColor objects." },
  },
]

export const SYSTEM = Object.fromEntries(SYSTEMS.map((s) => [s.id, s]))
