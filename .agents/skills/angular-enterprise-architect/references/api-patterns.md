# API communication

Use Angular `HttpClient` behind feature-specific data-access services. Register `provideHttpClient()` and functional interceptors in the existing application provider setup when HTTP integration is requested. Do not create a parallel bootstrap or put HTTP calls inside generic table/form controls.

## Boundary contracts

Define typed requests, DTO responses, paging/filtering parameters, and result metadata from the actual server contract. Angular HTTP generic types do not validate untrusted JSON at runtime; validate external data when its trust/risk warrants it. Map DTOs to domain/UI models where names, dates, units, or nullability differ.

Keep one pagination convention per API (page index/base or cursor, page size, total/next token). Encode query parameters with `HttpParams` or equivalent typed HttpClient options. Define empty-filter semantics, sort fields/direction, and timezone/date serialization. Never infer a production endpoint from an illustrative example.

## Request policy

- Scope credentials/authentication headers to explicitly trusted API origins. Never attach bearer tokens to every outbound URL.
- Normalize errors into a stable application contract such as kind, safe message, status, field errors, and correlation ID. Preserve enough context for diagnostics while excluding tokens, passwords, and sensitive response bodies.
- Define a bounded timeout appropriate to the operation, including upload/export exceptions. Retry only appropriate transient failures with a small bound/backoff; do not retry authentication/validation failures as transient errors.
- Do not automatically retry non-idempotent writes. A retryable mutation requires an explicit server-supported idempotency contract.
- Cancel obsolete reads. Show recoverable errors and meaningful retry actions. Prevent duplicate submissions; a canceled client write may still have reached the server.
- Cache only with an explicit lifetime, invalidation after mutations, and session/tenant-aware keys. Clear sensitive caches on logout or scope changes.

Coordinate centralized and local error presentation so one failure does not trigger several identical notifications. Authentication refresh must be bounded and single-flight when needed, and must not recursively intercept itself.

Use [the feature example](../examples/feature-module/usage.md) as a small paged-read pattern; its mock contract and relative endpoint need backend agreement.
