import { createContext, type ReactNode } from 'react';
import { useCreateEntry } from '@hooks/useCreateEntry/useCreateEntry.ts';
import { useDeleteEntry } from '@hooks/useDeleteEntry/useDeleteEntry';
import { isEntriesKey, useEntries } from '@hooks/useEntries/useEntries';
import { useEntriesFilters } from '@hooks/useEntriesFilters/useEntriesFilters';
import {
  isFlightDetailsKey,
  useFlightDetails,
} from '@hooks/useFlightDetails/useFlightDetails';
import { useUpdateEntry } from '@hooks/useUpdateEntry/useUpdateEntry';
import { useSWRConfig } from 'swr';
import { type DashboardDataContextType } from './DashboardContext.types.ts';

export const DashboardDataContext = createContext<
  DashboardDataContextType | undefined
>(undefined);

export const DashboardDataProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { typeFilter, dateFilter } = useEntriesFilters();
  const { mutate } = useSWRConfig();

  const {
    data: reports,
    isLoading: isReportsLoading,
    error: reportsError,
  } = useFlightDetails(dateFilter || undefined);

  const {
    entries,
    isLoading: isEntriesLoading,
    error: entriesError,
  } = useEntries({
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    date: dateFilter || undefined,
  });

  // Revalidate every cached filter combination, not only the visible one
  const mutateEntries = () => mutate(isEntriesKey);
  const mutateReports = () => mutate(isFlightDetailsKey);

  const { createEntry: createEntryMutation, isCreatingEntry } =
    useCreateEntry();

  const { deleteEntry: deleteEntryMutation, isDeletingEntry } =
    useDeleteEntry();

  const { updateEntry: updateEntryMutation, isUpdatingEntry } =
    useUpdateEntry();

  const createEntry = async (
    payload: Parameters<typeof createEntryMutation>[0],
  ) => {
    await createEntryMutation(payload);
    await Promise.all([mutateEntries(), mutateReports()]);
  };

  const deleteEntry = async (id: string) => {
    await deleteEntryMutation(id);
    await Promise.all([mutateEntries(), mutateReports()]);
  };

  const updateEntry = async (
    arg: Parameters<typeof updateEntryMutation>[0],
  ) => {
    await updateEntryMutation(arg);
    await Promise.all([mutateEntries(), mutateReports()]);
  };

  return (
    <DashboardDataContext.Provider
      value={{
        reports,
        isReportsLoading,
        reportsError,
        entries,
        isEntriesLoading,
        entriesError,
        refetchEntries: mutateEntries,
        deleteEntry,
        isDeletingEntry,
        updateEntry,
        isUpdatingEntry,
        isCreatingEntry,
        createEntry,
      }}
    >
      {children}
    </DashboardDataContext.Provider>
  );
};
