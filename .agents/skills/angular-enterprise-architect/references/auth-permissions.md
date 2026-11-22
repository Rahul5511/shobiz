# Authentication and authorization

Use a centralized typed permission registry such as `users.view`, `users.create`, `users.edit`, `users.delete`, `agencies.view`, `agencies.approve`, and `reports.export`. Add event permissions when that business flow is implemented. Names are a contract with the backend, not evidence that endpoints exist.

Roles such as Super Admin, Admin, Manager, Operator, and Viewer are examples. Confirm the actual role-to-permission mapping from the backend/product contract. Components check capabilities, not scattered role strings. Do not give a role an implicit wildcard bypass without an explicit policy.

## Session lifecycle

Model initializing, authenticated, anonymous, and failed session states explicitly. Load identity and grants from a trusted authenticated endpoint. Guards wait for initialization or fail closed with a recoverable outcome; an empty initial grant set is not proof that the session is anonymous.

Prefer established OIDC/OAuth integration or a server-managed secure session as appropriate to the backend. Coordinate session expiry, refresh, logout, return URLs, and multi-tab behavior. Do not implement an ad hoc credential store. Clear permissions and user-scoped data on logout/account or tenant changes. Refresh failures must terminate rather than enter infinite retry/redirect loops.

## One policy across surfaces

- Routes and navigation read the same centralized permission definitions. Filter the navigation tree without leaving empty parents or exposing inaccessible destinations.
- Page actions, table actions, forms, and business commands use the same policy. Check permissions again when executing commands if session grants can change while the page remains open.
- Define whether a rule requires all or any permissions. Treat missing/unknown permissions as denied; distinguish a public route from a malformed permission rule.
- Route denial returns a `UrlTree`/redirect result. Choose login for anonymous sessions and an unauthorized page for authenticated denial. Never imperatively navigate and also return `false`.
- Backend APIs independently authorize every operation and object/tenant scope. UI guards and hidden buttons only guide the user experience.

See [the permission-guard example](../examples/permission-guard/usage.md). Its session adapter is intentionally fail-closed and must be connected to a trusted session flow before use.
