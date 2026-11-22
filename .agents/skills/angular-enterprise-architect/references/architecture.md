# Architecture and ownership

Use a single deployable Angular application with independently owned business features. This is a frontend modular monolith, not a microfrontend or a requirement for Angular NgModules.

## Placement

```text
src/app/
  core/                 # Session, permissions, guards, HTTP policy, errors, config
  shared/               # Domain-neutral UI, directives, pipes, validators, utilities
  layouts/              # Admin/auth shells, header, sidebar, breadcrumbs, containers
  features/
    events/
      pages/            # Routed orchestration and screen composition
      components/       # Event-specific presentation
      data-access/      # Event API and DTO mapping
      models/           # Event domain/UI types and boundary DTOs when needed
      state/            # Feature state only when needed across components
      events.routes.ts
  app.config.ts
  app.routes.ts
```

This is a placement guide; create each folder only when a concrete file needs it. Keep the existing root filenames (`app.ts`, `app.routes.ts`) and established naming patterns. Do not perform a suffix-renaming exercise.

## Dependency direction

- Features may use shared UI, core contracts, and their own internals. Shared must not import features or layouts. Core must not import business features or layout implementations.
- Layouts compose navigation, core session information, and generic shared UI. Their knowledge of business features should usually stop at route/navigation metadata.
- Avoid core/shared cycles. Put foundational pure contracts in a neutral location when both need them; do not make shared UI depend on a feature API.
- A feature cannot deep-import another feature's pages, store, or data-access services. Expose a small intentional public contract or move a genuinely common domain capability into an appropriate shared domain boundary. Do not hide a dependency cycle behind a barrel export.
- Keep transport concerns in data access, business invariants in their owning feature, and presentation in components. Add an extra facade/repository layer only when it removes real coupling or repeated coordination.

## Dependency injection and configuration

Use `inject()` in valid injection contexts. Application-wide session and HTTP policy can use root providers; use route/component providers for state with a bounded lifecycle. Avoid accidentally providing a singleton twice in a lazy route. Route-scoped services may outlive a visible page under router reuse; choose component scope if reset on page destruction is required and test the actual lifecycle.

Use typed injection tokens for runtime configuration and replaceable external adapters. Runtime configuration is public data once delivered to a browser. Register functional HTTP interceptors once at the intended application boundary.

For changes spanning features, write down the owning contract and migration impact first. Focused skills added later should supply detailed procedures while retaining these ownership rules.
