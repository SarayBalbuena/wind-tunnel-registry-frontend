import { Skeleton } from '@chakra-ui/react';
import { getClassNames } from '@services/utils/getClassNames';
import cardStyles from '../ReportsCard.module.css';
import styles from './ReportsCardSkeleton.module.css';

export const ReportsCardSkeleton = () => {
  const containerClasses = getClassNames({
    [cardStyles.reportsCard]: true,
  });

  return (
    <div className={containerClasses}>
      <Skeleton width="60%" className={styles.skeletonLabel} />
      <Skeleton width="80%" className={styles.skeletonDescription} />
      <div className={cardStyles.reportsCardValueContainer}>
        <Skeleton width="50px" className={styles.skeletonValue} />
        <Skeleton width="20px" className={styles.skeletonUnit} />
      </div>
    </div>
  );
};
