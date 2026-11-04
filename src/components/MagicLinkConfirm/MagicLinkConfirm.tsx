import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { Button, Text } from '@chakra-ui/react';
import { useVerifyMagicLink } from '@hooks/useVerifyMagicLink/useVerifyMagicLink';
import styles from './MagicLinkConfirm.module.css';

/**
 * The emailed link only opens this page; the login happens on button click
 * (POST), so mail scanners that prefetch links can't use up the token.
 */
export const MagicLinkConfirm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { verify, loading, error } = useVerifyMagicLink();

  const handleContinue = async () => {
    if (token && (await verify(token)))
      navigate('/dashboard', { replace: true });
  };

  if (!token || error) {
    return (
      <div className={styles.card}>
        <Text role="alert" color="fg.error">
          That login link is invalid, expired or already used.
        </Text>
        <Button asChild variant="outline">
          <RouterLink to="/">Request a new link</RouterLink>
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <Text fontWeight="medium">Ready to log in?</Text>
      <Text fontSize="sm" color="fg.muted">
        Confirm to finish logging in to Wind Tunnel Logbook.
      </Text>
      <Button onClick={handleContinue} loading={loading}>
        Continue to log in
      </Button>
    </div>
  );
};
