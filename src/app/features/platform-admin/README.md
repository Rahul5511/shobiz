# Platform Admin

The `/app` workspace adapts `design-source/source` and `PLATFORM_ADMIN_UI_FLOW.md`.
Sign in with `superadmin@demo.local` / `Demo@123`. The stored role is `Super User`.

- `layouts/platform-admin` owns the header, sidebar, theme settings, guide and account context. Navigation inside `/app` still follows the existing in-workspace view model; no URLs or actions changed during screen separation.
- `shared/workspace/data-access/workspace.service` owns the shared admin-domain state and browser draft/record persistence. It still has exactly one provider on the admin shell. `shared/workspace/data/model.ts` composes the unchanged supplied JSON. Keep the form schemas and display content when replacing persistence with feature APIs.
- Each screen has its own component, template and CSS folder under `features/<feature>/pages/<screen>`: Dashboard; Clients; Events and registration QR; Users, Roles & permissions, Role Permissions and credentials assignment; all 11 master-data pages; Reports, Registration vs Attendance and Role Reports; Notifications; Profile and Change Password. Feature root files expose their screen components for shell composition.
- Event analytics lives in `features/events/components/event-dashboard`; Role Reports lives in `features/reports-and-tracking/pages/role-reports`. Both have separate HTML, CSS and TypeScript files; their existing screen-only CSS retains the native admin scope. Public registration, recovery and the legacy Events page also use external HTML/CSS files. Common theme rules remain shared.
- Reused list, form, review, record-detail and operational-report renderers live in `shared/workspace/components`. They render the same shared state and unchanged templates. Async QR/upload actions delegate to the shell so view changes do not destroy their change detector. Generic tables, icons and exports remain under `shared`.
- Extracted page/renderer components use `ChangeDetectionStrategy.Eager` to preserve the former inline template's response to the existing mutable workspace state. The shell keeps its original change-detection behavior.
- The own-account pages receive the same typed shell context, preserving unsaved profile state and synchronization with the header. The standalone public-registration page moved to `features/events/pages/public-registration`.
- `core/permissions/platform-admin-policy.ts` is the exact documented capability map used by routing and workspace commands. Saving permission checkboxes updates demo configuration, independently of this navigation policy.
- `core/services/login/LoginService` is the authentication adapter; `AuthSession` remains the sole live session owner. The workspace compatibility adapter delegates to them. Password changes last for the running service session; recovery and SSO are simulated.
- `layouts/platform-admin/platform-admin.css` preserves the reference stylesheet inside native CSS `@scope (.platform-admin)`, including themes, responsive and print rules. It also restores the reference browser margins within Tailwind's reset. It does not style other application roots.
- Public registration URLs open the supplied standalone public registration view with its own workspace state provider.

Run `npm.cmd run build` and `npm.cmd test -- --watch=false`. The tests cover login/session behavior, the guarded dashboard, read-only events, onboarding and separate access activation, drafts, validation, permission saves, active location options, report masking/date states and exports across pages.

APIs, real email delivery and production authentication are not connected. Live-browser visual verification was blocked by Computer Use's inability to determine the Chrome URL; automated Angular DOM and behavior tests run locally.
