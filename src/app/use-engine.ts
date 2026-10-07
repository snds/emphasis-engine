import { useMemo, useState, useCallback } from "react"
import { DEFAULT_SETTINGS, type Settings } from "@/engine/settings"
import { generate } from "@/engine/system"

export function useEngine() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const update = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), [])
  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), [])
  // One full re-solve per change: both modes, every role, every cell.
  const sys = useMemo(() => generate(settings), [settings])
  return { settings, update, reset, sys }
}

export type Engine = ReturnType<typeof useEngine>
