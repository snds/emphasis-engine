// Screenshots a native page, stock and themed, light and dark, phone and desktop.
// The theme is solved with a loud brand color, so it's obvious when the
// solved values do or don't reach a component.
//
// Needs the dev server running (npx vite --port 5173).
//   npx tsx scripts/native-shot.ts <id> [--base http://localhost:5173] [--out shots/native] [--brand #c026d3] [--width 1280]
import { mkdirSync } from "node:fs"
import { chromium } from "playwright"

const args = process.argv.slice(2)
const id = args[0]
const opt = (k: string, d: string) => {
  const i = args.indexOf(`--${k}`)
  return i >= 0 ? args[i + 1] : d
}
const base = opt("base", "http://localhost:5173")
const out = opt("out", "shots/native")
const brand = opt("brand", "#c026d3")
const widths = opt("width", "390,1280").split(",").map(Number)
mkdirSync(out, { recursive: true })

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium" })
const errors: string[] = []
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: width < 600 ? 2 : 1 })
  page.on("pageerror", (e) => errors.push(`${width}: ${e}`))
  page.on("console", (m) => m.type() === "error" && errors.push(`${width} console: ${m.text()}`))
  await page.goto(`${base}/native/${id}.html`)
  await page.waitForTimeout(1500)
  for (const mode of ["light", "dark"] as const) {
    for (const themed of [false, true]) {
      // Solve in the page: the dev server compiles the engine (it uses Vite-only imports), so nothing runs in Node.
      // Same message the app sends; the page treats its own window as parent when opened directly.
      await page.evaluate(
        async ({ id, mode, themed, brand }) => {
          const { DEFAULT_SETTINGS } = await import("/src/engine/settings.ts")
          const { generate } = await import("/src/engine/system.ts")
          const { nativeTheme } = await import("/src/engine/outputs.ts")
          const values = themed ? nativeTheme(generate({ ...DEFAULT_SETTINGS, theme: brand, output: id }), id, mode) : null
          window.postMessage({ type: "ee:theme", mode, values }, "*")
        },
        { id, mode, themed, brand },
      )
      await page.waitForTimeout(600)
      await page.screenshot({ path: `${out}/${id}-${width}-${mode}-${themed ? "themed" : "stock"}.png`, fullPage: true })
    }
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  if (overflow > 0) errors.push(`${width}: horizontal overflow ${overflow}px`)
  await page.close()
}
await browser.close()
console.log(errors.length ? errors.join("\n") : "no errors")
console.log(`shots in ${out}/${id}-*`)
