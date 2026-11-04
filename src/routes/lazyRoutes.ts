import { type ComponentType, lazy } from 'react';

/**
 * Helper to handle lazy loading of named exports
 * @param importFn - The dynamic import function: () => import('...')
 * @param name - The name of the exported component
 */
// biome-ignore lint/suspicious/noExplicitAny: T must be any to allow index access of unknown modules
export const lazyNamed = <T extends Record<string, any>>(
  importFn: () => Promise<T>,
  name: keyof T,
) => {
  return lazy(async () => {
    const module = await importFn();
    return { default: module[name] as ComponentType };
  });
};

// Defined routes with lazy loading
export const Dashboard = lazyNamed(
  () => import('@pages/Dashboard/Dashboard.tsx'),
  'Dashboard',
);
export const Home = lazyNamed(() => import('@pages/Home/Home.tsx'), 'Home');
export const MagicLinkVerify = lazyNamed(
  () => import('@pages/MagicLinkVerify/MagicLinkVerify.tsx'),
  'MagicLinkVerify',
);
