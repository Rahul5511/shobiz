# Shobiz Ngage shared design system

The application now uses the local `angular-design-library` export through this consolidated Angular layer. `src/styles.css` loads the shared entry point once and maps existing Tailwind color names to Ngage tokens. Login, recovery, public registration, workspace forms, record lists, account screens and report controls import the shared components.

## Source and normalization

- `styles/exported-tokens.css`: 542 stable named tokens extracted from both token manifests; lengths have CSS units and textual font weights become numbers. Exported light/dark and desktop/tablet/mobile values are preserved.
- `styles/tokens.css`: application aliases, spacing/typography compatibility, focus and custom-accent behavior. Component styles inherit tokens instead of resetting them on every host.
- `styles/typography.css`: 32 responsive heading/text utilities plus the existing S/M/L aliases.
- `components/icon-assets.ts` and `public/ngage/library/icons/`: 140 reconstructed SVG geometries across 14 icon families. Nested source offsets are retained. Masks inherit current color, including hover/disabled states. The application's icon adapter uses these where matching glyphs exist; other application-specific icons retain their existing geometry.
- `token-conflicts.json`: 12 conflicting source mode entries. The first exported component definition is canonical; foundation definitions fill missing names. Alternatives are recorded for review rather than silently discarded.

The original export remains a reference and is not imported into the runtime. Its catalog pages, previews, verification images, conversion tooling, node_modules, Figma spacer specimens and entire-frame examples are not application components. Brand image/avatar crop warnings in the source are not treated as verified assets. Existing branding remains in place.

## Shared component contracts

| Export family                    | Application API                                                                                                                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button variants/states           | Native `button[ngageButton]` or navigation `a[ngageButton]`; `variant`, `size`, optional leading/trailing icons. Native disabled, click, submit and link behavior remain intact. |
| Snackbar / notification          | `ngage-alert` with standard, positive, negative, alert or info tone; optional dismissal emits intent to its consumer.                                                            |
| Basic input / search / textarea  | `ngageInput` on native input, select or textarea. Keep Reactive Forms/ngModel and native attributes on the control.                                                              |
| Checkbox / radio / toggle        | Native input with `ngageChoice="checkbox"`, `"radio"` or `"switch"`; checked/disabled/value remain owned by Angular forms or the parent.                                         |
| Tag / status badge               | `ngage-tag` or `span[ngageTag]`, typed tone/size, optional removal and disabled state.                                                                                           |
| Chip                             | `button[ngageChip]` with parent-owned `selected`, native click/disabled and aria-pressed.                                                                                        |
| Selected navigation              | `button[ngageNav]` with `selected`. These are navigation buttons, not an ARIA tablist without arrow-key behavior.                                                                |
| Progress specimens               | Native `progress[ngageProgress]`, numeric value/max and a consumer-provided accessible label. Analytical meters remain meters.                                                   |
| Avatar                           | `ngage-avatar` with required label, image and initials; failed images fall back to initials.                                                                                     |
| Divider                          | `ngageDivider` on a separator element.                                                                                                                                           |
| Hint / form field / popup header | Existing consolidated `ngage-hint`, `ngage-form-field`, `ngageModal` contracts, now using the same global tokens.                                                                |

Menus, breadcrumbs, tables, pagination and business-specific panels retain their existing data and interaction logic. Their native controls use shared primitives where applicable; exported static frames are not substituted for working application behavior. Tag inputs can compose native input and removable tags rather than adding one component per exported state. Simple radio/checkbox controls need no custom value accessor because Angular already binds native controls.

Hover, focus-visible and pressed use CSS states. Checked and selected use native properties or parent inputs. Inactive/unselected does not mean disabled. Component state does not fetch data or change permissions. One icon per slot inherits color; no hidden default/hover/disabled icon trees are rendered.

The exported orange backgrounds are retained. Solid button and positive/warning notification foregrounds are adapted for readability rather than copying low-contrast white text. Custom accent colors remain user configurable and require their own contrast review. Baikal/Inter font files were not supplied: the stack falls back to installed Segoe UI/Arial. Add appropriately licensed local WOFF2 files to obtain font parity.

## Examples

```html
<button ngageButton type="submit" [disabled]="saving">Save</button>
<button ngageButton type="button" variant="border" (click)="cancel()">Cancel</button>
<input ngageInput formControlName="email" type="email" />
<input type="checkbox" ngageChoice="switch" formControlName="enabled" />
<ngage-tag tone="positive">Active</ngage-tag>
<ngage-tag [removable]="true" removeLabel="Remove Mumbai" (removed)="removeCity()"
  >Mumbai</ngage-tag
>
<ngage-alert tone="negative" [dismissible]="false">Save failed</ngage-alert>
```

Import only the standalone exports needed by the consuming component from `shared/design-system`. Include the global entry point once, as already configured; do not import raw per-variant CSS globally. Add unique label/control IDs, validation descriptions and accessible names at the consumer boundary.

## Regeneration and verification

```text
node tools/design-system/generate.mjs
node tools/design-system/verify.mjs
npm run build
npm test -- --watch=false
```

Regeneration requires the local ignored `angular-design-library` folder. Generated tokens, the conflict report, the icon registry and SVG assets are committed application inputs; builds do not require that source folder. No packages were added. The verifier checks shared CSS token references and nonempty finite SVG geometry. Component tests cover native forms/disabled behavior, chip/navigation selection, tag removal, avatar recovery, icon geometry reuse, notification dismissal and modal intent. Existing integration tests cover authentication and workspace flows.

Browser checks covered the login and workspace at narrow and desktop split-screen widths: the sidebar subtitle, header wrapping, downward profile chevron and stacked filters were inspected. Full keyboard, contrast and all-screen visual verification remain pending. Unit tests do not prove browser layout, focus trapping or visual parity. SVG conversion preserves nested affine transforms; `node --test tools/design-system/svg-geometry.test.mjs` checks arrow direction, clipping and transform origins.

### Anchored popover

`NgagePopover` is exported by the shared design system. Bind `isOpen`, the trigger HTMLElement as `anchor`, `heading` and optional `description`; handle `dismissed` to clear the parent's open state. Project the popover body into it. Native top-layer rendering prevents clipping by scroll containers. It repositions on scroll/resize, clamps to the viewport, supports Escape and arrow-key navigation, and restores trigger focus after explicit dismissal. Outside-click dismissal leaves focus on the clicked control. A fixed-position fallback is included for environments without the native Popover API.
