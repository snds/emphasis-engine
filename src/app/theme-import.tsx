import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PROFILES } from "@/engine/profiles"
import { brandOf, coverage, parseTheme } from "@/engine/reference"
import type { Settings } from "@/engine/settings"
import type { Engine } from "./use-engine"
import { InfoTip } from "./info-tip"

const GENERIC_HINT = "Paste the system's theme CSS: the light and dark blocks that define its color variables."
const HINTS: Record<string, string> = {
  shadcn: "Paste globals.css: the :root and .dark blocks. oklch, hsl, bare HSL channels (shadcn v3), hex, and var() references all read.",
  radix: "Paste a Radix custom palette (the light and dark blocks). Scales are matched by name: gray-family for gray, your accent, and red. Missing alpha steps are derived from the solid steps.",
  material: "Paste a Material Theme Builder CSS export (.light and .dark, or tokens.css with -light / -dark suffixes). Contrast variants are skipped.",
}

/**
 * Read an existing theme as the output system's reference. Its values become
 * the targets, read through the system's own recipes, and your colors are
 * solved against them.
 */
export function ThemeImport({ settings: s, update }: { settings: Settings; update: Engine["update"] }) {
  const profile = PROFILES[s.output]
  const imported = s.imports?.[s.output]
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(imported?.source ?? "")
  const [error, setError] = useState<string | null>(null)

  const read = () => {
    const t = parseTheme(text, profile)
    const found = Object.keys(t.values.light).length + Object.keys(t.values.dark).length
    if (!found) {
      setError(`No ${profile.label} variables found. ${(HINTS[s.output] ?? GENERIC_HINT)}`)
      return
    }
    setError(null)
    update({ imports: { ...s.imports, [s.output]: t } })
    setOpen(false)
  }
  const clear = () => {
    const next = { ...s.imports }
    delete next[s.output]
    update({ imports: next })
    setText("")
  }

  const cov = imported ? coverage(profile, imported) : null
  const brand = imported ? brandOf(profile, imported) : null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-0.5">
          <span className="text-sm">Reference</span>
          <InfoTip label="Reference">
            The theme whose rendered results become the targets. Stock is the system's default theme. Import reads your own theme
            through the system's recipes, so the output reproduces what your theme renders today, for any colors you pick.
          </InfoTip>
        </div>
        <span className="text-xs text-muted-foreground">{imported ? "Imported" : `Stock ${profile.label}`}</span>
      </div>
      {cov && (
        <div className="flex flex-col gap-1 rounded-md border border-dashed px-2.5 py-2 text-xs text-muted-foreground">
          <span>
            Light {cov.light.found} of {cov.light.total} · Dark {cov.dark.found} of {cov.dark.total} variables read.
            {cov.light.missing.length + cov.dark.missing.length > 0 && " The rest come from stock."}
          </span>
          {imported!.unreadable.length > 0 && <span>{imported!.unreadable.length} values couldn't be read as colors.</span>}
          {cov.dark.found === 0 && <span>No dark block found; dark mode uses stock targets.</span>}
          {(cov.light.missing.length > 0 || cov.dark.missing.length > 0) && (
            <details>
              <summary className="cursor-pointer">Missing</summary>
              <code className="font-mono text-[11px] break-all">
                {[...new Set([...cov.light.missing, ...cov.dark.missing])].join(" ")}
              </code>
            </details>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
          {imported ? "Edit import" : "Import theme"}
        </Button>
        {brand && brand !== s.theme.toLowerCase() && (
          <Button variant="outline" size="sm" onClick={() => update({ theme: brand })}>
            <span className="size-3 rounded-sm border" style={{ background: brand }} />
            Use its brand color
          </Button>
        )}
        {imported && (
          <Button variant="ghost" size="sm" onClick={clear}>
            Back to stock
          </Button>
        )}
      </div>
      {open && (
        <div className="flex flex-col gap-1.5">
          <textarea
            aria-label={`${profile.label} theme CSS`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={(HINTS[s.output] ?? GENERIC_HINT)}
            spellCheck={false}
            className="min-h-40 w-full rounded-md border border-input bg-transparent px-2.5 py-2 font-mono text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-1.5">
            <Button size="sm" onClick={read} disabled={!text.trim()}>
              Read theme
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
