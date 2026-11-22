# Conditional typed form

Read [example.ts](example.ts). It uses typed Reactive Forms supported by the installed project. The fixed form schema has one dynamic requirement: approval notes become required only when approval is selected. Hidden notes are preserved locally for toggling back, but omitted as `null` in the submitted DTO when approval is off. Whitespace-only required text is rejected.

Import `EventForm` into the owning feature page and bind unique error IDs, pending state, safe server errors, and the save intent:

```html
<app-event-form
  nameErrorId="create-event-name-error"
  noteErrorId="create-event-note-error"
  [saving]="saving()"
  [serverError]="saveError()"
  (saveRequested)="saveEvent($event)"
/>
```

The feature owner must gate `saveEvent` synchronously and own the mutation lifecycle (for example with an `exhaustMap` command stream). A child pending input improves feedback but does not alone guarantee duplicate prevention before the parent's next render. Check permissions at invocation. On success, update the saved baseline/mark pristine; on failure, retain entered values and release the pending gate. Map known backend field errors to the relevant control and show other safe errors at form level.

For edit mode, populate the form once from the selected entity; do not overwrite dirty edits on every refresh. Add a real unsaved-changes guard at the page boundary. For asynchronous dropdowns or validators, define cancellation, dependent value reset, and pending/error behavior before adding controls.

Use compatible PrimeNG controls when installed, preserving typed form ownership and accessible label/error associations. Verify Signal Forms stability and widget integration before choosing them for another task. This pattern is conditional fields, not a runtime form-schema engine.

Verify: name validation, whitespace rejection, note requirement toggling, hidden note omission, pending/invalid submission rejection, save payload, server failure recovery, and parent-side duplicate submission gating.
