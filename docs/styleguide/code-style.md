# Code style

## Formatting (Biome)

- 2-space indent, single quotes, trailing commas, semicolons.
- `pnpm lint:fix` formats and **organizes imports** in this group order:
  `react` → `react-dom/client` → `react-router-dom` → packages → aliases (`@…`) → relative paths → `*.css`.
- `biome-ignore` comments must give a real reason (no `<explanation>` placeholders).

## TypeScript

- `strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly` → no `enum`, no `namespace`, no parameter properties. Use string-literal unions: `type EntryType = 'INDIVIDUAL' | 'SHARED'`.
- Type-only imports use **inline** style (Biome `useImportType`):
  ```ts
  import { type Entry } from '@services/entriesService/entries.service.types.ts';
  import { createContext, type ReactNode } from 'react';
  ```
- `interface` for props and object shapes; `type` for unions, aliases and mapped types.
- No `any`. If unavoidable, add `// biome-ignore lint/suspicious/noExplicitAny: <reason>`.
- Explicit return types on service functions and context accessor hooks.
- Prefix intentionally unused params with `_` (`(_key, { arg }) => …`).

## Imports & aliases

| Alias | Path |
| --- | --- |
| `@components/*` | `src/components/*` |
| `@hooks/*` | `src/hooks/*` |
| `@services/*` | `src/services/*` |
| `@pages/*` | `src/pages/*` |
| `@tests/*` | `src/tests/*` |
| `@assets/*` | `src/assets/*` |
| `@App` | `src/App.tsx` |
| `@/*` | `src/*` (used for `@/context/...`) |

- Use aliases across features; relative `./` imports only for files in the same component folder (styles, types, helpers).
- Including the `.ts`/`.tsx` extension is allowed (`allowImportingTsExtensions`) and is the dominant style — be consistent within a file.

## Naming

| Thing | Convention | Example |
| --- | --- | --- |
| Component folder & file | PascalCase | `EntriesCard/EntriesCard.tsx` |
| Component sidecar files | `<Name>.types.ts`, `.module.css`, `.helpers.ts`, `.styles.ts`, `.test.tsx` | `EntryFormDialog.helpers.ts` |
| Hook | `useCamelCase` in its own folder | `hooks/useEntries/useEntries.ts` |
| Hook file extension | `.ts` (use `.tsx` only if it returns JSX) | |
| Service | `<domain>Service/<domain>.service.ts` | `entriesService/entries.service.ts` |
| Chakra UI snippets | kebab-case in `components/ui` | `confirm-dialog.tsx` |
| Constants | `SCREAMING_SNAKE_CASE` | `ENTRIES_KEY`, `ENTRY_FORM_ID`, `TYPE_CONFIG` |
| CSS module classes | camelCase | `.reportsCardLabel` |
| `data-testid` | kebab-case | `reports-card-total`, `dashboard-page` |
| Booleans | `is*` / `has*` | `isCreatingEntry`, `isEntryFormOpen` |
| Handlers | props `on*`, implementations `handle*` or intent verbs | `onDelete`, `handleSubmit`, `confirmDelete` |

## Functions & exports

- Arrow functions + **named exports** everywhere: `export const getEntries = async () => …`.
- No default exports (exception: config files).
- Keep pure logic out of components: put it in `<Name>.helpers.ts` or `services/**/utils`.

## User-facing copy

- English. Session types are shown as **"1-on-1"** (`INDIVIDUAL`) and **"Group"** (`SHARED`) — keep labels consistent across cards, badges and forms.
- Durations are rendered via `getTimeParts(minutes)` → `[{ value, unit: 'h' | 'min' }]`; don't format time by hand.
