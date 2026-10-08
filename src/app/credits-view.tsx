// Credits and licenses: low prominence, but present. The apca-w3 license
// requires its notice to be viewable by users of the tool.
const REFS = [
  { name: "APCA (Accessible Perceptual Contrast Algorithm)", url: "https://git.apcacontrast.com/documentation/WhyAPCA", note: "Contrast thresholds and use-case levels." },
  { name: "apca-w3 license", url: "https://github.com/Myndex/apca-w3/blob/master/LICENSE.md", note: "Used unmodified for web-content contrast prediction." },
  { name: "Radix Colors", url: "https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale", note: "Twelve-step scale structure." },
  { name: "shadcn/ui", url: "https://ui.shadcn.com", note: "Component kit and token names. MIT license." },
  { name: "Base UI", url: "https://base-ui.com", note: "Unstyled primitives under the components. MIT license." },
  { name: "OKLab and OKLCH", url: "https://bottosson.github.io/posts/oklab/", note: "Perceptual color space by Björn Ottosson." },
  { name: "Tabler Icons", url: "https://tabler.io/icons", note: "Icons. MIT license." },
  { name: "IBM Plex Sans", url: "https://github.com/IBM/plex", note: "Typeface. SIL Open Font License." },
]

// Native examples bundle each system's own packages. Names and marks belong to their owners.
const SYSTEMS = [
  { name: "Radix Themes", url: "https://www.radix-ui.com/themes", license: "MIT" },
  { name: "Material Web (@material/web)", url: "https://github.com/material-components/material-web", license: "Apache-2.0" },
  { name: "Bootstrap", url: "https://getbootstrap.com", license: "MIT" },
  { name: "daisyUI", url: "https://daisyui.com", license: "MIT" },
  { name: "IBM Carbon", url: "https://carbondesignsystem.com", license: "Apache-2.0" },
  { name: "Fluent UI React", url: "https://react.fluentui.dev", license: "MIT" },
  { name: "Primer React", url: "https://primer.style/react", license: "MIT" },
  { name: "Atlassian Design System (@atlaskit)", url: "https://atlassian.design", license: "Apache-2.0" },
  { name: "Ant Design", url: "https://ant.design", license: "MIT" },
  { name: "Chakra UI", url: "https://chakra-ui.com", license: "MIT" },
  { name: "Mantine", url: "https://mantine.dev", license: "MIT" },
  { name: "Coinbase Design System (@coinbase/cds-web)", url: "https://github.com/coinbase/cds", license: "Apache-2.0" },
]

export function CreditsView() {
  return (
    <div className="flex max-w-2xl flex-col gap-8 text-sm">
      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">Credits and licenses</h2>
        <p className="text-muted-foreground">
          Emphasis Engine is a free tool. It is not affiliated with Myndex, Radix, shadcn, or any project listed here.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h3 className="font-semibold">References and licenses</h3>
        <ul className="flex flex-col gap-2">
          {REFS.map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-2">
                {r.name}
              </a>
              <span className="text-muted-foreground"> — {r.note}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-2">
        <h3 className="font-semibold">Design systems in the native examples</h3>
        <p className="text-muted-foreground">
          Each native example renders that system's own published packages, unmodified, under their licenses. Product names and marks belong
          to their owners; their use here identifies the system and implies no endorsement.
        </p>
        <ul className="flex flex-col gap-1">
          {SYSTEMS.map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-2">
                {r.name}
              </a>
              <span className="text-muted-foreground"> — {r.license}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-2">
        <h3 className="font-semibold">Guidance</h3>
        <p className="text-muted-foreground">
          Contrast values are a perceptual model, not a compliance certificate. Check important pairs on real screens, in light and dark.
          APCA terms are used only while this integration tracks the current apca-w3 release.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h3 className="font-semibold">apca-w3 notice</h3>
        <p className="text-muted-foreground">
          Contains apca-w3, copyright © 2019–2023 Andrew Somers and Myndex. All rights reserved. Patent(s) pending. Licensed to the W3C under
          its cooperative agreement for use with WCAG accessibility guidelines for web content, subject to the W3C Software and Document
          Notice and License and the additional limitations in the full license, which is linked above.
        </p>
      </section>
    </div>
  )
}
