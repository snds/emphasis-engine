// Probe harness: stock shadcn components from this app's preset, each tagged
// with data-probe, on the page and on a card. The probe script sets every
// variable to a sentinel color and reads what the components actually paint.
import { createRoot } from "react-dom/client"
import "../index.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Toggle } from "@/components/ui/toggle"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"

function Set({ where }: { where: string }) {
  const p = (name: string) => ({ "data-probe": `${name}@${where}` })
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {(["default", "outline", "secondary", "ghost", "destructive", "link"] as const).map((v) => (
          <Button key={v} variant={v} {...p(`button-${v}`)}>
            Button
          </Button>
        ))}
      </div>
      <Input placeholder="Placeholder" {...p("input")} />
      <div className="flex items-center gap-3">
        <Checkbox {...p("checkbox")} />
        <Checkbox defaultChecked {...p("checkbox-checked")} />
        <Switch {...p("switch")} />
        <Switch defaultChecked {...p("switch-checked")} />
        <Toggle {...p("toggle")}>B</Toggle>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["default", "secondary", "destructive", "outline"] as const).map((v) => (
          <Badge key={v} variant={v} {...p(`badge-${v}`)}>
            Badge
          </Badge>
        ))}
      </div>
      <Tabs defaultValue="a" {...p("tabs")}>
        <TabsList>
          <TabsTrigger value="a">Active</TabsTrigger>
          <TabsTrigger value="b" data-probe={`tab-inactive@${where}`}>
            Inactive
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Select>
        <SelectTrigger {...p("select")}>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
      </Select>
      <p className="text-foreground" {...p("text")}>
        Text
      </p>
      <p className="text-muted-foreground" {...p("text-muted")}>
        Muted
      </p>
      <Separator {...p("separator")} />
      <Alert variant="destructive" {...p("alert-destructive")}>
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Description</AlertDescription>
      </Alert>
      <Table>
        <TableBody>
          <TableRow {...p("table-row")}>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(
  <div className="grid grid-cols-2 gap-6 bg-background p-6 text-foreground" data-surface="page">
    <Set where="page" />
    <Card data-probe="card@page">
      <CardHeader>
        <CardTitle>Card</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent>
        <Set where="card" />
      </CardContent>
    </Card>
  </div>,
)
