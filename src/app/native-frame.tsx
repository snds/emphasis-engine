import { useEffect, useMemo, useRef, useState } from "react"
import { nativeTheme } from "@/engine/outputs"
import type { Mode } from "@/engine/settings"
import type { System } from "@/engine/system"

/** Systems with a native page. shadcn is native to the app itself. */
export const NATIVE_IDS = ["radix", "material", "bootstrap", "daisyui", "carbon", "fluent", "primer", "atlassian", "antd", "chakra", "mantine", "cds"]
export const hasNative = (id: string) => NATIVE_IDS.includes(id)
export const nativeUrl = (id: string) => `${import.meta.env.BASE_URL}native/${id}.html`

// Frames stay mounted for the last few systems viewed, so switching back is instant: no reload, just a new theme message.
const KEEP = 3

function Frame({ id, active, values, mode }: { id: string; active: boolean; values: ReturnType<typeof nativeTheme> | null; mode: Mode }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [ready, setReady] = useState(false)
  const [height, setHeight] = useState(900)
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return
      if (e.data?.type === "ee:ready") setReady(true)
      // A hidden frame can report 0; keep the last real height.
      if (e.data?.type === "ee:height" && typeof e.data.h === "number" && e.data.h > 0) setHeight(e.data.h)
    }
    window.addEventListener("message", on)
    return () => window.removeEventListener("message", on)
  }, [])
  // Only the visible frame takes theme messages; a hidden one keeps its last theme and catches up when shown.
  useEffect(() => {
    if (ready && active) ref.current?.contentWindow?.postMessage({ type: "ee:theme", mode, values }, "*")
  }, [ready, active, mode, values])
  return (
    <div hidden={!active} className="relative">
      {!ready && active && (
        <div className="absolute inset-x-0 top-0 flex h-40 items-center justify-center text-sm text-muted-foreground">Loading {id}…</div>
      )}
      <iframe
        ref={ref}
        src={nativeUrl(id)}
        title={`${id} native example`}
        className="block w-full border-0 transition-opacity"
        style={{ height, opacity: ready ? 1 : 0 }}
      />
    </div>
  )
}

/**
 * The system's own components, in its own document, wearing the solved
 * theme. `stock` sends no values, which shows the system's stock theme.
 */
export function NativeStage({ sys, mode, id, stock }: { sys: System; mode: Mode; id: string; stock?: boolean }) {
  const [recent, setRecent] = useState<string[]>([id])
  // Adjusting state during render on a prop change: React's documented pattern, no effect round-trip.
  if (recent[0] !== id) setRecent([id, ...recent.filter((x) => x !== id)].slice(0, KEEP))
  const values = useMemo(() => (stock ? null : nativeTheme(sys, id, mode)), [sys, id, mode, stock])
  return (
    <div>
      {recent.map((x) => (
        <Frame key={x} id={x} active={x === id} mode={mode} values={x === id ? values : null} />
      ))}
    </div>
  )
}
