import { MATERIAL } from "./material"
import { RADIX } from "./radix"
import { SHADCN } from "./shadcn"
import type { Profile } from "../profile"

export const PROFILES: Record<string, Profile> = { shadcn: SHADCN, radix: RADIX, material: MATERIAL }
export type ProfileId = "shadcn" | "radix" | "material"
export const PROFILE_IDS: ProfileId[] = ["shadcn", "radix", "material"]
