import { createHash } from "node:crypto"
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { join, relative, resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

const root = import.meta.dirname
// Every native page is its own entry: each system's CSS stays inside its own document.
const nativePages = Object.fromEntries(
  readdirSync(resolve(root, "native"))
    .filter((f) => f.endsWith(".html"))
    .map((f) => [`native/${f.replace(/\.html$/, "")}`, resolve(root, "native", f)]),
)

/**
 * Writes dist/sw.js with the full file list, so the service worker can
 * cache every system's page in the background after the first visit.
 * The list's hash is the cache version: a new deploy gets a new cache.
 */
function precache(): Plugin {
  let outDir = "dist"
  return {
    name: "precache",
    apply: "build",
    configResolved(c) {
      outDir = resolve(c.root, c.build.outDir)
    },
    closeBundle() {
      const files: string[] = []
      const walk = (d: string) => {
        for (const f of readdirSync(d)) {
          const p = join(d, f)
          if (statSync(p).isDirectory()) walk(p)
          else if (f !== "sw.js") files.push(relative(outDir, p).split("\\").join("/"))
        }
      }
      walk(outDir)
      files.sort()
      const version = createHash("sha1").update(files.join("\n")).digest("hex").slice(0, 10)
      const template = readFileSync(resolve(root, "src/sw-template.js"), "utf8")
      writeFileSync(join(outDir, "sw.js"), template.replace("__VERSION__", version).replace("__FILES__", JSON.stringify(files)))
    },
  }
}

/**
 * Library code (CSS.escape polyfills in Chakra and Mantine) carries a literal
 * U+FFFD inside string literals. Some hosts reject files containing it, so it
 * ships as the equivalent \uFFFD escape. Same string at runtime.
 */
function escapeReplacementChar(): Plugin {
  return {
    name: "escape-replacement-char",
    apply: "build",
    generateBundle(_, bundle) {
      for (const chunk of Object.values(bundle)) if (chunk.type === "chunk") chunk.code = chunk.code.replaceAll("\uFFFD", "\\uFFFD")
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the build runs from any host or subfolder.
  base: "./",
  plugins: [react(), tailwindcss(), escapeReplacementChar(), precache()],
  resolve: {
    alias: {
      "@": resolve(root, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: { main: resolve(root, "index.html"), ...nativePages },
    },
  },
})
