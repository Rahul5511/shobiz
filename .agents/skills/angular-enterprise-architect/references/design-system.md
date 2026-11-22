# Design system, Tailwind, and PrimeNG

## Compatibility gate

Tailwind is already imported in `src/styles.css` with the v4 PostCSS integration. Inspect the installed setup before changing it; do not introduce a v3 configuration or a second reset. PrimeNG is not installed at skill creation. When its integration is requested, check official PrimeNG peer dependencies, theme package/import paths, and Angular support for the chosen release before installing it. Do not assume an older theme API or animation-provider recipe is current.

## Token ownership

Define semantic application tokens centrally and bind them to the supported PrimeNG theme preset mechanism and Tailwind v4 theme/CSS variables. Keep one source of meaning across both systems rather than two unrelated color palettes.

| Token family | Required decisions                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| Color        | Brand primary/secondary; success, warning, danger, info; text, muted text, surface, background, border |
| Typography   | Font family, size scale, line heights, weights                                                         |
| Geometry     | Spacing scale, radius, shadow, density, header/sidebar/container dimensions                            |
| Interaction  | Focus ring, hover/active/disabled states, animation durations and reduced motion                       |
| Responsive   | Breakpoints and shell behavior, including narrow tables and navigation                                 |

Create light and dark semantic values; ensure overlay panels and library components follow the same mode selector. Persist only a non-sensitive theme preference and respect system preference where product rules allow it. Check contrast in both modes, including disabled controls, charts, errors, focus rings, and badges. Never communicate status by color alone.

## Styling decisions

Use Tailwind primarily for layout, spacing, responsive utilities, and simple presentation. Use PrimeNG for complex widgets such as sorting/filtering tables, overlays, date pickers, and multi-selects. Prefer supported preset tokens, component inputs, and documented extension hooks over internal DOM selectors.

Set a deliberate CSS layer/reset order and test a representative input, button, dialog, and table for reset conflicts. Avoid repeated hardcoded colors, arbitrary spacing drift, broad `!important`, duplicate rules, and new `::ng-deep` overrides. A specialized component may own a justified local token; do not turn a one-off value into an enterprise foundation prematurely.

Validate keyboard navigation, visible focus, touch targets, zoom, mobile overflow, and reduced-motion behavior. Storybook is useful when reusable components need isolated state documentation; add it only when the task warrants the dependency and maintenance.
