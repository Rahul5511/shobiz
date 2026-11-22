# Routing and navigation

Use application shell routes and feature-owned lazy route arrays. Prefer `loadComponent` for a small page and `loadChildren` for a feature route collection. Do not eagerly import the pages that a lazy boundary is intended to defer.

## Route policy

- Use functional guards with injected policy/session services. `canMatch` can prevent matching a protected lazy route; return a redirect result on denial rather than falling through to another route unintentionally. Add activation/command checks where session changes require them.
- Guards must handle session initialization and anonymous versus forbidden outcomes. Protect permission metadata from typos through typed helper contracts or explicit typed guard factories.
- Add route titles, centralized breadcrumb/navigation metadata, intended redirects with `pathMatch: 'full'` where needed, unauthorized and not-found destinations. Keep the wildcard last.
- Validate internal return URLs to avoid open redirects. Ensure login/unauthorized/not-found destinations are not guarded in a way that loops.
- Use `CanDeactivateFn` for forms with meaningful unsaved changes. Define how saving, canceling, and save failure affect the guard.
- Preload only when it improves measured navigation and respects permission/network policy. Avoid blanket eager preloading of all business modules.

Keep navigation configuration centralized and permission-aware. Use URLs/query parameters for shareable paging/filter state where useful; validate them before using them as API inputs. Model breadcrumbs that require fetched labels without coupling the shell to a feature's private store.

See [the feature route](../examples/feature-module/usage.md) and [the permission guard](../examples/permission-guard/usage.md). Their integration snippets require adapting real shell paths and session contracts.
