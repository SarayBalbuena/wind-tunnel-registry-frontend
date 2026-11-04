import { checkSession } from '@services/authService/auth.service.ts';
import useSWR from 'swr';
import { type CheckSession } from './useCheckSession.types';

export const SESSION_KEY = 'user-session';

export const useCheckSession = (): CheckSession => {
  const { data: session, isLoading } = useSWR(SESSION_KEY, checkSession, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });

  return {
    name: session?.name ?? '',
    isAuthenticated: session?.authenticated ?? false,
    loading: isLoading,
  };
};
