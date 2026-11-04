import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  entryFormRules,
  getDefaultEntryFormValues,
  getEntryFormValues,
  getLocalDateISO,
  LAST_ENTRY_TYPE_KEY,
  MAX_MINUTES,
  MINUTES_PRESETS,
  readLastEntryType,
  saveLastEntryType,
} from './EntryFormDialog.helpers.ts';

describe('EntryFormDialog helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 2, 1, 23, 30)); // March 1, 2026, 23:30 local
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('when computing dates', () => {
    it('should use the local date, not the UTC one', () => {
      expect(getLocalDateISO()).toBe('2026-03-01');
    });

    it('should go back a number of days across months', () => {
      expect(getLocalDateISO(1)).toBe('2026-02-28');
    });
  });

  describe('when building the default values', () => {
    it('should use today, 15 minutes and the given type', () => {
      expect(getDefaultEntryFormValues('SHARED')).toEqual({
        type: 'SHARED',
        date: '2026-03-01',
        minutes: 15,
        note: '',
      });
    });

    it('should keep the entry values when editing', () => {
      const entry = {
        id: '1',
        type: 'INDIVIDUAL' as const,
        date: '2025-01-02',
        minutes: 40,
        note: 'sit',
      };

      expect(getEntryFormValues(entry, 'SHARED')).toEqual({
        type: 'INDIVIDUAL',
        date: '2025-01-02',
        minutes: 40,
        note: 'sit',
      });
    });
  });

  describe('when remembering the last type', () => {
    it('should return null when nothing is stored', () => {
      expect(readLastEntryType()).toBeNull();
    });

    it('should return the stored type', () => {
      saveLastEntryType('SHARED');
      expect(readLastEntryType()).toBe('SHARED');
    });

    it('should ignore an invalid stored value', () => {
      window.localStorage.setItem(LAST_ENTRY_TYPE_KEY, 'NOPE');
      expect(readLastEntryType()).toBeNull();
    });

    it('should not fail when the storage is unavailable', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('denied');
      });
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('denied');
      });

      expect(readLastEntryType()).toBeNull();
      expect(() => saveLastEntryType('SHARED')).not.toThrow();

      vi.restoreAllMocks();
    });
  });

  describe('when validating the minutes', () => {
    it('should accept 1 to 1440 minutes, like the backend', () => {
      expect(entryFormRules.minutes.min.value).toBe(1);
      expect(entryFormRules.minutes.max.value).toBe(1440);
      expect(MAX_MINUTES).toBe(1440);
    });

    it('should only offer presets inside that range', () => {
      for (const preset of MINUTES_PRESETS) {
        expect(preset).toBeGreaterThanOrEqual(1);
        expect(preset).toBeLessThanOrEqual(MAX_MINUTES);
      }
    });
  });
});
