// Probe harness: Chakra UI v3. Semantic tokens switch with the .dark class on <html>.
import { Alert, Badge, Box, Button, Card, Checkbox, ChakraProvider, Input, Link, Separator, Switch, Tabs, Text, defaultSystem } from "@chakra-ui/react"
import { col, grid, mount, p, row } from "./kit"

function Set({ w }: { w: string }) {
  const n = p(w)
  return (
    <div style={col}>
      <div style={row}>
        <Button variant="solid" {...n("button-primary")}>Button</Button>
        <Button variant="subtle" {...n("button-secondary")}>Button</Button>
        <Button variant="outline" {...n("button-outline")}>Button</Button>
        <Button variant="ghost" {...n("button-ghost")}>Button</Button>
        <Button variant="solid" colorPalette="red" {...n("button-danger")}>Button</Button>
      </div>
      <Input placeholder="Placeholder" {...n("input")} />
      <div style={row}>
        <Checkbox.Root {...n("checkbox")}><Checkbox.HiddenInput /><Checkbox.Control /></Checkbox.Root>
        <Checkbox.Root defaultChecked {...n("checkbox-checked")}><Checkbox.HiddenInput /><Checkbox.Control /></Checkbox.Root>
        <Switch.Root {...n("switch")}><Switch.HiddenInput /><Switch.Control /></Switch.Root>
        <Switch.Root defaultChecked {...n("switch-checked")}><Switch.HiddenInput /><Switch.Control /></Switch.Root>
        <Badge colorPalette="blue" {...n("badge")}>Badge</Badge>
        <Badge {...n("badge-neutral")}>Badge</Badge>
      </div>
      <Tabs.Root defaultValue="a">
        <Tabs.List {...n("tabs")}>
          <Tabs.Trigger value="a">Active</Tabs.Trigger>
          <Tabs.Trigger value="b" {...n("tab-inactive")}>Inactive</Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>
      <Text {...n("text")}>Text</Text>
      <Text color="fg.muted" {...n("text-muted")}>Muted</Text>
      <Link href="#" colorPalette="blue" {...n("link")}>Link</Link>
      <Separator {...n("divider")} />
      <Alert.Root status="error" {...n("alert-danger")}><Alert.Title>Alert</Alert.Title></Alert.Root>
      <Alert.Root status="info" {...n("alert-info")}><Alert.Title>Alert</Alert.Title></Alert.Root>
    </div>
  )
}

mount(
  () => (
    <ChakraProvider value={defaultSystem}>
      <Box bg="bg" color="fg" minH="100vh" style={grid}>
        <Set w="page" />
        <Card.Root {...p("page")("card")}>
          <Card.Body>
            <Set w="card" />
          </Card.Body>
        </Card.Root>
      </Box>
    </ChakraProvider>
  ),
  { onMode: (m) => { document.documentElement.classList.toggle("dark", m === "dark"); document.documentElement.classList.toggle("light", m === "light") } },
)
