import { SESSION_KEY } from '@hooks/useCheckSession/useCheckSession';
import { verifyMagicLink } from '@services/authService/auth.service';
import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

export const VERIFY_MAGIC_LINK_KEY = 'auth-magic-link-verify';

export const useVerifyMagicLink = () => {
  const { mutate } = useSWRConfig();
  const { trigger, isMutating, error } = useSWRMutation(
    VERIFY_MAGIC_LINK_KEY,
    verifyMagicLink,
  );

  const verify = async (token: string) => {
    try {
      await trigger({ token });
      await mutate(SESSION_KEY);
      return true;
    } catch (err) {
      console.error('Error verifying magic link:', err);
      return false;
    }
  };

  return { verify, loading: isMutating, error };
};
