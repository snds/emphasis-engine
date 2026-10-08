// Prints a profile's variables: path, stock and solved values per mode.
// Solves in the page through the dev server (the engine uses Vite-only imports).
//   npx tsx scripts/solve-dump.ts <id> [filter-regex] [--brand #2563eb] [--base http://localhost:5173]
import { chromium } from "playwright"

const args = process.argv.slice(2)
const id = args[0]
const filter = args[1] && !args[1].startsWith("--") ? args[1] : ""
const opt = (k: string, d: string) => {
  const i = args.indexOf(`--${k}`)
  return i >= 0 ? args[i + 1] : d
}
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium" })
const page = await browser.newPage()
// tsx wraps named functions in __name(); the page has no such helper.
await page.addInitScript("window.__name = (f) => f")
await page.goto(`${opt("base", "http://localhost:5173")}/index.html`)
const rows = await page.evaluate(
  async ({ id, filter, brand }) => {
    const { DEFAULT_SETTINGS } = await import("/src/engine/settings.ts")
    const { generate } = await import("/src/engine/system.ts")
    const { solveOutput, profileFor } = await import("/src/engine/outputs.ts")
    const { PROFILES } = await import("/src/engine/profiles/index.ts")
    const sys = generate({ ...DEFAULT_SETTINGS, theme: brand || DEFAULT_SETTINGS.theme, output: id })
    const p = PROFILES[id]
    const ref = profileFor(sys, id).reference
    const out = { light: solveOutput(sys, id, "light"), dark: solveOutput(sys, id, "dark") }
    const re = new RegExp(filter || ".")
    const capped = (m: "light" | "dark") => new Set(out[m].outcomes.filter((o) => o.capped).map((o) => o.recipe.id))
    return {
      vars: p.vars
        .filter((v) => re.test(v.name))
        .map((v) => ({
          name: v.name,
          path: JSON.stringify(v.path),
          stock: [ref.light[v.name], ref.dark[v.name]],
          solved: [out.light.values[v.name]?.css, out.dark.values[v.name]?.css],
        })),
      unmet: { light: [...capped("light")], dark: [...capped("dark")] },
    }
  },
  { id, filter, brand: opt("brand", "") },
)
for (const r of rows.vars) console.log(`${r.name}\n  path   ${r.path}\n  stock  ${r.stock.join("  |  ")}\n  solved ${r.solved.join("  |  ")}`)
console.log("capped recipes:", JSON.stringify(rows.unmet))
await browser.close()
