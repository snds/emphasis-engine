// Every output system: hand-written profiles plus profiles the probe
// generated from each system's own components.
import type { Profile } from "../profile"
import { HAND_PROFILES } from "./hand"

const generated = Object.values(import.meta.glob<Profile>("./generated/*.json", { eager: true, import: "default" }))

export const PROFILES: Record<string, Profile> = {
  ...HAND_PROFILES,
  ...Object.fromEntries(generated.sort((a, b) => a.label.localeCompare(b.label)).map((p) => [p.id, p])),
}
export type ProfileId = string
export const PROFILE_IDS: ProfileId[] = Object.keys(PROFILES)
export const GENERATED_IDS: ProfileId[] = generated.map((p) => p.id)
