import { getClassNames } from '@services/utils/getClassNames.ts';
import styles from './HomePreview.module.css';
import { type PreviewCard, type PreviewEntry } from './HomePreview.types.ts';

const PREVIEW_CARDS: PreviewCard[] = [
  { type: 'total', label: 'Total', hours: 14, minutes: 25 },
  { type: 'individual', label: '1-on-1', hours: 9, minutes: 10 },
  { type: 'shared', label: 'Group', hours: 5, minutes: 15 },
];

// Bar heights live in the CSS module (nth-child) to avoid inline styles
const PREVIEW_BARS: { id: string; type: 'individual' | 'shared' }[] = [
  { id: 'jan', type: 'individual' },
  { id: 'feb', type: 'shared' },
  { id: 'mar', type: 'individual' },
  { id: 'apr', type: 'individual' },
  { id: 'may', type: 'shared' },
  { id: 'jun', type: 'individual' },
  { id: 'jul', type: 'individual' },
  { id: 'aug', type: 'shared' },
];

const PREVIEW_ENTRIES: PreviewEntry[] = [
  { type: 'individual', label: '1-on-1 · Nov 2', duration: '1 h 30 min' },
  { type: 'shared', label: 'Group · Oct 28', duration: '45 min' },
];

/** Decorative sample of the dashboard. Uses fake data, hidden from assistive tech. */
export const HomePreview = () => (
  <div className={styles.stage} aria-hidden="true">
    <div className={styles.preview}>
      <div className={styles.windowBar}>
        <i />
        <i />
        <i />
        <span>Dashboard</span>
      </div>

      <div className={styles.cards}>
        {PREVIEW_CARDS.map((card) => (
          <div
            key={card.type}
            className={getClassNames({
              [styles.card]: true,
              [styles[card.type]]: true,
            })}
          >
            <small>{card.label}</small>
            <b>
              {card.hours}
              <i>h</i>
              {card.minutes}
              <i>min</i>
            </b>
          </div>
        ))}
      </div>

      <div className={styles.bars}>
        {PREVIEW_BARS.map((bar) => (
          <span key={bar.id} className={styles[bar.type]} />
        ))}
      </div>

      <div className={styles.entries}>
        {PREVIEW_ENTRIES.map((entry) => (
          <div
            key={entry.label}
            className={getClassNames({
              [styles.entry]: true,
              [styles[entry.type]]: true,
            })}
          >
            <span>{entry.label}</span>
            <b>{entry.duration}</b>
          </div>
        ))}
      </div>
    </div>
  </div>
);
