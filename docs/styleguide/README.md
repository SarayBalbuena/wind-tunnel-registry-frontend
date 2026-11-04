# Styleguide

| Doc | Covers |
| --- | --- |
| [code-style.md](./code-style.md) | TypeScript, imports, naming, file layout |
| [components.md](./components.md) | Component structure, props, compound components, a11y |
| [styling.md](./styling.md) | CSS Modules, Chakra props, tokens, dark mode, responsive, visual language |
| [testing.md](./testing.md) | Vitest, Testing Library, MSW, conventions |

Tooling enforces a lot of this: **Biome** (`pnpm lint`) for formatting, lint rules and import order, and **TypeScript strict** (`pnpm build`). When in doubt, run `pnpm lint:fix` and follow existing code.
