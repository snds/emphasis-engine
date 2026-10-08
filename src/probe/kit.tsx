// Shared harness plumbing. Each harness page exposes window.__probe so the
// probe can switch modes and knows where the system defines its variables.
import { useSyncExternalStore, type ReactNode } from "react"
import { createRoot } from "react-dom/client"

export type Mode = "light" | "dark"
type Harness = { setMode: (m: Mode) => Promise<void>; scopes: () => Element[] }
declare global {
  interface Window {
    __probe?: Harness
  }
}

const frames = (n: number) => new Promise<void>((r) => {
  const step = (i: number) => (i <= 0 ? r() : requestAnimationFrame(() => step(i - 1)))
  step(n)
})

let mode: Mode = "light"
const listeners = new Set<() => void>()
const useMode = () => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => mode)

/** Name a probe root: `${component}@${where}`. */
export const p = (where: string) => (name: string) => ({ "data-probe": `${name}@${where}` })

export function mount(
  render: (mode: Mode) => ReactNode,
  opts: { onMode?: (m: Mode) => void | Promise<void>; scopes?: () => Element[] } = {},
) {
  function App() {
    return <>{render(useMode())}</>
  }
  createRoot(document.getElementById("root")!).render(<App />)
  window.__probe = {
    async setMode(m) {
      mode = m
      await opts.onMode?.(m)
      listeners.forEach((l) => l())
      await frames(4)
      await new Promise((r) => setTimeout(r, 120))
    },
    scopes: opts.scopes ?? (() => [document.documentElement]),
  }
}

/** For CSS-only systems: just a mode switch and the root as scope. */
export function plain(onMode: (m: Mode) => void) {
  window.__probe = {
    async setMode(m) {
      onMode(m)
      await frames(3)
    },
    scopes: () => [document.documentElement],
  }
}

export const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, padding: 24 } as const
export const col = { display: "flex", flexDirection: "column", gap: 12 } as const
export const row = { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" } as const
