# Reusable component standards

Keep a component feature-local until actual reuse or a domain-neutral contract justifies shared placement. Favor composition, projected content/templates, and small typed inputs/outputs over inheritance or a universal configuration engine. Do not wrap every PrimeNG widget.

## Contract and behavior

- Use typed signal inputs/outputs supported by the installed Angular release. Specify required inputs, defaults, emitted intent, ownership of selection/value state, and stable identity.
- Presentation controls accept data and emit actions. Generic UI must not fetch data, know API endpoints, decode roles, or own domain workflow rules.
- Support applicable loading, disabled, error, and empty states. Avoid showing stale success content as current data during an error unless it is clearly identified.
- Provide native semantics, visible labels, accessible descriptions/errors, keyboard interaction, focus handling for overlays, and responsive layout. Check the rendered third-party widget rather than assuming its accessibility settings suffice.
- Use shared tokens. Give reusable controls behavioral tests and a usage example showing state ownership; documentation can be colocated or in Storybook when beneficial.

## Enterprise patterns

| Pattern                         | Boundary and important states                                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Data table                      | Typed rows/columns; stable keys; server paging for large data; explicit sort/filter/page events; row actions and permissions supplied by owner |
| Form field                      | Label/control/error association; required and invalid states; typed control integration; avoid competing value sources                         |
| Page header and filters         | Title/actions/description slots; explicit reset/search events; URL state when useful                                                           |
| Confirmation dialog             | Clear destructive action, focus return, keyboard dismissal policy, pending state that prevents duplicate submission                            |
| Badge and notification          | Text plus semantic color; non-color status cue; appropriate live announcements without repeated noise                                          |
| Upload and date range           | Progress/cancel/failure; limits and accessible instructions; explicit timezone/range boundaries                                                |
| Loading, skeleton, empty, error | Contextual text and recovery action; layout stability; meaningful accessible status                                                            |
| Permission-aware action         | Consume centralized authorization decisions; check at invocation as needed; hidden vs disabled behavior defined by UX                          |

Start from [the table example](../examples/reusable-table/usage.md) for a simple presentation contract. For advanced tables, prefer compatible PrimeNG functionality over rebuilding sorting, virtual scrolling, and selection mechanics.
