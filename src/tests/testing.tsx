import { type FC, type ReactElement, type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from '@components/ui/provider';
import {
  type RenderOptions,
  render as rtlRender,
  renderHook as rtlRenderHook,
} from '@testing-library/react';
import { SWRConfig } from 'swr';
import { AuthProvider } from '@/context/AuthContext/AuthContext.tsx';
import { DashboardProviders } from '@/context/DashboardProviders/DashboardProviders.tsx';

/**
 * Global wrapper with `SWRConfig` and Chakra UI `Provider` to disable caching in tests.
 */
const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
    <AuthProvider>
      <Provider>
        <DashboardProviders>{children}</DashboardProviders>
      </Provider>
    </AuthProvider>
  </SWRConfig>
);

/**
 * Renders a React component wrapped with `SWRConfig` and `MemoryRouter`.
 *
 * @param ui - The React component to render.
 * @param route - The initial route for the `MemoryRouter`.
 * @param path - The path for the route.
 * @param options - Additional options for the `render()` function.
 */
const render = (
  ui: ReactElement,
  {
    route = '/',
    path = '*',
    ...options
  }: RenderOptions & { route?: string; path?: string } = {},
) => {
  // The router sits outside the providers, like BrowserRouter in main.tsx,
  // because some providers read the URL.
  const RouterWrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>
      <Wrapper>{children}</Wrapper>
    </MemoryRouter>
  );

  return rtlRender(
    <Routes>
      <Route path={path} element={ui} />
    </Routes>,
    {
      wrapper: RouterWrapper,
      ...options,
    },
  );
};

/**
 * Renders a React hook wrapped with `SWRConfig` and a `MemoryRouter`.
 *
 * @param hook - The React hook to test.
 */
const renderHook = <T,>(
  hook: () => T,
  { route = '/' }: { route?: string } = {},
) => {
  const RouterWrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>
      <Wrapper>{children}</Wrapper>
    </MemoryRouter>
  );

  return rtlRenderHook(() => hook(), { wrapper: RouterWrapper });
};

export * from '@testing-library/react';
export { render, renderHook };
