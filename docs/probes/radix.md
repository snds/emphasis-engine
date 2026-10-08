# Probe: Radix Themes

Probed 2026-10-08 from @radix-ui/themes ^3.3.0. 113 color variables set to sentinel colors; real hover, press, and keyboard focus; every painted color traced back to its variable, opacity, or mix, and to the surfaces underneath.

## Light mode

394 samples collapsed to 68 distinct pairs. 23 of 26 profile recipes observed exactly; 1 more had their paint observed over a different surface.

### Profile recipes not observed

| Recipe | Pair | Written from | Paint seen elsewhere |
| --- | --- | --- | --- |
| text-lo-panel | `--gray-11 | --color-panel` | Text color=gray: gray-11 |  |
| field-hover | `--gray-a8 | --color-surface` | TextField: gray-a8 after gray-a7 |  |
| error-text | `--red-a11 | --color-panel` | Text color=red: red-a11 | yes |

### Pairs the components paint that the profile doesn't list

| Pair | Seen in |
| --- | --- |
| `--accent-a11 | --accent-surface` | button-surface@page rest color, button-surface@page hover color, button-surface@page focus color, badge-surface@page rest color, +10 |
| `--accent-a11 | --color-background` | button-outline@page rest color, button-outline@page focus color, button-ghost@page rest color, button-ghost@page focus color, +8 |
| `--accent-a3 | --color-background` | button-soft@page rest background-color, button-soft@page focus background-color, button-surface@page pressed background-color, button-outline@page pressed background-color, +5 |
| `--accent-indicator | --color-background` | checkbox@page focus background-color, checkbox-checked@page rest background-color, checkbox-checked@page hover background-color, checkbox-checked@page pressed background-color, +4 |
| `--accent-a6 | --accent-surface` | badge-surface@page rest inset-ring, badge-surface@page hover inset-ring, badge-surface@page pressed inset-ring, badge-surface@page focus inset-ring, +4 |
| `--gray-a11 | --color-background` | tabs@page rest color, tabs@page hover color, tabs@page pressed color, tabs@page focus color, +4 |
| `--accent-indicator | --color-panel` | checkbox@card focus background-color, checkbox-checked@card rest background-color, checkbox-checked@card hover background-color, checkbox-checked@card pressed background-color, +4 |
| `--accent-surface | --color-background` | button-surface@page rest background-color, button-surface@page hover background-color, button-surface@page focus background-color, badge-surface@page rest background-color, +3 |
| `--accent-surface | --color-panel` | button-surface@card rest background-color, button-surface@card hover background-color, button-surface@card focus background-color, badge-surface@card rest background-color, +3 |
| `--accent-9 | --color-background` | button-solid@page rest background-color, button-solid@page focus background-color, badge-solid@page rest background-color, badge-solid@page hover background-color, +2 |
| `--accent-a8 | --color-background` | button-outline@page rest inset-ring, button-outline@page focus inset-ring, badge-outline@page rest inset-ring, badge-outline@page hover inset-ring, +2 |
| `--gray-a3 | --color-background` | switch@page rest background-color, switch@page hover background-color, switch@page focus background-color, switch-checked@page rest background-color, +2 |
| `--accent-a4 | --gray-a3` | switch@page focus ring, switch-checked@page rest ring, switch-checked@page hover ring, switch@card focus ring, +2 |
| `--accent-9 | --color-panel` | button-solid@card rest background-color, button-solid@card focus background-color, badge-solid@card rest background-color, badge-solid@card hover background-color, +2 |
| `--gray-a3 | --color-panel` | switch@card rest background-color, switch@card hover background-color, switch@card focus background-color, switch-checked@card rest background-color, +2 |
| `--accent-a11 | --accent-a4` | button-soft@page hover color, button-ghost@page pressed color, button-soft@card hover color, button-ghost@card pressed color |
| `--accent-a7 | --accent-surface` | button-surface@page rest inset-ring, button-surface@page focus inset-ring, button-surface@card rest inset-ring, button-surface@card focus inset-ring |
| `--accent-a8 | --accent-a3` | button-surface@page pressed inset-ring, button-outline@page pressed inset-ring, button-surface@card pressed inset-ring, button-outline@card pressed inset-ring |
| `--color-surface | --color-background` | checkbox@page rest background-color, checkbox@page hover background-color, checkbox@page pressed background-color, checkbox-checked@page focus background-color |
| `--gray-a7 | --color-background` | checkbox@page rest inset-ring, checkbox@page hover inset-ring, checkbox@page pressed inset-ring, checkbox-checked@page focus inset-ring |
| `--gray-12 | --accent-indicator` | tabs@page rest color, tabs@page focus color, tabs@card rest color, tabs@card focus color |
| `--gray-12 | --color-background` | text@page rest color, text@page hover color, text@page pressed color, text@page focus color |
| `--gray-a6 | --color-background` | separator@page rest background-color, separator@page hover background-color, separator@page pressed background-color, separator@page focus background-color |
| `--red-a3 | --color-background` | callout-red@page rest background-color, callout-red@page hover background-color, callout-red@page pressed background-color, callout-red@page focus background-color |
| `--gray-a7 | --color-panel` | checkbox@card rest inset-ring, checkbox@card hover inset-ring, checkbox@card pressed inset-ring, checkbox-checked@card focus inset-ring |
| `--red-a3 | --color-panel` | callout-red@card rest background-color, callout-red@card hover background-color, callout-red@card pressed background-color, callout-red@card focus background-color |
| `--accent-a4 | --color-background` | button-soft@page hover background-color, button-ghost@page pressed background-color |
| `--accent-a11 | --accent-a5` | button-soft@page pressed color, button-soft@card pressed color |
| `--accent-a8 | --accent-surface` | button-surface@page hover inset-ring, button-surface@card hover inset-ring |
| `--accent-a11 | --accent-a2` | button-outline@page hover color, button-outline@card hover color |
| `--accent-a8 | --accent-a2` | button-outline@page hover inset-ring, button-outline@card hover inset-ring |
| `--gray-a4 | --color-background` | switch@page pressed background-color, switch-checked@page pressed background-color |
| `--accent-a4 | --gray-a4` | switch-checked@page pressed ring, switch-checked@card pressed ring |
| `--gray-a3 | --accent-indicator` | tabs@page hover background-color, tabs@card hover background-color |
| `--gray-12 | --gray-a3` | tabs@page hover color, tabs@card hover color |
| `--accent-a3 | --accent-indicator` | tabs@page pressed background-color, tabs@card pressed background-color |
| `--gray-12 | --accent-a3` | tabs@page pressed color, tabs@card pressed color |
| `--focus-8 | --accent-indicator` | tabs@page pressed outline, tabs@card pressed outline |
| `--accent-10 | --color-panel` | button-solid@card hover background-color, button-solid@card pressed background-color |
| `--gray-a4 | --color-panel` | switch@card pressed background-color, switch-checked@card pressed background-color |
| `--accent-a5 | --color-background` | button-soft@page pressed background-color |
| `--accent-a2 | --color-background` | button-outline@page hover background-color |
| `--accent-a5 | --color-panel` | button-soft@card pressed background-color |
| `--accent-a2 | --color-panel` | button-outline@card hover background-color |

## Dark mode

394 samples collapsed to 68 distinct pairs. 24 of 27 profile recipes observed exactly; 1 more had their paint observed over a different surface.

### Profile recipes not observed

| Recipe | Pair | Written from | Paint seen elsewhere |
| --- | --- | --- | --- |
| text-lo-panel | `--gray-11 | --color-panel` | Text color=gray: gray-11 |  |
| field-hover | `--gray-a8 | --color-surface` | TextField: gray-a8 after gray-a7 |  |
| error-text | `--red-a11 | --color-panel` | Text color=red: red-a11 | yes |

### Pairs the components paint that the profile doesn't list

| Pair | Seen in |
| --- | --- |
| `--accent-a11 | --accent-surface` | button-surface@page rest color, button-surface@page hover color, button-surface@page focus color, badge-surface@page rest color, +10 |
| `--accent-a11 | --color-background` | button-outline@page rest color, button-outline@page focus color, button-ghost@page rest color, button-ghost@page focus color, +8 |
| `--accent-a3 | --color-background` | button-soft@page rest background-color, button-soft@page focus background-color, button-surface@page pressed background-color, button-outline@page pressed background-color, +5 |
| `--accent-a6 | --accent-surface` | badge-surface@page rest inset-ring, badge-surface@page hover inset-ring, badge-surface@page pressed inset-ring, badge-surface@page focus inset-ring, +4 |
| `--gray-a11 | --color-background` | tabs@page rest color, tabs@page hover color, tabs@page pressed color, tabs@page focus color, +4 |
| `--accent-indicator | --color-panel` | checkbox@card rest background-color, checkbox@card hover background-color, checkbox@card pressed background-color, checkbox-checked@card focus background-color, +4 |
| `--accent-surface | --color-background` | button-surface@page rest background-color, button-surface@page hover background-color, button-surface@page focus background-color, badge-surface@page rest background-color, +3 |
| `--accent-surface | --color-panel` | button-surface@card rest background-color, button-surface@card hover background-color, button-surface@card focus background-color, badge-surface@card rest background-color, +3 |
| `--accent-a8 | --color-background` | button-outline@page rest inset-ring, button-outline@page focus inset-ring, badge-outline@page rest inset-ring, badge-outline@page hover inset-ring, +2 |
| `--gray-a3 | --color-background` | switch@page rest background-color, switch@page hover background-color, switch@page focus background-color, switch-checked@page rest background-color, +2 |
| `--accent-a4 | --gray-a3` | switch@page rest ring, switch@page hover ring, switch-checked@page focus ring, switch@card rest ring, +2 |
| `--accent-9 | --color-panel` | button-solid@card rest background-color, button-solid@card focus background-color, badge-solid@card rest background-color, badge-solid@card hover background-color, +2 |
| `--gray-a3 | --color-panel` | switch@card rest background-color, switch@card hover background-color, switch@card focus background-color, switch-checked@card rest background-color, +2 |
| `--accent-a11 | --accent-a4` | button-soft@page hover color, button-ghost@page pressed color, button-soft@card hover color, button-ghost@card pressed color |
| `--accent-a7 | --accent-surface` | button-surface@page rest inset-ring, button-surface@page focus inset-ring, button-surface@card rest inset-ring, button-surface@card focus inset-ring |
| `--accent-a8 | --accent-a3` | button-surface@page pressed inset-ring, button-outline@page pressed inset-ring, button-surface@card pressed inset-ring, button-outline@card pressed inset-ring |
| `--color-surface | --color-background` | checkbox@page focus background-color, checkbox-checked@page rest background-color, checkbox-checked@page hover background-color, checkbox-checked@page pressed background-color |
| `--gray-a7 | --color-background` | checkbox@page focus inset-ring, checkbox-checked@page rest inset-ring, checkbox-checked@page hover inset-ring, checkbox-checked@page pressed inset-ring |
| `--gray-12 | --accent-indicator` | tabs@page rest color, tabs@page focus color, tabs@card rest color, tabs@card focus color |
| `--gray-12 | --color-background` | text@page rest color, text@page hover color, text@page pressed color, text@page focus color |
| `--gray-a6 | --color-background` | separator@page rest background-color, separator@page hover background-color, separator@page pressed background-color, separator@page focus background-color |
| `--red-a3 | --color-background` | callout-red@page rest background-color, callout-red@page hover background-color, callout-red@page pressed background-color, callout-red@page focus background-color |
| `--gray-a7 | --color-panel` | checkbox@card focus inset-ring, checkbox-checked@card rest inset-ring, checkbox-checked@card hover inset-ring, checkbox-checked@card pressed inset-ring |
| `--red-a3 | --color-panel` | callout-red@card rest background-color, callout-red@card hover background-color, callout-red@card pressed background-color, callout-red@card focus background-color |
| `--accent-a4 | --color-background` | button-soft@page hover background-color, button-ghost@page pressed background-color |
| `--accent-a11 | --accent-a5` | button-soft@page pressed color, button-soft@card pressed color |
| `--accent-a8 | --accent-surface` | button-surface@page hover inset-ring, button-surface@card hover inset-ring |
| `--accent-a11 | --accent-a2` | button-outline@page hover color, button-outline@card hover color |
| `--accent-a8 | --accent-a2` | button-outline@page hover inset-ring, button-outline@card hover inset-ring |
| `--gray-a4 | --color-background` | switch@page pressed background-color, switch-checked@page pressed background-color |
| `--accent-a4 | --gray-a4` | switch@page pressed ring, switch@card pressed ring |
| `--gray-a3 | --accent-indicator` | tabs@page hover background-color, tabs@card hover background-color |
| `--gray-12 | --gray-a3` | tabs@page hover color, tabs@card hover color |
| `--accent-a3 | --accent-indicator` | tabs@page pressed background-color, tabs@card pressed background-color |
| `--gray-12 | --accent-a3` | tabs@page pressed color, tabs@card pressed color |
| `--focus-8 | --accent-indicator` | tabs@page pressed outline, tabs@card pressed outline |
| `--accent-10 | --color-panel` | button-solid@card hover background-color, button-solid@card pressed background-color |
| `--gray-a4 | --color-panel` | switch@card pressed background-color, switch-checked@card pressed background-color |
| `--accent-a5 | --color-background` | button-soft@page pressed background-color |
| `--accent-a2 | --color-background` | button-outline@page hover background-color |
| `--accent-a5 | --color-panel` | button-soft@card pressed background-color |
| `--accent-a2 | --color-panel` | button-outline@card hover background-color |
