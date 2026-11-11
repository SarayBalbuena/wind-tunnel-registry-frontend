import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  provider: vi.fn(),
  register: vi.fn(),
  exporter: vi.fn(),
  registerInstrumentations: vi.fn(),
  resource: vi.fn(),
  processor: vi.fn(),
}));

vi.mock('@opentelemetry/context-zone', () => ({
  ZoneContextManager: class {},
}));
vi.mock('@opentelemetry/exporter-trace-otlp-proto', () => ({
  OTLPTraceExporter: class {
    constructor(options: unknown) {
      mocks.exporter(options);
    }
  },
}));
vi.mock('@opentelemetry/instrumentation', () => ({
  registerInstrumentations: mocks.registerInstrumentations,
}));
vi.mock('@opentelemetry/instrumentation-fetch', () => ({
  FetchInstrumentation: class {},
}));
vi.mock('@opentelemetry/instrumentation-xml-http-request', () => ({
  XMLHttpRequestInstrumentation: class {},
}));
vi.mock('@opentelemetry/resources', () => ({
  resourceFromAttributes: (attributes: unknown) => {
    mocks.resource(attributes);
    return {};
  },
}));
vi.mock('@opentelemetry/sdk-trace-web', () => ({
  BatchSpanProcessor: class {
    constructor(exporter: unknown) {
      mocks.processor(exporter);
    }
  },
  WebTracerProvider: class {
    constructor(options: unknown) {
      mocks.provider(options);
    }
    register = mocks.register;
  },
}));

const loadInstrumentation = async () => {
  vi.resetModules();
  await import('./instrumentation');
};

describe('instrumentation', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.stubEnv('VITE_OTEL_SERVICE_NAME', 'test-service');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('when the endpoint is missing', () => {
    it('should warn and skip setup', async () => {
      vi.stubEnv('VITE_OTEL_EXPORTER_OTLP_ENDPOINT', '');
      vi.stubEnv('VITE_OTEL_EXPORTER_OTLP_HEADERS', 'Authorization=Bearer x');

      await loadInstrumentation();

      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('OpenTelemetry disabled'),
      );
      expect(mocks.provider).not.toHaveBeenCalled();
      expect(mocks.registerInstrumentations).not.toHaveBeenCalled();
    });
  });

  describe('when the headers are missing', () => {
    it('should warn and skip setup', async () => {
      vi.stubEnv('VITE_OTEL_EXPORTER_OTLP_ENDPOINT', 'https://otlp.test');
      vi.stubEnv('VITE_OTEL_EXPORTER_OTLP_HEADERS', '');

      await loadInstrumentation();

      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('OpenTelemetry disabled'),
      );
      expect(mocks.exporter).not.toHaveBeenCalled();
      expect(mocks.register).not.toHaveBeenCalled();
    });
  });

  describe('when endpoint and headers are set', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_OTEL_EXPORTER_OTLP_ENDPOINT', 'https://otlp.test');
      vi.stubEnv(
        'VITE_OTEL_EXPORTER_OTLP_HEADERS',
        '"Authorization=Api-Token a=b,X-Other=1"',
      );
    });

    it('should register the tracer and instrumentations without warning', async () => {
      await loadInstrumentation();

      expect(warn).not.toHaveBeenCalled();
      expect(mocks.register).toHaveBeenCalledTimes(1);
      expect(mocks.registerInstrumentations).toHaveBeenCalledTimes(1);
    });

    it('should export to the traces path with parsed headers', async () => {
      await loadInstrumentation();

      expect(mocks.exporter).toHaveBeenCalledWith({
        url: 'https://otlp.test/v1/traces',
        headers: { Authorization: 'Api-Token a=b', 'X-Other': '1' },
      });
    });

    it('should pass the batch span processor to the provider', async () => {
      await loadInstrumentation();

      expect(mocks.processor).toHaveBeenCalledTimes(1);
      expect(mocks.provider).toHaveBeenCalledWith(
        expect.objectContaining({
          spanProcessors: [expect.anything()],
        }),
      );
    });

    it('should set the service name on the resource', async () => {
      await loadInstrumentation();

      expect(mocks.resource).toHaveBeenCalledWith(
        expect.objectContaining({ 'service.name': 'test-service' }),
      );
    });
  });
});
