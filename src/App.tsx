import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { IconMoon, IconSun } from "@tabler/icons-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useTheme } from "@/components/theme-provider"
import { useEngine } from "@/app/use-engine"
import { Controls } from "@/app/controls"
import { Preview } from "@/app/preview"
import { Specimens } from "@/app/specimen"
import { RecipeBoard } from "@/app/recipe-board"
import { GridView } from "@/app/grid-view"
import { ReportView } from "@/app/report-view"
import { ExportView } from "@/app/export-view"
import { CreditsView } from "@/app/credits-view"
import { InfoTip } from "@/app/info-tip"
import { MobileDock, MobileHeader, MoreSheet, type View } from "@/app/mobile-editor"
import { ImportPopover, SystemSelect } from "@/app/system-picker"
import { generate } from "@/engine/system"
import { NativeStage, hasNative } from "@/app/native-frame"
import { PROFILES } from "@/engine/profiles"
import { extensionVars, shadcnVars } from "@/engine/export"
import { DEFAULT_SETTINGS, advancedOverrides, type Mode } from "@/engine/settings"
import type { System } from "@/engine/system"

/** True at the md breakpoint and up, where controls get their own column. */
function useWide() {
  const query = "(min-width: 768px)"
  const [wide, setWide] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setWide(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return wide
}

function useResolvedMode(): [Mode, (m: Mode) => void] {
  const { theme, setTheme } = useTheme()
  const [system, setSystem] = useState<Mode>(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  )
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const on = () => setSystem(mq.matches ? "dark" : "light")
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return [theme === "system" ? system : (theme as Mode), setTheme]
}

/** The canvas for one view. Shared by the desktop tabs and the phone editor. */
function Canvas({ view, sys, mode, previewVars }: { view: View; sys: System; mode: Mode; previewVars: CSSProperties }) {
  const id = sys.settings.output
  // Native: the system's own components in their own page. Pairs: every color pair the profile solves, measured.
  const [show, setShow] = useState<"native" | "pairs">("native")
  if (view === "preview") {
    if (id === "shadcn")
      return (
        <div style={previewVars} className="min-h-full bg-background p-4 text-foreground">
          <Preview sys={sys} mode={mode} />
        </div>
      )
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-2">
          <p className="min-w-0 truncate text-xs text-muted-foreground">
            {show === "native" ? `${PROFILES[id].label}'s own components, wearing your colors` : "Each pair the profile solves, stock beside yours"}
          </p>
          <ToggleGroup aria-label="Preview kind" variant="outline" size="sm" spacing={0} value={[show]} onValueChange={(v) => v[0] && setShow(v[0] as "native" | "pairs")}>
            <ToggleGroupItem value="native" className="text-xs">Native</ToggleGroupItem>
            <ToggleGroupItem value="pairs" className="text-xs">Pairs</ToggleGroupItem>
          </ToggleGroup>
        </div>
        {show === "native" && hasNative(id) ? (
          <NativeStage sys={sys} mode={mode} id={id} />
        ) : (
          <div style={previewVars} className="bg-background p-4 text-foreground">
            {id === "radix" || id === "material" ? <Specimens sys={sys} mode={mode} id={id} /> : <RecipeBoard sys={sys} mode={mode} id={id} />}
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="p-4">
      {view === "grid" ? <GridView sys={sys} mode={mode} /> : view === "report" ? <ReportView sys={sys} mode={mode} /> : view === "export" ? <ExportView sys={sys} /> : <CreditsView />}
    </div>
  )
}

export function App() {
  const engine = useEngine()
  const { sys, settings, update } = engine
  const [mode, setMode] = useResolvedMode()
  const [themeApp, setThemeApp] = useState(false)
  const wide = useWide()
  const [tab, setTab] = useState<View>("preview")
  const [more, setMore] = useState(false)
  // Hold to compare: the canvas shows the defaults for the same system and import, like Photos' before/after.
  const [comparing, setComparing] = useState(false)
  const stock = useMemo(
    () => generate({ ...DEFAULT_SETTINGS, output: settings.output, imports: settings.imports, advanced: settings.advanced }),
    [settings.output, settings.imports, settings.advanced]
  )
  const shown = comparing ? stock : sys

  // The preview reads the solved system through CSS variables scoped to it.
  const previewVars = useMemo(
    () => ({ ...shadcnVars(shown, mode), ...extensionVars(shown, mode) }) as CSSProperties,
    [shown, mode]
  )

  // Optional: let the tool's own chrome wear the generated theme.
  useEffect(() => {
    const root = document.documentElement
    const vars = shadcnVars(sys, mode)
    if (themeApp) Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
    return () => Object.keys(vars).forEach((k) => root.style.removeProperty(k))
  }, [themeApp, sys, mode])

  const overrides = advancedOverrides(settings)

  if (!wide)
    return (
      <TooltipProvider>
        <div className="min-h-svh bg-background text-foreground">
          <MobileHeader engine={engine} mode={mode} setMode={setMode} view={tab} setView={setTab} onCompare={setComparing} onMore={() => setMore(true)} />
          <main className="relative pb-[calc(var(--dock-h,0px)+1rem)]">
            {comparing && (
              <span className="pointer-events-none fixed top-28 left-1/2 z-20 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background shadow">
                Defaults
              </span>
            )}
            <Canvas view={tab} sys={shown} mode={mode} previewVars={previewVars} />
          </main>
          <MobileDock engine={engine} />
          <MoreSheet open={more} onOpenChange={setMore} engine={engine} themeApp={themeApp} setThemeApp={setThemeApp} onCredits={() => setTab("credits")} />
        </div>
      </TooltipProvider>
    )

  return (
    <TooltipProvider>
      <div className="flex min-h-svh flex-col bg-background text-foreground md:h-svh">
        <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b px-4 py-2.5">
          <div className="min-w-0">
            <h1 className="text-base font-semibold">Emphasis Engine</h1>
            <p className="hidden text-xs text-muted-foreground sm:block">Perceptual color systems from three picks</p>
          </div>
          {/* The output system decides what every view shows, so it sits beside the title, with its import. */}
          <div className="mr-auto flex items-center gap-1.5">
            <SystemSelect engine={engine} />
            <ImportPopover engine={engine} />
            <InfoTip label="Output system">
              The design system your colors are written for. Each turns tokens into color its own way; Preview, Report, and Export follow
              this choice. Import reads your own theme for it, so the targets are what your theme renders today. Theme this app always uses
              shadcn, since this tool is built with it.
            </InfoTip>
          </div>
<div className="flex items-center gap-0.5">
          <ToggleGroup
            aria-label="Mode"
            variant="outline"
            size="sm"
            spacing={0}
            value={[mode]}
            onValueChange={(v) => v[0] && setMode(v[0] as Mode)}
          >
            <ToggleGroupItem value="light" aria-label="Light mode">
              <IconSun /> <span className="hidden sm:inline">Light</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" aria-label="Dark mode">
              <IconMoon /> <span className="hidden sm:inline">Dark</span>
            </ToggleGroupItem>
          </ToggleGroup>
            <InfoTip label="Mode">Light and dark are solved as separate systems, not inverted.</InfoTip>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="advanced" checked={settings.advanced} onCheckedChange={(advanced) => update({ advanced })} />
            <Label htmlFor="advanced">Advanced</Label>
            <InfoTip label="Advanced">Shows every solver lever. Broken targets become warnings instead of limits.</InfoTip>
            {!settings.advanced && overrides.length > 0 && (
              <Badge variant="secondary" title={overrides.join(", ")}>
                {overrides.length} override{overrides.length === 1 ? "" : "s"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch id="theme-app" checked={themeApp} onCheckedChange={setThemeApp} />
            <Label htmlFor="theme-app">
              Theme <span className="hidden sm:inline">this</span> app
            </Label>
            <InfoTip label="Theme this app">Applies the generated theme to this tool's own interface.</InfoTip>
          </div>
        </header>

        <div className="flex flex-1 flex-col md:min-h-0 md:flex-row">
          <aside className="w-80 shrink-0 overflow-y-auto border-r" aria-label="Controls">
            <Controls engine={engine} />
          </aside>
          <main className="min-w-0 flex-1 md:overflow-y-auto">
            <Tabs value={tab} onValueChange={(v) => setTab(v as View)} className="gap-0">
              <div className="sticky top-0 z-20 overflow-x-auto border-b bg-background/80 px-4 py-2 backdrop-blur">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="grid">Grid</TabsTrigger>
                  <TabsTrigger value="report">Report</TabsTrigger>
                  <TabsTrigger value="export">Export</TabsTrigger>
                </TabsList>
              </div>
              {(["preview", "grid", "report", "export", "credits"] as const).map((v) => (
                <TabsContent key={v} value={v} id={v === "preview" ? "preview" : undefined}>
                  <Canvas view={v} sys={shown} mode={mode} previewVars={previewVars} />
                </TabsContent>
              ))}
            </Tabs>
            <footer className="border-t px-4 py-3 text-xs text-muted-foreground">
              <button type="button" className="underline underline-offset-2 hover:text-foreground" onClick={() => setTab("credits")}>
                Credits and licenses
              </button>
            </footer>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default App
