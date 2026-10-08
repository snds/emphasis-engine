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
import { GridView } from "@/app/grid-view"
import { ReportView } from "@/app/report-view"
import { ExportView } from "@/app/export-view"
import { CreditsView } from "@/app/credits-view"
import { InfoTip } from "@/app/info-tip"
import { extensionVars, shadcnVars } from "@/engine/export"
import { advancedOverrides, type Mode } from "@/engine/settings"

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

export function App() {
  const engine = useEngine()
  const { sys, settings, update } = engine
  const [mode, setMode] = useResolvedMode()
  const [themeApp, setThemeApp] = useState(false)
  const [tab, setTab] = useState("preview")

  // The preview reads the solved system through CSS variables scoped to it.
  const previewVars = useMemo(
    () => ({ ...shadcnVars(sys, mode), ...extensionVars(sys, mode) }) as CSSProperties,
    [sys, mode]
  )

  // Optional: let the tool's own chrome wear the generated theme.
  useEffect(() => {
    const root = document.documentElement
    const vars = shadcnVars(sys, mode)
    if (themeApp) Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
    return () => Object.keys(vars).forEach((k) => root.style.removeProperty(k))
  }, [themeApp, sys, mode])

  const overrides = advancedOverrides(settings)

  return (
    <TooltipProvider>
      <div className="flex min-h-svh flex-col bg-background text-foreground md:h-svh">
        <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b px-4 py-2.5">
          <div className="mr-auto">
            <h1 className="text-base font-semibold">Emphasis Engine</h1>
            <p className="text-xs text-muted-foreground">Perceptual color systems from three picks</p>
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
              <IconSun /> Light
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" aria-label="Dark mode">
              <IconMoon /> Dark
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
            <Label htmlFor="theme-app">Theme this app</Label>
            <InfoTip label="Theme this app">Applies the generated theme to this tool's own interface.</InfoTip>
          </div>
        </header>

        <div className="flex flex-1 flex-col md:min-h-0 md:flex-row">
          <aside className="border-b md:w-80 md:shrink-0 md:overflow-y-auto md:border-r md:border-b-0" aria-label="Controls">
            <Controls engine={engine} />
          </aside>
          <main className="min-w-0 flex-1 md:overflow-y-auto">
            <Tabs value={tab} onValueChange={(v) => setTab(v as string)} className="gap-0">
              <div className="sticky top-0 z-20 border-b bg-background/80 px-4 py-2 backdrop-blur">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="grid">Grid</TabsTrigger>
                  <TabsTrigger value="report">Report</TabsTrigger>
                  <TabsTrigger value="export">Export</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="preview" id="preview">
                <div style={previewVars} className="min-h-full bg-background p-4 text-foreground">
                  {sys.settings.output === "shadcn" ? (
                    <Preview sys={sys} mode={mode} />
                  ) : (
                    <Specimens sys={sys} mode={mode} id={sys.settings.output} />
                  )}
                </div>
              </TabsContent>
              <TabsContent value="grid" className="p-4">
                <GridView sys={sys} mode={mode} />
              </TabsContent>
              <TabsContent value="report" className="p-4">
                <ReportView sys={sys} mode={mode} />
              </TabsContent>
              <TabsContent value="export" className="p-4">
                <ExportView sys={sys} />
              </TabsContent>
              <TabsContent value="credits" className="p-4">
                <CreditsView />
              </TabsContent>
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
