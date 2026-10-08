# Probe: Radix Themes

Probed 2026-10-08 from @radix-ui/themes ^3.3.0. 115 color variables set to sentinel colors; real hover, press, and keyboard focus; every painted color traced back to its variable, opacity, or mix, and to the surfaces underneath.

## Light mode

394 samples collapsed to 69 distinct pairs. 23 of 26 profile recipes observed exactly; 1 more had their paint observed over a different surface.

### Profile recipes not observed

| Recipe | Pair | Written from | Paint seen elsewhere |
| --- | --- | --- | --- |
| text-lo-panel | `--gray-11 | --color-panel` | Text color=gray: gray-11 |  |
| field-hover | `--gray-a8 | --color-surface` | TextField: gray-a8 after gray-a7 |  |
| error-text | `--red-a11 | --color-panel` | Text color=red: red-a11 | yes |

### Pairs the components paint that the profile doesn't list

| Pair | Seen in |
| --- | --- |
| `--accent-a11 | --color-background` | button-outline rest color, button-outline focus color, button-ghost rest color, button-ghost focus color, +8 |
| `--accent-a3 | --color-background` | button-soft rest background-color, button-soft focus background-color, button-surface pressed background-color, button-outline pressed background-color, +5 |
| `--accent-indicator | --color-background` | checkbox focus background-color, checkbox-checked rest background-color, checkbox-checked hover background-color, checkbox-checked pressed background-color, +4 |
| `--gray-a11 | --color-background` | tabs rest color, tabs hover color, tabs pressed color, tabs focus color, +4 |
| `--accent-indicator | --color-panel` | checkbox focus background-color, checkbox-checked rest background-color, checkbox-checked hover background-color, checkbox-checked pressed background-color, +4 |
| `--accent-surface | --color-background` | button-surface rest background-color, button-surface hover background-color, button-surface focus background-color, badge-surface rest background-color, +3 |
| `--accent-a11 | --accent-surface` | button-surface rest color, button-surface hover color, button-surface focus color, badge-surface rest color, +3 |
| `--accent-surface | --color-panel` | button-surface rest background-color, button-surface hover background-color, button-surface focus background-color, badge-surface rest background-color, +3 |
| `--accent-9 | --color-background` | button-solid rest background-color, button-solid focus background-color, badge-solid rest background-color, badge-solid hover background-color, +2 |
| `--accent-a8 | --color-background` | button-outline rest inset-ring, button-outline focus inset-ring, badge-outline rest inset-ring, badge-outline hover inset-ring, +2 |
| `--gray-a3 | --color-background` | switch rest background-color, switch hover background-color, switch focus background-color, switch-checked rest background-color, +2 |
| `--accent-9 | --color-panel` | button-solid rest background-color, button-solid focus background-color, badge-solid rest background-color, badge-solid hover background-color, +2 |
| `--gray-a3 | --color-panel` | switch rest background-color, switch hover background-color, switch focus background-color, switch-checked rest background-color, +2 |
| `--color-surface | --color-background` | checkbox rest background-color, checkbox hover background-color, checkbox pressed background-color, checkbox-checked focus background-color |
| `--gray-a7 | --color-background` | checkbox rest inset-ring, checkbox hover inset-ring, checkbox pressed inset-ring, checkbox-checked focus inset-ring |
| `--accent-a6 | --accent-surface` | badge-surface rest inset-ring, badge-surface hover inset-ring, badge-surface pressed inset-ring, badge-surface focus inset-ring |
| `--gray-12 | --color-background` | text rest color, text hover color, text pressed color, text focus color |
| `--gray-a6 | --color-background` | separator rest background-color, separator hover background-color, separator pressed background-color, separator focus background-color |
| `--red-a3 | --color-background` | callout-red rest background-color, callout-red hover background-color, callout-red pressed background-color, callout-red focus background-color |
| `mix(--gray-a1,--red-10,0.331) | --color-background` | card rest ring, card hover ring, card pressed ring, card focus ring |
| `--gray-a7 | --color-panel` | checkbox rest inset-ring, checkbox hover inset-ring, checkbox pressed inset-ring, checkbox-checked focus inset-ring |
| `--red-a3 | --color-panel` | callout-red rest background-color, callout-red hover background-color, callout-red pressed background-color, callout-red focus background-color |
| `--accent-a4 | --gray-a3` | switch focus ring, switch-checked rest ring, switch-checked hover ring |
| `--accent-a4 | --color-background` | button-soft hover background-color, button-ghost pressed background-color |
| `--accent-a11 | --accent-a4` | button-soft hover color, button-ghost pressed color |
| `--accent-a7 | --accent-surface` | button-surface rest inset-ring, button-surface focus inset-ring |
| `--accent-a8 | --accent-a3` | button-surface pressed inset-ring, button-outline pressed inset-ring |
| `--gray-a4 | --color-background` | switch pressed background-color, switch-checked pressed background-color |
| `--gray-12 | --accent-indicator` | tabs rest color, tabs focus color |
| `--accent-10 | --color-panel` | button-solid hover background-color, button-solid pressed background-color |
| `--gray-a4 | --color-panel` | switch pressed background-color, switch-checked pressed background-color |
| `--accent-a5 | --color-background` | button-soft pressed background-color |
| `--accent-a11 | --accent-a5` | button-soft pressed color |
| `--accent-a8 | --accent-surface` | button-surface hover inset-ring |
| `--accent-a2 | --color-background` | button-outline hover background-color |
| `--accent-a11 | --accent-a2` | button-outline hover color |
| `--accent-a8 | --accent-a2` | button-outline hover inset-ring |
| `--accent-a4 | --gray-a4` | switch-checked pressed ring |
| `--gray-a3 | --accent-indicator` | tabs hover background-color |
| `--gray-12 | --gray-a3` | tabs hover color |
| `--accent-a3 | --accent-indicator` | tabs pressed background-color |
| `--gray-12 | --accent-a3` | tabs pressed color |
| `--focus-8 | --accent-indicator` | tabs pressed outline |
| `--accent-a5 | --color-panel` | button-soft pressed background-color |
| `--accent-a2 | --color-panel` | button-outline hover background-color |

## Dark mode

394 samples collapsed to 69 distinct pairs. 24 of 27 profile recipes observed exactly; 1 more had their paint observed over a different surface.

### Profile recipes not observed

| Recipe | Pair | Written from | Paint seen elsewhere |
| --- | --- | --- | --- |
| text-lo-panel | `--gray-11 | --color-panel` | Text color=gray: gray-11 |  |
| field-hover | `--gray-a8 | --color-surface` | TextField: gray-a8 after gray-a7 |  |
| error-text | `--red-a11 | --color-panel` | Text color=red: red-a11 | yes |

### Pairs the components paint that the profile doesn't list

| Pair | Seen in |
| --- | --- |
| `--accent-a11 | --color-background` | button-outline rest color, button-outline focus color, button-ghost rest color, button-ghost focus color, +8 |
| `--accent-a3 | --color-background` | button-soft rest background-color, button-soft focus background-color, button-surface pressed background-color, button-outline pressed background-color, +5 |
| `--gray-a11 | --color-background` | tabs rest color, tabs hover color, tabs pressed color, tabs focus color, +4 |
| `--accent-indicator | --color-panel` | checkbox rest background-color, checkbox hover background-color, checkbox pressed background-color, checkbox-checked focus background-color, +4 |
| `--accent-surface | --color-background` | button-surface rest background-color, button-surface hover background-color, button-surface focus background-color, badge-surface rest background-color, +3 |
| `--accent-a11 | --accent-surface` | button-surface rest color, button-surface hover color, button-surface focus color, badge-surface rest color, +3 |
| `--accent-surface | --color-panel` | button-surface rest background-color, button-surface hover background-color, button-surface focus background-color, badge-surface rest background-color, +3 |
| `--accent-a8 | --color-background` | button-outline rest inset-ring, button-outline focus inset-ring, badge-outline rest inset-ring, badge-outline hover inset-ring, +2 |
| `--gray-a3 | --color-background` | switch rest background-color, switch hover background-color, switch focus background-color, switch-checked rest background-color, +2 |
| `--accent-9 | --color-panel` | button-solid rest background-color, button-solid focus background-color, badge-solid rest background-color, badge-solid hover background-color, +2 |
| `--gray-a3 | --color-panel` | switch rest background-color, switch hover background-color, switch focus background-color, switch-checked rest background-color, +2 |
| `--color-surface | --color-background` | checkbox focus background-color, checkbox-checked rest background-color, checkbox-checked hover background-color, checkbox-checked pressed background-color |
| `--gray-a7 | --color-background` | checkbox focus inset-ring, checkbox-checked rest inset-ring, checkbox-checked hover inset-ring, checkbox-checked pressed inset-ring |
| `--accent-a6 | --accent-surface` | badge-surface rest inset-ring, badge-surface hover inset-ring, badge-surface pressed inset-ring, badge-surface focus inset-ring |
| `--gray-12 | --color-background` | text rest color, text hover color, text pressed color, text focus color |
| `--gray-a6 | --color-background` | separator rest background-color, separator hover background-color, separator pressed background-color, separator focus background-color |
| `--red-a3 | --color-background` | callout-red rest background-color, callout-red hover background-color, callout-red pressed background-color, callout-red focus background-color |
| `mix(--gray-a1,--red-10,0.331) | --color-background` | card rest ring, card hover ring, card pressed ring, card focus ring |
| `--gray-a7 | --color-panel` | checkbox focus inset-ring, checkbox-checked rest inset-ring, checkbox-checked hover inset-ring, checkbox-checked pressed inset-ring |
| `--red-a3 | --color-panel` | callout-red rest background-color, callout-red hover background-color, callout-red pressed background-color, callout-red focus background-color |
| `--accent-a4 | --gray-a3` | switch rest ring, switch hover ring, switch-checked focus ring |
| `--accent-a4 | --color-background` | button-soft hover background-color, button-ghost pressed background-color |
| `--accent-a11 | --accent-a4` | button-soft hover color, button-ghost pressed color |
| `--accent-a7 | --accent-surface` | button-surface rest inset-ring, button-surface focus inset-ring |
| `--accent-a8 | --accent-a3` | button-surface pressed inset-ring, button-outline pressed inset-ring |
| `--gray-a4 | --color-background` | switch pressed background-color, switch-checked pressed background-color |
| `--gray-12 | --accent-indicator` | tabs rest color, tabs focus color |
| `--accent-10 | --color-panel` | button-solid hover background-color, button-solid pressed background-color |
| `--gray-a4 | --color-panel` | switch pressed background-color, switch-checked pressed background-color |
| `--accent-a5 | --color-background` | button-soft pressed background-color |
| `--accent-a11 | --accent-a5` | button-soft pressed color |
| `--accent-a8 | --accent-surface` | button-surface hover inset-ring |
| `--accent-a2 | --color-background` | button-outline hover background-color |
| `--accent-a11 | --accent-a2` | button-outline hover color |
| `--accent-a8 | --accent-a2` | button-outline hover inset-ring |
| `--accent-a4 | --gray-a4` | switch pressed ring |
| `--gray-a3 | --accent-indicator` | tabs hover background-color |
| `--gray-12 | --gray-a3` | tabs hover color |
| `--accent-a3 | --accent-indicator` | tabs pressed background-color |
| `--gray-12 | --accent-a3` | tabs pressed color |
| `--focus-8 | --accent-indicator` | tabs pressed outline |
| `--accent-a5 | --color-panel` | button-soft pressed background-color |
| `--accent-a2 | --color-panel` | button-outline hover background-color |
