# Lazy feature with cancellable reads

Read [example.ts](example.ts). It is a compact standalone feature, not an Angular NgModule. It uses installed Angular/RxJS APIs, a typed first-page response, a bounded read timeout, visible failure/retry, and cancellation through `switchMap`. `toSignal` owns subscription cleanup in the component injection context. Catching errors inside the replaceable read keeps refresh working after a failure.

When implementing a real feature, split the types, API service, routed page, and route array into the owning feature folders only as needed. Import the route array lazily from application routes, adapting filenames:

```typescript
{
  path: 'events',
  loadChildren: () => import('./features/events/events.routes').then((m) => m.eventsRoutes),
}
```

Register `provideHttpClient()` in the existing `app.config.ts`. Add the actual authenticated shell and permission guard before exposing protected data. `/api/events`, its page base, timeout, DTO, and total count are illustrative contracts that must agree with the server; no endpoint is created by this example.

This demonstrates a first-page read. A full listing must add server-owned pagination, filters, and sorting rather than imply all results are shown. Reuse centralized error normalization if the application has it. Use design tokens/PrimeNG where the requested UI warrants them; the minimal semantic markup keeps this example independent of uninstalled packages.

Verify: first load, empty results, failure followed by retry, refresh canceling an obsolete read, and destruction during a pending request.
