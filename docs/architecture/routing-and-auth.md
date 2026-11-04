# Routing & auth

## Routes — `src/App.tsx`

```tsx
<Routes>
  <Route element={<Layout />}>              // nav + EntryFormDialog + <Outlet/>
    <Route path="/" element={<Home />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<Dashboard />} />
    </Route>
  </Route>
</Routes>
```

## Lazy loading — `src/routes/lazyRoutes.ts`

Pages are named exports, so they're loaded with the `lazyNamed` helper:

```ts
export const Dashboard = lazyNamed(() => import('@pages/Dashboard/Dashboard.tsx'), 'Dashboard');
```

Every new page must be registered here and imported into `App.tsx` from `./routes/lazyRoutes`.

## Auth flow

1. `AuthProvider` calls `useCheckSession` → SWR `'user-session'` → `GET /auth/session` (cookie).
2. Exposes `{ name, isAuthenticated, loading }` via `useAuth()`.
3. Login: `LoginButton` → `loginWithGoogle()` sets `window.location.href = ${API_URL}/auth/google` (server-side OAuth redirect).
4. Logout: `useLogout` → `GET /auth/logout`; on success it optimistically sets `'user-session'` to `{ authenticated: false }` via global `mutate`, then navigates to `/`.
5. `ProtectedRoute` shows a spinner while `loading`, otherwise renders `<Outlet/>` or `<Navigate to="/" replace/>`.
6. All data hooks pass `null` as the SWR key when unauthenticated, so no protected requests fire.

To protect a new route, nest it under the existing `<Route element={<ProtectedRoute />}>`.
