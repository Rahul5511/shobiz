# State management

| Need                                                        | Default choice                                                           |
| ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| Synchronous component state                                 | `signal()`                                                               |
| Derived values                                              | `computed()`; avoid a second writable copy                               |
| Debounced input, cancellation, polling, stream coordination | RxJS with explicit teardown                                              |
| Shared feature state                                        | Feature-scoped injectable service/store                                  |
| Reactive reads                                              | `resource()`/`httpResource()` only after status and compatibility checks |
| Complex cross-screen/event-driven state                     | Evaluate NgRx SignalStore/Store against demonstrated complexity          |

Keep global state limited to real application concerns such as session and theme. Do not install NgRx for a CRUD screen that a feature service handles well.

## Async correctness

Represent loading, result, empty, and error intentionally. A discriminated union is useful when combinations must be impossible. Invalidate or label stale data when parameters change.

Use `switchMap` for replaceable searches/reads, `exhaustMap` or an explicit pending gate for duplicate-sensitive submissions, and ordered coordination only when the domain requires it. Cancel obsolete HTTP subscriptions. `takeUntilDestroyed()` requires an injection context or an explicitly passed `DestroyRef`.

Keep errors inside the inner read stream so one failed request does not permanently stop refreshes. Do not use `EMPTY` as silent recovery without setting visible error state. Shared-stream caches require deliberate lifetime, identity/tenant keys, and invalidation; `shareReplay` alone is not a cache policy.

Use `computed()` for derived values, not `effect()` that copies state into other state. Reserve effects for real side effects such as non-sensitive preference persistence or third-party integration, with cleanup and no loops.

Treat resource APIs as read coordination. Use an explicit mutation flow for writes, then refresh/invalidate affected reads. Verify cancellation, injection context, loading/error semantics, and API stability before selecting them.

The [feature example](../examples/feature-module/usage.md) demonstrates cancellable reads without adding a state library.
