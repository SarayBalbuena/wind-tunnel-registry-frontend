---
name: verify-code
description: Verify code quality in this repo - Biome lint/format, import rules (aliases, inline type imports, ordering, unused/missing), TypeScript build and tests. Run BEFORE creating or refactoring code (baseline), AFTER editing, and ALWAYS before committing or opening a pull request. Use when asked to "verify", "check the code", "validate imports", "run biome", or as a gate inside create-pull-request, new-component, new-page, new-api-resource and refactors.
---

# Verify code

Gate for every code change. Never declare work done, commit, or open a PR without a green run.

## When to run

1. **Before** creating or refactoring: run the baseline (step 1) so existing failures are known and not blamed on your change.
2. **After** editing: run the full procedure.
3. **Before every commit / PR** (the `create-pull-request` skill must invoke this first).

## 1. Baseline / quick check

```bash
git status --short
pnpm lint
```

If the baseline already fails, report it to the user before changing anything.

## 2. Biome (lint + format + organize imports)

```bash
pnpm lint:fix   # biome check --write . : formats, fixes, orders imports
pnpm lint       # must finish with 0 errors
```

- Warnings: fix those in files you touched; report pre-existing ones, don't hide them.
- Never silence rules with `biome-ignore` unless the user agrees; explain why if you must.
- Review `git diff` after `lint:fix` to make sure it only touched intended files.

## 3. Imports checklist (check by reading the changed files)

- Use path aliases (`@components`, `@hooks`, `@services`, `@pages`, `@tests`, `@assets`, `@App`, `@/…`) instead of long `../../..` paths across folders.
- Type imports are inline: `import { type Foo } from '…'` (never `import type`).
- Order is enforced by Biome: react → react-dom/client → react-router-dom → packages → aliases → relative → `*.css`. Let `lint:fix` order it.
- No unused, duplicate or missing imports; no imports of deleted/renamed files.
- Named exports only, no default exports (except config files). Lazy routes use `lazyNamed`.
- Components never import `fetch`/`apiFetch` directly; they go through hooks (`apiFetch` → service → SWR hook).
- After renaming/moving files, grep for stale references:
  ```bash
  grep -rn "<OldName>" src docs .claude
  ```

## 4. Types and build

```bash
pnpm build   # tsc -b && vite build; type errors fail it
```

## 5. Tests

```bash
pnpm test -- --run
```

Add or update colocated tests for changed behaviour (see the `testing` skill).

## 6. Report

State exactly what ran and the results, e.g.:

- `pnpm lint` ✅ / ❌ (errors, warnings)
- imports checklist ✅ / issues fixed
- `pnpm build` ✅ / ❌
- `pnpm test -- --run` ✅ (N tests) / ❌

Never mark a step ✅ that was skipped or failed. If something fails and isn't caused by your change, stop and show the output.
