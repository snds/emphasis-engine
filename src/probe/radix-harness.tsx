// Probe harness: stock Radix Themes components.
import { createRoot } from "react-dom/client"
import "@radix-ui/themes/styles.css"
import { Badge, Button, Callout, Card, Checkbox, Link, Separator, Switch, Tabs, Text, TextField, Theme } from "@radix-ui/themes"

function Set({ where }: { where: string }) {
  const p = (name: string) => ({ "data-probe": `${name}@${where}` })
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(["solid", "soft", "surface", "outline", "ghost"] as const).map((v) => (
          <Button key={v} variant={v} {...p(`button-${v}`)}>
            Button
          </Button>
        ))}
      </div>
      <TextField.Root placeholder="Placeholder" {...p("textfield")} />
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Checkbox {...p("checkbox")} />
        <Checkbox defaultChecked {...p("checkbox-checked")} />
        <Switch {...p("switch")} />
        <Switch defaultChecked {...p("switch-checked")} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {(["solid", "soft", "surface", "outline"] as const).map((v) => (
          <Badge key={v} variant={v} {...p(`badge-${v}`)}>
            Badge
          </Badge>
        ))}
      </div>
      <Tabs.Root defaultValue="a">
        <Tabs.List {...p("tabs")}>
          <Tabs.Trigger value="a">Active</Tabs.Trigger>
          <Tabs.Trigger value="b">Inactive</Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>
      <Text {...p("text")}>Text</Text>
      <Text color="gray" {...p("text-muted")}>
        Muted
      </Text>
      <Link href="#" {...p("link")}>
        Link
      </Link>
      <Separator size="4" {...p("separator")} />
      <Callout.Root color="red" {...p("callout-red")}>
        <Callout.Text>Callout</Callout.Text>
      </Callout.Root>
    </div>
  )
}

// The probe switches modes with the dark class; Radix scopes its variables to the Theme element.
;(window as unknown as { __probe: unknown }).__probe = {
  async setMode(m: "light" | "dark") {
    document.documentElement.classList.toggle("dark", m === "dark")
    document.documentElement.classList.toggle("light", m === "light")
    await new Promise((r) => setTimeout(r, 100))
  },
  scopes: () => Array.from(document.querySelectorAll(".radix-themes")),
}

createRoot(document.getElementById("root")!).render(
  <Theme accentColor="blue" grayColor="gray" data-probe-theme>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, padding: 24 }} data-surface="page">
      <Set where="page" />
      <Card data-probe="card@page">
        <Set where="card" />
      </Card>
    </div>
  </Theme>,
)
