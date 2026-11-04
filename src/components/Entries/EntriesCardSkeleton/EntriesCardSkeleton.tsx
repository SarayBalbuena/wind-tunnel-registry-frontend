import { Flex, Skeleton } from '@chakra-ui/react';
import styles from '../EntriesCard/EntriesCard.module.css';

export const EntriesCardSkeleton = () => {
  return (
    <div className={styles.entriesCard}>
      <div className={styles.header}>
        <Skeleton height="24px" width="80px" borderRadius="full" />
        <Skeleton height="16px" width="90px" />
      </div>
      <div className={styles.content}>
        <Skeleton height="26px" width="70px" />
        <Flex gap="1">
          <Skeleton height="32px" width="32px" borderRadius="lg" />
          <Skeleton height="32px" width="32px" borderRadius="lg" />
        </Flex>
      </div>
    </div>
  );
};
