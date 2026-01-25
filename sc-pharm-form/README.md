# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Quick CV Upload (Apply Entry)

### Required backend env vars

- `SENDGRID_API_KEY`
- `HR_EMAIL` (or `HR_TO_EMAIL`)
- `FROM_EMAIL`
- `PORT` (optional, default `3003`)

### How to test

1. Create `backend/.env` with the required values above.
2. Start the API server: `node server.js` (from `ReactNJobApplicWeb/backend`).
3. Start the frontend: `npm install` then `npm run dev` (from `ReactNJobApplicWeb/sc-pharm-form`).
4. Visit `http://localhost:5173/apply` and try the Quick CV upload flow.
