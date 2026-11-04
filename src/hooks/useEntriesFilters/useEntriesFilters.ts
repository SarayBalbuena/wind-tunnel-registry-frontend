import { useSearchParams } from 'react-router-dom';
import { type EntryTypeFilter } from '@services/entriesService/entries.service.types.ts';

export const ENTRIES_SORTS = ['newest', 'oldest', 'longest'] as const;
export type EntriesSort = (typeof ENTRIES_SORTS)[number];

const TYPE_PARAM = 'type';
const DATE_PARAM = 'date';
const SEARCH_PARAM = 'q';
const SORT_PARAM = 'sort';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Flight log filters, kept in the URL so they survive a reload and can be
 * shared: `?type=SHARED&date=2026-03-09&q=sit&sort=oldest`.
 * Default values are left out of the URL and invalid values fall back to them.
 */
export const useEntriesFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const typeParam = searchParams.get(TYPE_PARAM);
  const typeFilter: EntryTypeFilter =
    typeParam === 'INDIVIDUAL' || typeParam === 'SHARED' ? typeParam : 'ALL';

  const dateParam = searchParams.get(DATE_PARAM) ?? '';
  const dateFilter = DATE_PATTERN.test(dateParam) ? dateParam : '';

  const search = searchParams.get(SEARCH_PARAM) ?? '';

  const sortParam = searchParams.get(SORT_PARAM);
  const sort: EntriesSort =
    ENTRIES_SORTS.find((option) => option === sortParam) ?? 'newest';

  const update = (changes: Record<string, string | undefined>) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      },
      { replace: true },
    );
  };

  return {
    typeFilter,
    dateFilter,
    search,
    sort,
    hasActiveFilters:
      typeFilter !== 'ALL' || dateFilter !== '' || search.trim() !== '',
    setTypeFilter: (type: EntryTypeFilter) =>
      update({ [TYPE_PARAM]: type === 'ALL' ? undefined : type }),
    setDateFilter: (date: string) => update({ [DATE_PARAM]: date }),
    setSearch: (value: string) => update({ [SEARCH_PARAM]: value }),
    setSort: (value: EntriesSort) =>
      update({ [SORT_PARAM]: value === 'newest' ? undefined : value }),
    clearFilters: () =>
      update({
        [TYPE_PARAM]: undefined,
        [DATE_PARAM]: undefined,
        [SEARCH_PARAM]: undefined,
      }),
  };
};
