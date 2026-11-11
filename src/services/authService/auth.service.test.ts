import { server } from '@tests/mocks/server.ts';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { requestMagicLink } from './auth.service';

describe('requestMagicLink', () => {
  describe('when asking for a login link', () => {
    it('should send the email and the origin the user is on', async () => {
      let sent: unknown;
      server.use(
        http.post(`${API_URL}/auth/magic-link`, async ({ request }) => {
          sent = await request.json();
          return HttpResponse.json({ message: 'ok' }, { status: 202 });
        }),
      );

      await requestMagicLink('key', { arg: { email: 'pilot@example.com' } });

      expect(sent).toEqual({
        email: 'pilot@example.com',
        origin: window.location.origin,
      });
    });
  });
});
