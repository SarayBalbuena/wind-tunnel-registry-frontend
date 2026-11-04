import { CHECK_SESSION_MOCK } from '@tests/mocks/checkSession/checkSessionMock.ts';
import { render, screen } from '@tests/testing.tsx';
import { mockFetchResponse } from '@tests/utils/mockFetchResponse.ts';
import { describe, expect, it } from 'vitest';
import { Home } from './Home.tsx';

describe('Home', () => {
  describe('when the user is authenticated', () => {
    it('should show the dashboard button and the totals', async () => {
      render(<Home />);

      expect(
        await screen.findByRole('button', { name: /Go to dashboard/i }),
      ).toBeInTheDocument();
      expect(await screen.findByTestId('home-totals')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Continue with Google/i }),
      ).not.toBeInTheDocument();
    });

    it('should show the new entry button', async () => {
      render(<Home />);

      expect(
        await screen.findByRole('button', { name: /New entry/i }),
      ).toBeInTheDocument();
    });
  });

  describe('when the user is not authenticated', () => {
    it('should show the login button and no totals', async () => {
      const unauthenticated = structuredClone(CHECK_SESSION_MOCK);
      unauthenticated.authenticated = false;
      mockFetchResponse(`${API_URL}/auth/session`, unauthenticated, 401);

      render(<Home />);

      expect(
        await screen.findByRole('button', { name: /Continue with Google/i }),
      ).toBeInTheDocument();
      expect(screen.queryByTestId('home-totals')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Go to dashboard/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('when rendered', () => {
    it('should show the headline, the features and the steps', async () => {
      render(<Home />);

      expect(
        await screen.findByRole('heading', { level: 1 }),
      ).toHaveTextContent(/Every minute in the tunnel, logged\./i);
      expect(
        screen.getByRole('heading', { name: /Log sessions/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /How it works/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Watch it grow/i)).toBeInTheDocument();
    });
  });
});
