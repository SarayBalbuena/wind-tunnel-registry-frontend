import { Reports } from '@components/Reports/Reports.tsx';
import { within } from '@testing-library/react';
import { render, screen } from '@tests/testing.tsx';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('ReportsCard', () => {
  describe('when render', () => {
    it.each([
      {
        testId: 'reports-card-total',
        label: 'Total',
        description: 'Total time accumulated in the wind tunnel.',
        values: ['2', 'h', '30', 'min'],
      },
      {
        testId: 'reports-card-individual',
        label: '1-on-1',
        description: 'Flights performed with an instructor.',
        values: ['1', 'h', '30', 'min'],
      },
      {
        testId: 'reports-card-shared',
        label: 'Group',
        description: 'Flights performed with other skydivers.',
        values: ['1', 'h'],
      },
    ])(
      'should render card $testId correctly ',
      async ({ testId, label, description, values }) => {
        render(<Reports />);

        const card = await screen.findByTestId(testId);
        const cardQueries = within(card);

        expect(cardQueries.getByText(label)).toBeInTheDocument();
        expect(cardQueries.getByText(description)).toBeInTheDocument();

        values.forEach((value) => {
          expect(cardQueries.getByText(value)).toBeInTheDocument();
        });
      },
    );
  });

  describe('when showing the month trend', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 2, 20));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it.each([
      { testId: 'reports-card-total', trend: '+1 h this month' },
      { testId: 'reports-card-individual', trend: '+45 min this month' },
      { testId: 'reports-card-shared', trend: '+15 min this month' },
    ])('should show $trend on $testId', async ({ testId, trend }) => {
      render(<Reports />);

      const card = await screen.findByTestId(testId);

      expect(await within(card).findByText(trend)).toBeInTheDocument();
    });

    it('should hide the trend when a date filter is active', async () => {
      render(<Reports />, { route: '/dashboard?date=2026-03-09' });

      const card = await screen.findByTestId('reports-card-total');

      expect(within(card).queryByText(/this month/i)).not.toBeInTheDocument();
    });
  });
});
