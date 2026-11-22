# EventOrganisation

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.4.

## Login demo

Run `npm start` and open `http://localhost:4200/login`.

- Email: `admin@eventflow.demo`
- Password: `EventFlow@123`
- Use **Use demo account** to fill the form, then sign in.

The local dummy API simulates a 650 ms response and rejects incorrect credentials. It does not contact an external service. Successful login opens `/events`, a protected welcome screen with sign-out. The demo identity lives only in memory: refreshing the page ends the session. No password or token is saved in browser storage.

### Feature ownership

- `src/app/features/login/`: login routes, page, form validation, and submission feedback.
- `src/app/core/services/login/login.service.ts`: login API calls, currently using a dummy response.
- `src/app/core/services/login/auth-session.service.ts`: session state and sign-in/sign-out lifecycle.
- `src/app/core/models/login/`: typed login requests, responses, and session contracts.
- `src/app/shared/utils/login/`: safe return navigation and its tests.
- `src/app/core/guards/login/`: protected-route and signed-in guest redirects.
- `src/app/layouts/login/` and `src/app/layouts/admin/`: login and workspace shells.
- `src/app/features/events/`: minimal destination after sign-in; event management is not implemented yet.

### Feature folder convention

Group related files by feature inside each responsibility folder, including their tests. For login this means `core/services/login/`, `core/models/login/`, `core/guards/login/`, `shared/utils/login/`, and `layouts/login/`. UI pages and routes remain under `features/login/`.

Follow the same pattern for future features: for example, add event API services under `core/services/events/` and event models under `core/models/events/`. Create a folder when it has a concrete file to contain. Keep genuinely reusable components in their own named folders under `shared/components/`.

### Connect the real API later

1. Replace the dummy implementation of `login(request: LoginRequest)` in `src/app/core/services/login/login.service.ts` with an Angular `HttpClient` request. Keep its `Observable<AuthUser>` return contract and map your backend response to it. Add login-related API methods to this service and give other features their own service folders.
2. Register `provideHttpClient()` in `src/app/app.config.ts` and inject `HttpClient` into `LoginService`. The service already uses `providedIn: 'root'`, so no custom mock-provider replacement is needed.
3. Map an invalid-credentials response to `new AuthApiError('invalid-credentials')`. Other failures receive a generic retry message. The session service applies a 10-second timeout without retrying the login mutation.
4. Replace the demo-only identity lifecycle with your server's agreed session restoration, expiry, and logout flow. For cookie sessions, coordinate HttpOnly/Secure/SameSite cookies and CSRF handling with the backend. Backend endpoints must enforce authentication and authorization independently of frontend guards.
5. Remove the demo account panel/import from `features/login/pages/login.ts` and `login.html`, the `DEMO_CREDENTIALS` constant from `core/services/login/login.service.ts`, and the demo labels/copy from the layouts and welcome screen. Adapt `login.service.spec.ts` to test the real HTTP contract with Angular's HTTP test providers when the demo is retired.

The login form and protected route depend on the session contract, so the HTTP adapter can change without rebuilding the form. The return-URL helper currently allows only `/events` with optional query parameters and a fragment; extend its allowlist with tests when adding protected destinations.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
