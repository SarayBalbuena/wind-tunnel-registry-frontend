---
name: new-api-resource
description: Add a new backend endpoint/resource end-to-end in this repo - service function + types, SWR query or mutation hook with exported cache key, optional DashboardDataContext wiring, MSW handler + fixture, and tests. Use when asked to "call a new endpoint", "add an API", "fetch X from the backend", "add a mutation", or "new service".
---

# New API resource

Follows `docs/architecture/data-flow.md`. Layers: `apiFetch` → service → hook → (context) → component.

## 1. Gather the contract

Ask for / confirm: HTTP method, path, request body, response shape, whether it requires auth (default yes), and which existing data it invalidates (entries changes ⇒ reports must refresh).

## 2. Types — `src/services/<domain>Service/<domain>.service.types.ts`

```ts
export interface <Thing> { id: string; … }
export interface Create<Thing>Payload { … }
export type <Thing>sResponse = <Thing>[];
```
String-literal unions, no enums.

## 3. Service — `src/services/<domain>Service/<domain>.service.ts`

```ts
import { apiFetch } from '@services/utils/apiFetch';
import { type <Thing>sResponse } from './<domain>.service.types';

export const get<Thing>s = async (): Promise<<Thing>sResponse> => {
  return await apiFetch('/<path>');
};

export const create<Thing> = async (payload: Create<Thing>Payload): Promise<<Thing>> => {
  return await apiFetch('/<path>', { method: 'POST', body: JSON.stringify(payload) });
};
```
- Explicit return types. Map API → view model here (pure mapping in `utils/<domain>.utils.ts`).
- Never use `fetch` directly.

## 4. Hook — `src/hooks/use<Thing>s/use<Thing>s.ts`

Query:
```ts
export const <THING>S_KEY = '<kebab-key>';

export const use<Thing>s = () => {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, error, mutate } = useSWR(
    isAuthenticated ? <THING>S_KEY : null,
    get<Thing>s,
    { revalidateOnFocus: false, keepPreviousData: true },
  );
  return { <thing>s: data, isLoading, error, mutate<Thing>s: mutate };
};
```

Mutation (`src/hooks/useCreate<Thing>/useCreate<Thing>.ts`), same key as the query:
```ts
const { trigger, isMutating, error } = useSWRMutation(
  isAuthenticated ? <THING>S_KEY : null,
  async (_key, { arg }: { arg: Create<Thing>Payload }) => create<Thing>(arg),
);
return { create<Thing>: trigger, isCreating<Thing>: isMutating, create<Thing>Error: error };
```

## 5. Context wiring (only if dashboard-wide)

If the data is shown on the dashboard or the mutation must refresh other resources, add it to `DashboardDataContext.tsx` and `DashboardContext.types.ts`, wrapping mutations to call `mutateReports()` (or the relevant `mutate*`) afterwards. Otherwise consume the hook directly in the component.

## 6. Mocks

- Fixture: `src/tests/mocks/<domain>/<domain>Mock.ts` → `export const <DOMAIN>_MOCK: <Thing>sResponse = [...]`
- Default handler in `src/tests/mocks/handlers.ts` using `${API_URL}`.

## 7. Tests

Use the `testing` skill. Minimum:
- util/mapping unit tests
- hook test: returns data when authenticated; no request when unauthenticated
- mutation test: triggers the request and the list revalidates

## 8. Verify

```bash
pnpm lint:fix && pnpm lint && pnpm build && pnpm test -- --run
```
