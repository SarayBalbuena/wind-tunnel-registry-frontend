import { fireEvent, render, screen } from '@tests/testing.tsx';
import { mockFetchResponse } from '@tests/utils/mockFetchResponse.ts';
import { describe, expect, it } from 'vitest';
import { App } from '@App';

describe('MagicLinkConfirm', () => {
  describe('when the page opens with a token', () => {
    it('should not log in until the button is clicked', async () => {
      let verifyCalls = 0;
      const { server } = await import('@tests/mocks/server.ts');
      const { http, HttpResponse } = await import('msw');
      server.use(
        http.post(`${API_URL}/auth/magic-link/verify`, () => {
          verifyCalls += 1;
          return HttpResponse.json({ name: 'Pilot', authenticated: true });
        }),
      );

      render(<App />, { route: '/auth/magic-link?token=abc' });

      expect(
        await screen.findByRole('button', { name: /Continue to log in/i }),
      ).toBeInTheDocument();
      expect(verifyCalls).toBe(0);
    });

    it('should go to the dashboard after a successful verify', async () => {
      render(<App />, { route: '/auth/magic-link?token=abc' });

      fireEvent.click(
        await screen.findByRole('button', { name: /Continue to log in/i }),
      );

      expect(await screen.findByTestId('dashboard-page')).toBeInTheDocument();
    });
  });

  describe('when the token is rejected', () => {
    it('should show the invalid link message', async () => {
      mockFetchResponse(
        `${API_URL}/auth/magic-link/verify`,
        { error: 'invalid' },
        401,
        'post',
      );
      render(<App />, { route: '/auth/magic-link?token=used' });

      fireEvent.click(
        await screen.findByRole('button', { name: /Continue to log in/i }),
      );

      expect(await screen.findByRole('alert')).toHaveTextContent(
        /invalid, expired or already used/i,
      );
      expect(
        screen.getByRole('link', { name: /Request a new link/i }),
      ).toBeInTheDocument();
    });
  });

  describe('when there is no token', () => {
    it('should show the invalid link message', async () => {
      render(<App />, { route: '/auth/magic-link' });

      expect(await screen.findByRole('alert')).toBeInTheDocument();
    });
  });
});
