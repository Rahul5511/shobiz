# Platform Admin

The `/app` workspace adapts the supplied design and Platform Admin flow, with the approved Word review changes. Demo sign-in: `superadmin@demo.local` / `Demo@123`. The internal Platform Admin role remains `Super User`.

## Screens and architecture

- The sidebar contains Dashboard, Clients, Events, Reports, Manage Access (Users and Role & Permission), and Master Data. Permission Settings / Role Permissions contains the feature permission matrix and synchronized role-wise view. Notifications and account actions remain in the header. Master Data selects among the existing 11 screens through a highlighted dropdown that receives focus when opened.
- Screens keep separate TypeScript, HTML and CSS files under their feature folders. The shell owns navigation within `/app`; shared record forms, lists and reviews reuse the existing schema renderer. Styles remain scoped to the admin workspace or individual component.
- The shell provides one `WorkspaceService` for shared records, drafts, assignments and browser persistence. Public registration retains its standalone provider. Async QR/upload actions continue to delegate to the shell.
- Mutable workspace renderers use `ChangeDetectionStrategy.Eager`; analytics use local Signals where already established. `AuthSession` owns the live session, with `LoginService` providing the dummy account adapter.
- `core/permissions/platform-admin-policy.ts` controls navigation and actions. The approved Admin changes enable event creation and editing, Requirements Log writes and visible attendee details. Executive assignment and scheduled reporting remain unavailable to Admin.

## Review behavior

- Dashboard defaults to all events, with Client/Event/City/date filters and event drilldown. It includes five KPIs, stage/status and Pax comparisons, registration trends, approval timing and outcomes, ongoing/upcoming events, and pending approvals waiting at least 72 hours. Missing timestamps remain unknown. Module progress is explicitly dummy, event-scoped data with coverage shown.
- Clients include the Branding step (optional client logo; client banner is removed), optional Address PIN Code / Postal code based on country (with legacy postal values preserved), searchable Account Manager selection, repeated secondary contacts and additional CS Managers. CS notification receipts are prepared locally. Events provide stage/client filters, start-date sorting, expandable city-specific details and DRF links, a pinned Actions column, and read-only DRF/Assets context. City stage/status/dates can inherit event defaults; missing city Pax/venue remain unspecified. Event logos/banners accept PNG/JPEG/WebP up to 2 MB, the optional website requires HTTP(S), and event branding takes precedence on public registration pages. Terms and Privacy documents remain unchanged.
- Users combine Name/Email identity, roles, event/city assignments and access preview. Existing emails match case-insensitively and gain roles without creating duplicate users. Lists/exports mask user email; report attendee PII remains visible. Client/event/city assignments appear only for Assigned scope using existing built-in scope conventions. The former Organisation fields and Mobile are omitted from onboarding while saved values remain preserved. Hierarchy follows nested creator links, keeping missing creators explicit. Disable supports reassignment to a qualified active first-role holder per held work item or pending-work flags. The fixed Admin role and last active Admin are protected.
- All assigned roles are stored, while sign-in continues using the first role. Editing one's active role requires signing in again. Custom role renames preserve assigned user references and account status.
- Standalone Role Reports is commented out and its old entry opens Reports. The shared report summary renderer remains available within Reports. Reports consolidate seven choices with summary/record views, filters, selected columns, pagination and export metadata history. Exports cover every matching record, not only the visible page. Sharing is prepared only for a matching contact of the selected client. Export history records preparation or failure, not confirmation that a file was saved.
- Removed client/event/user form fields stay in saved records. Legacy access-assignment drafts migrate to the combined user flow. Failed storage writes roll back the affected records and local invitation/notification changes.

## Deferred integration

Permission Settings now supports the 22 feature access levels using the exact 12 Shobiz starting-role matrix from Portal Access, Roles and Permissions v1.0. Existing custom roles are included with stable record IDs and conservatively mapped legacy permissions. New features default to None (Reports remains View); Platform Admin starts at Manage and can be edited like other roles. Matrix and role-wise views share one Signals store; filters never alter drafts. Edits are saved together only after the review confirmation. Failed persistence preserves unsaved edits and rolls back committed values. User role assignments remain in Manage Access and are not changed by this page.

The matrix uses a reusable native top-layer NgagePopover with anchored positioning, keyboard controls, light dismissal and focus restoration. NgageModal supplies review/discard confirmation. Frontend configuration persists in the existing dummy workspace storage; backend authorization, multi-role runtime aggregation, PII/scope enforcement and licensor switches remain separate integration work. Existing first-role sign-in semantics remain in use.

Supplied JSON and browser storage remain the data sources. Seed additions do not reset existing browser records. APIs, production authentication, real invitations, notification delivery and report sending are not connected. Login, recovery, public registration and theme behavior remain in place.

## Validation

Run `npm.cmd run build` and `npm.cmd test -- --watch=false`. Tests cover authentication/status persistence, approved capabilities, user onboarding and reassignment, protected Admin access, data/draft migration, rollback on storage failures, event log permissions, analytics boundaries, report filters/columns and exports.

Live-browser visual verification was unavailable because the Computer Use browser host was unavailable. Automated Angular DOM and behavior tests provide local verification; no live-browser visual pass is claimed.

