# Wind Tunnel Logbook 🪂

This project is the frontend for the **Wind Tunnel Logbook**, an app for tracking wind tunnel flight time. It logs **1-on-1** and shared **Group** sessions, shows progress in reports and charts, and lets you manage a flight log.

**Live app:** https://wind-tunnel-registry-frontend.vercel.app/

## Features

- **Home Page:** Hero, live totals, feature tiles and a "How it works" section, with light and dark mode.
- **Google Authentication:** Login with Google. The backend manages the cookie session.
- **Protected Dashboard:** Only for authenticated users, with routes guarded by `ProtectedRoute`.
- **Time Reports:** Totals and "this month" trends for 1-on-1 and Group time.
- **Monthly Hours Chart:** A stacked chart of the last 12 months, built with SVG and no chart library.
- **Flight Log:**
  - Create, edit and delete entries.
  - Entries are grouped by month, with subtotals.
  - Filter by type and date, search notes, and sort. Filters are kept in the URL.
  - Delete with an **Undo** toast.
- **Faster Logging:** The form opens with today's date, 15 minutes and the last used type. Save with `Ctrl/Cmd + Enter`.
- **Keyboard Shortcuts:** `N` opens a new entry and `/` focuses search. Key hints are shown in the UI.
- **Responsive Design:** Chakra UI v3 and CSS Modules, with a mobile breakpoint at 480px.

## Technologies Used

- **React 19** with **TypeScript** (strict) and the React Compiler
- **Vite** as build tool
- **Chakra UI v3** for UI components
- **React Router DOM** for navigation
- **CSS Modules** for component-specific styles
- **SWR** for remote data state, and **react-hook-form** for forms
- **Vitest**, **Testing Library** and **MSW** for tests
- **Biome** for linting and formatting
- **OpenTelemetry** for web traces (optional)

## Project Structure

```
src/
  components/     Feature components (PascalCase folders) + ui/ (Chakra primitives)
  pages/          Route-level components, lazy-loaded
  context/        Auth, DashboardData (server data) and DashboardUI (modal state)
  hooks/          SWR queries and mutations, context accessors, form logic
  services/       API layer: one folder per domain, plus apiFetch
  tests/          Custom render, MSW server and handlers, mocks
  instrumentation.ts  OpenTelemetry setup
docs/
  architecture/   Data flow, state management, routing and auth, observability, deployment
  styleguide/     Code style, components, styling, testing
```

See [`docs/architecture`](docs/architecture) and [`docs/styleguide`](docs/styleguide) for details.

## Environment Configuration

For local development, create a `.env.development` file in the project root:

```env
VITE_API_URL=https://substantial-rosalynd-blue-code-1a304522.koyeb.app
```

`VITE_API_URL` is the backend base URL. It is injected at build time as the global `API_URL`.

The `VITE_OTEL_*` variables (`VITE_OTEL_SERVICE_NAME`, `VITE_OTEL_EXPORTER_OTLP_ENDPOINT`, `VITE_OTEL_EXPORTER_OTLP_HEADERS`) are optional. Leave them out to disable tracing locally.

Env files are git-ignored. Never commit secrets.

## Quick Start Guide

### Prerequisites

- [Node.js](https://nodejs.org/) (the version the project uses is in `package.json`)
- [pnpm](https://pnpm.io/) 10 (pinned via `packageManager`)

### Installation

```bash
pnpm install
```

### Development

To start the development server:

```bash
pnpm dev
```

### Build

To type-check and generate the production build:

```bash
pnpm build
```

### Other Scripts

- `pnpm lint`: Runs the linter and format check (Biome).
- `pnpm lint:fix`: Applies safe fixes, formats, and organizes imports.
- `pnpm format`: Formats the code.
- `pnpm test`: Runs unit tests in watch mode (Vitest). Use `pnpm test -- --run` for a single run.
- `pnpm test:ui`: Opens the Vitest UI.
- `pnpm typegen`: Regenerates Chakra typings from `src/theme.ts`.

## Deployment

The app is a static Vite build hosted on Vercel. `vercel.json` proxies `/api/*` to the backend, so the session cookie stays first-party, and rewrites other paths to `index.html`. See [`docs/architecture/deployment.md`](docs/architecture/deployment.md) for the required settings.

## Contributing

- Run `pnpm lint`, `pnpm build` and `pnpm test -- --run` before opening a PR. CI runs the same checks.
- Use Conventional Commits for commit messages, for example `feat(entries): ...`.
- Follow the [styleguide](docs/styleguide/README.md).
