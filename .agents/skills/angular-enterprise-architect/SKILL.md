---
name: angular-enterprise-architect
description: "Design, implement, review, and refactor this project's enterprise Angular admin portal. Use for Angular features, reusable components, PrimeNG and Tailwind integration, design tokens, permissions, routing, Signals, forms, API access, and frontend performance. Provides shared architecture guidance for future focused skills; does not govern unrelated backend work."
---

# Angular Enterprise Architect

Act as the principal Angular architect for this single admin portal: a modular monolith with multiple business features, roles, and permission-based operations. Prioritize consistency, correctness, security, maintainability, scalability, then measured performance. Choose the simplest design that meets the current requirement.

## Project scope and compatibility

This is a repository-local master skill. Keep it and future focused skills under this repository's `.agents/skills/`; do not install or change global skills. Apply its shared boundaries alongside relevant focused skills when they exist. Read only references relevant to the task; do not invent, generate, or invoke missing skills. Explicit user requirements and applicable repository instructions take precedence. Resolve a concrete conflict explicitly rather than silently overriding it.

At creation, the manifest declares Angular `^22.2.0`, TypeScript `~6.0.2`, RxJS `~7.8.0`, and Tailwind `^4.1.12`. Installed versions were Angular 22.2.3, TypeScript 6.0.3, RxJS 7.8.2, and Tailwind 4.3.3. These are a baseline, not permanent pins: recheck `package.json`, the lockfile, installed packages, and compiler configuration on each task.

The project currently has standalone bootstrap, empty application routes, and Tailwind imported in `src/styles.css`. PrimeNG, NgRx, Playwright, Storybook, ESLint, and Git hooks are not configured. Prettier and Vitest are installed. TypeScript `strict` and Angular `strictTemplates` are not explicitly enabled. Never describe a target convention as already implemented.

Before selecting APIs or adding packages, verify their supported status and peer compatibility against installed declarations and official version-specific documentation. Use the latest stable version compatible with the project when a dependency change is requested; do not upgrade a working project as a side effect. Prefer typed Reactive Forms until Signal Forms stability and chosen PrimeNG controls are verified. Apply the same check to `resource()` and `httpResource()`; experimental availability is not a reason to migrate.

## Mandatory architecture rules

- Use standalone components and feature boundaries: `core`, `shared`, `layouts`, and `features`. Create only folders the task needs. See [architecture](references/architecture.md).
- Keep authentication, authorization, interceptors, and application-wide policy in core; feature business logic and API services stay in their feature. Features cannot import another feature's private implementation.
- Use strong types, explicit boundary contracts, `inject()`, and intentional provider scopes. Target TypeScript strict mode and strict template checking; when enabling these flags, address affected errors within an agreed scope rather than suppressing them.
- Use modern Angular control flow and lazy routes. Prefer local Signals and computed state, RxJS for asynchronous coordination, and feature-scoped stores over global mutable state.
- Use Tailwind for layout/utilities and compatible PrimeNG components for advanced UI. Centralize theme tokens and PrimeNG presets. Do not wrap every library control or build speculative abstractions.
- Centralize permission definitions. Apply the same policy to routes, navigation, and actions. Backend authorization is mandatory; a frontend check never authorizes an API operation.
- Keep secrets out of frontend code and browser credentials out of insecure storage. Preserve Angular sanitization. Handle loading, error, empty, disabled, and accessible interaction states where applicable.
- Keep changes focused on the requested task. Examples are adaptation patterns, not instructions to scaffold the whole portal or install dependencies.

## Feature implementation workflow

1. Inspect repository instructions, affected source, dependencies, routes, theme configuration, API contracts, and available checks. Identify the feature, owning layer, roles/permissions, and existing patterns to reuse.
2. Briefly explain the intended change and assumptions. Resolve missing business rules from connected/project sources when available; ask only when a necessary contract cannot be inferred safely.
3. Read the relevant references below. Implement only needed types, routes, components, API services, state, and integration. Extend existing conventions instead of reorganizing unrelated code.
4. Account for authorization, asynchronous cancellation, server validation, loading/errors/empty results, keyboard use, responsive layout, and cleanup as the affected flow requires.
5. Add or update tests for meaningful behavior and risk. Run applicable checks supported by the project. A documentation-only change does not need an application build.
6. Report changed files, integration steps, checks actually run, and material assumptions or limitations. Distinguish unavailable tooling from checks that failed.

## Review and refactoring workflow

Inspect the real call paths and feature boundaries before proposing changes. Prioritize concrete correctness and authorization defects, then maintainability and measured performance issues. Report findings with file locations, impact, and the smallest safe correction; distinguish defects from optional preferences. Implement fixes when requested, preserve public contracts unless the task changes them, and verify affected behavior. A review alone does not authorize broad restructuring or dependency migration.

## Reference selection

| When working on                                                         | Read                                                        |
| ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| Layer ownership, folder placement, feature boundaries, dependency scope | [architecture.md](references/architecture.md)               |
| Tailwind, PrimeNG, light/dark themes, design tokens                     | [design-system.md](references/design-system.md)             |
| Shared controls, tables, component contracts, accessibility             | [component-standards.md](references/component-standards.md) |
| Sessions, role-to-permission policy, route/action visibility            | [auth-permissions.md](references/auth-permissions.md)       |
| Signals, RxJS, feature stores, resource APIs                            | [state-management.md](references/state-management.md)       |
| DTOs, HttpClient, interceptors, retries, pagination, caching            | [api-patterns.md](references/api-patterns.md)               |
| Typed forms, conditional validation, server errors, unsaved changes     | [forms-patterns.md](references/forms-patterns.md)           |
| Lazy loading, guards, navigation, breadcrumbs                           | [routing-patterns.md](references/routing-patterns.md)       |
| XSS, CSRF, sessions, uploads, secrets, auditing                         | [security.md](references/security.md)                       |
| Tests, linting, formatting, CI checks                                   | [testing.md](references/testing.md)                         |
| Rendering, bundle size, large tables, cancellation                      | [performance.md](references/performance.md)                 |

## Adaptable examples

Each example has a local usage guide and a self-contained Angular source file. They were compiled with strict TypeScript and Angular template checking against the installed baseline. Revalidate against the current project before copying them; none is wired into the application.

- [Lazy feature and cancellable API reads](examples/feature-module/usage.md).
- [Typed, accessible reusable table](examples/reusable-table/usage.md).
- [Typed form with conditional fields](examples/dynamic-form/usage.md).
- [Permission definitions, session state, and guard](examples/permission-guard/usage.md).

## Completion criteria

Respect feature ownership, public contracts, theme tokens, and permission policy. Verify the requested happy path and material failure/denial states with available checks. Use `npm run build` and `npm test -- --watch=false` when appropriate; formatting, lint, E2E, and CI commands must exist before claiming them as gates. Never claim a check passed unless it ran successfully. Explain any missing server contract or unconfigured tool that prevents verification.
