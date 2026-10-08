// shadcn output, kept for the app's own chrome ("Theme this app") and older call sites.
import { outputFindings, outputSpecs, solveOutput } from "./outputs"
import type { Mode } from "./settings"
import type { System } from "./system"

export const solveShadcn = (sys: System, mode: Mode) => solveOutput(sys, "shadcn", mode)
export const shadcnSpecs = (sys: System) => outputSpecs(sys, "shadcn")
export const shadcnFindings = (sys: System) => outputFindings(sys, "shadcn")
export type { Finding } from "./outputs"
