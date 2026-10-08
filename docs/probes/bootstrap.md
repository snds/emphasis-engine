# Generated profile: Bootstrap

Generated 2026-10-08 from bootstrap ^5.3.8. 488 light and 488 dark samples; 63 variables and 88 recipes inferred. Review in the app's Report.

- Page: `--bs-body-bg`
- `--bs-btn-hover-bg@.btn-primary`: the engine's brand solid

| Element kind | Recipes |
| --- | --- |
| surface | 17 |
| border-control | 4 |
| text-primary | 15 |
| state | 17 |
| border-decorative | 19 |
| text-on-tint | 4 |
| on-solid | 1 |
| text-secondary | 11 |

## Variables

| Variable | Path |
| --- | --- |
| `--bs-body-bg` | {"kind":"page"} |
| `--bs-card-bg@.card` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-alert-bg@.alert-danger` | {"kind":"step","palette":"danger","from":"--bs-body-bg","chroma":0.89,"dir":{"light":"away","dark":"back"}} |
| `--bs-alert-bg@.alert-primary` | {"kind":"step","palette":"brand","from":"--bs-body-bg","chroma":1.04,"dir":{"light":"away","dark":"back"}} |
| `--bs-alert-border-color@.alert-danger` | {"kind":"step","palette":"danger","from":"--bs-alert-bg@.alert-danger","chroma":0.88} |
| `--bs-alert-border-color@.alert-primary` | {"kind":"step","palette":"brand","from":"--bs-alert-bg@.alert-primary","chroma":1.02} |
| `--bs-alert-color@.alert-danger` | {"kind":"step","palette":"danger","from":"--bs-alert-bg@.alert-danger","chroma":0.92} |
| `--bs-alert-color@.alert-primary` | {"kind":"step","palette":"brand","from":"--bs-alert-bg@.alert-primary","chroma":0.96} |
| `--bs-body-color` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-form-check-bg@.form-check-input` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-nav-tabs-link-active-bg@.nav-tabs` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-border-color` | {"kind":"step","palette":"neutral","from":"--bs-form-check-bg@.form-check-input"} |
| `--bs-btn-active-bg@.btn-danger` | {"kind":"step","palette":"danger","from":"--bs-body-bg","chroma":0.99} |
| `--bs-btn-active-bg@.btn-outline-primary` | {"kind":"step","palette":"brand","from":"--bs-body-bg","chroma":1.02} |
| `--bs-btn-active-bg@.btn-primary` | {"kind":"step","palette":"brand","from":"--bs-body-bg"} |
| `--bs-btn-active-bg@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-btn-active-border-color@.btn-danger` | {"kind":"step","palette":"danger","from":"--bs-btn-active-bg@.btn-danger","chroma":0.98,"dir":{"light":"away","dark":"back"}} |
| `--bs-btn-active-border-color@.btn-outline-primary` | {"kind":"step","palette":"brand","from":"--bs-btn-active-bg@.btn-outline-primary","chroma":1.02} |
| `--bs-btn-active-border-color@.btn-primary` | {"kind":"step","palette":"brand","from":"--bs-btn-active-bg@.btn-primary","chroma":0.99,"dir":{"light":"away","dark":"back"}} |
| `--bs-btn-active-border-color@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-btn-active-bg@.btn-secondary","dir":{"light":"away","dark":"back"}} |
| `--bs-btn-active-color@.btn-danger` | {"kind":"step","palette":"neutral","from":"--bs-btn-active-bg@.btn-danger","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-active-color@.btn-link` | {"kind":"step","palette":"brand","from":"--bs-body-bg"} |
| `--bs-btn-active-color@.btn-outline-primary` | {"kind":"step","palette":"neutral","from":"--bs-btn-active-bg@.btn-outline-primary","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-active-color@.btn-primary` | {"kind":"step","palette":"neutral","from":"--bs-btn-active-bg@.btn-primary","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-active-color@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-btn-active-bg@.btn-secondary","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-bg@.btn` | {"kind":"step","palette":"brand","from":"--bs-body-bg","chroma":1.02} |
| `--bs-btn-bg@.btn-danger` | {"kind":"step","palette":"danger","from":"--bs-body-bg"} |
| `--bs-btn-bg@.btn-primary` | {"kind":"step","palette":"brand","from":"--bs-body-bg","chroma":1.02} |
| `--bs-btn-bg@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-btn-border-color@.btn` | {"kind":"step","palette":"brand","from":"--bs-btn-bg@.btn","chroma":1.02} |
| `--bs-btn-border-color@.btn-danger` | {"kind":"step","palette":"danger","from":"--bs-btn-bg@.btn-danger"} |
| `--bs-btn-border-color@.btn-outline-primary` | {"kind":"step","palette":"brand","from":"--bs-btn-bg@.btn","chroma":1.02} |
| `--bs-btn-border-color@.btn-primary` | {"kind":"step","palette":"brand","from":"--bs-btn-bg@.btn-primary","chroma":1.02} |
| `--bs-btn-border-color@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-btn-bg@.btn-secondary"} |
| `--bs-btn-color@.btn-danger` | {"kind":"step","palette":"neutral","from":"--bs-btn-bg@.btn-danger","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-color@.btn-link` | {"kind":"step","palette":"brand","from":"--bs-btn-bg@.btn","chroma":1.02} |
| `--bs-btn-color@.btn-outline-primary` | {"kind":"step","palette":"brand","from":"--bs-btn-bg@.btn","chroma":1.02} |
| `--bs-btn-color@.btn-primary` | {"kind":"step","palette":"neutral","from":"--bs-btn-bg@.btn-primary","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-color@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-btn-bg@.btn-secondary","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-hover-bg@.btn-danger` | {"kind":"step","palette":"danger","from":"--bs-body-bg","chroma":0.99} |
| `--bs-btn-hover-bg@.btn-outline-primary` | {"kind":"step","palette":"brand","from":"--bs-body-bg","chroma":1.02} |
| `--bs-btn-hover-bg@.btn-primary` | {"kind":"solid","role":"brand"} |
| `--bs-btn-hover-bg@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-btn-hover-border-color@.btn` | {"kind":"step","palette":"brand","from":"--bs-body-bg"} |
| `--bs-btn-hover-border-color@.btn-danger` | {"kind":"step","palette":"danger","from":"--bs-btn-hover-bg@.btn-danger","chroma":0.99,"dir":{"light":"away","dark":"back"}} |
| `--bs-btn-hover-border-color@.btn-outline-primary` | {"kind":"step","palette":"brand","from":"--bs-btn-hover-bg@.btn-outline-primary","chroma":1.02} |
| `--bs-btn-hover-border-color@.btn-primary` | {"kind":"step","palette":"brand","from":"--bs-btn-hover-bg@.btn-primary","dir":{"light":"away","dark":"back"}} |
| `--bs-btn-hover-border-color@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-btn-hover-bg@.btn-secondary","dir":{"light":"away","dark":"back"}} |
| `--bs-btn-hover-color@.btn-danger` | {"kind":"step","palette":"neutral","from":"--bs-btn-hover-bg@.btn-danger","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-hover-color@.btn-link` | {"kind":"step","palette":"brand","from":"--bs-body-bg"} |
| `--bs-btn-hover-color@.btn-outline-primary` | {"kind":"step","palette":"neutral","from":"--bs-btn-hover-bg@.btn-outline-primary","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-hover-color@.btn-primary` | {"kind":"step","palette":"neutral","from":"--bs-btn-hover-bg@.btn-primary","dir":{"light":"back","dark":"away"}} |
| `--bs-btn-hover-color@.btn-secondary` | {"kind":"step","palette":"neutral","from":"--bs-btn-hover-bg@.btn-secondary","dir":{"light":"back","dark":"away"}} |
| `--bs-card-border-color@.card` | {"kind":"step","palette":"neutral","from":"--bs-card-bg@.card","translucent":"always"} |
| `--bs-card-cap-bg@.card` | {"kind":"step","palette":"neutral","from":"--bs-form-check-bg@.form-check-input","translucent":"always"} |
| `--bs-nav-link-color@.nav` | {"kind":"step","palette":"brand","from":"--bs-body-bg","chroma":1.02} |
| `--bs-nav-link-hover-color@.nav` | {"kind":"step","palette":"brand","from":"--bs-body-bg"} |
| `--bs-nav-tabs-border-color@.nav-tabs` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-nav-tabs-link-active-color@.nav-tabs` | {"kind":"step","palette":"neutral","from":"--bs-nav-tabs-link-active-bg@.nav-tabs"} |
| `--bs-secondary-bg` | {"kind":"step","palette":"neutral","from":"--bs-body-bg"} |
| `--bs-secondary-color` | {"kind":"step","palette":"neutral","from":"--bs-body-bg","translucent":"always"} |
| `--bs-success-border-subtle` | {"kind":"step","palette":"success","from":"--bs-form-check-bg@.form-check-input"} |
| `--bs-warning-text-emphasis` | {"kind":"step","palette":"warning","from":"--bs-body-bg"} |
