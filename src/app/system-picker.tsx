// The output system: which design system the solved colors are written for.
// It sets what Preview, Report, and Export show, so it lives in the top bar,
// with the theme import beside it (an import is always for the chosen system).
import { useRef, useState } from "react"
import { Popover } from "@base-ui/react/popover"
import { IconCheck, IconChevronDown, IconFileImport } from "@tabler/icons-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PROFILES, PROFILE_IDS } from "@/engine/profiles"
import { ThemeImport } from "./theme-import"
import type { Engine } from "./use-engine"

const HAND = PROFILE_IDS.filter((id) => !PROFILES[id].generated)
const GENERATED = PROFILE_IDS.filter((id) => PROFILES[id].generated)

/** Desktop: a compact grouped select. */
export function SystemSelect({ engine, className }: { engine: Engine; className?: string }) {
  const { settings: s, update } = engine
  return (
    <Select items={PROFILE_IDS.map((id) => ({ value: id, label: PROFILES[id].label }))} value={s.output} onValueChange={(v) => v && update({ output: v as string })}>
      <SelectTrigger size="sm" className={cn("w-44", className)} aria-label="Output system" title={PROFILES[s.output].description}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Hand-written</SelectLabel>
          {HAND.map((id) => (
            <SelectItem key={id} value={id}>
              {PROFILES[id].label}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Generated from components</SelectLabel>
          {GENERATED.map((id) => (
            <SelectItem key={id} value={id}>
              {PROFILES[id].label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

/** Desktop: the import, in a popover anchored to its button. A dot marks an active import. */
export function ImportPopover({ engine }: { engine: Engine }) {
  const { settings: s, update } = engine
  const [open, setOpen] = useState(false)
  const imported = !!s.imports?.[s.output]
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger render={<Button variant="outline" size="sm" aria-label={imported ? "Theme imported. Edit import" : "Import a theme"} />}>
        <IconFileImport />
        Import
        {imported && <span className="size-1.5 rounded-full bg-primary" aria-hidden />}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={6} align="start" className="z-50">
          <Popover.Popup className="w-96 max-w-[calc(100vw-2rem)] rounded-lg border bg-popover p-4 text-popover-foreground shadow-lg outline-none data-ending-style:opacity-0 data-starting-style:opacity-0 transition-opacity">
            <Popover.Title className="text-sm font-semibold">Import a {PROFILES[s.output].label} theme</Popover.Title>
            <Popover.Description className="mb-3 text-xs text-muted-foreground">
              Its values become the targets, read through {PROFILES[s.output].label}'s own recipes.
            </Popover.Description>
            <ThemeImport key={s.output} settings={s} update={update} defaultOpen onDone={() => setOpen(false)} />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

/**
 * Phone: the system's name is the header's title, tappable. It opens a sheet with
 * every system (one line of what each is) and the import for the chosen one at the end.
 */
export function SystemSheetButton({ engine }: { engine: Engine }) {
  const { settings: s, update } = engine
  const [open, setOpen] = useState(false)
  const importRef = useRef<HTMLDivElement>(null)
  const imported = !!s.imports?.[s.output]
  const row = (id: string) => (
    <button
      key={id}
      type="button"
      role="radio"
      aria-checked={s.output === id}
      onClick={() => update({ output: id })}
      className="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left outline-none focus-visible:bg-muted active:bg-muted"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{PROFILES[id].label}</span>
        <span className="block truncate text-xs text-muted-foreground">{PROFILES[id].description}</span>
      </span>
      {s.output === id && <IconCheck className="size-5 shrink-0 text-primary" aria-hidden />}
    </button>
  )
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Output system: ${PROFILES[s.output].label}. Change system or import a theme`}
        className="-ml-2 flex min-h-11 min-w-0 items-center gap-1 rounded-full px-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted"
      >
        <span className="min-w-0">
          <span className="block text-[11px] leading-tight text-muted-foreground">Emphasis Engine</span>
          <span className="flex items-center gap-1 truncate text-base leading-tight font-semibold">
            {PROFILES[s.output].label}
            {imported && <span className="size-1.5 rounded-full bg-primary" aria-label="Theme imported" />}
          </span>
        </span>
        <IconChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </button>
      <Drawer open={open} onOpenChange={setOpen} snapPoints={[0.6, 1]}>
        <DrawerContent title="Output system" description="Preview, Report, and Export follow this system.">
          {/* The import sits after thirteen systems; this jumps there. */}
          <div className="px-4 pt-3">
            <Button variant="outline" size="sm" onClick={() => importRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              <IconFileImport />
              {imported ? `Edit ${PROFILES[s.output].label} import` : `Import a ${PROFILES[s.output].label} theme`}
            </Button>
          </div>
          <div role="radiogroup" aria-label="Output system">
            <p className="px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground">Hand-written</p>
            {HAND.map(row)}
            <p className="px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground">Generated from components</p>
            {GENERATED.map(row)}
          </div>
          <div ref={importRef} className="mt-2 scroll-mt-2 border-t px-4 pt-4">
            <p className="mb-2 text-sm font-semibold">Import a {PROFILES[s.output].label} theme</p>
            <ThemeImport key={s.output} settings={s} update={update} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
