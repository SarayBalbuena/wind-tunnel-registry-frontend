import {
  type CreateEntryPayload,
  type EntriesResponse,
  type UpdateEntryPayload,
} from '@services/entriesService/entries.service.types.ts';
import { type MappedFlightDetailsResponse } from '@services/reportsService/reports.service.types.ts';

export interface DashboardDataContextType {
  reports: MappedFlightDetailsResponse | undefined;
  isReportsLoading: boolean;
  reportsError: unknown;
  entries: EntriesResponse | undefined;
  isEntriesLoading: boolean;
  entriesError: unknown;
  refetchEntries: () => Promise<unknown>;
  allEntries: EntriesResponse | undefined;
  allEntriesError: unknown;
  createEntry: (payload: CreateEntryPayload) => Promise<void>;
  isCreatingEntry: boolean;
  deleteEntry: (id: string) => Promise<void>;
  isDeletingEntry: boolean;
  updateEntry: (arg: {
    id: string;
    payload: UpdateEntryPayload;
  }) => Promise<void>;
  isUpdatingEntry: boolean;
}
