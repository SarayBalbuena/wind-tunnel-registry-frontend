import { ENTRIES_MOCK } from '@tests/mocks/entries/entriesMock.ts';
import { describe, expect, it } from 'vitest';
import {
  buildMonthlySeries,
  formatMonthTrend,
  getAxisMaxHours,
  getCurrentMonthKey,
  getMonthMinutes,
} from './MonthlyChart.helpers.ts';

const NOW = new Date(2026, 2, 20); // March 20, 2026

describe('MonthlyChart helpers', () => {
  describe('when building the series', () => {
    it('should return the last 12 months ending with the current one', () => {
      const series = buildMonthlySeries([], NOW);

      expect(series).toHaveLength(12);
      expect(series[0].key).toBe('2025-04');
      expect(series.at(-1)?.key).toBe('2026-03');
      expect(series.at(-1)?.fullLabel).toBe('March 2026');
    });

    it('should show the year on the first column and on January', () => {
      const series = buildMonthlySeries([], NOW);

      expect(
        series.filter((point) => point.year).map((point) => point.key),
      ).toEqual(['2025-04', '2026-01']);
    });

    it('should add up minutes by type and keep empty months', () => {
      const series = buildMonthlySeries(ENTRIES_MOCK, NOW);
      const march = series.at(-1);

      expect(march).toMatchObject({ individual: 45, shared: 15, total: 60 });
      expect(series[0]).toMatchObject({ individual: 0, shared: 0, total: 0 });
    });

    it('should ignore entries outside the window', () => {
      const total = buildMonthlySeries(ENTRIES_MOCK, NOW).reduce(
        (sum, point) => sum + point.total,
        0,
      );

      // The three March 2024 entries (50 min) are older than 12 months
      expect(total).toBe(60);
    });
  });

  describe('when computing the axis', () => {
    it('should round up to a nice number of hours', () => {
      const series = buildMonthlySeries(ENTRIES_MOCK, NOW);
      expect(getAxisMaxHours(series)).toBe(1);

      series[3].total = 7 * 60 + 5;
      expect(getAxisMaxHours(series)).toBe(8);
    });

    it('should use the smallest axis when there are no flights', () => {
      expect(getAxisMaxHours(buildMonthlySeries([], NOW))).toBe(1);
    });
  });

  describe('when computing the current month', () => {
    it('should return the key of the month', () => {
      expect(getCurrentMonthKey(NOW)).toBe('2026-03');
    });

    it('should add up the minutes of the month by type', () => {
      expect(getMonthMinutes(ENTRIES_MOCK, NOW)).toEqual({
        total: 60,
        individual: 45,
        shared: 15,
      });
    });

    it('should return zeros for a month without flights', () => {
      expect(getMonthMinutes(ENTRIES_MOCK, new Date(2026, 5, 1))).toEqual({
        total: 0,
        individual: 0,
        shared: 0,
      });
    });
  });

  describe('when formatting the trend', () => {
    it.each([
      { minutes: 0, text: 'No flights this month' },
      { minutes: 45, text: '+45 min this month' },
      { minutes: 60, text: '+1 h this month' },
      { minutes: 90, text: '+1 h 30 min this month' },
    ])('should format $minutes minutes', ({ minutes, text }) => {
      expect(formatMonthTrend(minutes)).toBe(text);
    });
  });
});
