# Probe: shadcn/ui

Probed 2026-10-08 from this app's preset (b1sABueby). 31 color variables set to sentinel colors; real hover, press, and keyboard focus; every painted color traced back to its variable, opacity, or mix, and to the surfaces underneath.

## Light mode

542 samples collapsed to 63 distinct pairs. 22 of 25 profile recipes observed exactly; 1 more had their paint observed over a different surface.

### Profile recipes not observed

| Recipe | Pair | Written from | Paint seen elsewhere |
| --- | --- | --- | --- |
| accent | `--accent | --popover` | select item: bg-accent |  |
| sidebar | `--sidebar | --background` | sidebar: bg-sidebar |  |
| item-highlight | `--foreground/0.1 | --popover` | select: data-highlighted:bg-foreground/10 | yes |

### Pairs the components paint that the profile doesn't list

| Pair | Seen in |
| --- | --- |
| `--primary | --background` | button-default@page rest background-color, button-default@page focus background-color, button-link@page rest color, button-link@page hover color, +14 |
| `--primary | --card` | button-default@card rest background-color, button-default@card focus background-color, button-link@card rest color, button-link@card hover color, +14 |
| `--muted-foreground | --background` | input@page rest placeholder, input@page hover placeholder, input@page pressed placeholder, input@page focus placeholder, +12 |
| `--ring | --background` | button-outline@page focus border, button-ghost@page focus border, button-link@page focus border, input@page pressed border, +8 |
| `--secondary-foreground | --secondary` | button-secondary@page rest color, button-secondary@page focus color, badge-secondary@page rest color, badge-secondary@page hover color, +8 |
| `--muted | --background` | button-outline@page hover background-color, button-outline@page pressed background-color, button-ghost@page hover background-color, button-ghost@page pressed background-color, +7 |
| `--background | --muted` | tabs@page rest background-color, tabs@page hover background-color, tabs@page pressed background-color, tabs@page focus background-color, +6 |
| `--background | --input` | switch@page rest background-color, switch@page hover background-color, switch@page pressed background-color, switch-checked@page focus background-color, +4 |
| `--background | --primary` | switch@page focus background-color, switch-checked@page rest background-color, switch-checked@page hover background-color, switch-checked@page pressed background-color, +4 |
| `--destructive/0.9 | --card` | alert-destructive@page rest color, alert-destructive@page hover color, alert-destructive@page pressed color, alert-destructive@page focus color, +4 |
| `--ring | --primary` | button-default@page focus border, checkbox@page focus border, switch@page focus border, button-default@card focus border, +2 |
| `--secondary | --background` | button-secondary@page rest background-color, button-secondary@page focus background-color, badge-secondary@page rest background-color, badge-secondary@page hover background-color, +2 |
| `--destructive/0.1 | --background` | button-destructive@page rest background-color, button-destructive@page focus background-color, badge-destructive@page rest background-color, badge-destructive@page hover background-color, +2 |
| `--destructive | --background > --destructive/0.1` | button-destructive@page rest color, button-destructive@page focus color, badge-destructive@page rest color, badge-destructive@page hover color, +2 |
| `--primary | --primary` | checkbox-checked@page rest border, checkbox-checked@page hover border, checkbox-checked@page pressed border, checkbox-checked@card rest border, +2 |
| `--ring | --card` | button-ghost@card focus border, button-link@card focus border, input@card pressed border, input@card focus border, +2 |
| `--border | --muted` | button-outline@page hover border, button-outline@page pressed border, button-outline@card hover border, button-outline@card pressed border |
| `--secondary-foreground | mix(--secondary,--foreground,0.05)` | button-secondary@page hover color, button-secondary@page pressed color, button-secondary@card hover color, button-secondary@card pressed color |
| `--primary-foreground | --background` | checkbox@page focus stroke, checkbox-checked@page rest stroke, checkbox-checked@page hover stroke, checkbox-checked@page pressed stroke |
| `--ring | --muted` | tabs@page focus outline, tab-inactive@page focus outline, tabs@card focus outline, tab-inactive@card focus outline |
| `--ring/0.5 | --muted` | tabs@page focus ring, tab-inactive@page focus ring, tabs@card focus ring, tab-inactive@card focus ring |
| `--primary-foreground | --card` | checkbox@card focus stroke, checkbox-checked@card rest stroke, checkbox-checked@card hover stroke, checkbox-checked@card pressed stroke |
| `--card | --card` | alert-destructive@card rest background-color, alert-destructive@card hover background-color, alert-destructive@card pressed background-color, alert-destructive@card focus background-color |
| `--destructive/0.2 | --background` | button-destructive@page hover background-color, button-destructive@page pressed background-color, button-destructive@page focus ring |
| `--destructive/0.2 | --card` | button-destructive@card hover background-color, button-destructive@card pressed background-color, button-destructive@card focus ring |
| `--primary/0.8 | --background` | button-default@page hover background-color, button-default@page pressed background-color |
| `--primary-foreground | --background > --primary/0.8` | button-default@page hover color, button-default@page pressed color |
| `--background | --background` | button-outline@page rest background-color, button-outline@page focus background-color |
| `mix(--secondary,--foreground,0.05) | --background` | button-secondary@page hover background-color, button-secondary@page pressed background-color |
| `--ring | --secondary` | button-secondary@page focus border, button-secondary@card focus border |
| `--destructive | --background > --destructive/0.2` | button-destructive@page hover color, button-destructive@page pressed color |
| `--ring | --input` | switch-checked@page focus border, switch-checked@card focus border |
| `--muted/0.5 | --background` | table-row@page hover background-color, table-row@page pressed background-color |
| `--primary-foreground | --card > --primary/0.8` | button-default@card hover color, button-default@card pressed color |
| `--background | --card` | button-outline@card rest background-color, button-outline@card focus background-color |
| `--destructive | --card > --destructive/0.2` | button-destructive@card hover color, button-destructive@card pressed color |
| `--destructive/0.4 | --background > --destructive/0.1` | button-destructive@page focus border |
| `--destructive/0.4 | --card > --destructive/0.1` | button-destructive@card focus border |

## Dark mode

566 samples collapsed to 84 distinct pairs. 24 of 29 profile recipes observed exactly; 3 more had their paint observed over a different surface.

### Profile recipes not observed

| Recipe | Pair | Written from | Paint seen elsewhere |
| --- | --- | --- | --- |
| accent | `--accent | --popover` | select item: bg-accent |  |
| sidebar | `--sidebar | --background` | sidebar: bg-sidebar |  |
| item-highlight | `--foreground/0.1 | --popover` | select: data-highlighted:bg-foreground/10 | yes |
| input-card | `--input | --card` | input, select, checkbox: border-input | yes |
| input-page | `--input | --background` | border-input | yes |

### Pairs the components paint that the profile doesn't list

| Pair | Seen in |
| --- | --- |
| `--primary | --card` | button-default@card rest background-color, button-default@card focus background-color, button-link@card rest color, button-link@card hover color, +14 |
| `--input/0.3 | --background` | button-outline@page rest background-color, button-outline@page focus background-color, input@page rest background-color, input@page hover background-color, +8 |
| `--secondary-foreground | --secondary` | button-secondary@page rest color, button-secondary@page focus color, badge-secondary@page rest color, badge-secondary@page hover color, +8 |
| `--input | --background > --input/0.3` | button-outline@page rest border, button-outline@page focus border, input@page rest border, input@page hover border, +4 |
| `--muted-foreground | --background > --input/0.3` | input@page rest placeholder, input@page hover placeholder, input@page pressed placeholder, input@page focus placeholder, +4 |
| `--destructive/0.9 | --card` | alert-destructive@page rest color, alert-destructive@page hover color, alert-destructive@page pressed color, alert-destructive@page focus color, +4 |
| `--input | --card > --input/0.3` | button-outline@card rest border, button-outline@card focus border, input@card rest border, input@card hover border, +4 |
| `--muted-foreground | --card > --input/0.3` | input@card rest placeholder, input@card hover placeholder, input@card pressed placeholder, input@card focus placeholder, +4 |
| `--muted | --background` | toggle@page rest background-color, toggle@page hover background-color, toggle@page pressed background-color, tabs@page rest background-color, +3 |
| `--input/0.3 | --muted` | tabs@page focus background-color, tab-inactive@page focus background-color, tabs@card rest background-color, tabs@card hover background-color, +3 |
| `--foreground | --muted > --input/0.3` | tabs@page focus color, tab-inactive@page focus color, tabs@card rest color, tabs@card hover color, +3 |
| `--input | --muted > --input/0.3` | tabs@page focus border, tab-inactive@page focus border, tabs@card rest border, tabs@card hover border, +3 |
| `--ring | --primary` | button-default@page focus border, checkbox-checked@page focus border, switch-checked@page focus border, button-default@card focus border, +2 |
| `--foreground | --background > --input/0.3` | button-outline@page rest color, button-outline@page focus color, input@page rest color, input@page hover color, +2 |
| `--secondary | --background` | button-secondary@page rest background-color, button-secondary@page focus background-color, badge-secondary@page rest background-color, badge-secondary@page hover background-color, +2 |
| `--destructive/0.2 | --background` | button-destructive@page rest background-color, button-destructive@page focus background-color, badge-destructive@page rest background-color, badge-destructive@page hover background-color, +2 |
| `--destructive | --background > --destructive/0.2` | button-destructive@page rest color, button-destructive@page focus color, badge-destructive@page rest color, badge-destructive@page hover color, +2 |
| `--primary | --primary` | checkbox@page rest border, checkbox@page hover border, checkbox@page pressed border, checkbox@card rest border, +2 |
| `--card-foreground | --card > --input/0.3` | button-outline@card rest color, button-outline@card focus color, input@card rest color, input@card hover color, +2 |
| `--input/0.5 | --background` | button-outline@page hover background-color, button-outline@page pressed background-color, select@page hover background-color, select@page pressed background-color |
| `--input | --background > --input/0.5` | button-outline@page hover border, button-outline@page pressed border, select@page hover border, select@page pressed border |
| `--secondary-foreground | mix(--secondary,--foreground,0.05)` | button-secondary@page hover color, button-secondary@page pressed color, button-secondary@card hover color, button-secondary@card pressed color |
| `--muted/0.5 | --background` | button-ghost@page hover background-color, button-ghost@page pressed background-color, table-row@page hover background-color, table-row@page pressed background-color |
| `--ring | --background > --input/0.3` | input@page pressed border, input@page focus border, checkbox@page focus border, select@page focus border |
| `--primary-foreground | --background` | checkbox@page rest stroke, checkbox@page hover stroke, checkbox@page pressed stroke, checkbox-checked@page focus stroke |
| `--input/0.8 | --background` | switch@page focus background-color, switch-checked@page rest background-color, switch-checked@page hover background-color, switch-checked@page pressed background-color |
| `--foreground | --background > --input/0.8` | switch@page focus background-color, switch-checked@page rest background-color, switch-checked@page hover background-color, switch-checked@page pressed background-color |
| `--ring | --muted` | tabs@page focus outline, tab-inactive@page focus outline, tabs@card focus outline, tab-inactive@card focus outline |
| `--ring/0.5 | --muted` | tabs@page focus ring, tab-inactive@page focus ring, tabs@card focus ring, tab-inactive@card focus ring |
| `--muted-foreground | --background > --input/0.5` | select@page hover color, select@page hover stroke, select@page pressed color, select@page pressed stroke |
| `--muted-foreground | --background` | text-muted@page rest color, text-muted@page hover color, text-muted@page pressed color, text-muted@page focus color |
| `--input | --card > --input/0.5` | button-outline@card hover border, button-outline@card pressed border, select@card hover border, select@card pressed border |
| `--ring | --card > --input/0.3` | input@card pressed border, input@card focus border, checkbox@card focus border, select@card focus border |
| `--primary-foreground | --card` | checkbox@card rest stroke, checkbox@card hover stroke, checkbox@card pressed stroke, checkbox-checked@card focus stroke |
| `--foreground | --card > --input/0.8` | switch@card focus background-color, switch-checked@card rest background-color, switch-checked@card hover background-color, switch-checked@card pressed background-color |
| `--muted-foreground | --card > --input/0.5` | select@card hover color, select@card hover stroke, select@card pressed color, select@card pressed stroke |
| `--card | --card` | alert-destructive@card rest background-color, alert-destructive@card hover background-color, alert-destructive@card pressed background-color, alert-destructive@card focus background-color |
| `--primary/0.8 | --background` | button-default@page hover background-color, button-default@page pressed background-color |
| `--primary-foreground | --background > --primary/0.8` | button-default@page hover color, button-default@page pressed color |
| `--foreground | --background > --input/0.5` | button-outline@page hover color, button-outline@page pressed color |
| `mix(--secondary,--foreground,0.05) | --background` | button-secondary@page hover background-color, button-secondary@page pressed background-color |
| `--ring | --secondary` | button-secondary@page focus border, button-secondary@card focus border |
| `--foreground | --background > --muted/0.5` | button-ghost@page hover color, button-ghost@page pressed color |
| `--ring | --background` | button-ghost@page focus border, button-link@page focus border |
| `--destructive/0.3 | --background` | button-destructive@page hover background-color, button-destructive@page pressed background-color |
| `--destructive | --background > --destructive/0.3` | button-destructive@page hover color, button-destructive@page pressed color |
| `--primary-foreground | --card > --primary/0.8` | button-default@card hover color, button-default@card pressed color |
| `--foreground | --card > --input/0.5` | button-outline@card hover color, button-outline@card pressed color |
| `--foreground | --card > --muted/0.5` | button-ghost@card hover color, button-ghost@card pressed color |
| `--ring | --card` | button-ghost@card focus border, button-link@card focus border |
| `--destructive/0.3 | --card` | button-destructive@card hover background-color, button-destructive@card pressed background-color |
| `--destructive | --card > --destructive/0.3` | button-destructive@card hover color, button-destructive@card pressed color |
| `--destructive/0.4 | --background > --destructive/0.2` | button-destructive@page focus border |
| `--destructive/0.4 | --background` | button-destructive@page focus ring |
| `--ring | --background > --input/0.8` | switch@page focus border |
| `--destructive/0.4 | --card > --destructive/0.2` | button-destructive@card focus border |
| `--destructive/0.4 | --card` | button-destructive@card focus ring |
| `--ring | --card > --input/0.8` | switch@card focus border |
