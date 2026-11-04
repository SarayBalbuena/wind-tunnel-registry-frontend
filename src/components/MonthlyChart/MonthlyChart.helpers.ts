import { type Entry } from '@services/entriesService/entries.service.types.ts';
import { type MonthlyPoint, type MonthMinutes } from './MonthlyChart.types.ts';

export const CHART_MONTHS = 12;

// Round-looking tops for the vertical axis, in hours
const NICE_MAX_HOURS = [
  1, 2, 4, 6, 8, 10, 12, 16, 20, 24, 30, 40, 50, 60, 80, 100, 150, 200, 300,
  500, 1000,
];

const toKey = (year: number, monthIndex: number) =>
  `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

const monthName = (year: number, monthIndex: number, month: 'short' | 'long') =>
  new Date(Date.UTC(year, monthIndex, 1)).toLocaleDateString('en-US', {
    month,
    timeZone: 'UTC',
  });

/** The key ("2026-03") of the month `now` falls in. */
export const getCurrentMonthKey = (now: Date) =>
  toKey(now.getFullYear(), now.getMonth());

/** Minutes flown in the month of `now`, in total and by type. */
export const getMonthMinutes = (entries: Entry[], now: Date): MonthMinutes => {
  const key = getCurrentMonthKey(now);
  const result: MonthMinutes = { total: 0, individual: 0, shared: 0 };

  for (const entry of entries) {
    if (entry.date.slice(0, 7) !== key) continue;

    result.total += entry.minutes;
    if (entry.type === 'INDIVIDUAL') result.individual += entry.minutes;
    else result.shared += entry.minutes;
  }

  return result;
};

/**
 * One point per month for the last `months` months, ending with the month of
 * `now`. Months without flights are kept (with zeros) so the axis is regular.
 */
export const buildMonthlySeries = (
  entries: Entry[],
  now: Date,
  months = CHART_MONTHS,
): MonthlyPoint[] => {
  const points: MonthlyPoint[] = [];

  for (let offset = months - 1; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const year = date.getFullYear();
    const monthIndex = date.getMonth();

    points.push({
      key: toKey(year, monthIndex),
      label: monthName(year, monthIndex, 'short'),
      fullLabel: `${monthName(year, monthIndex, 'long')} ${year}`,
      year: offset === months - 1 || monthIndex === 0 ? year : undefined,
      individual: 0,
      shared: 0,
      total: 0,
    });
  }

  const byKey = new Map(points.map((point) => [point.key, point]));

  for (const entry of entries) {
    const point = byKey.get(entry.date.slice(0, 7));
    if (!point) continue;

    if (entry.type === 'INDIVIDUAL') point.individual += entry.minutes;
    else point.shared += entry.minutes;
    point.total += entry.minutes;
  }

  return points;
};

/** Top of the vertical axis in hours: the smallest round value that fits. */
export const getAxisMaxHours = (series: MonthlyPoint[]) => {
  const maxHours = Math.max(0, ...series.map((point) => point.total)) / 60;

  return (
    NICE_MAX_HOURS.find((value) => value >= maxHours) ??
    Math.ceil(maxHours / 100) * 100
  );
};

/** "+45 min this month", or "No flights this month". */
export const formatMonthTrend = (minutes: number) => {
  if (minutes <= 0) return 'No flights this month';

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const duration = [hours ? `${hours} h` : '', rest ? `${rest} min` : '']
    .filter(Boolean)
    .join(' ');

  return `+${duration} this month`;
};
