# ReactNJobApplicWeb Backend Test Baseline

Generated: 2026-05-09

This document records the current backend smoke tests before and during migration into the shared `currentSC-official-website-project` service.

## Current Test Status

The backend now uses Node's built-in test runner. This avoids adding new dependencies and avoids refactoring `server.js` just to export an Express app.

Current backend scripts:

```text
npm run dev   -> nodemon server.js
npm start     -> node server.js
npm test      -> node --test tests/*.test.cjs
```

Current test file:

```text
backend/tests/backend-smoke.test.cjs
```

Because `backend/server.js` starts listening immediately and does not export the Express app, the tests start the server as a child process on a random local port.

## Safety Rules Used By Tests

- `NODE_ENV=test` is set for child server processes.
- External-service env vars are overridden with empty/test-only values.
- Tests do not send real SendGrid email.
- Tests do not call the real LINE Messaging API.
- Tests do not call the real Google Apps Script endpoint.
- Tests do not upload real applicant resumes or real PII.
- Tests use generated dummy payloads only.
- Tests do not read local `.env` values for assertions or fixtures.
- No database tests are included because the source backend has no database layer.

## Baseline Test Cases Added

| Area | Test | Expected baseline |
| --- | --- | --- |
| Startup | Spawn `node server.js` on a free local port | Server starts and logs listening message |
| Root | `GET /` | `200` text `OK` |
| Health | `GET /health` | `200` JSON `{ ok: true }` |
| LINE webhook no secret | `POST /api/line/webhook` with `{ events: [] }` and no `LINE_CHANNEL_SECRET` | `200` `{ ok: true }`; production risk documented |
| LINE webhook missing signature | `POST /api/line/webhook` with test `LINE_CHANNEL_SECRET` but no `x-line-signature` | `400` JSON error |
| Job notify missing token | `POST /api/notify/line/job-application` with minimal body and no LINE token | `200` JSON with `ok: false`, `skipped: true` |
| CV notify missing token | `POST /api/line/notify` with minimal body and no LINE token | `200` JSON with `ok: false`, `skipped: true` |
| CV upload missing file | `POST /api/apply/cv` with no file | `400` JSON `{ ok: false, error: "Missing CV file" }` |
| CV upload wrong file type | `POST /api/apply/cv` with non-PDF dummy file | `400` JSON `{ ok: false, error: "CV must be a PDF" }` |
| Submit application invalid payload | `POST /api/submit-application` with malformed `payload` JSON | `400` JSON `{ ok: false, error: "Invalid payload JSON" }` |
| Resume JSON missing SendGrid | `POST /api/resume` with no SendGrid key | `500` JSON missing SendGrid key |

## Routes Not Fully Covered Yet

The following should not be fully exercised until external services are mocked:

- Successful SendGrid email paths.
- Successful LINE Messaging API paths.
- Successful Google Apps Script forwarding.
- Real resume/CV attachment delivery.

Reason: those flows can trigger real third-party side effects, cost, spam, or leakage of applicant data.

## What Is Not Covered Yet

- Full browser form submission behavior.
- Live GitHub Pages deployed bundle verification.
- Render Dashboard settings.
- CORS preflight from production GitHub Pages origin.
- Real LINE webhook signature with production secret.
- SendGrid deliverability.
- Manual end-to-end applicant workflow.

## Commands Run

Source backend:

```powershell
npm --prefix backend test
```

Result:

```text
6 tests passed
```

Target backend after integration:

```powershell
npm --prefix backend test
```

Result in target repo:

```text
20 tests passed
```
