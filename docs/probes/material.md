# Probe: Material 3

Probed 2026-10-08 from @material/web ^2.5.0. 22 color variables set to sentinel colors; real hover, press, and keyboard focus; every painted color traced back to its variable, opacity, or mix, and to the surfaces underneath.

## Light mode

604 samples collapsed to 31 distinct pairs. 19 of 40 profile recipes observed exactly; 3 more had their paint observed over a different surface.

### Profile recipes not observed

| Recipe | Pair | Written from | Paint seen elsewhere |
| --- | --- | --- | --- |
| surface-container-lowest | `--md-sys-color-surface-container-lowest | --md-sys-color-surface` | --md-sys-color-surface-container-lowest |  |
| surface-container | `--md-sys-color-surface-container | --md-sys-color-surface` | --md-sys-color-surface-container |  |
| surface-container-high | `--md-sys-color-surface-container-high | --md-sys-color-surface` | --md-sys-color-surface-container-high |  |
| on-surface-highest | `--md-sys-color-on-surface | --md-sys-color-surface-container-highest` | --md-sys-color-on-surface on surface-container-highest | yes |
| outline-variant | `--md-sys-color-outline-variant | --md-sys-color-surface` | divider, card outline: outline-variant |  |
| primary-pressed | `--md-sys-color-on-primary/0.1 | --md-sys-color-primary` | state layer: --md-sys-color-on-primary at 10% |  |
| secondary | `--md-sys-color-secondary | --md-sys-color-surface` | --md-sys-color-secondary: filled button, active indicator |  |
| on-secondary | `--md-sys-color-on-secondary | --md-sys-color-secondary` | --md-sys-color-on-secondary on --md-sys-color-secondary |  |
| secondary-hover | `--md-sys-color-on-secondary/0.08 | --md-sys-color-secondary` | state layer: --md-sys-color-on-secondary at 8% |  |
| secondary-pressed | `--md-sys-color-on-secondary/0.1 | --md-sys-color-secondary` | state layer: --md-sys-color-on-secondary at 10% |  |
| error | `--md-sys-color-error | --md-sys-color-surface` | --md-sys-color-error: filled button, active indicator |  |
| on-error | `--md-sys-color-on-error | --md-sys-color-error` | --md-sys-color-on-error on --md-sys-color-error |  |
| error-hover | `--md-sys-color-on-error/0.08 | --md-sys-color-error` | state layer: --md-sys-color-on-error at 8% |  |
| error-pressed | `--md-sys-color-on-error/0.1 | --md-sys-color-error` | state layer: --md-sys-color-on-error at 10% |  |
| error-container | `--md-sys-color-error-container | --md-sys-color-surface` | --md-sys-color-error-container |  |
| on-error-container | `--md-sys-color-on-error-container | --md-sys-color-error-container` | --md-sys-color-on-error-container on --md-sys-color-error-container |  |
| error-container-hover | `--md-sys-color-on-error-container/0.08 | --md-sys-color-error-container` | state layer: --md-sys-color-on-error-container at 8% |  |
| text-button-label | `--md-sys-color-primary | --md-sys-color-surface > --md-sys-color-primary/0.08` | text button: primary on its 8% layer | yes |
| focus | `--md-sys-color-secondary | --md-sys-color-surface` | focus ring: secondary, 3dp |  |
| list-hover | `--md-sys-color-on-surface/0.08 | --md-sys-color-surface-container` | state layer: on-surface at 8% | yes |
| disabled-label | `--md-sys-color-on-surface/0.38 | --md-sys-color-surface` | on-surface at 38% |  |

### Pairs the components paint that the profile doesn't list

| Pair | Seen in |
| --- | --- |
| `--md-sys-color-on-surface | --md-sys-color-surface-container-low` | textfield rest color, textfield rest placeholder, textfield hover border, textfield hover color, +27 |
| `--md-sys-color-primary | --md-sys-color-surface-container-low` | button-filled rest background-color, button-filled hover background-color, button-filled pressed background-color, button-filled focus background-color, +14 |
| `--md-sys-color-outline | --md-sys-color-surface-container-low` | button-outlined rest border, button-outlined hover border, button-outlined pressed border, button-outlined focus border, +9 |
| `--md-sys-color-on-surface-variant | --md-sys-color-surface-container-low` | textfield rest color, textfield-filled rest color, textfield-filled hover color, checkbox rest border, +5 |
| `--md-sys-color-secondary-container | --md-sys-color-surface-container-low` | button-tonal rest background-color, button-tonal hover background-color, button-tonal pressed background-color, button-tonal focus background-color, +4 |
| `--md-sys-color-surface-container-highest | --md-sys-color-surface-container-low` | textfield-filled rest background-color, textfield-filled hover background-color, textfield-filled pressed background-color, textfield-filled focus background-color, +4 |
| `--md-sys-color-on-surface/0.08 | --md-sys-color-surface-container-low` | textfield-filled hover background-color, textfield-filled pressed background-color, chip hover background-color, chip pressed background-color, +4 |
| `--md-sys-color-primary/0.08 | --md-sys-color-surface-container-low` | button-outlined hover background-color, button-outlined pressed background-color, button-text hover background-color, button-text pressed background-color |
| `--md-sys-color-primary-container | --md-sys-color-surface-container-low` | fab-primary rest background-color, fab-primary hover background-color, fab-primary pressed background-color, fab-primary focus background-color |
| `--md-sys-color-primary-container | --md-sys-color-primary` | switch focus background-color, switch-checked hover background-color, switch-checked pressed background-color |
| `--md-sys-color-primary/0.08 | --md-sys-color-primary` | checkbox-checked hover background-color, checkbox-checked pressed background-color |
| `--md-sys-color-on-surface/0.08 | --md-sys-color-on-surface-variant` | switch hover background-color, switch pressed background-color |
| `--md-sys-color-primary/0.08 | --md-sys-color-primary-container` | switch-checked hover background-color, switch-checked pressed background-color |

## Dark mode

604 samples collapsed to 31 distinct pairs. 19 of 40 profile recipes observed exactly; 3 more had their paint observed over a different surface.

### Profile recipes not observed

| Recipe | Pair | Written from | Paint seen elsewhere |
| --- | --- | --- | --- |
| surface-container-lowest | `--md-sys-color-surface-container-lowest | --md-sys-color-surface` | --md-sys-color-surface-container-lowest |  |
| surface-container | `--md-sys-color-surface-container | --md-sys-color-surface` | --md-sys-color-surface-container |  |
| surface-container-high | `--md-sys-color-surface-container-high | --md-sys-color-surface` | --md-sys-color-surface-container-high |  |
| on-surface-highest | `--md-sys-color-on-surface | --md-sys-color-surface-container-highest` | --md-sys-color-on-surface on surface-container-highest | yes |
| outline-variant | `--md-sys-color-outline-variant | --md-sys-color-surface` | divider, card outline: outline-variant |  |
| primary-pressed | `--md-sys-color-on-primary/0.1 | --md-sys-color-primary` | state layer: --md-sys-color-on-primary at 10% |  |
| secondary | `--md-sys-color-secondary | --md-sys-color-surface` | --md-sys-color-secondary: filled button, active indicator |  |
| on-secondary | `--md-sys-color-on-secondary | --md-sys-color-secondary` | --md-sys-color-on-secondary on --md-sys-color-secondary |  |
| secondary-hover | `--md-sys-color-on-secondary/0.08 | --md-sys-color-secondary` | state layer: --md-sys-color-on-secondary at 8% |  |
| secondary-pressed | `--md-sys-color-on-secondary/0.1 | --md-sys-color-secondary` | state layer: --md-sys-color-on-secondary at 10% |  |
| error | `--md-sys-color-error | --md-sys-color-surface` | --md-sys-color-error: filled button, active indicator |  |
| on-error | `--md-sys-color-on-error | --md-sys-color-error` | --md-sys-color-on-error on --md-sys-color-error |  |
| error-hover | `--md-sys-color-on-error/0.08 | --md-sys-color-error` | state layer: --md-sys-color-on-error at 8% |  |
| error-pressed | `--md-sys-color-on-error/0.1 | --md-sys-color-error` | state layer: --md-sys-color-on-error at 10% |  |
| error-container | `--md-sys-color-error-container | --md-sys-color-surface` | --md-sys-color-error-container |  |
| on-error-container | `--md-sys-color-on-error-container | --md-sys-color-error-container` | --md-sys-color-on-error-container on --md-sys-color-error-container |  |
| error-container-hover | `--md-sys-color-on-error-container/0.08 | --md-sys-color-error-container` | state layer: --md-sys-color-on-error-container at 8% |  |
| text-button-label | `--md-sys-color-primary | --md-sys-color-surface > --md-sys-color-primary/0.08` | text button: primary on its 8% layer | yes |
| focus | `--md-sys-color-secondary | --md-sys-color-surface` | focus ring: secondary, 3dp |  |
| list-hover | `--md-sys-color-on-surface/0.08 | --md-sys-color-surface-container` | state layer: on-surface at 8% | yes |
| disabled-label | `--md-sys-color-on-surface/0.38 | --md-sys-color-surface` | on-surface at 38% |  |

### Pairs the components paint that the profile doesn't list

| Pair | Seen in |
| --- | --- |
| `--md-sys-color-on-surface | --md-sys-color-surface-container-low` | textfield rest color, textfield rest placeholder, textfield hover border, textfield hover color, +27 |
| `--md-sys-color-primary | --md-sys-color-surface-container-low` | button-filled rest background-color, button-filled hover background-color, button-filled pressed background-color, button-filled focus background-color, +14 |
| `--md-sys-color-outline | --md-sys-color-surface-container-low` | button-outlined rest border, button-outlined hover border, button-outlined pressed border, button-outlined focus border, +9 |
| `--md-sys-color-on-surface-variant | --md-sys-color-surface-container-low` | textfield rest color, textfield-filled rest color, textfield-filled hover color, checkbox rest border, +5 |
| `--md-sys-color-secondary-container | --md-sys-color-surface-container-low` | button-tonal rest background-color, button-tonal hover background-color, button-tonal pressed background-color, button-tonal focus background-color, +4 |
| `--md-sys-color-surface-container-highest | --md-sys-color-surface-container-low` | textfield-filled rest background-color, textfield-filled hover background-color, textfield-filled pressed background-color, textfield-filled focus background-color, +4 |
| `--md-sys-color-on-surface/0.08 | --md-sys-color-surface-container-low` | textfield-filled hover background-color, textfield-filled pressed background-color, chip hover background-color, chip pressed background-color, +4 |
| `--md-sys-color-primary/0.08 | --md-sys-color-surface-container-low` | button-outlined hover background-color, button-outlined pressed background-color, button-text hover background-color, button-text pressed background-color |
| `--md-sys-color-primary-container | --md-sys-color-surface-container-low` | fab-primary rest background-color, fab-primary hover background-color, fab-primary pressed background-color, fab-primary focus background-color |
| `--md-sys-color-primary-container | --md-sys-color-primary` | switch hover background-color, switch pressed background-color, switch-checked focus background-color |
| `--md-sys-color-primary/0.08 | --md-sys-color-primary` | checkbox hover background-color, checkbox pressed background-color |
| `--md-sys-color-primary/0.08 | --md-sys-color-primary-container` | switch hover background-color, switch pressed background-color |
| `--md-sys-color-on-surface/0.08 | --md-sys-color-on-surface-variant` | switch-checked hover background-color, switch-checked pressed background-color |
