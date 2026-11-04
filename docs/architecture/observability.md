# Observability

`src/instrumentation.ts` is the **first import** in `src/main.tsx` so that fetch/XHR are patched before any request.

- `WebTracerProvider` with `ZoneContextManager`, `BatchSpanProcessor`, `OTLPTraceExporter` (proto) → `${VITE_OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`.
- Auto-instrumentation: `FetchInstrumentation`, `XMLHttpRequestInstrumentation`.
- Service name: `VITE_OTEL_SERVICE_NAME`. Headers: `VITE_OTEL_EXPORTER_OTLP_HEADERS` (`k=v,k2=v2`).
- Env template: `.env.otel.bluebox-template`. Real `.env*` files are git-ignored.
- **Opt-in:** if `VITE_OTEL_EXPORTER_OTLP_ENDPOINT` or `VITE_OTEL_EXPORTER_OTLP_HEADERS` is unset, setup is skipped with a `console.warn` (no exports, no 401s). Only `VITE_`-prefixed vars reach the browser; unprefixed `OTEL_*` names are ignored by the app.
- **VCS attributes:** spans carry `vcs.repository.url.full` (normalized https remote, no credentials or `.git`) and `vcs.ref.head.revision` (`git rev-parse HEAD`). `vite.config.ts` resolves them from git when the dev server starts or the app is built and injects them as the `VCS_REPOSITORY_URL` / `VCS_REVISION` constants (declared in `src/env.d.ts`). They are omitted if git info is unavailable, so CI builds need the `.git` directory, and local values refresh only on restart or rebuild.
- **Security:** `VITE_*` values are inlined into the browser bundle, so the OTLP token is readable by anyone loading the app. Use an ingest-only token, or move export behind a collector/proxy that adds the token server-side.

Telemetry flows to **Bluebox**. For production questions (error rates, latency, failing endpoints) use the `production-query` skill; for issues with a `bluebox-task-id` marker use `bluebox-investigation-context`.

Guidelines:
- Don't create manual spans in components; if you need custom spans, add a small helper under `src/services/utils/` that uses `@opentelemetry/api`.
- Never log tokens, emails or note contents as span attributes.
