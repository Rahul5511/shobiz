# Enterprise forms

Default to typed Reactive Forms with non-nullable controls where empty values have a defined meaning. Evaluate Signal Forms only after checking the installed Angular stability status, project policy, and chosen PrimeNG control integration. Do not mix competing form/value ownership approaches on the same control.

## Field behavior

- Keep business-specific defaults, conditional fields, and validation in the owning feature. Share only genuinely generic validators/error presentation.
- Derive create/edit mode from a clear contract. Load initial data once per intended record transition without overwriting the user's dirty edits on background refresh.
- Define null versus empty-string/empty-array semantics. Serialize only allowed fields; disabled controls can disappear from `.value`, while `getRawValue()` includes them.
- On conditional changes, add/remove the relevant validators and recompute validity. Decide whether hidden values should be cleared, retained locally, or omitted from the payload.
- Use debounced/cancelable asynchronous validators with meaningful pending states. Handle cascading dropdown invalidation and races; clear a child selection when the parent makes it invalid.
- Associate labels/help/error text with controls. Show errors consistently after touch/submission, use appropriate autocomplete, and move focus to the relevant error summary/field when needed.

## Submission and navigation

Prevent duplicate submissions and reject invalid/pending forms. Map server field errors to controls without overwriting unrelated client errors. Show a safe form-level message for network or unrecognized errors. Preserve user-entered values after failure.

Define dirty state relative to the saved baseline. Mark pristine only after confirmed save, and protect unsaved edits with an appropriate `CanDeactivateFn`; account for pending saves and applicable browser unload limitations. A disabled button alone does not implement permission enforcement.

Dynamic forms do not automatically justify a schema engine. Start with typed conditional configuration; use a discriminated field schema only when there is a real requirement for runtime-defined fields. Keep renderer kinds and validation rules allowlisted rather than executing server-provided code.

The [dynamic-form example](../examples/dynamic-form/usage.md) uses fixed typed controls with a conditional approval note, field errors, and parent-owned submission state.
