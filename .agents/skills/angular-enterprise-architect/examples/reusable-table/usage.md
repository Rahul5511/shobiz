# Typed presentation table

Read [example.ts](example.ts). The owner maps feature data to `SummaryRow`, supplies authorization decisions, and handles output intents. The table has no API/session dependency. It uses captions, row/column headers, textual status, native buttons, stable identity, and explicit loading/error/empty states.

Example parent bindings, after importing `SummaryTable` into the parent:

```html
<app-summary-table
  caption="Event overview"
  [rows]="summaryRows()"
  [loading]="loading()"
  [error]="errorMessage()"
  [canOpen]="canViewEvents()"
  (openRequested)="openEvent($event)"
  (retryRequested)="reload()"
/>
```

Parent state and handlers above are illustrative integration names. Recheck permission at the action boundary where grants may change. A single `canOpen` input represents a uniform capability; use owner-supplied per-row decisions for object-specific actions. The server must still authorize the target object.

This small semantic table requires no new UI dependency. For advanced requirements, select a compatible PrimeNG release and adapt this contract to its supported table, paging, selection, and sort/filter APIs. Prefer PrimeNG mechanics over extending this into a bespoke grid. Keep server pagination in the parent/data layer and preserve caption/keyboard/focus behavior. A wrapper is justified only by actual shared behavior or design policy.

Verify: distinct loading/error/empty states, error retry intent, stable IDs, visible textual status, permission-controlled action columns, and the emitted record ID. Check responsive overflow and keyboard focus using the application's real theme.
