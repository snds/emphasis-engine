# Probe: shadcn/ui

Probed 2026-10-08 from this app's preset (b1sABueby). 31 color variables set to sentinel colors; real hover, press, and keyboard focus; every painted color traced back to its variable, opacity, or mix, and to the surfaces underneath.

## Light mode

542 samples collapsed to 66 distinct pairs. 22 of 25 profile recipes observed exactly; 1 more had their paint observed over a different surface.

### Profile recipes not observed

| Recipe | Pair | Written from | Paint seen elsewhere |
| --- | --- | --- | --- |
| accent | `--accent | --popover` | select item: bg-accent |  |
| sidebar | `--sidebar | --background` | sidebar: bg-sidebar |  |
| item-highlight | `--foreground/0.1 | --popover` | select: data-highlighted:bg-foreground/10 | yes |

### Pairs the components paint that the profile doesn't list

| Pair | Seen in |
| --- | --- |
| `--secondary-foreground | --secondary` | button-secondary@page rest color, button-secondary@page focus color, badge-secondary@page rest color, badge-secondary@page hover color, +8 |
| `--ring | --background` | button-outline@page focus border, button-ghost@page focus border, button-link@page focus border, input@page pressed border, +7 |
| `--muted | --background` | button-outline@page hover background-color, button-outline@page pressed background-color, button-ghost@page hover background-color, button-ghost@page pressed background-color, +6 |
| `--muted-foreground | --background` | select@page rest color, select@page hover color, select@page pressed color, select@page focus color, +4 |
| `--destructive/0.9 | --card` | alert-destructive@page rest color, alert-destructive@page hover color, alert-destructive@page pressed color, alert-destructive@page focus color, +4 |
| `--background | --muted` | tabs@page focus background-color, tab-inactive@page focus background-color, tabs@card rest background-color, tabs@card hover background-color, +3 |
| `--primary | --background` | button-default@page rest background-color, button-default@page focus background-color, badge-default@page rest background-color, badge-default@page hover background-color, +2 |
| `--secondary | --background` | button-secondary@page rest background-color, button-secondary@page focus background-color, badge-secondary@page rest background-color, badge-secondary@page hover background-color, +2 |
| `--destructive/0.1 | --background` | button-destructive@page rest background-color, button-destructive@page focus background-color, badge-destructive@page rest background-color, badge-destructive@page hover background-color, +2 |
| `--destructive | --background > --destructive/0.1` | button-destructive@page rest color, button-destructive@page focus color, badge-destructive@page rest color, badge-destructive@page hover color, +2 |
| `--primary | --card` | button-default@card rest background-color, button-default@card focus background-color, badge-default@card rest background-color, badge-default@card hover background-color, +2 |
| `--ring | --card` | button-ghost@card focus border, button-link@card focus border, input@card pressed border, input@card focus border, +1 |
| `--border | --muted` | button-outline@page hover border, button-outline@page pressed border, button-outline@card hover border, button-outline@card pressed border |
| `--secondary-foreground | mix(--secondary,--foreground,0.05)` | button-secondary@page hover color, button-secondary@page pressed color, button-secondary@card hover color, button-secondary@card pressed color |
| `--primary | --background` | button-link@page rest color, button-link@page hover color, button-link@page pressed color, button-link@page focus color |
| `--muted-foreground | --background` | input@page rest placeholder, input@page hover placeholder, input@page pressed placeholder, input@page focus placeholder |
| `--ring | --muted` | tabs@page focus outline, tab-inactive@page focus outline, tabs@card focus outline, tab-inactive@card focus outline |
| `--ring/0.5 | --muted` | tabs@page focus ring, tab-inactive@page focus ring, tabs@card focus ring, tab-inactive@card focus ring |
| `--muted-foreground | --background` | select@page rest stroke, select@page hover stroke, select@page pressed stroke, select@page focus stroke |
| `--primary | --card` | button-link@card rest color, button-link@card hover color, button-link@card pressed color, button-link@card focus color |
| `--card | --card` | alert-destructive@card rest background-color, alert-destructive@card hover background-color, alert-destructive@card pressed background-color, alert-destructive@card focus background-color |
| `--primary/0.8 | --background` | button-default@page hover background-color, button-default@page pressed background-color |
| `--primary-foreground | --background > --primary/0.8` | button-default@page hover color, button-default@page pressed color |
| `--ring | --primary` | button-default@page focus border, button-default@card focus border |
| `--background | --background` | button-outline@page rest background-color, button-outline@page focus background-color |
| `mix(--secondary,--foreground,0.05) | --background` | button-secondary@page hover background-color, button-secondary@page pressed background-color |
| `--ring | --secondary` | button-secondary@page focus border, button-secondary@card focus border |
| `--destructive/0.2 | --background` | button-destructive@page hover background-color, button-destructive@page pressed background-color |
| `--destructive | --background > --destructive/0.2` | button-destructive@page hover color, button-destructive@page pressed color |
| `--muted/0.5 | --background` | table-row@page hover background-color, table-row@page pressed background-color |
| `--primary-foreground | --card > --primary/0.8` | button-default@card hover color, button-default@card pressed color |
| `--background | --card` | button-outline@card rest background-color, button-outline@card focus background-color |
| `--destructive/0.2 | --card` | button-destructive@card hover background-color, button-destructive@card pressed background-color |
| `--destructive | --card > --destructive/0.2` | button-destructive@card hover color, button-destructive@card pressed color |
| `--destructive/0.4 | --background > --destructive/0.1` | button-destructive@page focus border |
| `--destructive/0.2 | --background` | button-destructive@page focus ring |
| `--destructive/0.4 | --card > --destructive/0.1` | button-destructive@card focus border |
| `--destructive/0.2 | --card` | button-destructive@card focus ring |

## Dark mode

566 samples collapsed to 84 distinct pairs. 23 of 29 profile recipes observed exactly; 3 more had their paint observed over a different surface.

### Profile recipes not observed

| Recipe | Pair | Written from | Paint seen elsewhere |
| --- | --- | --- | --- |
| accent | `--accent | --popover` | select item: bg-accent |  |
| sidebar | `--sidebar | --background` | sidebar: bg-sidebar |  |
| switch-off | `--input/0.8 | --card` | switch: dark:data-unchecked:bg-input/80 |  |
| item-highlight | `--foreground/0.1 | --popover` | select: data-highlighted:bg-foreground/10 | yes |
| input-card | `--input | --card` | input, select, checkbox: border-input | yes |
| input-page | `--input | --background` | border-input | yes |

### Pairs the components paint that the profile doesn't list

| Pair | Seen in |
| --- | --- |
| `--secondary-foreground | --secondary` | button-secondary@page rest color, button-secondary@page focus color, badge-secondary@page rest color, badge-secondary@page hover color, +8 |
| `--input/0.3 | --background` | button-outline@page rest background-color, button-outline@page focus background-color, input@page rest background-color, input@page hover background-color, +4 |
| `--destructive/0.9 | --card` | alert-destructive@page rest color, alert-destructive@page hover color, alert-destructive@page pressed color, alert-destructive@page focus color, +4 |
| `--input/0.3 | --muted` | tabs@page focus background-color, tab-inactive@page focus background-color, tabs@card rest background-color, tabs@card hover background-color, +3 |
| `--foreground | --muted > --input/0.3` | tabs@page focus color, tab-inactive@page focus color, tabs@card rest color, tabs@card hover color, +3 |
| `--input | --muted > --input/0.3` | tabs@page focus border, tab-inactive@page focus border, tabs@card rest border, tabs@card hover border, +3 |
| `--foreground | --background > --input/0.3` | button-outline@page rest color, button-outline@page focus color, input@page rest color, input@page hover color, +2 |
| `--secondary | --background` | button-secondary@page rest background-color, button-secondary@page focus background-color, badge-secondary@page rest background-color, badge-secondary@page hover background-color, +2 |
| `--destructive/0.2 | --background` | button-destructive@page rest background-color, button-destructive@page focus background-color, badge-destructive@page rest background-color, badge-destructive@page hover background-color, +2 |
| `--destructive | --background > --destructive/0.2` | button-destructive@page rest color, button-destructive@page focus color, badge-destructive@page rest color, badge-destructive@page hover color, +2 |
| `--muted | --background` | toggle@page hover background-color, toggle@page pressed background-color, tabs@page rest background-color, tabs@page hover background-color, +2 |
| `--primary | --card` | button-default@card rest background-color, button-default@card focus background-color, badge-default@card rest background-color, badge-default@card hover background-color, +2 |
| `--card-foreground | --card > --input/0.3` | button-outline@card rest color, button-outline@card focus color, input@card rest color, input@card hover color, +2 |
| `--input | --background > --input/0.3` | button-outline@page rest border, button-outline@page focus border, input@page rest border, input@page hover border, +1 |
| `--input | --card > --input/0.3` | button-outline@card rest border, button-outline@card focus border, input@card rest border, input@card hover border, +1 |
| `--input/0.5 | --background` | button-outline@page hover background-color, button-outline@page pressed background-color, select@page hover background-color, select@page pressed background-color |
| `--input | --background > --input/0.5` | button-outline@page hover border, button-outline@page pressed border, select@page hover border, select@page pressed border |
| `--secondary-foreground | mix(--secondary,--foreground,0.05)` | button-secondary@page hover color, button-secondary@page pressed color, button-secondary@card hover color, button-secondary@card pressed color |
| `--muted/0.5 | --background` | button-ghost@page hover background-color, button-ghost@page pressed background-color, table-row@page hover background-color, table-row@page pressed background-color |
| `--muted-foreground | --background > --input/0.3` | input@page rest placeholder, input@page hover placeholder, input@page pressed placeholder, input@page focus placeholder |
| `--ring | --muted` | tabs@page focus outline, tab-inactive@page focus outline, tabs@card focus outline, tab-inactive@card focus outline |
| `--ring/0.5 | --muted` | tabs@page focus ring, tab-inactive@page focus ring, tabs@card focus ring, tab-inactive@card focus ring |
| `--muted-foreground | --background` | text-muted@page rest color, text-muted@page hover color, text-muted@page pressed color, text-muted@page focus color |
| `--input | --card > --input/0.5` | button-outline@card hover border, button-outline@card pressed border, select@card hover border, select@card pressed border |
| `--primary | --card` | button-link@card rest color, button-link@card hover color, button-link@card pressed color, button-link@card focus color |
| `--muted-foreground | --card > --input/0.3` | input@card rest placeholder, input@card hover placeholder, input@card pressed placeholder, input@card focus placeholder |
| `--card | --card` | alert-destructive@card rest background-color, alert-destructive@card hover background-color, alert-destructive@card pressed background-color, alert-destructive@card focus background-color |
| `--ring | --background > --input/0.3` | input@page pressed border, input@page focus border, select@page focus border |
| `--ring | --card > --input/0.3` | input@card pressed border, input@card focus border, select@card focus border |
| `--primary/0.8 | --background` | button-default@page hover background-color, button-default@page pressed background-color |
| `--primary-foreground | --background > --primary/0.8` | button-default@page hover color, button-default@page pressed color |
| `--ring | --primary` | button-default@page focus border, button-default@card focus border |
| `--foreground | --background > --input/0.5` | button-outline@page hover color, button-outline@page pressed color |
| `mix(--secondary,--foreground,0.05) | --background` | button-secondary@page hover background-color, button-secondary@page pressed background-color |
| `--ring | --secondary` | button-secondary@page focus border, button-secondary@card focus border |
| `--foreground | --background > --muted/0.5` | button-ghost@page hover color, button-ghost@page pressed color |
| `--ring | --background` | button-ghost@page focus border, button-link@page focus border |
| `--destructive/0.3 | --background` | button-destructive@page hover background-color, button-destructive@page pressed background-color |
| `--destructive | --background > --destructive/0.3` | button-destructive@page hover color, button-destructive@page pressed color |
| `--muted-foreground | --background > --input/0.3` | select@page rest color, select@page focus color |
| `--muted-foreground | --background > --input/0.3` | select@page rest stroke, select@page focus stroke |
| `--muted-foreground | --background > --input/0.5` | select@page hover color, select@page pressed color |
| `--muted-foreground | --background > --input/0.5` | select@page hover stroke, select@page pressed stroke |
| `--primary-foreground | --card > --primary/0.8` | button-default@card hover color, button-default@card pressed color |
| `--foreground | --card > --input/0.5` | button-outline@card hover color, button-outline@card pressed color |
| `--foreground | --card > --muted/0.5` | button-ghost@card hover color, button-ghost@card pressed color |
| `--ring | --card` | button-ghost@card focus border, button-link@card focus border |
| `--destructive/0.3 | --card` | button-destructive@card hover background-color, button-destructive@card pressed background-color |
| `--destructive | --card > --destructive/0.3` | button-destructive@card hover color, button-destructive@card pressed color |
| `--muted-foreground | --card > --input/0.3` | select@card rest color, select@card focus color |
| `--muted-foreground | --card > --input/0.3` | select@card rest stroke, select@card focus stroke |
| `--muted-foreground | --card > --input/0.5` | select@card hover color, select@card pressed color |
| `--muted-foreground | --card > --input/0.5` | select@card hover stroke, select@card pressed stroke |
| `--destructive/0.4 | --background > --destructive/0.2` | button-destructive@page focus border |
| `--destructive/0.4 | --background` | button-destructive@page focus ring |
| `--destructive/0.4 | --card > --destructive/0.2` | button-destructive@card focus border |
| `--destructive/0.4 | --card` | button-destructive@card focus ring |
