import { apiFetch } from '@services/utils/apiFetch';
import {
  type AuthSessionResponse,
  type MagicLinkRequest,
  type MagicLinkResponse,
  type VerifyMagicLinkRequest,
} from './auth.service.types';

export const checkSession = (): Promise<AuthSessionResponse> =>
  apiFetch('/auth/session');

export const loginWithGoogle = () => {
  window.location.href = `${API_URL}/auth/google`;
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
    // The backend opens the emailed link on this frontend (production, a
    // Vercel preview or localhost) when the origin is on its allowlist.
    body: JSON.stringify({ ...arg, origin: window.location.origin }),
  });

export const verifyMagicLink = (
  _key: string,
  { arg }: { arg: VerifyMagicLinkRequest },
): Promise<AuthSessionResponse> =>
  apiFetch('/auth/magic-link/verify', {
    method: 'POST',
    body: JSON.stringify(arg),
  });
