import { useMemo, useRef, useState } from "react"
import { IconCheck, IconCopy, IconDownload } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cssExport, dtcgJson, radixCss } from "@/engine/export"
import { outputCss } from "@/engine/outputs"
import { PROFILES } from "@/engine/profiles"
import type { System } from "@/engine/system"

const FORMATS = [
  { id: "system", label: "System variables", file: "emphasis-system.css", note: "The chosen output system's own variables and mode selectors, solved through its recipes." },
  { id: "css", label: "shadcn + extensions", file: "emphasis-theme.css", note: "shadcn token names plus the extension set, light and dark." },
  { id: "radix", label: "Role scales", file: "emphasis-scales.css", note: "The engine's own 12-step solid and alpha scales per role, per mode." },
  { id: "dtcg", label: "DTCG JSON", file: "emphasis-tokens.json", note: "Design Tokens Community Group format, both modes." },
] as const

export function ExportView({ sys }: { sys: System }) {
  const [fmt, setFmt] = useState<(typeof FORMATS)[number]["id"]>("system")
  const [copied, setCopied] = useState(false)
  const pre = useRef<HTMLPreElement>(null)
  // Embedded viewers block script-driven downloads; offer Copy only there.
  const embedded = typeof window !== "undefined" && window.self !== window.top
  const text = useMemo(
    () =>
      fmt === "system"
        ? `/* Emphasis Engine · ${PROFILES[sys.settings.output].label} */\n` + outputCss(sys, sys.settings.output)
        : fmt === "css"
          ? cssExport(sys)
          : fmt === "radix"
            ? radixCss(sys)
            : dtcgJson(sys),
    [fmt, sys],
  )
  const base = FORMATS.find((x) => x.id === fmt)!
  const f = fmt === "system" ? { ...base, file: `emphasis-${sys.settings.output}.css`, note: `${PROFILES[sys.settings.output].label} variables, solved through its recipes.` } : base

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard refused: select the text so the viewer can copy it.
      const sel = window.getSelection()
      if (pre.current && sel) {
        const range = document.createRange()
        range.selectNodeContents(pre.current)
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }
  }
  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: fmt === "dtcg" ? "application/json" : "text/css" }))
    const a = document.createElement("a")
    a.href = url
    a.download = f.file
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Export</h2>
          <p className="text-sm text-muted-foreground">{f.note} Tokens Studio and Figma variables are next.</p>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup aria-label="Format" variant="outline" size="sm" spacing={0} value={[fmt]} onValueChange={(v) => v[0] && setFmt(v[0] as typeof fmt)}>
            {FORMATS.map((x) => (
              <ToggleGroupItem key={x.id} value={x.id}>
                {x.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <IconCheck /> : <IconCopy />}
            {copied ? "Copied" : "Copy"}
          </Button>
          {!embedded && (
            <Button size="sm" onClick={download}>
              <IconDownload />
              Download
            </Button>
          )}
        </div>
      </div>
      <pre ref={pre} className="max-h-[65vh] overflow-auto rounded-lg border bg-muted/40 p-4 font-mono text-xs leading-relaxed">{text}</pre>
    </div>
  )
}
