# Observability

`src/instrumentation.ts` is the **first import** in `src/main.tsx` so that fetch/XHR are patched before any request.

- `WebTracerProvider` with `ZoneContextManager`, `BatchSpanProcessor`, `OTLPTraceExporter` (proto) → `${VITE_OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`.
- Auto-instrumentation: `FetchInstrumentation`, `XMLHttpRequestInstrumentation`.
- Service name: `VITE_OTEL_SERVICE_NAME`. Headers: `VITE_OTEL_EXPORTER_OTLP_HEADERS` (`k=v,k2=v2`).
- Env template: `.env.otel.bluebox-template`. Real `.env*` files are git-ignored.

Telemetry flows to **Bluebox**. For production questions (error rates, latency, failing endpoints) use the `production-query` skill; for issues with a `bluebox-task-id` marker use `bluebox-investigation-context`.

Guidelines:
- Don't create manual spans in components; if you need custom spans, add a small helper under `src/services/utils/` that uses `@opentelemetry/api`.
- Never log tokens, emails or note contents as span attributes.
