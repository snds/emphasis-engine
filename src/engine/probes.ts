// Probe results: what the real components were seen painting, per profile
// and mode, written by scripts/probe.ts. Used to mark each recipe in the
// Report as seen in the components, seen over another surface, or not seen.
import shadcn from "./profiles/probes/shadcn.json"
import radix from "./profiles/probes/radix.json"
import material from "./profiles/probes/material.json"
import type { ProfileId } from "./profiles"
import type { Mode } from "./settings"

type ModeProbe = {
  samples: number
  recipes: number
  observed: string[]
  elsewhere: string[]
  unobserved: { id: string; key: string; source: string }[]
  candidates: { key: string; prop: string; sources: string[] }[]
}
export type Probe = { profile: string; probedAt: string; source: string; variables: number; modes: Record<Mode, ModeProbe> }

export const PROBES: Record<ProfileId, Probe> = {
  shadcn: shadcn as Probe,
  radix: radix as Probe,
  material: material as Probe,
}

export type ProbeStatus = "seen" | "elsewhere" | "unseen" | "convention"

export function probeStatus(id: ProfileId, mode: Mode, recipeId: string, convention?: boolean): ProbeStatus | null {
  if (convention) return "convention"
  const m = PROBES[id]?.modes[mode]
  if (!m) return null
  if (m.observed.includes(recipeId)) return "seen"
  if (m.elsewhere.includes(recipeId)) return "elsewhere"
  if (m.unobserved.some((u) => u.id === recipeId)) return "unseen"
  return null
}
