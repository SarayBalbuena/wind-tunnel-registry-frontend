---
name: testing
description: Write or fix tests in this repo with Vitest + Testing Library + MSW using the project's custom render (@tests/testing.tsx), MSW handlers and mockFetchResponse. Use when asked to "add tests", "write a test for X", "increase coverage", "fix failing test", or after creating a component/hook/service.
---

# Testing

Full conventions: `docs/styleguide/testing.md`. This skill is the procedure.

## 1. Identify the unit and its layer

| Layer | Test style | File |
| --- | --- | --- |
| Pure util / helper | plain function calls | `<file>.test.ts` next to it |
| Hook | `renderHook` from `@tests/testing.tsx` + `waitFor` | `hooks/useX/useX.test.ts(x)` |
| Component | `render` from `@tests/testing.tsx`, user-visible assertions | `<Name>.test.tsx` next to it |
| Routing / auth | `render(<App />, { route })` | `src/App.test.tsx` |

Read the unit's source and every hook/endpoint it touches before writing.

## 2. Make sure HTTP is mocked

1. Find the endpoint(s) the unit calls (`src/services/**`).
2. Check `src/tests/mocks/handlers.ts` has a default handler. If not, add:
   - fixture `src/tests/mocks/<domain>/<domain>Mock.ts` typed with the service response type, exported as `<DOMAIN>_MOCK`
   - handler `http.<method>(\`${API_URL}/path\`, () => HttpResponse.json(<DOMAIN>_MOCK, { status: 200 }))`
3. For per-test variations use `mockFetchResponse(\`${API_URL}/path\`, body, status, method)` — clone fixtures with `structuredClone` before editing.

Never `vi.mock` services or SWR. Never call real network.

## 3. Write the test

```tsx
import { <Unit> } from '@components/<Feature>/<Unit>.tsx';
import { fireEvent, within } from '@testing-library/react';
import { render, screen } from '@tests/testing.tsx';
import { mockFetchResponse } from '@tests/utils/mockFetchResponse.ts';
import { describe, expect, it } from 'vitest';

describe('<Unit>', () => {
  describe('when data loads', () => {
    it('should render …', async () => {
      render(<<Unit> />);
      expect(await screen.findByRole('heading', { name: /flight log/i })).toBeInTheDocument();
    });
  });

  describe('when the request fails', () => {
    it('should show an error', async () => {
      mockFetchResponse(`${API_URL}/entries`, { message: 'error' }, 500);
      render(<<Unit> />);
      expect(await screen.findByText(/error loading/i)).toBeInTheDocument();
    });
  });
});
```

Rules:
- `render`/`screen`/`renderHook` **must** come from `@tests/testing.tsx`.
- Async data → `findBy*`; absence → `queryBy*` + `.not.toBeInTheDocument()`.
- Query by role+name first, then label, text, and `data-testid` last.
- `describe('when …')` / `it('should …')`; `it.each` for tables.
- Scope with `within(container)`.
- Cover: happy path, error, empty, and each user interaction (click edit → dialog opens, confirm delete → request sent + list updates).
- Dialogs render in a portal — query from `screen`, not from the container.
- Unauthenticated scenario: `mockFetchResponse(\`${API_URL}/auth/session\`, { ...CHECK_SESSION_MOCK, authenticated: false })`.

## 4. Run

```bash
pnpm test -- --run <path-or-pattern>
```

If a test fails, read the error and fix the test or (if the test reveals a real bug) report it to the user before changing production code. Finish with `pnpm lint` and the full `pnpm test -- --run`. Report pass/fail counts honestly.
