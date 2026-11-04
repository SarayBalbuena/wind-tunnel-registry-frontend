import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      API_URL: JSON.stringify(env.VITE_API_URL),
    },
    server: {
      open: true,
    },
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                test: /node_modules\/(react|react-dom)/,
                name: 'vendor-react',
              },
              {
                test: /node_modules\/(@chakra-ui|@emotion|framer-motion)/,
                name: 'vendor-ui',
              },
            ],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@tests': path.resolve(__dirname, './src/tests'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@services': path.resolve(__dirname, './src/services'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@App': path.resolve(__dirname, './src/App.tsx'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/tests/setup.ts', './src/tests/test-globals.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary', 'json'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/tests/**',
          'src/components/ui/**',
          'src/**/*.types.ts',
          'src/**/*.d.ts',
          'src/main.tsx',
          'src/instrumentation.ts',
        ],
      },
    },
  };
});
