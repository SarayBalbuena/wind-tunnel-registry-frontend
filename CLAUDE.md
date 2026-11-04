# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**Wind Tunnel Logbook** — a React SPA for tracking wind-tunnel flight time (individual "1-on-1" and shared "Group" sessions). Users log in with Google (cookie session handled by the backend), then see a dashboard with time reports and a flight log they can create/edit/delete.

Backend API base URL comes from `VITE_API_URL` and is injected at build time as the global `API_URL` (see `vite.config.ts` → `define`, declared in `src/env.d.ts`).

## Commands

```bash
pnpm install         # install deps (pnpm only — packageManager is pinned)
pnpm dev             # vite dev server
pnpm build           # tsc -b && vite build  (type errors fail the build)
pnpm lint            # biome check .
pnpm lint:fix        # biome check --write .  (also organizes imports)
pnpm test            # vitest (watch mode locally)
pnpm test -- --run   # single run, as CI does
pnpm test -- --run src/components/Reports   # run a subset
```

CI (`.github/workflows/ci.yml`) runs **lint → build → test** on every PR to `main`. Run all three before declaring work done.

## Stack

React 19 (+ React Compiler via babel preset) · TypeScript strict · Vite 8 (rolldown) · Chakra UI v3 · CSS Modules · SWR · react-hook-form · react-router-dom v7 · Vitest + Testing Library + MSW · Biome · OpenTelemetry (web traces → Bluebox).

## Layout

```
src/
  components/     Feature components (PascalCase folders) + ui/ (Chakra-generated primitives, kebab-case)
  pages/          Route-level components, lazy-loaded via routes/lazyRoutes.ts
  context/        React contexts: Auth, DashboardData (server data), DashboardUI (reducer for modals)
  hooks/          One folder per hook: SWR queries/mutations, context accessors, form logic
  services/       API layer: <domain>Service/<domain>.service.ts + .types.ts; utils/apiFetch.ts
  tests/          testing.tsx (custom render), MSW server + handlers, mocks/, utils/
  instrumentation.ts  OTel setup — imported first in main.tsx
```

Deeper docs:
- `docs/architecture/` — data flow, state management, routing/auth, observability
- `docs/styleguide/` — code conventions, components, styling/theming, testing

## Key conventions (read the styleguide for details)

- **Named exports only**, arrow-function components: `export const Foo = () => {}`. No default exports (lazy routes use `lazyNamed`).
- **Component folder** = `Foo/Foo.tsx` + optional `Foo.types.ts`, `Foo.module.css`, `Foo.helpers.ts`, `Foo.styles.ts`, `Foo.test.tsx`.
- **Imports** use path aliases (`@components`, `@hooks`, `@services`, `@pages`, `@tests`, `@assets`, `@App`, `@/…`). Type imports use inline style: `import { type Foo } from '…'` (Biome-enforced). Let `pnpm lint:fix` order imports.
- **Data**: components never call `fetch`. Flow is `apiFetch` → `*.service.ts` → SWR hook in `hooks/` → (optionally) `DashboardDataContext` → component. SWR keys are exported constants (`ENTRIES_KEY`) and gated on `isAuthenticated`.
- **Mutations that change entries must also revalidate reports** (`mutateReports()`), as done in `DashboardDataContext`.
- **Styling**: CSS Modules for layout/visuals, Chakra props for Chakra components. Use `var(--chakra-colors-*)` tokens in CSS; dark mode via `:global(.dark) .cls`. Mobile breakpoint is `max-width: 480px`. Combine classes with `getClassNames`.
- **Context access** always through a hook that throws outside its provider (`useDashboardData`, `useDashboardUI`, `useAuth`).
- **Tests**: colocated `*.test.tsx`, render via `@tests/testing.tsx` (wraps all providers + MemoryRouter), HTTP mocked by MSW (`src/tests/mocks/handlers.ts`); override per-test with `mockFetchResponse`. `describe('when …')` / `it('should …')`.
- `src/components/ui/*` are Chakra snippet files — edit sparingly and keep their existing style (forwardRef, `'use client'`).

## Gotchas

- `API_URL` is a global constant, not `import.meta.env` — use it in services and MSW handlers.
- `DashboardDataProvider` is mounted twice (in `DashboardProviders` from `main.tsx` and again in `App.tsx`). Consumers get the inner one. Don't add a third; see `docs/architecture/state-management.md`.
- React Compiler is on: avoid manual `useMemo`/`useCallback` unless measured; never mutate props/state.
- OTel env vars (`VITE_OTEL_*`) are optional locally; `.env*` files are git-ignored — never commit secrets.
- Bluebox skills live in `.claude/skills/bluebox-*` and `production-query` — use them for production questions.

## Claude tooling in this repo

- Skills (`.claude/skills/`): `new-component`, `new-api-resource`, `new-page`, `testing`, `verify-code` (run before create/refactor and before every PR), `create-pull-request`, `consolidate-dependabot`, plus Bluebox skills.
- Hooks (`.claude/settings.json`): `PostToolUse` on `Edit|Write` runs `biome check --write` on the edited file (format, safe fixes, import order). It does not replace `verify-code` (build + tests).
- Agents (`.claude/agents/`): `feature-builder`, `test-writer`, `code-reviewer`, `ui-stylist`.

## Git

Never commit on `main` — use the `create-pull-request` skill. Branches: `<type>/<kebab-desc>`. Commits: Conventional Commits (`feat(entries): …`). PR titles: `[FEAT] - Description` (becomes the squash commit). PR body: `.github/pull_request_template.md`.
