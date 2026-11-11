import styles from './EntriesList.module.css';
import { type EntriesListProps } from './EntriesList.types.ts';

export const EntriesList = ({
  toolbar,
  actions,
  help,
  children,
}: EntriesListProps) => {
  return (
    <div className={styles.entriesContainer}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>Flight Log</h2>
          {actions}
        </div>
        {help}
        {toolbar}
      </div>
      <div className={styles.groups}>{children}</div>
    </div>
  );
};
