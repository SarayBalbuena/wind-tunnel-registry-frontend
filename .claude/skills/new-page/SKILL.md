---
name: new-page
description: Add a new route/page to this repo - page component in src/pages, lazy registration via lazyNamed in routes/lazyRoutes.ts, route in App.tsx (public or under ProtectedRoute), optional nav link, and a routing test. Use when asked to "add a page", "new route", "new screen", or "/new-page <Name>".
---

# New page

See `docs/architecture/routing-and-auth.md`.

## Steps

1. **Page component** `src/pages/<Name>/<Name>.tsx` (+ `<Name>.module.css` if needed). Pages compose feature components only — no data fetching or business logic.
   ```tsx
   export const <Name> = () => (
     <div data-testid="<kebab-name>-page">
       {/* feature components */}
     </div>
   );
   ```
   Build new feature pieces with the `new-component` skill.

2. **Lazy route** in `src/routes/lazyRoutes.ts`:
   ```ts
   export const <Name> = lazyNamed(() => import('@pages/<Name>/<Name>.tsx'), '<Name>');
   ```

3. **Route** in `src/App.tsx`, inside `<Route element={<Layout />}>`:
   - public: `<Route path="/<path>" element={<<Name> />} />`
   - authenticated: nest inside the existing `<Route element={<ProtectedRoute />}>`.
   Import from `./routes/lazyRoutes`.

4. **Navigation** (optional): add a link in `Layout.tsx` or `UserMenu/MenuActions` using `ChakraLink asChild` + `RouterLink`.

5. **Test** in `src/App.test.tsx`:
   - authenticated user reaching `/<path>` sees `<kebab-name>-page` (`findByTestId`)
   - if protected: unauthenticated user does not (override `/auth/session` with `authenticated: false`)

6. **Verify**: `pnpm lint:fix && pnpm lint && pnpm build && pnpm test -- --run`.
