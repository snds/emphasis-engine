# Generated profile: Bootstrap

Generated 2026-10-08 from bootstrap ^5.3.8. 916 light and 916 dark samples; 88 variables and 100 recipes inferred. Review in the app's Report.

- Page: `--bs-body-bg`
- `--bs-btn-bg@.btn-primary`: the engine's brand solid

| Element kind | Recipes |
| --- | --- |
| surface | 15 |
| border-decorative | 18 |
| text-primary | 19 |
| text-secondary | 15 |
| state | 15 |
| border-control | 4 |
| text-on-tint | 4 |
| on-solid | 1 |
| focus | 7 |
| solid | 2 |

## Variables

| Variable | Path |
| --- | --- |
| `--bs-body-bg` | {"kind":"page"} |
| `--bs-alert-bg@.alert-danger` | {"kind":"step","palette":"danger","from":"--bs-body-bg","chroma":0.89,"dir":{"light":"away","dark":"back"}} |
| `--bs-alert-bg@.alert-info` | {"kind":"step","palette":"info","from":"--bs-body-bg","chroma":0.84,"dir":{"light":"away","dark":"back"}} |
| `--bs-alert-bg@.alert-success` | {"kind":"step","palette":"success","from":"--bs-body-bg","chroma":0.2,"dir":{"light":"away","dark":"back"}} |
| `--bs-alert-bg@.alert-warning` | {"kind":"step","palette":"warning","from":"--bs-body-bg","chroma":0.99} |
| `--bs-alert-border-color@.alert-danger` | {"kind":"step","palette":"danger","from":"--bs-alert-bg@.alert-danger","chroma":0.88} |
| `--bs-alert-border-color@.alert-info` | {"kind":"step","palette":"info","from":"--bs-alert-bg@.alert-info","chroma":0.83} |
| `--bs-alert-border-color@.alert-success` | {"kind":"step","palette":"success","from":"--bs-alert-bg@.alert-success","chroma":0.34} |
| `--bs-alert-border-color@.alert-warning` | {"kind":"step","palette":"warning","from":"--bs-alert-bg@.alert-warning"} |
| `--bs-alert-color@.alert-danger` | {"kind":"step","palette":"danger","from":"--bs-alert-bg@.alert-danger","chroma":0.92} |
| `--bs-alert-color@.alert-info` | {"kind":"step","palette":"info","from":"--bs-alert-bg@.alert-info","chroma":0.98} |
| `--bs-alert-color@.alert-success` | {"kind":"step","palette":"success","from":"--bs-alert-bg@.alert-success","chroma":0.93} |
| `--bs-alert-color@.alert-warning` | {"kind":"step","palette":"warning","from":"--bs-alert-bg@.alert-warning","chroma":0.99} |
| `--bs-card-bg@.card` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-body-color-rgb` | {"kind":"step","palette":"neutral","from":"--bs-card-bg@.card"} |
| `--bs-body-color` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-form-check-bg@.form-check-input` | {"kind":"step","palette":"neutral","from":"--bs-card-bg@.card"} |
| `--bs-tertiary-bg-rgb` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-border-color` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-btn-active-bg@.btn-danger` | {"kind":"step","palette":"danger","from":"--bs-body-bg","chroma":0.99} |
| `--bs-btn-active-bg@.btn-outline-primary` | {"kind":"step","palette":"brand","from":"--bs-body-bg"} |
| `--bs-btn-active-bg@.btn-primary` | {"kind":"step","palette":"brand","from":"--bs-card-bg@.card","chroma":0.97} |
| `--bs-btn-active-bg@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-btn-active-border-color@.btn-danger` | {"kind":"step","palette":"danger","from":"--bs-btn-active-bg@.btn-danger","chroma":0.98,"dir":{"light":"away","dark":"back"}} |
| `--bs-btn-active-border-color@.btn-outline-primary` | {"kind":"step","palette":"brand","from":"--bs-btn-active-bg@.btn-outline-primary"} |
| `--bs-btn-active-border-color@.btn-primary` | {"kind":"step","palette":"brand","from":"--bs-btn-active-bg@.btn-primary","chroma":0.97,"dir":{"light":"away","dark":"back"}} |
| `--bs-btn-active-border-color@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-btn-active-bg@.btn-secondary","dir":{"light":"away","dark":"back"}} |
| `--bs-btn-active-color@.btn-danger` | {"kind":"step","palette":"neutral","from":"--bs-btn-active-bg@.btn-danger","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-active-color@.btn-link` | {"kind":"step","palette":"brand","from":"--bs-card-bg@.card","chroma":0.97} |
| `--bs-btn-active-color@.btn-outline-primary` | {"kind":"step","palette":"neutral","from":"--bs-btn-active-bg@.btn-outline-primary","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-active-color@.btn-primary` | {"kind":"step","palette":"neutral","from":"--bs-btn-active-bg@.btn-primary","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-active-color@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-btn-active-bg@.btn-secondary","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-bg@.btn-danger` | {"kind":"step","palette":"danger","from":"--bs-body-bg"} |
| `--bs-btn-bg@.btn-primary` | {"kind":"solid","role":"brand"} |
| `--bs-btn-bg@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-btn-border-color@.btn-danger` | {"kind":"step","palette":"danger","from":"--bs-btn-bg@.btn-danger"} |
| `--bs-btn-border-color@.btn-outline-primary` | {"kind":"step","palette":"brand","from":"--bs-body-bg"} |
| `--bs-btn-border-color@.btn-primary` | {"kind":"step","palette":"brand","from":"--bs-btn-bg@.btn-primary"} |
| `--bs-btn-border-color@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-btn-bg@.btn-secondary"} |
| `--bs-btn-color@.btn-danger` | {"kind":"step","palette":"neutral","from":"--bs-btn-bg@.btn-danger","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-color@.btn-link` | {"kind":"step","palette":"brand","from":"--bs-card-bg@.card"} |
| `--bs-btn-color@.btn-outline-primary` | {"kind":"step","palette":"brand","from":"--bs-body-bg"} |
| `--bs-btn-color@.btn-primary` | {"kind":"step","palette":"neutral","from":"--bs-btn-bg@.btn-primary","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-color@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-btn-bg@.btn-secondary","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-disabled-bg@.btn-primary` | {"kind":"step","palette":"brand","from":"--bs-body-bg"} |
| `--bs-btn-disabled-border-color@.btn-primary` | {"kind":"step","palette":"brand","from":"--bs-btn-disabled-bg@.btn-primary"} |
| `--bs-btn-disabled-color@.btn-primary` | {"kind":"step","palette":"neutral","from":"--bs-btn-disabled-bg@.btn-primary","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-focus-shadow-rgb@.btn-danger` | {"kind":"step","palette":"danger","from":"--bs-body-bg","chroma":0.82} |
| `--bs-btn-focus-shadow-rgb@.btn-link` | {"kind":"step","palette":"brand","from":"--bs-card-bg@.card"} |
| `--bs-btn-focus-shadow-rgb@.btn-outline-primary` | {"kind":"step","palette":"brand","from":"--bs-body-bg"} |
| `--bs-btn-focus-shadow-rgb@.btn-primary` | {"kind":"step","palette":"brand","from":"--bs-card-bg@.card"} |
| `--bs-btn-focus-shadow-rgb@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-btn-hover-bg@.btn-danger` | {"kind":"step","palette":"danger","from":"--bs-body-bg","chroma":0.99} |
| `--bs-btn-hover-bg@.btn-outline-primary` | {"kind":"step","palette":"brand","from":"--bs-body-bg"} |
| `--bs-btn-hover-bg@.btn-primary` | {"kind":"step","palette":"brand","from":"--bs-card-bg@.card","chroma":0.98} |
| `--bs-btn-hover-bg@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-btn-hover-border-color@.btn-danger` | {"kind":"step","palette":"danger","from":"--bs-btn-hover-bg@.btn-danger","chroma":0.99,"dir":{"light":"away","dark":"back"}} |
| `--bs-btn-hover-border-color@.btn-outline-primary` | {"kind":"step","palette":"brand","from":"--bs-btn-hover-bg@.btn-outline-primary"} |
| `--bs-btn-hover-border-color@.btn-primary` | {"kind":"step","palette":"brand","from":"--bs-btn-hover-bg@.btn-primary","chroma":0.97,"dir":{"light":"away","dark":"back"}} |
| `--bs-btn-hover-border-color@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-btn-hover-bg@.btn-secondary","dir":{"light":"away","dark":"back"}} |
| `--bs-btn-hover-color@.btn-danger` | {"kind":"step","palette":"neutral","from":"--bs-btn-hover-bg@.btn-danger","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-hover-color@.btn-link` | {"kind":"step","palette":"brand","from":"--bs-card-bg@.card","chroma":0.97} |
| `--bs-btn-hover-color@.btn-outline-primary` | {"kind":"step","palette":"neutral","from":"--bs-btn-hover-bg@.btn-outline-primary","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-hover-color@.btn-primary` | {"kind":"step","palette":"neutral","from":"--bs-btn-hover-bg@.btn-primary","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-hover-color@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-btn-hover-bg@.btn-secondary","dir":{"light":"back","dark":"away"}} |
| `--bs-card-border-color@.card` | {"kind":"step","palette":"neutral","from":"--bs-card-bg@.card","translucent":"always"} |
| `--bs-table-bg@.table` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-danger-rgb` | {"kind":"step","palette":"danger","from":"--bs-table-bg@.table"} |
| `--bs-emphasis-color-rgb` | {"kind":"step","palette":"neutral","from":"--bs-table-bg@.table"} |
| `--bs-form-invalid-border-color` | {"kind":"step","palette":"danger","from":"--bs-body-bg"} |
| `--bs-form-invalid-color` | {"kind":"step","palette":"danger","from":"--bs-card-bg@.card"} |
| `--bs-info-rgb` | {"kind":"step","palette":"info","from":"--bs-table-bg@.table"} |
| `--bs-link-color-rgb` | {"kind":"step","palette":"brand","from":"--bs-body-bg"} |
| `--bs-link-hover-color-rgb` | {"kind":"step","palette":"brand","from":"--bs-body-bg","chroma":0.97} |
| `--bs-nav-link-color@.nav` | {"kind":"step","palette":"brand","from":"--bs-body-bg"} |
| `--bs-nav-link-color@.navbar-nav` | {"kind":"step","palette":"neutral","from":"--bs-tertiary-bg-rgb","translucent":"always"} |
| `--bs-nav-link-hover-color@.nav` | {"kind":"step","palette":"brand","from":"--bs-body-bg","chroma":0.97} |
| `--bs-nav-tabs-link-active-bg@.nav-tabs` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-nav-tabs-link-active-border-color@.nav-tabs` | {"kind":"step","palette":"neutral","from":"--bs-nav-tabs-link-active-bg@.nav-tabs"} |
| `--bs-nav-tabs-link-active-color@.nav-tabs` | {"kind":"step","palette":"neutral","from":"--bs-nav-tabs-link-active-bg@.nav-tabs"} |
| `--bs-nav-tabs-link-hover-border-color@.nav-tabs` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-secondary-color` | {"kind":"step","palette":"neutral","from":"--bs-card-bg@.card","translucent":"always"} |
| `--bs-success-rgb` | {"kind":"step","palette":"success","from":"--bs-table-bg@.table"} |
| `--bs-table-border-color@.table` | {"kind":"step","palette":"neutral","from":"--bs-table-bg@.table"} |
| `--bs-table-color@.table` | {"kind":"step","palette":"neutral","from":"--bs-table-bg@.table"} |
| `--bs-table-hover-color@.table` | {"kind":"step","palette":"neutral","from":"--bs-table-bg@.table"} |
| `--bs-tertiary-color` | {"kind":"step","palette":"neutral","from":"--bs-body-bg","translucent":"always"} |
| `--bs-warning-rgb` | {"kind":"step","palette":"warning","from":"--bs-table-bg@.table"} |
