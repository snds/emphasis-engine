// Service worker, written into dist by the precache plugin in vite.config.ts.
// After the first visit it caches every file in the build, every system's
// native page included, so switching systems never waits on the network.
// Hashed assets are immutable: cache first. Pages: network first, cache when offline.
const VERSION = "__VERSION__"
const FILES = __FILES__
const CACHE = `ee-${VERSION}`

self.addEventListener("install", (e) => {
  // The app shell first, so install finishes fast; the rest fills in after activation.
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["./", "./index.html"]).catch(() => {})).then(() => self.skipWaiting()))
})

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k)
      await self.clients.claim()
      // Respect Data Saver where the browser exposes it; those visitors load each system on demand.
      if (self.navigator.connection?.saveData) return
      const c = await caches.open(CACHE)
      const have = new Set((await c.keys()).map((r) => r.url))
      for (const f of FILES) {
        const url = new URL(f, self.registration.scope).href
        if (!have.has(url)) await c.add(url).catch(() => {})
      }
    })(),
  )
})

self.addEventListener("fetch", (e) => {
  const req = e.request
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return
  const immutable = /\/assets\//.test(req.url)
  e.respondWith(
    (async () => {
      const c = await caches.open(CACHE)
      if (immutable) {
        const hit = await c.match(req)
        if (hit) return hit
        const res = await fetch(req)
        if (res.ok) c.put(req, res.clone())
        return res
      }
      try {
        const res = await fetch(req)
        if (res.ok) c.put(req, res.clone())
        return res
      } catch (err) {
        const hit = await c.match(req, { ignoreSearch: true })
        if (hit) return hit
        throw err
      }
    })(),
  )
})
