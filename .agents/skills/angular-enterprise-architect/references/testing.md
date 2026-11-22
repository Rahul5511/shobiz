# Verification and code quality

Choose checks for the changed behavior and actual repository tooling. At creation, package scripts include `build` and `test`; the project uses Angular's Vitest-based setup. ESLint, Playwright, Storybook, and Git hooks are not configured. Do not claim these gates exist or install all of them for an unrelated task.

## Behavioral coverage

| Changed behavior        | Useful verification                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Permissions and session | Allow/deny, anonymous/loading/error state, stale grants after logout, all/any semantics, backend denial handling |
| Data access and state   | Request parameters, mapping, error normalization, canceled stale reads, mutation invalidation                    |
| Forms                   | Required/conditional/async validation, pending state, server errors, duplicate submission, dirty/save behavior   |
| Shared UI               | Inputs/outputs, loading/empty/error, stable identity, keyboard/focus, responsive rendering                       |
| Routes                  | Lazy boundary, redirects, unauthorized/not-found, unsaved changes                                                |
| Critical business flow  | Integration/E2E happy path and material failure/authorization paths                                              |

Use the existing unit runner for services, validators, utilities, state, and component behavior. Configure HttpClient test providers in the order required by the installed Angular version when replacing real networking. Do not make unit tests call live APIs.

For E2E, prefer Playwright when the project establishes that tooling. Exercise authentication, permission denial, and meaningful business outcomes with controlled identities/data. Pair automated accessibility checks with keyboard/focus checks; automation alone is insufficient.

## Commands and quality gates

- `npm run build`: production compilation/bundling using the project's Angular configuration.
- `npm test -- --watch=false`: non-interactive tests; inspect actual runner options when they change.
- `node_modules/.bin/prettier --check <changed-files>` or the platform equivalent: use existing formatting rules.
- Run configured type checks, lint, E2E, and CI scripts when they exist and are relevant. Do not invent script names in completion reports.

Target strict TypeScript and Angular templates. The current root config does not explicitly enable `strict`/`strictTemplates`; plan that migration with its actual impact when requested. Do not suppress errors with `any`, non-null assertions, blanket lint disables, or `@ts-ignore` merely to pass a gate.

Add tests for meaningful new behavior and regressions; avoid mechanical tests of wording, documentation, trivial styling, or private implementation details. Report the exact checks run and distinguish failures, unavailable tools, and untested integrations. CI gates, formatting hooks, and Storybook should be introduced when their setup is in scope.
