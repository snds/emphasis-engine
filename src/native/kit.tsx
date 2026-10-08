// Native page plumbing. Each system's page is its own document, loaded in an
// iframe so its resets and globals can't touch the app or another system.
// The app sends the solved theme by postMessage; this kit switches the
// system's own mode mechanism and lays the values over the stock theme the
// same way the probe does, so the page shows what the Report measures.
import { useSyncExternalStore, type ReactNode } from "react"
import { createRoot } from "react-dom/client"

export type Mode = "light" | "dark"
/** One solved variable. Root variables have no selector; scoped ones name the component selector. */
export type ThemeValue = { name: string; selector: string | null; value: string; js?: string; order?: number }
export type ThemeMessage = { type: "ee:theme"; mode: Mode; values: ThemeValue[] | null }

const frames = (n: number) =>
  new Promise<void>((r) => {
    const step = (i: number) => (i <= 0 ? r() : requestAnimationFrame(() => step(i - 1)))
    step(n)
  })

let mode: Mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light"
const listeners = new Set<() => void>()
export const useMode = () => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => mode)

// The solved root values in JS-friendly syntax, for systems whose theme is a JS object
// (Ant Design's tokens, Coinbase CDS's ThemeProvider). Their hover and pressed colors are
// computed in JS from that object, so CSS overrides alone never reach them.
let jsValues: Record<string, string> | null = null
const valueListeners = new Set<() => void>()
export const useThemeValues = () =>
  useSyncExternalStore((l) => (valueListeners.add(l), () => valueListeners.delete(l)), () => jsValues)

type Saved = { el: HTMLElement; name: string; value: string; priority: string; set: string }
let saved: Saved[] = []

function restore() {
  document.getElementById("ee-theme")?.remove()
  for (const s of saved.reverse()) {
    // A provider may have rewritten the variable since (a mode switch): its value wins over the one saved earlier.
    if (s.el.style.getPropertyValue(s.name) !== s.set) continue
    if (s.value) s.el.style.setProperty(s.name, s.value, s.priority)
    else s.el.style.removeProperty(s.name)
  }
  saved = []
}

/** Selectors that land on <html> or a scope element: where root variables live. */
function rootLike(part: string, scopes: Element[]) {
  if (/^(:root|html|body)\b/.test(part)) return true
  try {
    return scopes.some((s) => s.matches(part))
  } catch {
    return false
  }
}

/**
 * Component selectors that redefine a root variable with a literal value
 * (a zone class, a nested theme). The root override wouldn't reach under
 * them, so they get the same value too. Remaps (a var() value) are left
 * alone: those are the system pointing one token at another on purpose.
 */
function redefinitions(names: Set<string>, scopes: Element[]) {
  const out: { selector: string; name: string }[] = []
  const scan = (rules: CSSRuleList) => {
    for (const r of Array.from(rules)) {
      if ("cssRules" in r && (r as CSSGroupingRule).cssRules?.length) scan((r as CSSGroupingRule).cssRules)
      if (!(r instanceof CSSStyleRule)) continue
      const hit = Array.from(r.style).filter((p) => names.has(p) && !/var\(/.test(r.style.getPropertyValue(p)))
      if (!hit.length) continue
      for (const raw of r.selectorText.split(",")) {
        const part = raw.trim()
        if (rootLike(part, scopes) || /:(hover|focus|active|checked|disabled)|::/.test(part)) continue
        try {
          if (!document.querySelector(part)) continue
        } catch {
          continue
        }
        for (const name of hit) out.push({ selector: part, name })
      }
    }
  }
  for (const s of Array.from(document.styleSheets)) {
    try {
      scan(s.cssRules)
    } catch {
      /* cross-origin sheet */
    }
  }
  return out
}

function apply(values: ThemeValue[], scopes: Element[]) {
  const els = Array.from(new Set([document.documentElement, ...scopes])) as HTMLElement[]
  const rules: string[] = []
  const root = new Map<string, string>()
  // Scoped overrides are all !important, so source order decides between a base rule and its
  // variant on the same element. Keep the system's own order (.btn before .btn-primary).
  const ordered = [...values].sort((a, b) => (a.order ?? -1) - (b.order ?? -1))
  for (const v of ordered) {
    if (v.selector) rules.push(`${v.selector}{${v.name}:${v.value} !important}`)
    else {
      root.set(v.name, v.value)
      for (const el of els) {
        const before = { value: el.style.getPropertyValue(v.name), priority: el.style.getPropertyPriority(v.name) }
        el.style.setProperty(v.name, v.value, "important")
        // Record what the browser actually stored (it may normalize the text) to compare on restore.
        saved.push({ el, name: v.name, ...before, set: el.style.getPropertyValue(v.name) })
      }
    }
  }
  for (const r of redefinitions(new Set(root.keys()), els)) rules.push(`${r.selector}{${r.name}:${root.get(r.name)} !important}`)
  const style = document.createElement("style")
  style.id = "ee-theme"
  style.textContent = rules.join("\n")
  document.head.appendChild(style)
}

export type NativeOptions = {
  /** Switch the system's own light/dark mechanism (a class, an attribute, a provider prop). */
  onMode?: (m: Mode) => void | Promise<void>
  /** Elements the system writes its theme variables on, besides <html> (a provider's root div). */
  scopes?: () => Element[]
}

/**
 * Mount a native page. `render` gets the current mode so React providers
 * can switch themes; `onMode` handles class- or attribute-driven systems.
 */
export function mountNative(id: string, render: (mode: Mode) => ReactNode, opts: NativeOptions = {}) {
  const scopes = () => opts.scopes?.() ?? []
  function App() {
    return <>{render(useMode())}</>
  }
  document.documentElement.style.colorScheme = mode
  void opts.onMode?.(mode)
  createRoot(document.getElementById("root")!).render(<App />)

  let last: ThemeMessage | null = null
  let busy = Promise.resolve()
  async function set(msg: ThemeMessage) {
    if (msg.mode !== mode) {
      mode = msg.mode
      document.documentElement.style.colorScheme = mode
      await opts.onMode?.(mode)
      listeners.forEach((l) => l())
    }
    const next = msg.values ? Object.fromEntries(msg.values.filter((v) => !v.selector).map((v) => [v.name, v.js ?? v.value])) : null
    if (JSON.stringify(next) !== JSON.stringify(jsValues)) {
      jsValues = next
      valueListeners.forEach((l) => l())
    }
    // Two frames: React commits the mode, the system's provider writes its variables.
    await frames(2)
    restore()
    if (msg.values) apply(msg.values, scopes())
  }
  window.addEventListener("message", (e) => {
    if (e.source !== parent || e.data?.type !== "ee:theme") return
    last = e.data as ThemeMessage
    // Serialize: a fast scrub sends many messages; each applies after the last finished.
    busy = busy.then(() => (last === e.data ? set(e.data) : undefined))
  })

  // ?probe: the component probe reads this page. It switches modes through the same path as the
  // app, finds theme variables on the same scopes, and samples roots the page tags itself.
  if (new URLSearchParams(location.search).has("probe")) {
    const settle = () => new Promise((r) => setTimeout(r, 150))
    ;(window as unknown as { __probe: unknown }).__probe = {
      async setMode(m: Mode) {
        await set({ type: "ee:theme", mode: m, values: null })
        await frames(4)
        await settle()
        const { tagProbeRoots } = await import("./probe-tags")
        tagProbeRoots()
      },
      scopes: () => (scopes().length ? scopes() : [document.documentElement]),
    }
  }

  // Report content height so the host can size the frame and let the app page scroll, not the frame.
  const post = () => parent.postMessage({ type: "ee:height", id, h: document.documentElement.scrollHeight }, "*")
  new ResizeObserver(post).observe(document.body)
  parent.postMessage({ type: "ee:ready", id }, "*")
}

// Layout helpers for pages whose system has no layout primitives of its own.
export const stack = (gap = 16) => ({ display: "flex", flexDirection: "column", gap }) as const
export const inline = (gap = 8) => ({ display: "flex", gap, flexWrap: "wrap", alignItems: "center" }) as const
