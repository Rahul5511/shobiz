# Shobiz Ngage shared design system (inactive)

Validation: production build passed; all 72 tests passed, including three shared-component interaction tests. A separate temporary preview compiled with strict Angular template checking and was then removed. All 16 original SVG files are non-empty and parse as SVG with their original root dimensions preserved. Production JS/CSS contains no new design-system selectors, tokens, or Baikal references. Browser visual/focus verification remains pending because browser access was unavailable and the desktop fallback timed out. jsdom modal methods are stubbed in unit tests; those tests do not verify browser focus trapping.

Prepared from [Shobiz Ngage v1.0.0](https://www.figma.com/design/YG6lPwRohd0WklutCitxsj/Shobiz_Ngage_Components__v1.0.0) on 22 November 2026.

Nothing here is imported into application screens, routes, bootstrap, existing shared components, or `src/styles.css`. No packages were added. Original SVGs live in `public/ngage/icons/`; their presence does not activate the styles.

## Available files

- `styles/tokens.css`: namespaced semantic colors, measured spacing, radii, shadow, typography values.
- `styles/typography.css`: explicit S/M/L utilities (12/16, 14/20, 16/24 px), regular and medium weights. No global heading/body rules.
- `styles/forms.css`: opt-in native control styling, focus, disabled, validation states.
- `index.ts`: standalone Angular buttons, alerts, modal, hint, field wrapper, input directive, original icon assets.

Components import the central token stylesheet into their encapsulated host styles. The CSS entry point also provides `.ngage-theme` for future plain markup. Existing Tailwind variables remain untouched. Future overrides can target a component host's `--ngage-*` properties.

## Source coverage and limits

| Source node             | Prepared implementation                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| Buttons `46:145`        | Primary, ghost, border, icon solid/border; default/large; native hover/disabled; original add/chevron icons |
| Snackbar `56:1289`      | Standard, positive, negative, alert; optional dismiss output                                                |
| Hint Container `5:1858` | Default, positive, notice, negative, info                                                                   |
| Popup header `49:954`   | Exact header typography/padding/divider and close icon inside a native modal dialog                         |
| Basic Input `5:2444`    | Native text/select/textarea field foundation and label/hint presentation; projected native controls         |

The `4:201` Components page is empty; designs are on sibling pages. The Figma tool limit prevented further extraction. This is not a complete export of the file: charts, tables, navigation, chips, avatars, illustrations, templates, advanced dropdowns, and additional typography/variable collections remain for later extraction. No dark palette or unseen heading scale has been invented.

Baikal Regular and Medium are specified by the design, but webfont files are not supplied. `--ngage-font-family` uses Baikal when available and otherwise falls back to sans-serif. Add licensed WOFF2 files and local `@font-face` declarations before judging typography fidelity. No external font request is configured.

The file specifies a popup header rather than a complete modal. Native dialog behavior, body padding, backdrop, visible focus outlines, responsive text wrapping, and accessible labels are implementation adaptations. The supplied brand/status colors are preserved; assess text contrast before rollout. Large button sizing is designed for primary; other variants retain the shared size API for convenience.

## Future integration (examples only)

Import only the required standalone exports from this directory into a future consumer. Add `styles/index.css` to that consumer's stylesheet (relative path as appropriate), or deliberately import it globally when migration is approved. The `.ngage-control` stylesheet must be available for projected native controls. The rest of the components carry their own CSS. For plain typography markup, put utilities under `.ngage-theme` so token values inherit.

```html
<button ngageButton type="button" [leadingIcon]="false" [trailingIcon]="false">Save</button>
<button ngageButton type="button" variant="icon-solid">Add attendee</button>

@if (showMessage()) {
<ngage-alert tone="positive" (dismissed)="showMessage.set(false)">Saved successfully</ngage-alert>
}

<dialog
  ngageModal
  heading="Confirm changes"
  description="Review before saving"
  [isOpen]="showDialog()"
  (closeRequested)="showDialog.set(false)"
>
  <p>Ready to save?</p>
  <footer ngageModalFooter><!-- consumer-owned actions --></footer>
</dialog>

<ngage-form-field controlId="email" label="Email" [required]="true" hint="Use your work email">
  <input ngageInput id="email" type="email" required aria-describedby="email-hint" />
</ngage-form-field>
```

Use native `disabled`, `type`, `required`, Reactive Forms bindings, and input events. The field wrapper's `required` input draws the marker; set `required` on the native control as well. Connect validation to `state` and native `aria-invalid`. Give icon-only buttons descriptive projected text (visually hidden) or an `aria-label`. Notification dismissal and modal visibility stay with the consumer. On `closeRequested`, set `isOpen` false; the browser handles modal focus trapping and focus restoration. Do not manually set the dialog's `open` attribute. Use unique control IDs and associate hint IDs with `aria-describedby`.
