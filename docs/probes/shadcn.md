# Probe: shadcn/ui

Probed 2026-10-08 from this app's preset components (b1sABueby, Base UI). 32 color variables set to sentinel colors; real hover, press, and keyboard focus; every painted color traced back to its variable, opacity, or mix, and to the surfaces underneath.

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
| `--primary | --background` | button-default rest background-color, button-default focus background-color, button-link rest color, button-link hover color, +14 |
| `--primary | --card` | button-default rest background-color, button-default focus background-color, button-link rest color, button-link hover color, +14 |
| `--muted-foreground | --background` | input rest placeholder, input hover placeholder, input pressed placeholder, input focus placeholder, +12 |
| `--muted | --background` | button-outline hover background-color, button-outline pressed background-color, button-ghost hover background-color, button-ghost pressed background-color, +7 |
| `--ring | --background` | button-outline focus border, button-ghost focus border, button-link focus border, input pressed border, +5 |
| `--secondary | --background` | button-secondary rest background-color, button-secondary focus background-color, badge-secondary rest background-color, badge-secondary hover background-color, +2 |
| `--secondary-foreground | --secondary` | button-secondary rest color, button-secondary focus color, badge-secondary rest color, badge-secondary hover color, +2 |
| `--destructive/0.1 | --background` | button-destructive rest background-color, button-destructive focus background-color, badge-destructive rest background-color, badge-destructive hover background-color, +2 |
| `--destructive | --background > --destructive/0.1` | button-destructive rest color, button-destructive focus color, badge-destructive rest color, badge-destructive hover color, +2 |
| `--ring | --card` | button-ghost focus border, button-link focus border, input pressed border, input focus border, +2 |
| `--background | --muted` | tabs rest background-color, tabs hover background-color, tabs pressed background-color, tabs focus background-color, +1 |
| `--primary-foreground | --background` | checkbox focus stroke, checkbox-checked rest stroke, checkbox-checked hover stroke, checkbox-checked pressed stroke |
| `--background | --input` | switch rest background-color, switch hover background-color, switch pressed background-color, switch-checked focus background-color |
| `--background | --primary` | switch focus background-color, switch-checked rest background-color, switch-checked hover background-color, switch-checked pressed background-color |
| `--destructive/0.9 | --card` | alert-destructive rest color, alert-destructive hover color, alert-destructive pressed color, alert-destructive focus color |
| `--primary-foreground | --card` | checkbox focus stroke, checkbox-checked rest stroke, checkbox-checked hover stroke, checkbox-checked pressed stroke |
| `--card | --card` | alert-destructive rest background-color, alert-destructive hover background-color, alert-destructive pressed background-color, alert-destructive focus background-color |
| `--ring | --primary` | button-default focus border, checkbox focus border, switch focus border |
| `--destructive/0.2 | --background` | button-destructive hover background-color, button-destructive pressed background-color, button-destructive focus ring |
| `--primary | --primary` | checkbox-checked rest border, checkbox-checked hover border, checkbox-checked pressed border |
| `--destructive/0.2 | --card` | button-destructive hover background-color, button-destructive pressed background-color, button-destructive focus ring |
| `--primary/0.8 | --background` | button-default hover background-color, button-default pressed background-color |
| `--primary-foreground | --background > --primary/0.8` | button-default hover color, button-default pressed color |
| `--background | --background` | button-outline rest background-color, button-outline focus background-color |
| `--border | --muted` | button-outline hover border, button-outline pressed border |
| `mix(--secondary,--foreground,0.05) | --background` | button-secondary hover background-color, button-secondary pressed background-color |
| `--secondary-foreground | mix(--secondary,--foreground,0.05)` | button-secondary hover color, button-secondary pressed color |
| `--destructive | --background > --destructive/0.2` | button-destructive hover color, button-destructive pressed color |
| `--ring | --muted` | tabs focus outline, tab-inactive focus outline |
| `--ring/0.5 | --muted` | tabs focus ring, tab-inactive focus ring |
| `--muted/0.5 | --background` | table-row hover background-color, table-row pressed background-color |
| `--primary-foreground | --card > --primary/0.8` | button-default hover color, button-default pressed color |
| `--background | --card` | button-outline rest background-color, button-outline focus background-color |
| `--destructive | --card > --destructive/0.2` | button-destructive hover color, button-destructive pressed color |
| `--ring | --secondary` | button-secondary focus border |
| `--destructive/0.4 | --background > --destructive/0.1` | button-destructive focus border |
| `--ring | --input` | switch-checked focus border |
| `--destructive/0.4 | --card > --destructive/0.1` | button-destructive focus border |

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
| `--primary | --card` | button-default rest background-color, button-default focus background-color, button-link rest color, button-link hover color, +14 |
| `--input/0.3 | --background` | button-outline rest background-color, button-outline focus background-color, input rest background-color, input hover background-color, +8 |
| `--input | --background > --input/0.3` | button-outline rest border, button-outline focus border, input rest border, input hover border, +4 |
| `--muted-foreground | --background > --input/0.3` | input rest placeholder, input hover placeholder, input pressed placeholder, input focus placeholder, +4 |
| `--input | --card > --input/0.3` | button-outline rest border, button-outline focus border, input rest border, input hover border, +4 |
| `--muted-foreground | --card > --input/0.3` | input rest placeholder, input hover placeholder, input pressed placeholder, input focus placeholder, +4 |
| `--muted | --background` | toggle rest background-color, toggle hover background-color, toggle pressed background-color, tabs rest background-color, +3 |
| `--foreground | --background > --input/0.3` | button-outline rest color, button-outline focus color, input rest color, input hover color, +2 |
| `--secondary | --background` | button-secondary rest background-color, button-secondary focus background-color, badge-secondary rest background-color, badge-secondary hover background-color, +2 |
| `--secondary-foreground | --secondary` | button-secondary rest color, button-secondary focus color, badge-secondary rest color, badge-secondary hover color, +2 |
| `--destructive/0.2 | --background` | button-destructive rest background-color, button-destructive focus background-color, badge-destructive rest background-color, badge-destructive hover background-color, +2 |
| `--destructive | --background > --destructive/0.2` | button-destructive rest color, button-destructive focus color, badge-destructive rest color, badge-destructive hover color, +2 |
| `--card-foreground | --card > --input/0.3` | button-outline rest color, button-outline focus color, input rest color, input hover color, +2 |
| `--input/0.3 | --muted` | tabs focus background-color, tab-inactive focus background-color, tabs rest background-color, tabs hover background-color, +1 |
| `--foreground | --muted > --input/0.3` | tabs focus color, tab-inactive focus color, tabs rest color, tabs hover color, +1 |
| `--input | --muted > --input/0.3` | tabs focus border, tab-inactive focus border, tabs rest border, tabs hover border, +1 |
| `--input/0.5 | --background` | button-outline hover background-color, button-outline pressed background-color, select hover background-color, select pressed background-color |
| `--input | --background > --input/0.5` | button-outline hover border, button-outline pressed border, select hover border, select pressed border |
| `--muted/0.5 | --background` | button-ghost hover background-color, button-ghost pressed background-color, table-row hover background-color, table-row pressed background-color |
| `--ring | --background > --input/0.3` | input pressed border, input focus border, checkbox focus border, select focus border |
| `--primary-foreground | --background` | checkbox rest stroke, checkbox hover stroke, checkbox pressed stroke, checkbox-checked focus stroke |
| `--input/0.8 | --background` | switch focus background-color, switch-checked rest background-color, switch-checked hover background-color, switch-checked pressed background-color |
| `--foreground | --background > --input/0.8` | switch focus background-color, switch-checked rest background-color, switch-checked hover background-color, switch-checked pressed background-color |
| `--muted-foreground | --background > --input/0.5` | select hover color, select hover stroke, select pressed color, select pressed stroke |
| `--muted-foreground | --background` | text-muted rest color, text-muted hover color, text-muted pressed color, text-muted focus color |
| `--destructive/0.9 | --card` | alert-destructive rest color, alert-destructive hover color, alert-destructive pressed color, alert-destructive focus color |
| `--input | --card > --input/0.5` | button-outline hover border, button-outline pressed border, select hover border, select pressed border |
| `--ring | --card > --input/0.3` | input pressed border, input focus border, checkbox focus border, select focus border |
| `--primary-foreground | --card` | checkbox rest stroke, checkbox hover stroke, checkbox pressed stroke, checkbox-checked focus stroke |
| `--foreground | --card > --input/0.8` | switch focus background-color, switch-checked rest background-color, switch-checked hover background-color, switch-checked pressed background-color |
| `--muted-foreground | --card > --input/0.5` | select hover color, select hover stroke, select pressed color, select pressed stroke |
| `--card | --card` | alert-destructive rest background-color, alert-destructive hover background-color, alert-destructive pressed background-color, alert-destructive focus background-color |
| `--ring | --primary` | button-default focus border, checkbox-checked focus border, switch-checked focus border |
| `--primary | --primary` | checkbox rest border, checkbox hover border, checkbox pressed border |
| `--primary/0.8 | --background` | button-default hover background-color, button-default pressed background-color |
| `--primary-foreground | --background > --primary/0.8` | button-default hover color, button-default pressed color |
| `--foreground | --background > --input/0.5` | button-outline hover color, button-outline pressed color |
| `mix(--secondary,--foreground,0.05) | --background` | button-secondary hover background-color, button-secondary pressed background-color |
| `--secondary-foreground | mix(--secondary,--foreground,0.05)` | button-secondary hover color, button-secondary pressed color |
| `--foreground | --background > --muted/0.5` | button-ghost hover color, button-ghost pressed color |
| `--ring | --background` | button-ghost focus border, button-link focus border |
| `--destructive/0.3 | --background` | button-destructive hover background-color, button-destructive pressed background-color |
| `--destructive | --background > --destructive/0.3` | button-destructive hover color, button-destructive pressed color |
| `--ring | --muted` | tabs focus outline, tab-inactive focus outline |
| `--ring/0.5 | --muted` | tabs focus ring, tab-inactive focus ring |
| `--primary-foreground | --card > --primary/0.8` | button-default hover color, button-default pressed color |
| `--foreground | --card > --input/0.5` | button-outline hover color, button-outline pressed color |
| `--foreground | --card > --muted/0.5` | button-ghost hover color, button-ghost pressed color |
| `--ring | --card` | button-ghost focus border, button-link focus border |
| `--destructive/0.3 | --card` | button-destructive hover background-color, button-destructive pressed background-color |
| `--destructive | --card > --destructive/0.3` | button-destructive hover color, button-destructive pressed color |
| `--ring | --secondary` | button-secondary focus border |
| `--destructive/0.4 | --background > --destructive/0.2` | button-destructive focus border |
| `--destructive/0.4 | --background` | button-destructive focus ring |
| `--ring | --background > --input/0.8` | switch focus border |
| `--destructive/0.4 | --card > --destructive/0.2` | button-destructive focus border |
| `--destructive/0.4 | --card` | button-destructive focus ring |
| `--ring | --card > --input/0.8` | switch focus border |
