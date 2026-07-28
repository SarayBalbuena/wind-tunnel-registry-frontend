import './instrumentation';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from '@components/ui/provider';
import { DashboardProviders } from '@/context/DashboardProviders/DashboardProviders.tsx';
import { AuthProvider } from './context/AuthContext/AuthContext.tsx';
import { App } from '@App';

// biome-ignore lint/style/noNonNullAssertion: Necessary for mounting React
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Provider>
          <DashboardProviders>
            <App />
          </DashboardProviders>
        </Provider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
