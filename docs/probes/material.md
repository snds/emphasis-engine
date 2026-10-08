# Probe: Material 3

Probed 2026-10-08 from @material/web ^2.5.0. 22 color variables set to sentinel colors; real hover, press, and keyboard focus; every painted color traced back to its variable, opacity, or mix, and to the surfaces underneath.

## Light mode

604 samples collapsed to 34 distinct pairs. 15 of 40 profile recipes observed exactly; 6 more had their paint observed over a different surface.

### Profile recipes not observed

| Recipe | Pair | Written from | Paint seen elsewhere |
| --- | --- | --- | --- |
| surface-container-lowest | `--md-sys-color-surface-container-lowest | --md-sys-color-surface` | --md-sys-color-surface-container-lowest |  |
| surface-container | `--md-sys-color-surface-container | --md-sys-color-surface` | --md-sys-color-surface-container |  |
| surface-container-high | `--md-sys-color-surface-container-high | --md-sys-color-surface` | --md-sys-color-surface-container-high |  |
| on-surface-highest | `--md-sys-color-on-surface | --md-sys-color-surface-container-highest` | --md-sys-color-on-surface on surface-container-highest | yes |
| on-surface-variant-highest | `--md-sys-color-on-surface-variant | --md-sys-color-surface-container-highest` | --md-sys-color-on-surface-variant on surface-container-highest | yes |
| outline-variant | `--md-sys-color-outline-variant | --md-sys-color-surface` | divider, card outline: outline-variant |  |
| on-primary | `--md-sys-color-on-primary | --md-sys-color-primary` | --md-sys-color-on-primary on --md-sys-color-primary |  |
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
| switch-edge | `--md-sys-color-outline | --md-sys-color-surface-container-highest` | switch: outline on surface-container-highest (probe) | yes |
| filled-field-label | `--md-sys-color-on-surface-variant | --md-sys-color-surface-container-highest` | filled text field: on-surface-variant on surface-container-highest | yes |
| list-hover | `--md-sys-color-on-surface/0.08 | --md-sys-color-surface-container` | state layer: on-surface at 8% | yes |
| disabled-label | `--md-sys-color-on-surface/0.38 | --md-sys-color-surface` | on-surface at 38% |  |

### Pairs the components paint that the profile doesn't list

| Pair | Seen in |
| --- | --- |
| `--md-sys-color-on-surface | --md-sys-color-surface-container-low` | textfield@card rest color, textfield@card hover color, textfield@card pressed color, textfield@card focus color, +12 |
| `--md-sys-color-outline | --md-sys-color-surface-container-low` | button-outlined@card rest border, button-outlined@card hover border, button-outlined@card pressed border, button-outlined@card focus border, +5 |
| `--md-sys-color-secondary-container | --md-sys-color-surface-container-low` | button-tonal@card rest background-color, button-tonal@card hover background-color, button-tonal@card pressed background-color, button-tonal@card focus background-color, +4 |
| `--md-sys-color-on-surface | --md-sys-color-surface-container-low` | textfield@card rest placeholder, textfield@card hover placeholder, textfield@card pressed placeholder, textfield@card focus placeholder, +4 |
| `--md-sys-color-on-surface-variant | --md-sys-color-surface-container-low` | textfield@card rest color, textfield-filled@card rest color, textfield-filled@card hover color, text-muted@card rest color, +3 |
| `--md-sys-color-on-surface | --md-sys-color-surface-container-low` | textfield@card hover border, checkbox@card hover border, checkbox@card pressed border, checkbox@card focus border, +3 |
| `--md-sys-color-on-surface/0.08 | --md-sys-color-surface-container-low` | textfield-filled@card hover background-color, textfield-filled@card pressed background-color, chip@card hover background-color, chip@card pressed background-color, +2 |
| `--md-sys-color-primary | --md-sys-color-surface-container-low` | button-filled@card rest background-color, button-filled@card hover background-color, button-filled@card pressed background-color, button-filled@card focus background-color |
| `--md-sys-color-primary/0.08 | --md-sys-color-surface-container-low` | button-outlined@card hover background-color, button-outlined@card pressed background-color, button-text@card hover background-color, button-text@card pressed background-color |
| `--md-sys-color-primary | --md-sys-color-surface-container-low` | textfield@card pressed color, textfield@card focus color, textfield-filled@card pressed color, textfield-filled@card focus color |
| `--md-sys-color-surface-container-highest | --md-sys-color-surface-container-low` | textfield-filled@card rest background-color, textfield-filled@card hover background-color, textfield-filled@card pressed background-color, textfield-filled@card focus background-color |
| `--md-sys-color-primary-container | --md-sys-color-surface-container-low` | fab-primary@card rest background-color, fab-primary@card hover background-color, fab-primary@card pressed background-color, fab-primary@card focus background-color |
| `--md-sys-color-primary | --md-sys-color-surface-container-low` | textfield@card pressed border, textfield@card focus border |
| `--md-sys-color-on-surface-variant | --md-sys-color-surface-container-low` | checkbox@card rest border, checkbox-checked@card rest border |

## Dark mode

604 samples collapsed to 34 distinct pairs. 15 of 40 profile recipes observed exactly; 6 more had their paint observed over a different surface.

### Profile recipes not observed

| Recipe | Pair | Written from | Paint seen elsewhere |
| --- | --- | --- | --- |
| surface-container-lowest | `--md-sys-color-surface-container-lowest | --md-sys-color-surface` | --md-sys-color-surface-container-lowest |  |
| surface-container | `--md-sys-color-surface-container | --md-sys-color-surface` | --md-sys-color-surface-container |  |
| surface-container-high | `--md-sys-color-surface-container-high | --md-sys-color-surface` | --md-sys-color-surface-container-high |  |
| on-surface-highest | `--md-sys-color-on-surface | --md-sys-color-surface-container-highest` | --md-sys-color-on-surface on surface-container-highest | yes |
| on-surface-variant-highest | `--md-sys-color-on-surface-variant | --md-sys-color-surface-container-highest` | --md-sys-color-on-surface-variant on surface-container-highest | yes |
| outline-variant | `--md-sys-color-outline-variant | --md-sys-color-surface` | divider, card outline: outline-variant |  |
| on-primary | `--md-sys-color-on-primary | --md-sys-color-primary` | --md-sys-color-on-primary on --md-sys-color-primary |  |
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
| switch-edge | `--md-sys-color-outline | --md-sys-color-surface-container-highest` | switch: outline on surface-container-highest (probe) | yes |
| filled-field-label | `--md-sys-color-on-surface-variant | --md-sys-color-surface-container-highest` | filled text field: on-surface-variant on surface-container-highest | yes |
| list-hover | `--md-sys-color-on-surface/0.08 | --md-sys-color-surface-container` | state layer: on-surface at 8% | yes |
| disabled-label | `--md-sys-color-on-surface/0.38 | --md-sys-color-surface` | on-surface at 38% |  |

### Pairs the components paint that the profile doesn't list

| Pair | Seen in |
| --- | --- |
| `--md-sys-color-on-surface | --md-sys-color-surface-container-low` | textfield@card rest color, textfield@card hover color, textfield@card pressed color, textfield@card focus color, +12 |
| `--md-sys-color-outline | --md-sys-color-surface-container-low` | button-outlined@card rest border, button-outlined@card hover border, button-outlined@card pressed border, button-outlined@card focus border, +5 |
| `--md-sys-color-secondary-container | --md-sys-color-surface-container-low` | button-tonal@card rest background-color, button-tonal@card hover background-color, button-tonal@card pressed background-color, button-tonal@card focus background-color, +4 |
| `--md-sys-color-on-surface | --md-sys-color-surface-container-low` | textfield@card rest placeholder, textfield@card hover placeholder, textfield@card pressed placeholder, textfield@card focus placeholder, +4 |
| `--md-sys-color-on-surface-variant | --md-sys-color-surface-container-low` | textfield@card rest color, textfield-filled@card rest color, textfield-filled@card hover color, text-muted@card rest color, +3 |
| `--md-sys-color-on-surface | --md-sys-color-surface-container-low` | textfield@card hover border, checkbox@card hover border, checkbox@card pressed border, checkbox@card focus border, +3 |
| `--md-sys-color-on-surface/0.08 | --md-sys-color-surface-container-low` | textfield-filled@card hover background-color, textfield-filled@card pressed background-color, chip@card hover background-color, chip@card pressed background-color, +2 |
| `--md-sys-color-primary | --md-sys-color-surface-container-low` | button-filled@card rest background-color, button-filled@card hover background-color, button-filled@card pressed background-color, button-filled@card focus background-color |
| `--md-sys-color-primary/0.08 | --md-sys-color-surface-container-low` | button-outlined@card hover background-color, button-outlined@card pressed background-color, button-text@card hover background-color, button-text@card pressed background-color |
| `--md-sys-color-primary | --md-sys-color-surface-container-low` | textfield@card pressed color, textfield@card focus color, textfield-filled@card pressed color, textfield-filled@card focus color |
| `--md-sys-color-surface-container-highest | --md-sys-color-surface-container-low` | textfield-filled@card rest background-color, textfield-filled@card hover background-color, textfield-filled@card pressed background-color, textfield-filled@card focus background-color |
| `--md-sys-color-primary-container | --md-sys-color-surface-container-low` | fab-primary@card rest background-color, fab-primary@card hover background-color, fab-primary@card pressed background-color, fab-primary@card focus background-color |
| `--md-sys-color-primary | --md-sys-color-surface-container-low` | textfield@card pressed border, textfield@card focus border |
| `--md-sys-color-on-surface-variant | --md-sys-color-surface-container-low` | checkbox@card rest border, checkbox-checked@card rest border |
