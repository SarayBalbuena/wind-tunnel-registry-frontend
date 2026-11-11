import { type ParsedEntriesCsv } from '@services/entriesService/entries.csv.types.ts';
import {
  type CreateEntryPayload,
  type Entry,
} from '@services/entriesService/entries.service.types.ts';

export interface ImportEntriesDialogProps {
  open: boolean;
  fileName: string;
  parsed: ParsedEntriesCsv;
  existing: Entry[];
  isLoading?: boolean;
  onConfirm: (entries: CreateEntryPayload[]) => void;
  onClose: () => void;
}
