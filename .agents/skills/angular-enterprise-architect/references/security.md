# Frontend security and enterprise boundaries

Use this guidance for the affected flow; a normal feature task does not implicitly request an exhaustive security audit.

## Browser and transport

- Preserve Angular template escaping and sanitization. Do not use `bypassSecurityTrust*`, raw DOM HTML insertion, or dynamic code execution without a concrete documented and reviewed trust justification.
- Prefer supported CSP and Trusted Types integration where the host supports it. Coordinate headers/nonces with deployment rather than pretending frontend source alone enforces server headers.
- For cookie authentication, coordinate HttpOnly/Secure/SameSite cookies and server CSRF defenses. Check Angular's XSRF behavior, API origin, cookie/header names, and backend verification; interceptor presence alone does not guarantee protection.
- For OIDC/OAuth, use a maintained standards-based integration and the backend's agreed browser flow. Do not store passwords, client secrets, or long-lived credentials in local/session storage. Frontend configuration and environment replacements are public.
- Scope auth headers and credentialed requests to trusted origins; coordinate CORS on the server. Allowlist safe URL schemes and destinations for navigation/downloads.

## Authorization and data handling

Backend APIs must enforce object/tenant-level authorization for reads, writes, exports, and downloads. UI permission checks are usability controls. Do not infer that hiding a row action secures its endpoint.

Treat upload size/type/extension checks in the client as early feedback; require server validation, storage/access policy, and malware scanning where applicable. Do not trust browser MIME claims. Escape file names and validate download targets.

Show safe error messages and log only necessary diagnostic data. Do not send session credentials or sensitive form/response bodies to logs, analytics, or error tracking. Critical business audit records belong on the backend with authenticated actor, action, object, time, and result; browser telemetry is supplementary and untrusted.

Inspect dependency vulnerability reports when relevant and review fixes for compatibility. Do not blindly run force upgrades or introduce unrelated packages. Clear session-specific caches and exports on logout/scope changes where applicable.
