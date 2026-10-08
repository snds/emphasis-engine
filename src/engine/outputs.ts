// Output systems: the engine's intent solved through each system profile.
import { buildIntent } from "./intent"
import { solveProfile, type Outcome, type ProfileResult } from "./profile"
import { PROFILES, type ProfileId } from "./profiles"
import { withReference } from "./reference"
import type { A11y, Mode } from "./settings"
import type { System } from "./system"

const cache = new WeakMap<System, Map<string, ProfileResult>>()

export function solveOutput(sys: System, id: ProfileId, mode: Mode): ProfileResult {
  let m = cache.get(sys)
  if (!m) cache.set(sys, (m = new Map()))
  const key = id + mode
  let r = m.get(key)
  if (!r) m.set(key, (r = solveProfile(profileFor(sys, id), buildIntent(sys, mode))))
  return r
}

/** The profile with its reference: an imported theme when there is one, stock otherwise. */
export const profileFor = (sys: System, id: ProfileId) => withReference(PROFILES[id], sys.settings.imports?.[id])

export type Finding = { mode: Mode; outcome: Outcome }

/** Every accessibility check an output carries, both modes, grouped by switch. */
export function outputSpecs(sys: System, id: ProfileId): Record<keyof A11y, Finding[]> {
  const res = { inputBorders: [], secondaryText: [], solids: [], focusRing: [] } as Record<keyof A11y, Finding[]>
  for (const mode of ["light", "dark"] as Mode[])
    for (const o of solveOutput(sys, id, mode).outcomes) if (o.spec) res[o.spec.key].push({ mode, outcome: o })
  return res
}

export function outputFindings(sys: System, id: ProfileId): Record<keyof A11y, Finding[]> {
  const all = outputSpecs(sys, id)
  return Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v.filter((f) => !f.outcome.spec!.pass)])) as Record<keyof A11y, Finding[]>
}

/** A profile's CSS: its own variable names, its own mode selectors. */
export function outputCss(sys: System, id: ProfileId): string {
  const p = PROFILES[id]
  return (["light", "dark"] as Mode[])
    .map((mode) => {
      const vals = solveOutput(sys, id, mode).values
      return `${p.selectors[mode]} {\n${Object.entries(vals)
        .map(([k, v]) => `  ${k}: ${v.css};`)
        .join("\n")}\n}`
    })
    .join("\n\n")
}
