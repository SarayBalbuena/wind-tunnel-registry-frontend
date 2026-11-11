import { describe, expect, it } from 'vitest';
import {
  entriesToCsv,
  parseCsvDate,
  parseEntriesCsv,
  splitNewEntries,
} from './entries.csv';
import { type Entry } from './entries.service.types';

const entry = (overrides: Partial<Entry> = {}): Entry => ({
  id: '1',
  type: 'INDIVIDUAL',
  date: '2026-03-09',
  minutes: 20,
  ...overrides,
});

describe('parseCsvDate', () => {
  describe('when the date is valid', () => {
    it.each([
      ['2026-03-09', '2026-03-09'],
      ['23/09/23', '2023-09-23'],
      ['4/10/24', '2024-10-04'],
      ['04.10.2024', '2024-10-04'],
    ])('should read %s as %s', (raw, expected) => {
      expect(parseCsvDate(raw)).toBe(expected);
    });
  });

  describe('when the date is not usable', () => {
    it.each(['21/08', '31/02/25', 'tomorrow', ''])(
      'should reject "%s"',
      (raw) => {
        expect(parseCsvDate(raw)).toBeNull();
      },
    );
  });
});

describe('entriesToCsv', () => {
  it('should write a header and the entries oldest first', () => {
    const csv = entriesToCsv([
      entry({ date: '2026-03-10', minutes: 15, type: 'SHARED', note: 'b' }),
      entry({ date: '2026-03-09', minutes: 20 }),
    ]);

    expect(csv).toBe(
      [
        'date,type,minutes,note',
        '2026-03-09,INDIVIDUAL,20,',
        '2026-03-10,SHARED,15,b',
      ].join('\r\n'),
    );
  });

  it('should quote notes with commas, quotes and line breaks', () => {
    const csv = entriesToCsv([entry({ note: 'a, "b"\nc' })]);

    expect(csv).toContain('"a, ""b""\nc"');
  });

  it('should keep spreadsheet formulas in notes as text', () => {
    expect(entriesToCsv([entry({ note: '=1+1' })])).toContain("'=1+1");
  });

  it('should round-trip through the parser', () => {
    const entries = [
      entry({ note: 'a, "b"\nc' }),
      entry({ date: '2026-03-10', type: 'SHARED', note: '=1+1' }),
      entry({ date: '2026-03-11', minutes: 5 }),
    ];

    const { entries: parsed, errors } = parseEntriesCsv(entriesToCsv(entries));

    expect(errors).toEqual([]);
    expect(
      parsed.map(({ date, type, minutes, note }) => ({
        date,
        type,
        minutes,
        note,
      })),
    ).toEqual(
      entries.map(({ date, type, minutes, note }) => ({
        date,
        type,
        minutes,
        note,
      })),
    );
  });
});

describe('parseEntriesCsv', () => {
  describe('when the file is the original Spanish spreadsheet', () => {
    it('should read day-first dates, ignore totals and report dates without a year', () => {
      const csv = [
        'Día;Tiempo (min);Total (horas)',
        '23/09/23;3;',
        '28/10/23;10;',
        '21/08;5;',
        ';125;2,08333h',
        '',
      ].join('\n');

      const { entries, errors } = parseEntriesCsv(csv);

      expect(entries).toEqual([
        { line: 2, date: '2023-09-23', minutes: 3, type: null },
        { line: 3, date: '2023-10-28', minutes: 10, type: null },
      ]);
      expect(errors).toEqual([
        { line: 4, message: 'date "21/08" has no year' },
      ]);
    });
  });

  describe('when the sheet has title rows and two tables side by side', () => {
    const csv = [
      'Aprendizaje,,,,Huckjam,,,',
      ',,,,,,,',
      'Día,Tiempo (min),Total (horas),,Día,Tiempo (min),Total (horas),',
      '23/09/23,3,,,28/10/24,10,,',
      '28/10/23,10,,,21/08,5,,',
      ',,,,,125,2.08333h,',
    ].join('\r\n');

    it('should find the header, read both tables and type them by their title', () => {
      const { entries, errors } = parseEntriesCsv(csv);

      expect(entries.map((e) => [e.date, e.minutes, e.type])).toEqual([
        ['2023-09-23', 3, 'INDIVIDUAL'],
        ['2024-10-28', 10, 'SHARED'],
        ['2023-10-28', 10, 'INDIVIDUAL'],
      ]);
      expect(errors).toEqual([
        { line: 5, message: 'date "21/08" has no year (table 2)' },
      ]);
    });
  });

  describe('when the file uses the export format', () => {
    it('should read types and notes, with BOM and CRLF', () => {
      const csv =
        '﻿date,type,minutes,note\r\n2026-03-09,SHARED,30,"hi, there"\r\n';

      expect(parseEntriesCsv(csv).entries).toEqual([
        {
          line: 2,
          date: '2026-03-09',
          type: 'SHARED',
          minutes: 30,
          note: 'hi, there',
        },
      ]);
    });

    it('should accept friendly type names', () => {
      const csv = 'date,type,minutes\n2026-03-09,Group,30\n2026-03-10,1-on-1,5';

      expect(parseEntriesCsv(csv).entries.map((e) => e.type)).toEqual([
        'SHARED',
        'INDIVIDUAL',
      ]);
    });
  });

  describe('when rows are invalid', () => {
    it('should report each problem with its line and keep the valid rows', () => {
      const csv = [
        'date,type,minutes,note',
        '2026-03-09,INDIVIDUAL,0,',
        '2026-03-09,PLANE,10,',
        '2026-03-09,INDIVIDUAL,12.5,',
        '2026-03-09,INDIVIDUAL,10,ok',
      ].join('\n');

      const { entries, errors } = parseEntriesCsv(csv);

      expect(entries).toHaveLength(1);
      expect(errors.map((error) => error.line)).toEqual([2, 3, 4]);
      expect(errors[1].message).toContain('unknown type "PLANE"');
    });
  });

  describe('when the file cannot be used', () => {
    it('should fail on an empty file', () => {
      expect(parseEntriesCsv('').fatalError).toMatch(/empty/i);
    });

    it('should fail when the header has no date and minutes columns', () => {
      expect(parseEntriesCsv('foo,bar\n1,2').fatalError).toMatch(/header/i);
    });
  });
});

describe('splitNewEntries', () => {
  const incoming = (minutes: number) => ({
    type: 'INDIVIDUAL' as const,
    date: '2026-03-09',
    minutes,
  });

  it('should skip entries already in the log', () => {
    const { fresh, duplicates } = splitNewEntries(
      [incoming(20), incoming(25)],
      [entry({ minutes: 20 })],
    );

    expect(duplicates).toEqual([incoming(20)]);
    expect(fresh).toEqual([incoming(25)]);
  });

  it('should match one-to-one, so a second identical flight is still new', () => {
    const { fresh, duplicates } = splitNewEntries(
      [incoming(20), incoming(20)],
      [entry({ minutes: 20 })],
    );

    expect(duplicates).toHaveLength(1);
    expect(fresh).toHaveLength(1);
  });
});
