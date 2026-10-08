// shadcn/ui as a system profile. Variables, the recipes its components
// paint them with (read from the preset's component source, b1sABueby on
// Base UI), and its stock theme as the reference.
import type { Profile, Recipe, VarSpec } from "../profile"

const v = (name: string) => ({ v: name })
const a = (name: string, k: number) => ({ alpha: v(name), k })

const neutral = (from: string, extra: Partial<Extract<VarSpec["path"], { kind: "step" }>> = {}) =>
  ({ kind: "step", palette: "neutral", from, ...extra }) as const

const VARS: VarSpec[] = [
  { name: "--background", path: { kind: "page" } },
  { name: "--card", path: neutral("--background", { engineSurface: { light: "page", dark: "surface-2" } }) },
  { name: "--popover", path: { kind: "alias", of: "--card" } },
  { name: "--muted", path: neutral("--card", { engineSurface: { light: "surface-2", dark: "surface-3" } }) },
  { name: "--accent", path: neutral("--popover", { engineSurface: { light: "surface-2", dark: "surface-3" } }) },
  { name: "--sidebar", path: neutral("--background") },
  { name: "--foreground", path: neutral("--background", { chroma: 0.6 }), note: "Placed by lightness near the end of the range; APCA flattens out there." },
  { name: "--secondary", path: neutral("--card") },
  { name: "--muted-foreground", path: neutral("--card") },
  { name: "--primary", path: { kind: "solid", role: "brand" } },
  { name: "--primary-foreground", path: { kind: "onSolid", role: "brand" } },
  { name: "--destructive", path: { kind: "step", palette: "danger", from: "--card" }, note: "Doubles as text, so it is solved as a readable red." },
  { name: "--border", path: neutral("--card", { translucent: true }) },
  { name: "--input", path: neutral("--card", { translucent: true }) },
  { name: "--ring", path: neutral("--card") },
  ...["--card-foreground", "--popover-foreground", "--accent-foreground", "--secondary-foreground", "--sidebar-foreground", "--sidebar-accent-foreground"].map(
    (name): VarSpec => ({ name, path: { kind: "alias", of: "--foreground" } })
  ),
  { name: "--sidebar-primary", path: { kind: "alias", of: "--primary" } },
  { name: "--sidebar-primary-foreground", path: { kind: "alias", of: "--primary-foreground" } },
  { name: "--sidebar-accent", path: { kind: "alias", of: "--accent" } },
  { name: "--sidebar-border", path: { kind: "alias", of: "--border" } },
  { name: "--sidebar-ring", path: { kind: "alias", of: "--ring" } },
  ...[0, 1, 2, 3, 4].map((i): VarSpec => ({ name: `--chart-${i + 1}`, path: { kind: "series", index: i } })),
]

const R: Recipe[] = [
  // Surfaces
  { id: "card", label: "Card on page", source: "card: bg-card", element: "surface", paint: v("--card"), over: [v("--background")], metric: "dL" },
  { id: "muted", label: "Muted on card", source: "tabs list, toggle on: bg-muted", element: "surface", paint: v("--muted"), over: [v("--card")], metric: "dL" },
  { id: "accent", label: "Accent on popover", source: "select item: bg-accent", element: "surface", paint: v("--accent"), over: [v("--popover")], metric: "dL" },
  { id: "secondary", label: "Secondary on card", source: "button, badge: bg-secondary", element: "surface", paint: v("--secondary"), over: [v("--card")], metric: "dL" },
  { id: "sidebar", label: "Sidebar on page", source: "sidebar: bg-sidebar", element: "surface", paint: v("--sidebar"), over: [v("--background")], metric: "dL" },

  // Text
  { id: "fg-page", label: "Text on page", source: "text-foreground", element: "text-primary", paint: v("--foreground"), over: [v("--background")], metric: "dL" },
  { id: "fg-card", label: "Text on card", source: "text-card-foreground", element: "text-primary", paint: v("--foreground"), over: [v("--card")], metric: "dL" },
  { id: "fg-muted", label: "Text on muted (hovered ghost)", source: "ghost: hover:bg-muted hover:text-foreground", element: "text-primary", paint: v("--foreground"), over: [v("--card"), v("--muted")], metric: "dL" },
  { id: "mfg-card", label: "Muted text on card", source: "card description: text-muted-foreground", element: "text-secondary", paint: v("--muted-foreground"), over: [v("--card")], metric: "lc" },
  { id: "mfg-muted", label: "Inactive tab text", source: "tabs: bg-muted + dark:text-muted-foreground", element: "text-secondary", modes: ["dark"], paint: v("--muted-foreground"), over: [v("--card"), v("--muted")], metric: "lc" },
  // Probe-confirmed: light-mode inactive tabs fade the foreground instead of using muted text.
  { id: "tab-inactive-light", label: "Inactive tab text", source: "tabs: bg-muted + text-foreground/60", element: "text-secondary", modes: ["light"], paint: a("--foreground", 0.6), over: [v("--card"), v("--muted")], metric: "lc" },
  { id: "destr-text", label: "Destructive text on card", source: "alert, form message: text-destructive", element: "text-secondary", paint: v("--destructive"), over: [v("--card")], metric: "lc" },
  { id: "destr-label-light", label: "Destructive button label", source: "button destructive: bg-destructive/10 text-destructive", element: "text-on-tint", modes: ["light"], paint: v("--destructive"), over: [v("--card"), a("--destructive", 0.1)], metric: "lc" },
  { id: "destr-label-dark", label: "Destructive button label", source: "button destructive: dark:bg-destructive/20 text-destructive", element: "text-on-tint", modes: ["dark"], paint: v("--destructive"), over: [v("--card"), a("--destructive", 0.2)], metric: "lc" },
  { id: "pfg", label: "Label on primary", source: "button default: bg-primary text-primary-foreground", element: "on-solid", paint: v("--primary-foreground"), over: [v("--primary")], metric: "lc", check: true },

  // States and tints
  { id: "muted-50", label: "Row hover, dark ghost hover", source: "table: hover:bg-muted/50 · ghost: dark:hover:bg-muted/50", element: "state", paint: a("--muted", 0.5), over: [v("--card")], metric: "dL" },
  { id: "outline-rest", label: "Outline button and field fill", source: "dark:bg-input/30", element: "state", modes: ["dark"], paint: a("--input", 0.3), over: [v("--card")], metric: "dL" },
  { id: "outline-hover", label: "Outline button hover", source: "dark:hover:bg-input/50", element: "state", modes: ["dark"], paint: a("--input", 0.5), over: [v("--card")], metric: "dL" },
  { id: "switch-off", label: "Switch track, off", source: "switch: dark:data-unchecked:bg-input/80", element: "state", modes: ["dark"], paint: a("--input", 0.8), over: [v("--card")], metric: "dL" },
  { id: "secondary-hover", label: "Secondary button hover", source: "hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]", element: "state", paint: { mix: [v("--secondary"), v("--foreground")], k: 0.05, space: "oklch" }, over: [v("--card")], metric: "dL" },
  { id: "primary-hover", label: "Primary button hover", source: "hover:bg-primary/80", element: "state", paint: a("--primary", 0.8), over: [v("--card")], metric: "dL", check: true },
  { id: "destr-tint-light", label: "Destructive button fill", source: "bg-destructive/10", element: "state", modes: ["light"], paint: a("--destructive", 0.1), over: [v("--card")], metric: "dL" },
  { id: "destr-tint-dark", label: "Destructive button fill", source: "dark:bg-destructive/20", element: "state", modes: ["dark"], paint: a("--destructive", 0.2), over: [v("--card")], metric: "dL" },
  { id: "item-highlight", label: "Menu item highlight", source: "select: data-highlighted:bg-foreground/10", element: "state", paint: a("--foreground", 0.1), over: [v("--popover")], metric: "dL", check: true },

  // Edges
  { id: "border-card", label: "Separator on card", source: "border-border", element: "border-decorative", paint: v("--border"), over: [v("--card")], metric: "dL" },
  { id: "border-page", label: "Separator on page", source: "border-border", element: "border-decorative", paint: v("--border"), over: [v("--background")], metric: "dL" },
  { id: "card-edge", label: "Card edge", source: "card: ring-1 ring-foreground/10", element: "border-decorative", paint: a("--foreground", 0.1), over: [v("--background")], metric: "dL", check: true },
  { id: "input-card", label: "Field border on card", source: "input, select, checkbox: border-input", element: "border-control", paint: v("--input"), over: [v("--card")], metric: "dL" },
  { id: "input-page", label: "Field border on page", source: "border-input", element: "border-control", paint: v("--input"), over: [v("--background")], metric: "dL" },
  { id: "ring-card", label: "Focus ring on card", source: "focus-visible:ring-3 ring-ring/50", element: "focus", paint: a("--ring", 0.5), over: [v("--card")], metric: "dL" },
  { id: "ring-page", label: "Focus ring on page", source: "focus-visible:ring-ring/50", element: "focus", paint: a("--ring", 0.5), over: [v("--background")], metric: "dL" },

  // Solids
  { id: "primary-page", label: "Primary on page", source: "bg-primary", element: "solid", modes: ["dark"], paint: v("--primary"), over: [v("--background")], metric: "lc", check: true },
]

export const SHADCN: Profile = {
  id: "shadcn",
  label: "shadcn/ui",
  description: "About 30 CSS variables. Components fade them with opacity modifiers and color-mix.",
  selectors: { light: ":root", dark: ".dark" },
  vars: VARS,
  recipes: R,
  reference: {
    light: {
      "--background": "oklch(1 0 0)",
      "--foreground": "oklch(0.145 0.008 326)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.145 0.008 326)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.145 0.008 326)",
      "--primary": "oklch(0.488 0.243 264.376)",
      "--primary-foreground": "oklch(0.97 0.014 254.604)",
      "--secondary": "oklch(0.967 0.001 286.375)",
      "--secondary-foreground": "oklch(0.21 0.006 285.885)",
      "--muted": "oklch(0.96 0.003 325.6)",
      "--muted-foreground": "oklch(0.542 0.034 322.5)",
      "--accent": "oklch(0.96 0.003 325.6)",
      "--accent-foreground": "oklch(0.212 0.019 322.12)",
      "--destructive": "oklch(0.577 0.245 27.325)",
      "--border": "oklch(0.922 0.005 325.62)",
      "--input": "oklch(0.922 0.005 325.62)",
      "--ring": "oklch(0.711 0.019 323.02)",
      "--chart-1": "oklch(0.865 0.127 207.078)",
      "--chart-2": "oklch(0.715 0.143 215.221)",
      "--chart-3": "oklch(0.609 0.126 221.723)",
      "--chart-4": "oklch(0.52 0.105 223.128)",
      "--chart-5": "oklch(0.45 0.085 224.283)",
      "--sidebar": "oklch(0.985 0 0)",
      "--sidebar-foreground": "oklch(0.145 0.008 326)",
      "--sidebar-primary": "oklch(0.546 0.245 262.881)",
      "--sidebar-primary-foreground": "oklch(0.97 0.014 254.604)",
      "--sidebar-accent": "oklch(0.96 0.003 325.6)",
      "--sidebar-accent-foreground": "oklch(0.212 0.019 322.12)",
      "--sidebar-border": "oklch(0.922 0.005 325.62)",
      "--sidebar-ring": "oklch(0.711 0.019 323.02)",
    },
    dark: {
      "--background": "oklch(0.145 0.008 326)",
      "--foreground": "oklch(0.985 0 0)",
      "--card": "oklch(0.212 0.019 322.12)",
      "--card-foreground": "oklch(0.985 0 0)",
      "--popover": "oklch(0.212 0.019 322.12)",
      "--popover-foreground": "oklch(0.985 0 0)",
      "--primary": "oklch(0.424 0.199 265.638)",
      "--primary-foreground": "oklch(0.97 0.014 254.604)",
      "--secondary": "oklch(0.274 0.006 286.033)",
      "--secondary-foreground": "oklch(0.985 0 0)",
      "--muted": "oklch(0.263 0.024 320.12)",
      "--muted-foreground": "oklch(0.711 0.019 323.02)",
      "--accent": "oklch(0.263 0.024 320.12)",
      "--accent-foreground": "oklch(0.985 0 0)",
      "--destructive": "oklch(0.704 0.191 22.216)",
      "--border": "oklch(1 0 0 / 10%)",
      "--input": "oklch(1 0 0 / 15%)",
      "--ring": "oklch(0.542 0.034 322.5)",
      "--chart-1": "oklch(0.865 0.127 207.078)",
      "--chart-2": "oklch(0.715 0.143 215.221)",
      "--chart-3": "oklch(0.609 0.126 221.723)",
      "--chart-4": "oklch(0.52 0.105 223.128)",
      "--chart-5": "oklch(0.45 0.085 224.283)",
      "--sidebar": "oklch(0.212 0.019 322.12)",
      "--sidebar-foreground": "oklch(0.985 0 0)",
      "--sidebar-primary": "oklch(0.623 0.214 259.815)",
      "--sidebar-primary-foreground": "oklch(0.97 0.014 254.604)",
      "--sidebar-accent": "oklch(0.263 0.024 320.12)",
      "--sidebar-accent-foreground": "oklch(0.985 0 0)",
      "--sidebar-border": "oklch(1 0 0 / 10%)",
      "--sidebar-ring": "oklch(0.542 0.034 322.5)",
    },
  },
}
