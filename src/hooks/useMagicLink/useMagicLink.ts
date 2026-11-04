import { requestMagicLink } from '@services/authService/auth.service';
import useSWRMutation from 'swr/mutation';

export const MAGIC_LINK_KEY = 'auth-magic-link';

export const useMagicLink = () => {
  const { trigger, isMutating, error, reset } = useSWRMutation(
    MAGIC_LINK_KEY,
    requestMagicLink,
  );

  const sendMagicLink = async (email: string) => {
    try {
      await trigger({ email });
      return true;
    } catch (err) {
      console.error('Error requesting magic link:', err);
      return false;
    }
  };

  return { sendMagicLink, loading: isMutating, error, reset };
};
