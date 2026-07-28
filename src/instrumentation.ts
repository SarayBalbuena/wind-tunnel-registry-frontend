import { ZoneContextManager } from '@opentelemetry/context-zone';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { Resource } from '@opentelemetry/resources';
import {
  BatchSpanProcessor,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const serviceName = import.meta.env.VITE_OTEL_SERVICE_NAME;
const endpoint = import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT;
const headers = import.meta.env.VITE_OTEL_EXPORTER_OTLP_HEADERS;

const resource = new Resource({
  [ATTR_SERVICE_NAME]: serviceName,
});

const provider = new WebTracerProvider({
  resource,
});

const exporter = new OTLPTraceExporter({
  url: `${endpoint}/v1/traces`,
  headers: headers
    ? Object.fromEntries(
        headers
          .replace(/^"|"$/g, '')
          .split(',')
          .map((h) => {
            const [key, ...value] = h.split('=');
            return [key, value.join('=')];
          }),
      )
    : {},
});

provider.addSpanProcessor(new BatchSpanProcessor(exporter));

provider.register({
  contextManager: new ZoneContextManager(),
});

registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation(),
    new XMLHttpRequestInstrumentation(),
  ],
});

console.log('OpenTelemetry initialized');
