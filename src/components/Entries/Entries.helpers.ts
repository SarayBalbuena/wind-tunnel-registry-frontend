import { type EntriesSort } from '@hooks/useEntriesFilters/useEntriesFilters.ts';
import { type Entry } from '@services/entriesService/entries.service.types.ts';
import { getTimeParts } from '@services/reportsService/utils/reports.utils.ts';

export interface EntriesGroup {
  key: string;
  label: string;
  entries: Entry[];
  totalMinutes: number;
}

/** How long the "Entry deleted" toast, with its Undo action, stays visible. */
export const UNDO_DURATION_MS = 6000;

export const SORT_OPTIONS: { value: EntriesSort; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'longest', label: 'Longest first' },
];

/** "1 h 30 min", "45 min" */
export const formatMinutes = (minutes: number) =>
  getTimeParts(minutes)
    .map((part) => `${part.value} ${part.unit}`)
    .join(' ');

/** "2026-07-28" -> "July 2026" (UTC, so the day never shifts with the timezone) */
export const getMonthLabel = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

/** "2026-07-28" -> "Jul 28, 2026" */
export const formatEntryDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

export const filterEntriesByNote = (entries: Entry[], search: string) => {
  const query = search.trim().toLowerCase();
  if (!query) return entries;

  return entries.filter((entry) => entry.note?.toLowerCase().includes(query));
};

const sumMinutes = (entries: Entry[]) =>
  entries.reduce((total, entry) => total + entry.minutes, 0);

/**
 * The API returns entries newest first. "oldest" reverses that order and
 * "longest" is a single flat group, because months make no sense there.
 */
export const buildEntryGroups = (
  entries: Entry[],
  sort: EntriesSort,
): EntriesGroup[] => {
  if (!entries.length) return [];

  if (sort === 'longest') {
    const longest = [...entries].sort((a, b) => b.minutes - a.minutes);
    return [
      {
        key: 'longest',
        label: 'Longest first',
        entries: longest,
        totalMinutes: sumMinutes(longest),
      },
    ];
  }

  const ordered = sort === 'oldest' ? [...entries].reverse() : entries;
  const groups: EntriesGroup[] = [];

  for (const entry of ordered) {
    const key = entry.date.slice(0, 7);
    const current = groups.at(-1);

    if (current?.key === key) {
      current.entries.push(entry);
      current.totalMinutes += entry.minutes;
    } else {
      groups.push({
        key,
        label: getMonthLabel(entry.date),
        entries: [entry],
        totalMinutes: entry.minutes,
      });
    }
  }

  return groups;
};
