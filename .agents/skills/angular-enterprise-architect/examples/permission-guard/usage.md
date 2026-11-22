# Central permissions and a fail-closed functional guard

Read [example.ts](example.ts). `Authorization` starts in a loading state with no grants. It exposes a typed permission policy and explicit authenticated/anonymous/error transitions. New session loads and logout clear old grants. `requirePermission` returns redirect results for login, unauthorized, and unresolved/failed session states rather than issuing imperative navigation.

Split these definitions into the real core session/permissions boundary when implementing. Populate grants only from the trusted server-backed session adapter, not from arbitrary local storage or assumed role defaults. Define how the backend maps roles and unknown permission identifiers; do not cast unchecked JSON into `Permission[]`.

Example root route integration after adapting the feature path:

```typescript
{
  path: 'events',
  canMatch: [requirePermission(permissions.eventsView)],
  loadChildren: () => import('./features/events/events.routes').then((m) => m.eventsRoutes),
}
```

Create the unguarded `/login`, `/unauthorized`, and `/session-unavailable` pages before using this redirect policy. The last page must offer session retry and a deliberate return to the original internal route. Alternatively, let the guard wait for the existing session adapter's initialization result with bounded error handling. Do not let initial loading silently masquerade as anonymous login or a resolved permission denial.

Navigation and actions should call `has()` using the same registry. The method reads a signal and is reactive when called from a template/computed context. A match guard does not revoke an already active page by itself: the session coordinator must handle logout/revocation, clear user data, and reroute where appropriate. Commands must recheck policy and handle server denial.

The example is not an authentication implementation. Wire the real session backend, cookie/OIDC strategy, CSRF policy, and object/tenant authorization separately. Every backend operation must independently authorize access.

Verify: loading/error fail closed, anonymous goes to login, authenticated allow/deny, grants cleared on logout and reload, and no redirect loops on the destination pages.
