// In-page functions for the probe. Each runs inside the harness page via
// page.evaluate, so each is self-contained: no imports, no outer references.

export type Sample = {
  probe: string
  path: string
  pseudo: string
  prop: string
  color: string
  opacity: number
  ownBg: string
  backdrop: string[]
}

/** A color variable as the page defines it: root-level (or on a scope element), or scoped to a component selector. */
export type FoundVar = { key: string; name: string; selector: string | null; remap?: boolean }

/** Find every custom property matching the system's prefix, and where it's defined. */
export function discoverVars(args: { prefix: string; exclude: string | null }): { vars: FoundVar[]; rootSelectors: string[] } {
  const prefix = new RegExp(args.prefix)
  const exclude = args.exclude ? new RegExp(args.exclude) : null
  const html = document.documentElement
  const scopes = window.__probe?.scopes() ?? [html]
  const rootLike = (part: string) => {
    part = part.trim()
    if (/^(:root|html|body)\b/.test(part)) return true
    try {
      return html.matches(part) || scopes.some((s) => s.matches(part))
    } catch {
      return false
    }
  }
  const usable = (part: string) => {
    part = part.trim()
    if (/:(hover|focus|active|checked|disabled|focus-visible|focus-within|not|has|is|where)|::/.test(part)) return false
    try {
      return !!document.querySelector(part)
    } catch {
      return false
    }
  }
  const out = new Map<string, FoundVar>()
  const rootSelectors = new Set<string>()
  const add = (name: string, selector: string | null, remap = false) => {
    if (!prefix.test(name) || exclude?.test(name)) return
    const key = selector ? `${name}@${selector}` : name
    if (!out.has(key)) out.set(key, { key, name, selector, remap })
  }
  const scan = (rules: CSSRuleList) => {
    for (const r of Array.from(rules)) {
      if ("cssRules" in r && (r as CSSGroupingRule).cssRules?.length) scan((r as CSSGroupingRule).cssRules)
      if (!(r instanceof CSSStyleRule)) continue
      const names = Array.from(r.style).filter((p) => p.startsWith("--"))
      if (!names.length) continue
      for (const part of r.selectorText.split(",")) {
        const root = rootLike(part)
        if (root && names.some((n) => prefix.test(n))) rootSelectors.add(part.trim())
        for (const n of names) {
          if (root) add(n, null)
          // A scoped definition that points at another variable is a deliberate remap (Radix's data-accent-color).
          else if (usable(part)) add(n, part.trim(), /var\(/.test(r.style.getPropertyValue(n)))
        }
      }
    }
  }
  for (const s of Array.from(document.styleSheets)) {
    try {
      scan(s.cssRules)
    } catch {
      /* cross-origin sheet */
    }
  }
  // Variables written inline on scope elements (Coinbase CDS's ThemeProvider).
  for (const s of scopes) for (const n of Array.from((s as HTMLElement).style ?? [])) if (n.startsWith("--")) add(n, null)
  return { vars: [...out.values()], rootSelectors: [...rootSelectors] }
}

/** Read each variable's current (stock) value where it applies. */
export function readVars(vars: { key: string; name: string; selector: string | null }[]): Record<string, string> {
  const html = document.documentElement
  const scopes = window.__probe?.scopes() ?? [html]
  const out: Record<string, string> = {}
  for (const v of vars) {
    const el = v.selector ? document.querySelector(v.selector) : (scopes[0] ?? html)
    if (!el) continue
    const val = getComputedStyle(el).getPropertyValue(v.name).trim() || getComputedStyle(html).getPropertyValue(v.name).trim()
    if (val) out[v.key] = val
  }
  return out
}

/**
 * Set every variable to its sentinel. Root variables go inline on <html> and
 * every scope element (inline beats any theme rule); scoped ones get an
 * !important rule on their selector. Root variables that a component
 * selector also redefines get that rule too, so the sentinel holds everywhere.
 */
export function applySentinels(args: {
  values: { key: string; name: string; selector: string | null; value: string }[]
  scopedRedefs: { name: string; selector: string }[]
  rootSelectors: string[]
}) {
  const html = document.documentElement
  // Harnesses list every element a theme rule lands on as a scope (Primer's
  // BaseStyles repeats the color-mode attributes on a div). Generic attribute
  // matches aren't used: Radix remaps --accent-* per element on purpose.
  void args.rootSelectors
  const scopes = Array.from(new Set([html, ...(window.__probe?.scopes() ?? [])])) as HTMLElement[]
  const saved: { el: HTMLElement; name: string; value: string; priority: string }[] = []
  const rules: string[] = []
  const rootValue = new Map<string, string>()
  for (const v of args.values) {
    if (v.selector) rules.push(`${v.selector}{${v.name}:${v.value} !important}`)
    else {
      rootValue.set(v.name, v.value)
      for (const el of scopes) {
        saved.push({ el, name: v.name, value: el.style.getPropertyValue(v.name), priority: el.style.getPropertyPriority(v.name) })
        el.style.setProperty(v.name, v.value, "important")
      }
    }
  }
  for (const r of args.scopedRedefs) {
    const val = rootValue.get(r.name)
    if (val) rules.push(`${r.selector}{${r.name}:${val} !important}`)
  }
  const style = document.createElement("style")
  style.id = "probe-sentinels"
  style.textContent = rules.join("\n")
  document.head.appendChild(style)
  ;(window as unknown as { __probeSaved: typeof saved }).__probeSaved = saved
}

export function restoreSentinels() {
  document.getElementById("probe-sentinels")?.remove()
  const saved = (window as unknown as { __probeSaved?: { el: HTMLElement; name: string; value: string; priority: string }[] }).__probeSaved ?? []
  for (const s of saved.reverse()) {
    if (s.value) s.el.style.setProperty(s.name, s.value, s.priority)
    else s.el.style.removeProperty(s.name)
  }
}

/** Stop transitions and animations, in the document and every shadow root. */
export function stillness() {
  const still = "*,*::before,*::after{transition:none!important;animation:none!important}"
  const style = document.getElementById("probe-still") ?? document.head.appendChild(Object.assign(document.createElement("style"), { id: "probe-still" }))
  style.textContent = still
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(still)
  const walk = (n: Element) => {
    if (n.shadowRoot && !n.shadowRoot.adoptedStyleSheets.some((s) => s.cssRules[0]?.cssText.includes("transition: none"))) {
      n.shadowRoot.adoptedStyleSheets = [...n.shadowRoot.adoptedStyleSheets, sheet]
      Array.from(n.shadowRoot.children).forEach(walk)
    }
    Array.from(n.children).forEach(walk)
  }
  walk(document.documentElement)
}

/** Sample every painted color under one probe root. */
export function sampleRoot(sel: string): Sample[] {
  const root = document.querySelector(sel)
  if (!root) return []
  const probe = root.getAttribute("data-probe")!
  const out: Sample[] = []
  const parentOf = (el: Element): Element | null =>
    el.parentElement ?? ((el.getRootNode() as ShadowRoot).host as Element | undefined) ?? null
  const opacityOf = (el: Element) => {
    let o = 1
    for (let e: Element | null = el; e; e = parentOf(e)) o *= +getComputedStyle(e).opacity || 0
    return o
  }
  // Every element under a point, topmost first, descending into shadow roots.
  const deepStack = (x: number, y: number): Element[] => {
    const expand = (scope: Document | ShadowRoot, seen: Set<Element>): Element[] => {
      const list: Element[] = []
      for (const e of scope.elementsFromPoint(x, y)) {
        if (seen.has(e)) continue
        seen.add(e)
        if (e.shadowRoot) list.push(...expand(e.shadowRoot, seen))
        list.push(e)
      }
      return list
    }
    return expand(document, new Set())
  }
  const bgsOf = (e: Element) => {
    const list: string[] = []
    // Topmost first: an element's ::after and ::before paint above its own background.
    for (const pseudo of ["::after", "::before", ""]) {
      const cs = getComputedStyle(e, pseudo || null)
      if (pseudo && (cs.content === "none" || cs.content === "normal")) continue
      const bg = cs.backgroundColor
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent" && +cs.opacity > 0) list.push(bg)
    }
    return list
  }
  // What's painted under an element: the hit-test stack at its center, below
  // it, so siblings drawn underneath count, not only ancestors.
  const backdropOf = (el: Element) => {
    const r = el.getBoundingClientRect()
    const stack = deepStack(r.x + r.width / 2, r.y + r.height / 2)
    const at = stack.indexOf(el)
    const below = at >= 0 ? stack.slice(at + 1) : stack.filter((e) => e !== el && !el.contains(e))
    const list: string[] = []
    for (const e of below) {
      if (e === el || el.contains(e)) continue
      list.push(...bgsOf(e))
      if (list.length > 14) break
    }
    return list
  }
  const visible = (el: Element) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none"
  }
  const visit = (el: Element, path: string) => {
    if (el !== root && el.hasAttribute("data-probe")) return
    if (!visible(el)) return
    const ownBg = getComputedStyle(el).backgroundColor
    const backdrop = backdropOf(el)
    const opacity = opacityOf(el)
    for (const pseudo of ["", "::before", "::after"]) {
      const cs = getComputedStyle(el, pseudo || null)
      if (pseudo && cs.content === "none") continue
      const push = (prop: string, color: string) => {
        if (!color || color === "rgba(0, 0, 0, 0)" || color === "transparent") return
        out.push({
          probe,
          path,
          pseudo,
          prop,
          color,
          opacity: opacity * (pseudo ? +cs.opacity : 1),
          ownBg: pseudo ? ownBg : prop === "background-color" ? "" : ownBg,
          backdrop: pseudo ? [ownBg, ...backdrop].filter((c) => c !== "rgba(0, 0, 0, 0)") : backdrop,
        })
      }
      push("background-color", cs.backgroundColor)
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())
      if (!pseudo && (hasText || el.tagName === "INPUT")) push("color", cs.color)
      if (!pseudo && el.tagName === "INPUT") push("placeholder", getComputedStyle(el, "::placeholder").color)
      if (!pseudo && el instanceof SVGElement) {
        if (cs.fill !== "none") push("fill", cs.fill)
        if (cs.stroke !== "none") push("stroke", cs.stroke)
      }
      const sides = ["top", "right", "bottom", "left"].filter(
        (s) => parseFloat(cs.getPropertyValue(`border-${s}-width`)) > 0 && cs.getPropertyValue(`border-${s}-style`) !== "none",
      )
      for (const c of new Set(sides.map((s) => cs.getPropertyValue(`border-${s}-color`)))) push("border", c)
      if (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) push("outline", cs.outlineColor)
      if (cs.boxShadow && cs.boxShadow !== "none") {
        // Rings and hairlines only: zero blur, a spread. Elevation shadows are skipped.
        for (const layer of cs.boxShadow.split(/,(?![^(]*\))/)) {
          const color = layer.match(/(rgba?|oklab|oklch|color)\([^)]*\)/)?.[0]
          const nums = layer.replace(/(rgba?|oklab|oklch|color)\([^)]*\)/, "").match(/-?[\d.]+px/g)?.map(parseFloat) ?? []
          const [, , blur = 0, spread = 0] = nums
          if (color && blur === 0 && spread > 0) push(layer.includes("inset") ? "inset-ring" : "ring", color)
        }
      }
    }
    const kids = [...((el as HTMLElement).shadowRoot?.children ?? []), ...el.children]
    kids.forEach((k, i) => visit(k, `${path}>${k.tagName.toLowerCase()}${i}`))
  }
  visit(root, root.tagName.toLowerCase())
  return out
}

declare global {
  interface Window {
    __probe?: { setMode: (m: "light" | "dark") => Promise<void>; scopes: () => Element[] }
  }
}
