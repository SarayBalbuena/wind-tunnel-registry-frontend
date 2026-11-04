# Testing

Stack: **Vitest** (jsdom, globals) · **@testing-library/react** · **jest-dom** · **MSW** (node server).

```bash
pnpm test                 # watch
pnpm test -- --run        # CI mode
pnpm test -- --run Reports
pnpm test:ui              # Vitest UI
pnpm test -- --run --coverage
```

## Setup files

| File | Role |
| --- | --- |
| `src/tests/setup.ts` | jest-dom, `server.listen()` / `resetHandlers()` / `close()` |
| `src/tests/test-globals.ts` | `window.matchMedia` mock (needed by Chakra/next-themes) |
| `src/tests/testing.tsx` | custom `render` / `renderHook` with all providers, isolated SWR cache, `MemoryRouter` |
| `src/tests/mocks/server.ts` | `setupServer(...handlers)` |
| `src/tests/mocks/handlers.ts` | default happy-path handlers for every endpoint |
| `src/tests/mocks/<domain>/<domain>Mock.ts` | typed fixtures (`ENTRIES_MOCK`, `REPORTS_MOCK`) |
| `src/tests/utils/mockFetchResponse.ts` | per-test override: `mockFetchResponse(url, body, status?, method?)` |

## Rules

1. **Always import `render`/`screen` from `@tests/testing.tsx`**, never directly from `@testing-library/react` (that would skip providers). `within`, `fireEvent`, `waitFor` may come from either.
2. **Mock HTTP with MSW, not `vi.mock` of services.** Default data comes from `handlers.ts`; override with `mockFetchResponse` inside the test. Handlers reset after each test.
3. Every new endpoint gets a default handler + typed fixture.
4. Clone fixtures before mutating: `const res = structuredClone(CHECK_SESSION_MOCK); res.authenticated = false;`.
5. Use `await screen.findBy…` for anything that depends on data (SWR is async). Use `queryBy…` + `.not.toBeInTheDocument()` for absence.
6. Query priority: `getByRole` (with `name`) → `getByLabelText` → `getByText` → `getByTestId`. Use `data-testid` for structural containers (`dashboard-page`, `reports-card-total`).
7. Scope assertions to a container with `within(card)`.
8. Test behaviour users see, not implementation (no asserting on state, class names or hook internals).

## Structure

```tsx
import { Entries } from '@components/Entries/Entries.tsx';
import { ENTRIES_MOCK } from '@tests/mocks/entries/entriesMock.ts';
import { render, screen } from '@tests/testing.tsx';
import { mockFetchResponse } from '@tests/utils/mockFetchResponse.ts';
import { describe, expect, it } from 'vitest';

describe('Entries', () => {
  describe('when entries load successfully', () => {
    it('should render one card per entry', async () => {
      render(<Entries />);
      expect(await screen.findAllByRole('button', { name: /edit flight/i })).toHaveLength(
        ENTRIES_MOCK.length,
      );
    });
  });

  describe('when the API fails', () => {
    it('should show an error message', async () => {
      mockFetchResponse(`${API_URL}/entries`, { message: 'boom' }, 500);
      render(<Entries />);
      expect(await screen.findByText(/error loading entries/i)).toBeInTheDocument();
    });
  });
});
```

- `describe('<Unit>')` → `describe('when <condition>')` → `it('should <outcome>')`.
- Use `it.each([...])('should … $field', …)` for table-driven cases (see `Reports.test.tsx`).
- Routes: `render(<App />, { route: '/dashboard' })`.
- Hooks: `renderHook(() => useEntries())` from `@tests/testing.tsx`, then `await waitFor(() => expect(result.current.entries).toBeDefined())`.
- Pure utils (`reports.utils.ts`, `*.helpers.ts`): plain unit tests, no render.

## What to test per layer

| Layer | Test |
| --- | --- |
| Pure utils / helpers | inputs → outputs, edge cases (0 minutes, exact hours) |
| Hooks | data mapping, auth gating (no request when unauthenticated), mutation triggers revalidation |
| Components | loading → data, error, empty, user interactions (open dialog, submit, delete confirm) |
| App | routing + auth redirect |

## Mutations

For POST/PATCH/DELETE add a handler override with the method arg and assert the UI updates:

```ts
mockFetchResponse(`${API_URL}/entries/1`, {}, 200, 'delete');
```

If you need to assert the request body, use `server.use(http.post(url, async ({ request }) => { body = await request.json(); return HttpResponse.json(...); }))`.
