import { useAuth } from '@hooks/useAuth/useAuth.ts';
import { getEntries } from '@services/entriesService/entries.service';
import { type EntriesQuery } from '@services/entriesService/entries.service.types';
import useSWR from 'swr';

export const ENTRIES_KEY = 'entries';

/** Matches every cached entries query, whatever its filters. */
export const isEntriesKey = (key: unknown) =>
  Array.isArray(key) && key[0] === ENTRIES_KEY;

export const useEntries = (query: EntriesQuery = {}) => {
  const { isAuthenticated } = useAuth();
  const { type, date } = query;

  const { data, isLoading, error, mutate } = useSWR(
    isAuthenticated ? ([ENTRIES_KEY, type ?? '', date ?? ''] as const) : null,
    ([, keyType, keyDate]) =>
      getEntries({
        type: keyType || undefined,
        date: keyDate || undefined,
      }),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  return {
    entries: data,
    isLoading,
    error,
    mutateEntries: mutate,
  };
};
