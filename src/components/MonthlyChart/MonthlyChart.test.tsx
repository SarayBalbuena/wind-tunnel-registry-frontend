import { MonthlyChart } from '@components/MonthlyChart/MonthlyChart.tsx';
import { render, screen, waitFor } from '@tests/testing.tsx';
import { mockFetchResponse } from '@tests/utils/mockFetchResponse.ts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('MonthlyChart', () => {
  beforeEach(() => {
    // Only the clock: timers must keep working for SWR and MSW
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 2, 20));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('when there are flights in the last 12 months', () => {
    it('should render the title, the legend and one column per month', async () => {
      render(<MonthlyChart />);

      expect(
        await screen.findByRole('heading', { name: 'Hours per month' }),
      ).toBeInTheDocument();
      expect(screen.getByText('1-on-1')).toBeInTheDocument();
      expect(screen.getByText('Group')).toBeInTheDocument();
      expect(screen.getAllByRole('img')).toHaveLength(12);
    });

    it('should describe each month with its totals', async () => {
      render(<MonthlyChart />);

      expect(
        await screen.findByRole('img', {
          name: 'March 2026: 1 h (1-on-1 45 min, group 15 min)',
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('img', {
          name: 'February 2026: 0 min (1-on-1 0 min, group 0 min)',
        }),
      ).toBeInTheDocument();
    });
  });

  describe('when there are no flights in the last 12 months', () => {
    it('should show an empty message', async () => {
      mockFetchResponse(`${API_URL}/entries`, []);

      render(<MonthlyChart />);

      expect(
        await screen.findByText('No flights in the last 12 months.'),
      ).toBeInTheDocument();
      expect(screen.queryAllByRole('img')).toHaveLength(0);
    });
  });

  describe('when the API fails', () => {
    it('should render nothing', async () => {
      mockFetchResponse(`${API_URL}/entries`, { message: 'boom' }, 500);

      render(<MonthlyChart />);

      // The skeleton shows until the request fails, then nothing is rendered
      await waitFor(() =>
        expect(
          screen.queryByTestId('monthly-chart-loading'),
        ).not.toBeInTheDocument(),
      );
      expect(screen.queryByTestId('monthly-chart')).not.toBeInTheDocument();
    });
  });
});
