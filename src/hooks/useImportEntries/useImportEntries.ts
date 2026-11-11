import { useAuth } from '@hooks/useAuth/useAuth.ts';
import { ENTRIES_KEY } from '@hooks/useEntries/useEntries';
import { importEntries as importEntriesService } from '@services/entriesService/entries.service';
import { type CreateEntryPayload } from '@services/entriesService/entries.service.types';
import useSWRMutation from 'swr/mutation';

export const useImportEntries = () => {
  const { isAuthenticated } = useAuth();

  const { trigger, isMutating, error } = useSWRMutation(
    isAuthenticated ? ENTRIES_KEY : null,
    async (_key, { arg }: { arg: CreateEntryPayload[] }) => {
      return await importEntriesService(arg);
    },
  );

  return {
    importEntries: trigger,
    isImportingEntries: isMutating,
    importEntriesError: error,
  };
};
