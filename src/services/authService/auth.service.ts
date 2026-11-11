import { apiFetch } from '@services/utils/apiFetch';
import {
  type AuthSessionResponse,
  type MagicLinkRequest,
  type MagicLinkResponse,
  type VerifyMagicLinkRequest,
} from './auth.service.types';

export const checkSession = (): Promise<AuthSessionResponse> =>
  apiFetch('/auth/session');

/**
 * Tells the backend which frontend started the login (production, a Vercel
 * preview or localhost) so it can return there. The backend only honours
 * origins on its allowlist and otherwise uses its own FRONTEND_URL.
 */
export const getGoogleLoginUrl = (origin = window.location.origin) =>
  `${API_URL}/auth/google?redirect=${encodeURIComponent(origin)}`;

export const loginWithGoogle = () => {
  window.location.href = getGoogleLoginUrl();
};

export const logout = () =>
  apiFetch('/auth/logout', {
    method: 'GET',
  });

export const requestMagicLink = (
  _key: string,
  { arg }: { arg: MagicLinkRequest },
): Promise<MagicLinkResponse> =>
  apiFetch('/auth/magic-link', {
    method: 'POST',
    body: JSON.stringify(arg),
  });

export const verifyMagicLink = (
  _key: string,
  { arg }: { arg: VerifyMagicLinkRequest },
): Promise<AuthSessionResponse> =>
  apiFetch('/auth/magic-link/verify', {
    method: 'POST',
    body: JSON.stringify(arg),
  });
