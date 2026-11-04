import { SORT_OPTIONS } from '@components/Entries/Entries.helpers.ts';
import { type EntriesSort } from '@hooks/useEntriesFilters/useEntriesFilters.ts';
import { type EntryTypeFilter } from '@services/entriesService/entries.service.types.ts';
import { getClassNames } from '@services/utils/getClassNames.ts';
import { LuSearch, LuX } from 'react-icons/lu';
import styles from './EntriesFilters.module.css';
import { type EntriesFiltersProps } from './EntriesFilters.types.ts';

const TYPE_OPTIONS: { value: EntryTypeFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'INDIVIDUAL', label: '1-on-1' },
  { value: 'SHARED', label: 'Group' },
];

export const EntriesFilters = ({
  typeFilter,
  dateFilter,
  search,
  sort,
  hasActiveFilters,
  onTypeChange,
  onDateChange,
  onSearchChange,
  onSortChange,
  onClear,
}: EntriesFiltersProps) => (
  <div className={styles.filters}>
    <fieldset className={styles.segment} aria-label="Filter by type">
      {TYPE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={typeFilter === option.value}
          className={getClassNames({
            [styles.segmentButton]: true,
            [styles.individual]: option.value === 'INDIVIDUAL',
            [styles.shared]: option.value === 'SHARED',
          })}
          onClick={() => onTypeChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </fieldset>

    <div className={styles.dateField}>
      <input
        type="date"
        className={styles.input}
        value={dateFilter}
        aria-label="Filter by date"
        onChange={(event) => onDateChange(event.target.value)}
      />
    </div>

    <label className={styles.search}>
      <LuSearch aria-hidden="true" />
      <input
        type="search"
        className={getClassNames({
          [styles.input]: true,
          [styles.searchInput]: true,
        })}
        value={search}
        placeholder="Search notes"
        aria-label="Search notes"
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </label>

    <select
      className={styles.select}
      value={sort}
      aria-label="Sort entries"
      onChange={(event) => onSortChange(event.target.value as EntriesSort)}
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>

    {hasActiveFilters && (
      <button type="button" className={styles.clear} onClick={onClear}>
        <LuX aria-hidden="true" />
        Clear filters
      </button>
    )}

    {dateFilter && (
      <p className={styles.hint}>The totals above are for {dateFilter} only.</p>
    )}
  </div>
);
