// Hand-written profiles, verified against their components by the probe.
import type { Profile } from "../profile"
import { MATERIAL } from "./material"
import { RADIX } from "./radix"
import { SHADCN } from "./shadcn"

export const HAND_PROFILES: Record<string, Profile> = { shadcn: SHADCN, radix: RADIX, material: MATERIAL }
