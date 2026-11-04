export type EntryType = 'INDIVIDUAL' | 'SHARED';

export type EntryTypeFilter = EntryType | 'ALL';

/** Query params supported by `GET /entries` (exact type and exact date). */
export interface EntriesQuery {
  type?: EntryType;
  date?: string;
}

export interface Entry {
  id: string;
  type: EntryType;
  date: string;
  minutes: number;
  note?: string;
}

export interface CreateEntryPayload {
  type: EntryType;
  minutes: number;
  date: string;
  note?: string;
}

export interface UpdateEntryPayload extends Partial<CreateEntryPayload> {}

export type EntriesResponse = Entry[];
