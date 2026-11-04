# Architecture

Overview of how the Wind Tunnel Logbook frontend is put together.

| Doc | Covers |
| --- | --- |
| [data-flow.md](./data-flow.md) | API client, services, SWR hooks, cache keys, mutations |
| [state-management.md](./state-management.md) | Contexts, provider tree, UI reducer |
| [routing-and-auth.md](./routing-and-auth.md) | Routes, lazy loading, session check, protected routes |
| [observability.md](./observability.md) | OpenTelemetry setup and Bluebox |

## High-level picture

```
                ┌──────────────────────────── Browser ─────────────────────────────┐
                │                                                                  │
  main.tsx ──►  │ instrumentation.ts (OTel fetch/XHR spans)                        │
                │ BrowserRouter                                                    │
                │  └ AuthProvider ── useCheckSession ── GET /auth/session          │
                │     └ Chakra Provider (+ next-themes color mode)                 │
                │        └ DashboardProviders (Data + UI)                          │
                │           └ App → Routes → Layout(nav, EntryFormDialog, Outlet)  │
                │                     ├ /           Home (public)                  │
                │                     └ /dashboard  ProtectedRoute → Dashboard     │
                │                                     ├ Reports                    │
                │                                     └ Entries                    │
                └──────────────────────────────────────────────────────────────────┘
                                          │  fetch (credentials: 'include')
                                          ▼
                                   Backend API (API_URL)
                         /auth/*  /entries  /reports/total-by-type
```

## Layers

| Layer | Folder | Responsibility | May import from |
| --- | --- | --- | --- |
| Pages | `src/pages` | Route-level composition, no logic | components, hooks |
| Components | `src/components` | Presentation + local UI state | hooks, services/*.types, services/utils, ui |
| UI primitives | `src/components/ui` | Chakra snippet wrappers (dialogs, menu, toaster, color mode) | `@chakra-ui/react` |
| Contexts | `src/context` | Shared state, aggregates hooks | hooks, services types |
| Hooks | `src/hooks` | SWR queries/mutations, context accessors, form logic | services, context |
| Services | `src/services` | HTTP calls, response mapping, pure utils | `services/utils` only |
| Tests | `src/tests` | Render helpers, MSW server/handlers, mocks | anything |

Rule of thumb: dependencies point **downwards** (pages → components → hooks → services). Services never import React.

## Build

- Vite 8 with rolldown; manual chunk groups `vendor-react` and `vendor-ui` (`vite.config.ts`).
- React Compiler runs via `@rolldown/plugin-babel` + `reactCompilerPreset`.
- `pnpm build` runs `tsc -b` first — type errors fail the build and CI.

## Decision records

Add new architecture decisions as `docs/architecture/adr/NNNN-title.md` (context → decision → consequences).
