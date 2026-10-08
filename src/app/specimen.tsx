import type { CSSProperties, ReactNode } from "react"
import { profileFor, solveOutput } from "@/engine/outputs"
import { PROFILES, type ProfileId } from "@/engine/profiles"
import type { Mode } from "@/engine/settings"
import type { System } from "@/engine/system"

/**
 * Side-by-side specimens for systems this app doesn't ship components for:
 * the stock theme, then your colors solved through the same profile. Each is
 * a small approximation of that system's components, painted only with the
 * system's own variables, so what differs between the two columns is the
 * values, never the recipes.
 */
export function Specimens({ sys, mode, id }: { sys: System; mode: Mode; id: Exclude<ProfileId, "shadcn"> }) {
  const p = PROFILES[id]
  const imported = !!sys.settings.imports?.[id]
  const solved = solveOutput(sys, id, mode)
  const stock = profileFor(sys, id).reference[mode]
  const yours = Object.fromEntries(Object.entries(solved.values).map(([k, v]) => [k, v.css]))
  const Spec = id === "radix" ? RadixSpecimen : MaterialSpecimen
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold">{p.label}</h2>
        <p className="text-sm text-muted-foreground">
          {p.description} Approximate components, painted only with {p.label}'s own variables: {imported ? "your imported theme" : "stock"} on the left, your colors
          solved through it on the right.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Column title={imported ? "Imported reference" : `Stock ${p.label}`}>
          <Spec vars={stock} />
        </Column>
        <Column title="Your colors">
          <Spec vars={yours} />
        </Column>
      </div>
    </div>
  )
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-2">
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

const scope = (vars: Record<string, string>) => vars as CSSProperties

// ── Radix Themes ────────────────────────────────────────────────────────────

const rBtn = "inline-flex h-8 items-center rounded-md px-3 text-sm font-medium outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-8)"

function RadixSpecimen({ vars }: { vars: Record<string, string> }) {
  return (
    <div style={scope(vars)} className="flex flex-col gap-4 rounded-lg bg-(--color-background) p-4">
      <div className="flex flex-col gap-3 rounded-lg bg-(--color-panel-solid) p-4 shadow-[0_0_0_1px_var(--gray-a5)]">
        <div>
          <div className="text-base font-semibold text-(--gray-12)">Tech pack review</div>
          <div className="text-sm text-(--gray-11)">
            Low-contrast text on the panel, with a <span className="text-(--accent-a11) underline">link</span>.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={`${rBtn} bg-(--accent-9) text-(--accent-contrast) hover:bg-(--accent-10)`}>Solid</button>
          <button className={`${rBtn} bg-(--accent-a3) text-(--accent-a11) hover:bg-(--accent-a4) active:bg-(--accent-a5)`}>Soft</button>
          <button className={`${rBtn} text-(--accent-a11) shadow-[inset_0_0_0_1px_var(--accent-a8)] hover:bg-(--accent-a2)`}>Outline</button>
          <button className={`${rBtn} text-(--accent-a11) hover:bg-(--accent-a3)`}>Ghost</button>
        </div>
        <input
          placeholder="Search styles"
          className="h-8 rounded-md bg-(--color-panel-solid) px-2.5 text-sm text-(--gray-12) shadow-[inset_0_0_0_1px_var(--gray-a7)] outline-none placeholder:text-(--gray-a10) hover:shadow-[inset_0_0_0_1px_var(--gray-a8)] focus:outline-2 focus:outline-offset-[-1px] focus:outline-(--focus-8)"
        />
        <div className="h-px bg-(--gray-a6)" />
        <div className="rounded-md bg-(--red-a3) px-3 py-2 text-sm text-(--red-a11)">Sync failed at line 212.</div>
      </div>
      <Scale vars={vars} name="accent" />
      <Scale vars={vars} name="gray" />
    </div>
  )
}

function Scale({ vars, name }: { vars: Record<string, string>; name: string }) {
  return (
    <div className="grid grid-cols-12 gap-0.5" aria-label={`${name} scale`}>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <div className="h-6 w-full rounded-sm" style={{ background: vars[`--${name}-${i + 1}`] }} />
          <span className="text-[10px] text-(--gray-11)">{i + 1}</span>
        </div>
      ))}
    </div>
  )
}

// ── Material 3 ──────────────────────────────────────────────────────────────

const M = (r: string) => `var(--md-sys-color-${r})`
/** A Material state layer: the on-color at a fixed opacity, over the container. */
const layer = (on: string, pct: number) => `linear-gradient(color-mix(in srgb, ${M(on)} ${pct}%, transparent), color-mix(in srgb, ${M(on)} ${pct}%, transparent))`

function MBtn({ bg, on, border, children }: { bg?: string; on: string; border?: string; children: ReactNode }) {
  const style = {
    background: bg ? M(bg) : "transparent",
    color: M(on),
    boxShadow: border ? `inset 0 0 0 1px ${M(border)}` : undefined,
    "--hover": layer(on, 8),
    "--press": layer(on, 10),
  } as CSSProperties
  return (
    <button
      style={style}
      className="inline-flex h-10 items-center rounded-full px-5 text-sm font-medium outline-none hover:[background-image:var(--hover)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--md-sys-color-secondary) active:[background-image:var(--press)]"
    >
      {children}
    </button>
  )
}

function MaterialSpecimen({ vars }: { vars: Record<string, string> }) {
  return (
    <div style={scope(vars)} className="flex flex-col gap-4 rounded-lg p-4" >
      <div className="flex flex-col gap-4 rounded-lg p-4" style={{ background: M("surface") }}>
        <div className="flex flex-col gap-3 rounded-xl p-4" style={{ background: M("surface-container-low") }}>
          <div>
            <div className="text-base font-medium" style={{ color: M("on-surface") }}>
              Tech pack review
            </div>
            <div className="text-sm" style={{ color: M("on-surface-variant") }}>
              Supporting text on a container.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <MBtn bg="primary" on="on-primary">Filled</MBtn>
            <MBtn bg="secondary-container" on="on-secondary-container">Tonal</MBtn>
            <MBtn on="primary" border="outline">Outlined</MBtn>
            <MBtn on="primary">Text</MBtn>
          </div>
          <label className="relative flex flex-col">
            <span className="absolute -top-2 left-3 px-1 text-xs" style={{ background: M("surface-container-low"), color: M("on-surface-variant") }}>
              Style name
            </span>
            <input
              defaultValue="Spring 2027"
              className="h-12 rounded-sm bg-transparent px-3 text-sm outline-none focus:shadow-[inset_0_0_0_2px_var(--md-sys-color-primary)]"
              style={{ color: M("on-surface"), boxShadow: `inset 0 0 0 1px ${M("outline")}` }}
            />
          </label>
          <div className="h-px" style={{ background: M("outline-variant") }} />
          <div className="rounded-lg px-3 py-2 text-sm" style={{ background: M("error-container"), color: M("on-error-container") }}>
            Sync failed at line 212.
          </div>
          <div className="rounded-lg px-3 py-2 text-sm" style={{ background: M("primary-container"), color: M("on-primary-container") }}>
            Primary container
          </div>
        </div>
        <div className="grid grid-cols-6 gap-0.5" aria-label="Surface containers">
          {["surface-container-lowest", "surface", "surface-container-low", "surface-container", "surface-container-high", "surface-container-highest"].map((k) => (
            <div key={k} className="h-6 rounded-sm shadow-[0_0_0_1px_var(--md-sys-color-outline-variant)]" style={{ background: M(k) }} title={k} />
          ))}
        </div>
      </div>
    </div>
  )
}
