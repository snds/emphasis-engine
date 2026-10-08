// The shared scene. Every native page shows this product, this copy, and
// this data, built from its own system's components and laid out by its own
// system's guidelines. Same story, native telling: the pages compare color,
// not content. A system without a piece (no switch, no tabs) uses its nearest
// equivalent or leaves it out; it never fakes one.

export const APP = {
  product: "Atelier PLM",
  nav: ["Overview", "Styles", "Materials", "Suppliers", "Reports"],
  activeNav: "Suppliers",
  user: { name: "Sam Rivera", initials: "SR" },
  breadcrumb: ["Workspaces", "Spring 2027 collection"],
}

export const PAGE = {
  title: "Workspace settings",
  description: "Who gets updates, which suppliers sync, and how this collection is shared.",
}

export const TABS = ["General", "Suppliers", "Notifications", "Danger zone"]

export const ACTIONS = {
  primary: "Save changes",
  secondary: "Duplicate",
  tertiary: "Preview",
  ghost: "Cancel",
  danger: "Delete workspace",
  disabled: "Publish",
}

export const FORM = {
  name: { label: "Workspace name", value: "Spring 2027 collection" },
  email: { label: "Notification email", placeholder: "team@example.com", help: "Updates go to this address." },
  // One field in its error state, so every system shows its invalid treatment.
  code: { label: "Season code", value: "SP-27X", error: "Season codes are two letters, a dash, and two digits." },
  region: { label: "Region", value: "North America", options: ["North America", "Europe", "Asia Pacific"] },
  sync: { label: "Sync supplier updates", help: "Pull price and lead-time changes nightly.", checked: true },
  summary: { label: "Email me a weekly summary", checked: true },
  visibility: { label: "Visibility", value: "team", options: [
    { value: "private", label: "Private" },
    { value: "team", label: "Team" },
    { value: "org", label: "Whole organization" },
  ] },
}

export type Status = "success" | "info" | "warning" | "danger"

export const ALERTS: { status: Status; title: string; body: string }[] = [
  { status: "success", title: "Samples approved", body: "All six colorways passed lab dip review." },
  { status: "info", title: "New supplier added", body: "Mill 14 can now receive tech packs." },
  { status: "warning", title: "Costing pending", body: "Two styles are missing trim prices." },
  { status: "danger", title: "Sync failed", body: "The ERP export stopped at line 212. Retry or contact support." },
]

export const ORDERS: { po: string; style: string; supplier: string; units: string; status: Status; label: string }[] = [
  { po: "PO-4471", style: "Linen overshirt", supplier: "Coastline Knits", units: "1,200", status: "success", label: "Shipped" },
  { po: "PO-4472", style: "Wool topcoat", supplier: "Atelier Nord", units: "640", status: "warning", label: "Delayed" },
  { po: "PO-4473", style: "Cotton chino", supplier: "Monsoon Weaving", units: "2,050", status: "info", label: "In production" },
  { po: "PO-4474", style: "Selvedge jean", supplier: "Ridge Denim", units: "380", status: "danger", label: "Rejected" },
]

export const STATS = [
  { label: "Open orders", value: "24", delta: "+3 this week" },
  { label: "On-time rate", value: "92%", delta: "−2 pts" },
  { label: "Styles costed", value: "41 / 48", delta: "7 left" },
]

export const TEXT = {
  heading: "Text emphasis",
  primary: "Primary text carries the content.",
  secondary: "Secondary text explains it.",
  disabled: "Disabled text sits back.",
  link: "View supplier scorecard",
}
