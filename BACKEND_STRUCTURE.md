# ReactNJobApplicWeb Backend Structure

Generated: 2026-05-09

This document records the current backend and deployment structure before migrating the backend into the shared `currentSC-official-website-project` service. Environment values are intentionally not included.

## Repository Summary

- Source repo: `C:\Users\scgro\Desktop\Webapp training project\ReactNJobApplicWeb`
- Git remote: `https://github.com/AKCD1998/ReactNJobApplicWeb.git`
- Current branch at inspection: `main`
- Working tree at inspection: clean
- Backend app root: `backend`
- Frontend app root: `sc-pharm-form`
- Package manager: npm, with separate `package-lock.json` files in `backend` and `sc-pharm-form`
- Workspace/monorepo tool: none detected
- Deployment intent: move backend behavior from old Render service `srv-d5r06lnfte5s73c12pt0` into shared service `srv-d58idfm3jp1c73bhgv40`

## High-Level Backend Architecture

The backend is a single CommonJS Express 5 application in `backend/server.js`.

Request flow:

1. `dotenv.config()` loads backend environment variables from local runtime or Render.
2. Express app is created.
3. CORS middleware is applied globally.
4. JSON body parser is applied globally with a raw-body capture hook for LINE webhook requests.
5. Routes are declared directly in `server.js`.
6. `app.listen()` starts the process.

There is no exported app object today. Baseline tests should start the server in a child process instead of importing `server.js`, unless the code is later changed to export the app without changing runtime behavior.

## Folder And File Map

```text
ReactNJobApplicWeb/
  .github/
    workflows/
      deploy.yml              GitHub Pages frontend build/deploy workflow
  backend/
    .env                      ignored local env file; values not inspected
    .gitignore                ignores .env, logs, node_modules, dist, etc.
    package.json              backend npm scripts and dependencies
    package-lock.json         backend npm lockfile
    server.js                 Express server entry point and all backend routes
  sc-pharm-form/
    .env                      ignored local env file; values not inspected
    .gitignore                ignores .env*, node_modules, dist, etc.
    package.json              Vite/React frontend scripts and dependencies
    package-lock.json         frontend npm lockfile
    vite.config.js            Vite config with GitHub Pages base path
    dist/                     local built frontend output
    src/                      React application source
  PROJECT_BLUNDERS.md         project-specific operational notes
```

## Backend Runtime

- Runtime: Node.js
- Module system: CommonJS (`"type": "commonjs"` in `backend/package.json`)
- Entry point: `backend/server.js`
- Start script: `npm start` -> `node server.js`
- Dev script: `npm run dev` -> `nodemon server.js`
- Default port: `3003`
- Framework: Express `^5.2.1`

Backend dependencies:

- `express`
- `cors`
- `dotenv`
- `multer`
- `@sendgrid/mail`

There is no database dependency in the source backend.

## API Endpoint Summary

| Method | Path | Handler location | Purpose | Auth | Notes |
| --- | --- | --- | --- | --- | --- |
| GET | `/` | `backend/server.js` | Basic root health response | None | Returns text `OK` |
| GET | `/health` | `backend/server.js` | Health check | None | Returns `{ ok: true }` |
| POST | `/api/line/webhook` | `backend/server.js` | LINE webhook receiver | LINE signature when configured | Requires raw body for signature verification |
| POST | `/api/notify/line/job-application` | `backend/server.js` | Sends LINE job application notification | None | Non-blocking style response; uses LINE Messaging API token |
| POST | `/api/line/notify` | `backend/server.js` | Sends LINE CV notification | None | Broadcast mode is intentionally rejected for this route |
| POST | `/api/apply/cv` | `backend/server.js` | Upload PDF CV and send email | None | `multer` memory upload, PDF-only, 10 MB limit |
| POST | `/api/submit-application` | `backend/server.js` | Submit full application payload and optional resume | None | Forwards to Google Apps Script and can send resume email |
| POST | `/api/resume` | `backend/server.js` | Submit base64 resume payload by JSON | None | Sends resume email through SendGrid |

## Controllers, Routes, Middleware, And Services

There are no separate route, controller, service, or middleware files. All route handlers, helper functions, LINE integration, Google Apps Script forwarding, SendGrid email logic, filename sanitization, and upload configuration live in `backend/server.js`.

Middleware:

- `cors()` with dynamic origin allowlist.
- `express.json({ limit: "15mb", verify })`.
- `multer.memoryStorage()` for resume/CV file uploads.

Security middleware not currently present:

- No `helmet`.
- No CSRF middleware.
- No explicit rate limiter.
- No cookie/session middleware.
- No JWT/auth middleware for public endpoints.

The LINE webhook route depends on `express.json`'s `verify` callback to preserve `req.rawBody` before JSON parsing. This must be preserved if the route is moved under a shared app that already has global JSON parsing.

## Database And Migrations

No PostgreSQL, ORM, database connection file, migrations, seeds, or schema files were found in the source backend.

Important migration implication:

- This backend should not need project-specific PostgreSQL migration work for the first consolidation.
- The shared target service already has PostgreSQL usage for the main website and `rx1011`; ReactNJobApplicWeb should not inherit or touch that database unless a future feature explicitly requires it.

## Environment Variable Names

Backend env vars used:

- `PORT`
- `SUBMIT_URL`
- `QUICK_CV_SUBMIT_URL`
- `HR_EMAIL`
- `HR_TO_EMAIL`
- `LINE_NOTIFY_ADMIN_URL`
- `CORS_ORIGINS`
- `REACTNJOB_SENDGRID_API_KEY`
- `FROM_EMAIL`
- `LINE_CHANNEL_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_NOTIFY_MODE`
- `LINE_NOTIFY_USER_IDS`

Frontend build-time env vars used:

- `VITE_API_BASE_URL`
- `VITE_REACTNJOB_API_PREFIX`
- `VITE_ENABLE_LINE_NOTIFY`
- `VITE_LINE_NOTIFY_ENDPOINT`
- `VITE_LINE_CV_NOTIFY_ENDPOINT`
- `DEV` through `import.meta.env.DEV`

Ignored local env files exist at:

- `backend/.env`
- `sc-pharm-form/.env`

They are ignored by nested `.gitignore` files and were not read for this documentation.

## Frontend Deployment And API Target

Frontend app:

- Root: `sc-pharm-form`
- Framework: Vite + React
- Module system: ESM
- Vite base path: `/ReactNJobApplicWeb/`
- Likely GitHub Pages URL: `https://akcd1998.github.io/ReactNJobApplicWeb/`

Current GitHub Pages workflow:

- File: `.github/workflows/deploy.yml`
- Trigger branches: `main`, `deploy-6b79448`
- Build command: `npm ci` then `npm run build` in `sc-pharm-form`
- Current production API base build variable: `VITE_API_BASE_URL=https://sc-official-website.onrender.com`
- Current production API prefix build variable: `VITE_REACTNJOB_API_PREFIX=/api/reactnjob`
- Current notification endpoint build variables:
  - `VITE_LINE_NOTIFY_ENDPOINT=/notify/line/job-application`
  - `VITE_LINE_CV_NOTIFY_ENDPOINT=/line/notify`
- Workflow guard fails the Pages build if the production bundle still contains `reactnjobapplicweb.onrender.com`.

Local built frontend output was rebuilt with the shared backend settings. The new local bundle contains `sc-official-website.onrender.com` and `/api/reactnjob`, and does not contain `reactnjobapplicweb.onrender.com`.

Important migration implication:

- Moving backend routes to `/api/reactnjob` on the shared service is not enough by itself; the static frontend bundle must also be rebuilt and redeployed.
- The frontend now supports `VITE_REACTNJOB_API_PREFIX`, so local development can keep `/api` while production can use `/api/reactnjob`.

## Deployment Files

Detected deployment-related files:

- `.github/workflows/deploy.yml` for GitHub Pages frontend deployment.

Not detected:

- `render.yaml`
- `Dockerfile`
- `docker-compose*.yml`
- `Procfile`
- `vercel.json`
- `netlify.toml`

Render services appear to be configured through the Render Dashboard rather than repo-local Blueprint files.

Known service IDs from the migration request:

- Old standalone Render service: `srv-d5r06lnfte5s73c12pt0`
- Target shared Render service: `srv-d58idfm3jp1c73bhgv40`

No Render mutation should happen until the service identity confirmation gate is completed.

## Workers, Queues, Cron, Uploads, Webhooks

Detected:

- File uploads through `multer` memory storage.
- LINE webhook endpoint at `/api/line/webhook`.
- Outbound calls to LINE Messaging API.
- Outbound calls to Google Apps Script submission endpoint.
- Outbound SendGrid email sending.

Not detected:

- PostgreSQL/database workers.
- Queue libraries such as Bull/BullMQ/Agenda.
- Cron/scheduler libraries.
- WebSocket server libraries.
- OCR/AI/heavy background worker entry points.

## Security And Cybersecurity Notes

- The backend stores uploaded files in memory only, but accepts 10 MB and 15 MB upload paths. Shared-service integration must preserve or tighten these limits.
- LINE webhook signature verification is skipped when `LINE_CHANNEL_SECRET` is unset. In production, that should be treated as a security risk.
- Frontend `logPayloadDiagnostics` logs applicant PII such as name, email, phone, Line ID, education, and application details to the browser console. This is a privacy risk for production.
- CORS defaults include `https://akcd1998.github.io`. GitHub Pages origin must not include `/ReactNJobApplicWeb`.
- No rate limiting was found on public notification and application submission endpoints. This matters because SendGrid and LINE calls can create cost/spam risk.
- No `helmet`/security headers middleware was found in the source backend.
- No CSRF/cookie auth was found; routes are unauthenticated public form endpoints.
- Logs should continue masking LINE user IDs and must not include full Authorization headers, SendGrid keys, LINE tokens, or full uploaded content.
- The frontend contains a hardcoded Google Apps Script endpoint URL. It was not changed in this migration, but production should move external submission endpoints into environment configuration where practical.

## Target Shared Backend Observations

Target repo inspected:

```text
C:\Users\scgro\Desktop\Webapp training project\currentSC-official-website-project
```

Relevant target facts:

- Target backend root: `backend`
- Target entry point: `backend/server.js`
- Module system: CommonJS
- Framework: Express `^5.2.1`
- Existing mounted routes:
  - `/api/auth`
  - `/api/rx1011`
  - `/api/contact`
  - `/api/health`
  - `/health`
- Existing tests: `backend/tests/backend-integration.test.cjs`
- Existing shared service has SendGrid, CORS, PostgreSQL, JWT auth, and the prior Rx1011 module.

Target integration risks:

- Target `app.use(express.json())` runs before namespaced modules. ReactNJobApplicWeb's LINE webhook needs raw-body preservation for signature verification, so the new module cannot simply mount behind the existing global JSON parser without special handling.
- Target CORS is mounted only under `/api`, which is compatible with `/api/reactnjob`, but it allows all origins when `CORS_ORIGIN` is empty. Production should use an explicit allowlist.
- Target already calls `sgMail.setApiKey(process.env.SENDGRID_API_KEY)` for the shared website. ReactNJob should use only `REACTNJOB_SENDGRID_API_KEY` in the shared service so SendGrid credentials cannot collide across projects.
- Target has PostgreSQL and global `DATABASE_URL`; ReactNJobApplicWeb should not use it.
- Existing target auth/JWT should not be applied accidentally to public job application endpoints.

## Implemented Migration Shape In This Branch

Project slug: `reactnjob`

Namespace:

```text
/api/reactnjob
```

Target module:

```text
backend/src/modules/reactnjob/
  index.js
```

Route mapping:

| Old path | New shared path |
| --- | --- |
| `/health` | `/api/reactnjob/health` |
| `/api/line/webhook` | `/api/reactnjob/line/webhook` |
| `/api/notify/line/job-application` | `/api/reactnjob/notify/line/job-application` |
| `/api/line/notify` | `/api/reactnjob/line/notify` |
| `/api/apply/cv` | `/api/reactnjob/apply/cv` |
| `/api/submit-application` | `/api/reactnjob/submit-application` |
| `/api/resume` | `/api/reactnjob/resume` |

Do not decommission the old Render service until the deployed frontend bundle no longer references `reactnjobapplicweb.onrender.com`, the new namespaced routes pass smoke tests, CORS preflight passes from the GitHub Pages origin, and a fresh form/CV workflow is manually verified.
