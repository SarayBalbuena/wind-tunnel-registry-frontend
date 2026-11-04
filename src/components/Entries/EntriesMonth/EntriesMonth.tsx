import styles from './EntriesMonth.module.css';
import { type EntriesMonthProps } from './EntriesMonth.types.ts';

export const EntriesMonth = ({
  label,
  summary,
  children,
}: EntriesMonthProps) => (
  <section className={styles.month} aria-label={label}>
    <div className={styles.header}>
      <h3 className={styles.label}>{label}</h3>
      <span className={styles.summary}>{summary}</span>
    </div>
    <div className={styles.grid}>{children}</div>
  </section>
);
