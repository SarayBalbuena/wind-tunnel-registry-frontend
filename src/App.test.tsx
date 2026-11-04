import { fireEvent } from '@testing-library/react';
import { CHECK_SESSION_MOCK } from '@tests/mocks/checkSession/checkSessionMock.ts';
import { render, screen } from '@tests/testing.tsx';
import { mockFetchResponse } from '@tests/utils/mockFetchResponse.ts';
import { describe, expect, it } from 'vitest';
import { App } from '@App';

describe('App', () => {
  describe('when render by default', () => {
    it('should render home page by default', async () => {
      render(<App />);
      const homeTitle = await screen.findByText(
        /Track your wind tunnel flight time, add individual sessions, shared sessions and stay updated on your progress./i,
      );
      const dashboardPage = screen.queryByTestId('dashboard-page');
      const dashBoardButton = await screen.findByRole('button', {
        name: /Go to dashboard/i,
      });

      expect(homeTitle).toBeInTheDocument();
      expect(dashBoardButton).toBeInTheDocument();
      expect(dashboardPage).not.toBeInTheDocument();
    });
  });
  describe('when navigate to dashboard', async () => {
    describe('when is an authorized user', () => {
      it('should navigate to dashboard', async () => {
        render(<App />, { route: '/dashboard' });

        const dashboardPage = await screen.findByTestId('dashboard-page');
        expect(dashboardPage).toBeInTheDocument();
      });
    });
    describe('when is not an authorized user', () => {
      it('should not navigate to dashboard', async () => {
        const modifiedResponse = structuredClone(CHECK_SESSION_MOCK);
        modifiedResponse.authenticated = false;
        mockFetchResponse(`${API_URL}/auth/session`, modifiedResponse);

        render(<App />, { route: '/dashboard' });

        const dashboardPage = screen.queryByTestId('dashboard-page');
        expect(dashboardPage).not.toBeInTheDocument();
      });
    });
  });
  describe('when login', () => {
    it('should authenticate user', async () => {
      const modifiedResponse = structuredClone(CHECK_SESSION_MOCK);
      modifiedResponse.authenticated = false;
      mockFetchResponse(`${API_URL}/auth/session`, modifiedResponse, 401);
      const originalLocation = window.location;

      Object.defineProperty(window, 'location', {
        configurable: true,
        value: {
          ...originalLocation,
          href: '',
        },
      });

      render(<App />);

      const loginButton = await screen.findByRole('button', {
        name: /Continue with Google/i,
      });

      fireEvent.click(loginButton);

      expect(window.location.href).toBe(`${API_URL}/auth/google`);
    });
  });
});
