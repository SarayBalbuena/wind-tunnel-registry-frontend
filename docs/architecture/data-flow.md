# Data flow

```
apiFetch  →  <domain>.service.ts  →  use<Thing> (SWR)  →  DashboardDataContext  →  component
 (HTTP)        (typed calls, mapping)   (cache, loading)     (aggregation, side effects)
```

## 1. `apiFetch` — `src/services/utils/apiFetch.ts`

- Prefixes `API_URL`, sends `credentials: 'include'` (cookie session) and JSON headers.
- Throws `Error('API error: <statusText>')` on non-2xx; returns `response.json()` otherwise.
- **Never call `fetch` directly elsewhere.** If you need new behaviour (e.g. 204 handling, typed errors), extend `apiFetch`.

> Known limitation: `DELETE` endpoints returning 204 with no body will make `response.json()` throw. Handle in `apiFetch` if the backend does that.

## 2. Services — `src/services/<domain>Service/`

```
entriesService/
  entries.service.ts        getEntries, createEntry, updateEntry, deleteEntry
  entries.service.types.ts  Entry, EntryType, CreateEntryPayload, UpdateEntryPayload, EntriesResponse
reportsService/
  reports.service.ts        getFlightDetails (fetch + map to cards)
  reports.service.types.ts
  utils/reports.utils.ts    getTimeParts, getMappedReportsData (pure, testable)
authService/
  auth.service.ts           checkSession, logout, login redirect
```

- Every function is `async` with an explicit return type.
- Response → view-model mapping happens in the service (see `getFlightDetails`), so hooks and components get ready-to-render data.
- Pure transformation helpers go in `utils/` next to the service.

## 3. SWR hooks — `src/hooks/use<Thing>/use<Thing>.ts`

**Queries**

Filters (`type`, `date`) live in the URL (`useEntriesFilters`, e.g. `?type=SHARED&date=2026-03-09`), are sent to the backend as query params and are part of the SWR key (`[ENTRIES_KEY, type, date]`):

```ts
export const ENTRIES_KEY = 'entries';
export const isEntriesKey = (key: unknown) =>
  Array.isArray(key) && key[0] === ENTRIES_KEY;

export const useEntries = (query: EntriesQuery = {}) => {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, error, mutate } = useSWR(
    isAuthenticated ? ([ENTRIES_KEY, query.type ?? '', query.date ?? ''] as const) : null, // gate on auth
    ([, type, date]) => getEntries({ type: type || undefined, date: date || undefined }),
    { revalidateOnFocus: false, keepPreviousData: true },
  );
  return { entries: data, isLoading, error, mutateEntries: mutate };
};
```

The same applies to `useFlightDetails(date)` (`[FLIGHT_DETAILS_KEY, date]`).

**Mutations** use `useSWRMutation` for the loading/error state. Because the query keys include the filters, `DashboardDataContext` revalidates every cached combination after each mutation with `useSWRConfig().mutate(isEntriesKey)` and `mutate(isFlightDetailsKey)`:

```ts
const { trigger, isMutating, error } = useSWRMutation(
  isAuthenticated ? ENTRIES_KEY : null,
  async (_key, { arg }: { arg: CreateEntryPayload }) => createEntryService(arg),
);
return { createEntry: trigger, isCreatingEntry: isMutating, createEntryError: error };
```

Backend filters available today: `GET /entries?type=INDIVIDUAL|SHARED&date=YYYY-MM-DD` and `GET /reports/total-by-type?date=YYYY-MM-DD` (exact values, no ranges). Search, sorting and month grouping are done on the client in `components/Entries/Entries.helpers.ts`.

Conventions:
- Export the cache key as a constant (`ENTRIES_KEY`, `FLIGHT_DETAILS_KEY`); never hardcode it twice.
- Rename SWR return values to domain names (`entries`, `isCreatingEntry`, `mutateReports`).
- Session key: `'user-session'` (in `useCheckSession`).

## 4. Cross-resource invalidation

Reports are derived from entries server-side. Any entry mutation must revalidate reports. That lives in `DashboardDataContext`:

```ts
const createEntry = async (payload) => {
  await createEntryMutation(payload);
  await mutateReports();
};
```

When adding a new mutation that affects other resources, wire the invalidation here (or in the hook), not in the component.

## 5. Components

Components read from `useDashboardData()` (dashboard data) or call a hook directly for isolated features. They handle three states explicitly, in this order:

1. loading → skeleton component (`EntriesSkeleton`, `ReportsLoading`)
2. error → error component/message
3. empty → empty state
4. data
