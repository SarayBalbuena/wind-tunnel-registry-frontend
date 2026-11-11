import { describe, expect, it } from 'vitest';
import { getGoogleLoginUrl } from './auth.service';

describe('getGoogleLoginUrl', () => {
  describe('when starting the Google login', () => {
    it('should send the origin the user is on so the backend can return there', () => {
      expect(getGoogleLoginUrl('https://app-git-feat-x-team.vercel.app')).toBe(
        `${API_URL}/auth/google?redirect=${encodeURIComponent('https://app-git-feat-x-team.vercel.app')}`,
      );
    });

    it('should default to the current window origin', () => {
      expect(getGoogleLoginUrl()).toContain(
        `redirect=${encodeURIComponent(window.location.origin)}`,
      );
    });
  });
});
