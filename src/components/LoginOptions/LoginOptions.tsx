import { useSearchParams } from 'react-router-dom';
import { Text } from '@chakra-ui/react';
import { LoginButton } from '@components/LoginButton/LoginButton';
import { MagicLinkForm } from '@components/MagicLinkForm/MagicLinkForm';
import styles from './LoginOptions.module.css';

export const MAGIC_LINK_ERROR = 'magic_link_invalid';

export const LoginOptions = () => {
  const [searchParams] = useSearchParams();
  const hasMagicLinkError = searchParams.get('error') === MAGIC_LINK_ERROR;

  return (
    <div className={styles.options}>
      {hasMagicLinkError && (
        <Text role="alert" color="fg.error" fontSize="sm">
          That login link is invalid, expired or already used. Request a new one
          below.
        </Text>
      )}
      <LoginButton />
      <div className={styles.divider} aria-hidden="true">
        <span>or</span>
      </div>
      <MagicLinkForm />
    </div>
  );
};
