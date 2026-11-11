import { useId, useState } from 'react';
import { CSV_TEMPLATE } from '@services/entriesService/entries.csv.ts';
import { getClassNames } from '@services/utils/getClassNames.ts';
import { LuChevronRight } from 'react-icons/lu';
import { downloadCsv } from './EntriesCsvActions.helpers.ts';
import styles from './EntriesCsvActions.module.css';

export const EntriesCsvHelp = () => {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={styles.help}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <LuChevronRight
          aria-hidden="true"
          className={getClassNames({
            [styles.caret]: true,
            [styles.caretOpen]: open,
          })}
        />
        How to import
      </button>

      <div
        id={panelId}
        className={getClassNames({
          [styles.panel]: true,
          [styles.panelOpen]: open,
        })}
      >
        <div className={styles.panelInner}>
          <ol>
            <li>
              Use a CSV with a header row and the columns <code>date</code>,{' '}
              <code>minutes</code>, <code>type</code> and <code>note</code>.
              Only date and minutes are required.
            </li>
            <li>
              Dates as <code>2026-03-09</code> or day first,{' '}
              <code>09/03/26</code>. A date without a year is skipped.
            </li>
            <li>
              Type is <code>INDIVIDUAL</code> (1-on-1) or <code>SHARED</code>{' '}
              (group). If it is missing you choose one for those rows.
            </li>
            <li>
              You see a preview first. Flights already in your log are skipped,
              so importing a file twice is safe.
            </li>
          </ol>
          <button
            type="button"
            className={styles.link}
            tabIndex={open ? 0 : -1}
            onClick={() =>
              downloadCsv(CSV_TEMPLATE, 'wind-tunnel-template.csv')
            }
          >
            Download a template
          </button>
        </div>
      </div>
    </div>
  );
};
