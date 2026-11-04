import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const FONT_STACK =
  "'Inter Variable', Inter, ui-sans-serif, system-ui, sans-serif";

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: FONT_STACK },
        body: { value: FONT_STACK },
      },
      radii: {
        card: { value: '14px' },
      },
    },
    semanticTokens: {
      colors: {
        surface: {
          page: { value: { _light: '{colors.gray.50}', _dark: '#0b0d12' } },
          card: { value: { _light: '{colors.white}', _dark: '#13161d' } },
          border: {
            value: {
              _light: 'rgba(15, 23, 42, 0.08)',
              _dark: 'rgba(255, 255, 255, 0.08)',
            },
          },
        },
        // Session types: individual (blue), shared (purple), total (teal)
        session: {
          individual: {
            fg: {
              value: {
                _light: '{colors.blue.700}',
                _dark: '{colors.blue.300}',
              },
            },
            accent: {
              value: {
                _light: '{colors.blue.500}',
                _dark: '{colors.blue.400}',
              },
            },
            subtle: {
              value: {
                _light: 'rgba(59, 130, 246, 0.10)',
                _dark: 'rgba(96, 165, 250, 0.14)',
              },
            },
          },
          shared: {
            fg: {
              value: {
                _light: '{colors.purple.700}',
                _dark: '{colors.purple.300}',
              },
            },
            accent: {
              value: {
                _light: '{colors.purple.500}',
                _dark: '{colors.purple.400}',
              },
            },
            subtle: {
              value: {
                _light: 'rgba(168, 85, 247, 0.10)',
                _dark: 'rgba(192, 132, 252, 0.14)',
              },
            },
          },
          total: {
            fg: {
              value: {
                _light: '{colors.teal.700}',
                _dark: '{colors.teal.300}',
              },
            },
            accent: {
              value: {
                _light: '{colors.teal.500}',
                _dark: '{colors.teal.400}',
              },
            },
          },
        },
      },
      shadows: {
        card: {
          value: {
            _light:
              '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.05)',
            _dark: '0 1px 2px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },
  },
  globalCss: {
    body: {
      bg: 'surface.page',
      letterSpacing: '-0.011em',
    },
    'h1, h2, h3': { letterSpacing: '-0.02em' },
  },
});

export const system = createSystem(defaultConfig, config);
