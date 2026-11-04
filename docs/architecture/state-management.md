# State management

| Kind of state | Where it lives | Example |
| --- | --- | --- |
| Server data | SWR cache (via hooks) | entries, reports, session |
| Shared server data + side effects | `DashboardDataContext` | `createEntry` also revalidates reports |
| Shared UI state | `DashboardUIContext` (`useReducer`) | entry form modal open/mode/selected |
| Auth | `AuthContext` (wraps `useCheckSession`) | `isAuthenticated`, `name`, `loading` |
| Form state | `react-hook-form` inside a dedicated hook | `useEntryForm` |
| Local UI state | `useState` in the component | `entryToDelete` in `Entries` |

Prefer the lowest row that works. Don't put server data in `useState`.

## Provider tree

```
main.tsx
  BrowserRouter
    AuthProvider                  src/context/AuthContext
      Provider (Chakra + theme)   src/components/ui/provider.tsx
        DashboardProviders        src/context/DashboardProviders
          DashboardDataProvider
            DashboardUIProvider
              App
                DashboardDataProvider   ← second instance (App.tsx)
                  Routes …
```

> ⚠️ `DashboardDataProvider` is mounted twice. Because SWR dedupes by key the network cost is small, but it is redundant. If you touch this, remove the one in `App.tsx` and make sure `src/tests/testing.tsx` still wraps components correctly (it uses `DashboardProviders`).

`src/tests/testing.tsx` mirrors this tree (minus the router, which is a `MemoryRouter`), plus an isolated `SWRConfig` cache per test.

## Context pattern

Each context has:

```
context/<Name>Context/
  <Name>Context.tsx           createContext<T | undefined>(undefined) + Provider
  <Name>Context.types.ts      the context value type
  <Name>Context.reducer.ts    (optional) reducer, actions union, initial state
hooks/use<Name>/use<Name>.ts  accessor that throws outside the provider
```

```ts
export const useDashboardUI = (): DashboardUIContextType => {
  const context = useContext(DashboardUIContext);
  if (!context) throw new Error('useDashboardUI must be used within DashboardUIProvider');
  return context;
};
```

Never `useContext(SomeContext)` directly in a component — always use the accessor hook.

## UI reducer

`DashboardUIContext.reducer.ts` uses a discriminated-union action type:

```ts
export type DashboardUIAction =
  | { type: 'OPEN_CREATE_ENTRY' }
  | { type: 'OPEN_EDIT_ENTRY'; payload: Entry }
  | { type: 'CLOSE_ENTRY_FORM' };
```

Add new UI flows (e.g. a filters drawer) as new actions + state fields, and expose intent-named functions (`openCreateEntryModal`) from the provider rather than `dispatch`.

The entry form dialog is rendered once in `Layout` and driven entirely by this context, so any component can open it via `useDashboardUI()`.
