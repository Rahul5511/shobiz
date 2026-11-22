# Performance and cleanup

Measure the affected interaction first: navigation latency, request count, rendering cost, bundle impact, or memory retention. Fix the observed bottleneck before adding caching, virtualization, or a state library.

- Preserve feature lazy loading. Use `@defer` for expensive noncritical UI when it meaningfully splits work; preserve usable loading/error placeholders and avoid layout jumps.
- Use Signals and immutable state updates. Apply `OnPush` where appropriate to the current Angular change-detection setup; do not introduce it as a ritual without checking third-party integration.
- Use stable domain identity in `@for (...; track item.id)` rather than array indexes for reorderable data. Avoid expensive template computation and repeated parsing.
- Use server pagination/filtering/sorting for large data. Use compatible virtual scrolling only when it helps the actual dataset and retains keyboard/screen-reader usability.
- Debounce search and cancel superseded reads. Avoid fetching on every unrelated state change or duplicating the same subscription/request.
- Bound cache size/lifetime and invalidate after mutations, logout, and tenant changes. Do not cache sensitive cross-user results under a shared key.
- Tear down subscriptions, listeners, observers, object URLs, and third-party widgets. Use Angular's destruction-aware APIs in a valid injection context.
- Inspect Angular build budgets and bundle reports before adding large libraries. Keep optional utilities and heavyweight UI behind appropriate lazy boundaries.

Validate the changed interaction under representative data/network conditions. Record before/after evidence when claiming a performance improvement; a successful build alone does not prove it is faster.
