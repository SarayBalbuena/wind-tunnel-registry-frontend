import { Route, Routes } from 'react-router-dom';
import { Layout } from '@components/Layout/Layout.tsx';
import { ProtectedRoute } from '@components/ProtectedRoute.tsx';
import { DashboardDataProvider } from '@/context/DashboardDataContext/DashboardContext.tsx';
import { Dashboard, Home, MagicLinkVerify } from './routes/lazyRoutes';

export const App = () => {
  return (
    <DashboardDataProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/auth/magic-link" element={<MagicLinkVerify />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Dashboard />} path="/dashboard" />
          </Route>
        </Route>
      </Routes>
    </DashboardDataProvider>
  );
};
