/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_OTEL_SERVICE_NAME: string;
  readonly VITE_OTEL_EXPORTER_OTLP_ENDPOINT: string;
  readonly VITE_OTEL_EXPORTER_OTLP_HEADERS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const API_URL: string;
declare const VCS_REPOSITORY_URL: string;
declare const VCS_REVISION: string;
