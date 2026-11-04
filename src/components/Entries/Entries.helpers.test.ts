import { ENTRIES_MOCK } from '@tests/mocks/entries/entriesMock.ts';
import { describe, expect, it } from 'vitest';
import {
  buildEntryGroups,
  filterEntriesByNote,
  formatEntryDate,
  formatMinutes,
  getMonthLabel,
} from './Entries.helpers.ts';

describe('Entries helpers', () => {
  describe('when formatting', () => {
    it('should format minutes as hours and minutes', () => {
      expect(formatMinutes(90)).toBe('1 h 30 min');
      expect(formatMinutes(60)).toBe('1 h');
      expect(formatMinutes(45)).toBe('45 min');
    });

    it('should format dates without shifting the day', () => {
      expect(getMonthLabel('2026-03-01')).toBe('March 2026');
      expect(formatEntryDate('2026-03-01')).toBe('Mar 1, 2026');
    });
  });

  describe('when filtering by note', () => {
    it('should ignore case and surrounding spaces', () => {
      const result = filterEntriesByNote(ENTRIES_MOCK, '  SIT ');
      expect(result.map((entry) => entry.note)).toEqual(['sit']);
    });

    it('should return every entry for an empty search', () => {
      expect(filterEntriesByNote(ENTRIES_MOCK, '  ')).toHaveLength(
        ENTRIES_MOCK.length,
      );
    });
  });

  describe('when grouping', () => {
    it('should group by month keeping the API order', () => {
      const groups = buildEntryGroups(ENTRIES_MOCK, 'newest');

      expect(groups.map((group) => group.label)).toEqual([
        'March 2026',
        'March 2024',
      ]);
      expect(groups[0].totalMinutes).toBe(60);
      expect(groups[0].entries).toHaveLength(3);
      expect(groups[1].totalMinutes).toBe(50);
    });

    it('should reverse the order for oldest first', () => {
      const groups = buildEntryGroups(ENTRIES_MOCK, 'oldest');

      expect(groups.map((group) => group.label)).toEqual([
        'March 2024',
        'March 2026',
      ]);
      expect(groups[0].entries[0].id).toBe('69a964657937a6510ecb8048');
    });

    it('should return one flat group for longest first', () => {
      const groups = buildEntryGroups(ENTRIES_MOCK, 'longest');

      expect(groups).toHaveLength(1);
      expect(groups[0].entries.map((entry) => entry.minutes)).toEqual([
        30, 25, 20, 15, 15, 5,
      ]);
    });

    it('should return no groups without entries', () => {
      expect(buildEntryGroups([], 'newest')).toEqual([]);
    });
  });
});
