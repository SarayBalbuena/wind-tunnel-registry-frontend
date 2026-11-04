import styles from './EntriesList.module.css';
import { type EntriesListProps } from './EntriesList.types.ts';

export const EntriesList = ({ toolbar, children }: EntriesListProps) => {
  return (
    <div className={styles.entriesContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Flight Log</h2>
        {toolbar}
      </div>
      <div className={styles.groups}>{children}</div>
    </div>
  );
};
