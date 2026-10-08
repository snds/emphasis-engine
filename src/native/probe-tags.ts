// Probe support for native pages. With ?probe in the URL, the page names its
// own sample roots, so the component probe can read the full native page (every
// alert, badge, table row, and header) instead of a minimal harness. Each root
// is named `<kind>-<what it says>@page`, which becomes the recipe's label.
import { PAGE } from "./scene"

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .split("-")
    .slice(0, 3)
    .join("-")

const shown = (el: Element) => {
  const r = el.getBoundingClientRect()
  const cs = getComputedStyle(el)
  return r.width > 2 && r.height > 2 && cs.visibility !== "hidden" && cs.display !== "none" && +cs.opacity > 0.05
}

/** Controls that hide their native input behind a drawn one: tag what's drawn. */
const drawn = (el: Element): Element => (shown(el) ? el : (el.closest("label") ?? el.parentElement ?? el))

const textOf = (el: Element) =>
  (el.getAttribute("aria-label") || (el as HTMLInputElement).placeholder || (el as HTMLInputElement).value || el.textContent || "").trim()

// Most specific first; an element takes the first kind it matches.
const KINDS: [string, string][] = [
  ["switch", '[role="switch"]'],
  ["checkbox", 'input[type="checkbox"], [role="checkbox"]'],
  ["radio", 'input[type="radio"], [role="radio"]'],
  ["select", 'select, [role="combobox"]'],
  ["input", 'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]), textarea'],
  ["tab", '[role="tab"]'],
  ["button", 'button, [role="button"], .btn'],
  ["link", "a[href]"],
  ["alert", '[role="alert"], [role="status"]'],
  ["row", "tbody tr"],
  ["header-row", "thead tr"],
  ["heading", "h1, h2, h3, h4"],
  ["divider", 'hr, [role="separator"]'],
]

/** Tag every sample root that isn't tagged yet. Safe to call repeatedly. */
export function tagProbeRoots() {
  const used = new Set(Array.from(document.querySelectorAll("[data-probe]")).map((e) => e.getAttribute("data-probe")!))
  const name = (base: string) => {
    let n = `${base}@page`
    for (let i = 2; used.has(n); i++) n = `${base}-${i}@page`
    used.add(n)
    return n
  }
  const tag = (el: Element, kind: string) => {
    // An element inside a root is sampled with that root.
    if (el.closest("[data-probe]")) return
    const what = slug(textOf(el))
    el.setAttribute("data-probe", name(what ? `${kind}-${what}` : kind))
  }
  // The page description sits straight on the page surface: the generator finds the page from it.
  const desc = Array.from(document.querySelectorAll("p, span, div")).find((e) => e.children.length === 0 && e.textContent?.trim() === PAGE.description)
  if (desc && !desc.hasAttribute("data-probe") && !used.has("text@page")) {
    desc.setAttribute("data-probe", "text@page")
    used.add("text@page")
  }
  for (const [kind, sel] of KINDS) for (const el of Array.from(document.querySelectorAll(sel))) if (!el.closest("[data-probe-skip]")) tag(drawn(el), kind)
  // Surfaces: boxes with their own opaque background (cards, tiles, alerts without a role, the header).
  for (const el of Array.from(document.querySelectorAll("body *"))) {
    if (el.hasAttribute("data-probe")) continue
    const bg = getComputedStyle(el).backgroundColor
    if (!bg || bg === "transparent" || /rgba\(.*,\s*0\)$/.test(bg)) continue
    const r = el.getBoundingClientRect()
    if (r.width * r.height < 4000 || !shown(el)) continue
    el.setAttribute("data-probe", name(`surface-${slug(textOf(el).slice(0, 40)) || "box"}`))
  }
  // Plain text that nothing above claimed: leaf paragraphs and labels.
  for (const el of Array.from(document.querySelectorAll("p, label, span, dd, dt, small, td"))) {
    if (el.children.length || el.closest("[data-probe]") || !el.textContent?.trim() || !shown(el)) continue
    el.setAttribute("data-probe", name(`text-${slug(el.textContent)}`))
  }
}
