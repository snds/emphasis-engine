// shadcn output: the engine's intent, translated through the shadcn profile.
// Kept as a thin adapter so the app and exports don't need to know how
// profiles work.
import { buildIntent } from "./intent"
import { solveProfile, type Outcome, type ProfileResult } from "./profile"
import { SHADCN } from "./profiles/shadcn"
import type { A11y, Mode } from "./settings"
import type { System } from "./system"

const cache = new WeakMap<System, Record<Mode, ProfileResult>>()

export function solveShadcn(sys: System, mode: Mode): ProfileResult {
  let entry = cache.get(sys)
  if (!entry) {
    entry = {
      light: solveProfile(SHADCN, buildIntent(sys, "light")),
      dark: solveProfile(SHADCN, buildIntent(sys, "dark")),
    }
    cache.set(sys, entry)
  }
  return entry[mode]
}

export type Finding = { mode: Mode; outcome: Outcome }

/** Every accessibility check the shadcn output carries, both modes, grouped by switch. */
export function shadcnSpecs(sys: System): Record<keyof A11y, Finding[]> {
  const res = { inputBorders: [], secondaryText: [], solids: [], focusRing: [] } as Record<keyof A11y, Finding[]>
  for (const mode of ["light", "dark"] as Mode[])
    for (const o of solveShadcn(sys, mode).outcomes) if (o.spec) res[o.spec.key].push({ mode, outcome: o })
  return res
}

/** Only the checks that miss their floor. */
export function shadcnFindings(sys: System): Record<keyof A11y, Finding[]> {
  const all = shadcnSpecs(sys)
  return Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v.filter((f) => !f.outcome.spec!.pass)])) as Record<
    keyof A11y,
    Finding[]
  >
}
