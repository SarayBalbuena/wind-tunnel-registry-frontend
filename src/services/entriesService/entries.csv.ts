import {
  type CsvRowError,
  type ParsedCsvEntry,
  type ParsedEntriesCsv,
} from './entries.csv.types';
import {
  type CreateEntryPayload,
  type Entry,
  type EntryType,
} from './entries.service.types';

export const CSV_HEADER = ['date', 'type', 'minutes', 'note'] as const;

export const CSV_TEMPLATE = [
  CSV_HEADER.join(','),
  '2026-03-09,INDIVIDUAL,20,First session',
  '2026-03-10,SHARED,15,',
].join('\r\n');

export const MAX_CSV_MINUTES = 24 * 60;
export const MAX_CSV_NOTE_LENGTH = 300;
export const MAX_CSV_ROWS = 5000;

const DELIMITERS = [',', ';', '\t'] as const;
const FORMULA_START = /^[=+\-@\t\r]/;

// ---------------------------------------------------------------- export

const escapeCell = (value: string, delimiter: string) =>
  /["\r\n]/.test(value) || value.includes(delimiter)
    ? `"${value.replaceAll('"', '""')}"`
    : value;

/**
 * Spreadsheets run cells starting with = + - @ as formulas. A leading quote
 * keeps a note like "=1+1" as text; the parser removes it again.
 */
const neutralizeFormula = (value: string) =>
  FORMULA_START.test(value) ? `'${value}` : value;

const restoreFormula = (value: string) =>
  value.startsWith("'") && FORMULA_START.test(value.slice(1))
    ? value.slice(1)
    : value;

/** Oldest first, so the file reads like a logbook. */
export const entriesToCsv = (entries: Entry[]): string => {
  const rows = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) =>
      [
        entry.date,
        entry.type,
        String(entry.minutes),
        neutralizeFormula(entry.note ?? ''),
      ]
        .map((cell) => escapeCell(cell, ','))
        .join(','),
    );

  return [CSV_HEADER.join(','), ...rows].join('\r\n');
};

// ---------------------------------------------------------------- parsing

const detectDelimiter = (text: string) => {
  // Look past title lines: sum over the first lines, not just the first one
  const lines = text.split(/\r\n|\n|\r/, 10);
  let best: string = ',';
  let bestCount = 0;

  for (const delimiter of DELIMITERS) {
    const count = lines.reduce(
      (sum, line) => sum + line.split(delimiter).length - 1,
      0,
    );
    if (count > bestCount) {
      best = delimiter;
      bestCount = count;
    }
  }

  return best;
};

/** RFC 4180 reader: quoted cells may hold delimiters, quotes and line breaks. */
export const parseCsvRows = (text: string, delimiter: string) => {
  const rows: { cells: string[]; line: number }[] = [];
  let cells: string[] = [];
  let cell = '';
  let inQuotes = false;
  let line = 1;
  let rowLine = 1;

  const endCell = () => {
    cells.push(cell);
    cell = '';
  };
  const endRow = () => {
    endCell();
    rows.push({ cells, line: rowLine });
    cells = [];
    rowLine = line;
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        if (char === '\n') line++;
        cell += char;
      }
    } else if (char === '"' && cell === '') {
      inQuotes = true;
    } else if (char === delimiter) {
      endCell();
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      line++;
      endRow();
    } else {
      cell += char;
    }
  }

  if (cell !== '' || cells.length > 0) endRow();

  return rows;
};

const normalizeHeader = (header: string) =>
  header
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\(.*?\)/g, '')
    .trim()
    .toLowerCase();

type Column = 'date' | 'type' | 'minutes' | 'note';

// English and the Spanish headers of the original spreadsheet
const HEADER_ALIASES: Record<string, Column> = {
  date: 'date',
  day: 'date',
  dia: 'date',
  fecha: 'date',
  minutes: 'minutes',
  minute: 'minutes',
  min: 'minutes',
  mins: 'minutes',
  minutos: 'minutes',
  tiempo: 'minutes',
  time: 'minutes',
  type: 'type',
  tipo: 'type',
  note: 'note',
  notes: 'note',
  nota: 'note',
  notas: 'note',
};

const TYPE_ALIASES: Record<string, EntryType> = {
  individual: 'INDIVIDUAL',
  aprendizaje: 'INDIVIDUAL',
  '1-on-1': 'INDIVIDUAL',
  '1on1': 'INDIVIDUAL',
  shared: 'SHARED',
  huckjam: 'SHARED',
  group: 'SHARED',
  grupo: 'SHARED',
  compartido: 'SHARED',
};

const isRealDate = (year: number, month: number, day: number) => {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Accepts YYYY-MM-DD and day-first D/M/YY or D/M/YYYY (also with - or .),
 * like the Spanish spreadsheets. A date without a year is rejected on
 * purpose: guessing the year would silently file flights in the wrong one.
 */
export const parseCsvDate = (raw: string): string | null => {
  const value = raw.trim();

  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
  if (iso) {
    const [year, month, day] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
    return isRealDate(year, month, day)
      ? `${year}-${pad(month)}-${pad(day)}`
      : null;
  }

  const dayFirst = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/.exec(value);
  if (dayFirst) {
    const day = Number(dayFirst[1]);
    const month = Number(dayFirst[2]);
    const year =
      dayFirst[3].length === 2
        ? 2000 + Number(dayFirst[3])
        : Number(dayFirst[3]);
    return isRealDate(year, month, day)
      ? `${year}-${pad(month)}-${pad(day)}`
      : null;
  }

  return null;
};

type Block = Partial<Record<Column, number>>;

const MAX_HEADER_SEARCH_ROWS = 20;

/**
 * A header row can hold several tables side by side (date, minutes, ...,
 * date, minutes, ...). Each `date` column starts a table; the columns after
 * it belong to it until the next `date`. Returns the tables that have both a
 * date and a minutes column.
 */
const findBlocks = (cells: string[]): Block[] => {
  const blocks: Block[] = [];

  cells.forEach((header, index) => {
    const column = HEADER_ALIASES[normalizeHeader(header)];
    if (!column) return;

    if (column === 'date') {
      blocks.push({ date: index });
      return;
    }

    const current = blocks.at(-1);
    if (current && current[column] === undefined) current[column] = index;
  });

  return blocks.filter(
    (block) => block.date !== undefined && block.minutes !== undefined,
  );
};

export const parseEntriesCsv = (input: string): ParsedEntriesCsv => {
  const text = input.replace(/^\uFEFF/, '');
  const rows = parseCsvRows(text, detectDelimiter(text));

  if (rows.length === 0) {
    return { entries: [], errors: [], fatalError: 'The file is empty.' };
  }

  // Skip title lines above the real header
  const headerIndex = rows
    .slice(0, MAX_HEADER_SEARCH_ROWS)
    .findIndex((row) => findBlocks(row.cells).length > 0);

  if (headerIndex === -1) {
    return {
      entries: [],
      errors: [],
      fatalError:
        'No header row found. The file needs a row with at least a date and a minutes column (date, minutes, type, note).',
    };
  }

  const blocks = findBlocks(rows[headerIndex].cells);
  const dataRows = rows.slice(headerIndex + 1);

  if (dataRows.length > MAX_CSV_ROWS) {
    return {
      entries: [],
      errors: [],
      fatalError: `The file has more than ${MAX_CSV_ROWS} rows. Split it and import it in parts.`,
    };
  }

  const entries: ParsedCsvEntry[] = [];
  const errors: CsvRowError[] = [];

  // A title above a table ("Huckjam", "Aprendizaje") sets its default type
  const titleType = (block: Block): EntryType | null => {
    for (const row of rows.slice(0, headerIndex).reverse()) {
      const title = (row.cells[block.date ?? -1] ?? '').trim().toLowerCase();
      if (title) return TYPE_ALIASES[title] ?? null;
    }
    return null;
  };

  blocks.forEach((block, blockIndex) => {
    const blockType = titleType(block);
    const label = blocks.length > 1 ? ` (table ${blockIndex + 1})` : '';

    const read = (cells: string[], column: Column) => {
      const index = block[column];
      return index === undefined ? '' : (cells[index] ?? '').trim();
    };

    for (const { cells, line } of dataRows) {
      const rawDate = read(cells, 'date');
      const rawType = read(cells, 'type');
      const rawMinutes = read(cells, 'minutes');
      const note = restoreFormula(read(cells, 'note'));

      // Blank lines and spreadsheet total rows (minutes only) carry no flight
      if (!rawDate && !rawType && !note) continue;

      const problems: string[] = [];

      const date = parseCsvDate(rawDate);
      if (!rawDate) problems.push('missing date');
      else if (!date) {
        problems.push(
          /^\d{1,2}[/.-]\d{1,2}$/.test(rawDate)
            ? `date "${rawDate}" has no year`
            : `invalid date "${rawDate}"`,
        );
      }

      const minutes = /^\d+$/.test(rawMinutes)
        ? Number(rawMinutes)
        : Number.NaN;
      if (!rawMinutes) problems.push('missing minutes');
      else if (
        !Number.isInteger(minutes) ||
        minutes < 1 ||
        minutes > MAX_CSV_MINUTES
      ) {
        problems.push(
          `minutes "${rawMinutes}" must be a whole number from 1 to ${MAX_CSV_MINUTES}`,
        );
      }

      let type: EntryType | null = blockType;
      if (rawType) {
        type = TYPE_ALIASES[rawType.toLowerCase()] ?? null;
        if (!type) problems.push(`unknown type "${rawType}"`);
      }

      if (note.length > MAX_CSV_NOTE_LENGTH) {
        problems.push(`note is longer than ${MAX_CSV_NOTE_LENGTH} characters`);
      }

      if (problems.length > 0 || !date) {
        errors.push({ line, message: `${problems.join(', ')}${label}` });
        continue;
      }

      entries.push({ line, date, minutes, type, ...(note ? { note } : {}) });
    }
  });

  entries.sort((a, b) => a.line - b.line);
  errors.sort((a, b) => a.line - b.line);

  return { entries, errors };
};

// ---------------------------------------------------------------- dedupe

const entryKey = ({
  date,
  type,
  minutes,
  note,
}: Pick<CreateEntryPayload, 'date' | 'type' | 'minutes' | 'note'>) =>
  [date, type, minutes, (note ?? '').trim()].join('|');

/**
 * Splits `incoming` into new entries and ones already in the log. Matching is
 * one-to-one, so two identical flights on the same day are only skipped when
 * the log really holds both. This also makes re-running a failed import safe.
 */
export const splitNewEntries = (
  incoming: CreateEntryPayload[],
  existing: Entry[],
) => {
  const remaining = new Map<string, number>();
  for (const entry of existing) {
    const key = entryKey(entry);
    remaining.set(key, (remaining.get(key) ?? 0) + 1);
  }

  const fresh: CreateEntryPayload[] = [];
  const duplicates: CreateEntryPayload[] = [];

  for (const entry of incoming) {
    const key = entryKey(entry);
    const left = remaining.get(key) ?? 0;

    if (left > 0) {
      remaining.set(key, left - 1);
      duplicates.push(entry);
    } else {
      fresh.push(entry);
    }
  }

  return { fresh, duplicates };
};
