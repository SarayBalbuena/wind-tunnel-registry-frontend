import { apiFetch } from '@services/utils/apiFetch';
import {
  type AuthSessionResponse,
  type MagicLinkRequest,
  type MagicLinkResponse,
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
    body: JSON.stringify(arg),
  });
