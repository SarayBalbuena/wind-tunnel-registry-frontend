import {
  type CreateEntryPayload,
  type EntryType,
} from './entries.service.types';

/** A CSV row that passed validation. `type` is null when the file gave none. */
export interface ParsedCsvEntry extends Omit<CreateEntryPayload, 'type'> {
  type: EntryType | null;
  /** 1-based line in the file, header included (what a spreadsheet shows). */
  line: number;
}

export interface CsvRowError {
  line: number;
  message: string;
}

export interface ParsedEntriesCsv {
  entries: ParsedCsvEntry[];
  errors: CsvRowError[];
  /** Set when the file cannot be read as entries at all. */
  fatalError?: string;
}
