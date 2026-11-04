import { useLocation } from 'react-router-dom';
import { Entries } from '@components/Entries/Entries.tsx';
import { fireEvent, within } from '@testing-library/react';
import { ENTRIES_MOCK } from '@tests/mocks/entries/entriesMock.ts';
import { REPORTS_MOCK } from '@tests/mocks/reports/reportsMock.ts';
import { server } from '@tests/mocks/server.ts';
import { render, screen, waitFor } from '@tests/testing.tsx';
import { mockFetchResponse } from '@tests/utils/mockFetchResponse.ts';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

const LocationProbe = () => (
  <output data-testid="location-search">{useLocation().search}</output>
);

const getEditButtons = () =>
  screen.queryAllByRole('button', { name: /edit flight/i });

describe('Entries', () => {
  describe('when entries load successfully', () => {
    it('should render one card per entry', async () => {
      render(<Entries />);

      expect(
        await screen.findAllByRole('button', { name: /edit flight/i }),
      ).toHaveLength(ENTRIES_MOCK.length);
    });

    it('should group the entries by month with a summary', async () => {
      render(<Entries />);

      const march2026 = await screen.findByRole('region', {
        name: 'March 2026',
      });
      const march2024 = screen.getByRole('region', { name: 'March 2024' });

      expect(
        within(march2026).getByText('1 h · 3 flights'),
      ).toBeInTheDocument();
      expect(
        within(march2024).getByText('50 min · 3 flights'),
      ).toBeInTheDocument();
    });
  });

  describe('when filtering by type', () => {
    it('should ask the API for that type and show only those entries', async () => {
      const requestedTypes: (string | null)[] = [];
      server.use(
        http.get(`${API_URL}/entries`, ({ request }) => {
          const type = new URL(request.url).searchParams.get('type');
          requestedTypes.push(type);
          return HttpResponse.json(
            ENTRIES_MOCK.filter((entry) => !type || entry.type === type),
          );
        }),
      );

      render(<Entries />);
      await screen.findAllByRole('button', { name: /edit flight/i });

      fireEvent.click(screen.getByRole('button', { name: 'Group' }));

      await waitFor(() => expect(getEditButtons()).toHaveLength(3));
      expect(requestedTypes).toContain('SHARED');
      expect(screen.getByRole('button', { name: 'Group' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });
  });

  describe('when filtering by date', () => {
    it('should ask entries and reports for that date', async () => {
      const reportUrls: string[] = [];
      server.use(
        http.get(`${API_URL}/reports/total-by-type`, ({ request }) => {
          reportUrls.push(request.url);
          return HttpResponse.json(REPORTS_MOCK);
        }),
      );

      render(<Entries />);
      await screen.findAllByRole('button', { name: /edit flight/i });

      fireEvent.change(screen.getByLabelText('Filter by date'), {
        target: { value: '2026-03-09' },
      });

      await waitFor(() => expect(getEditButtons()).toHaveLength(2));
      await waitFor(() =>
        expect(reportUrls.some((url) => url.includes('date=2026-03-09'))).toBe(
          true,
        ),
      );
      expect(
        screen.getByText(/totals above are for 2026-03-09 only/i),
      ).toBeInTheDocument();
    });
  });

  describe('when searching notes', () => {
    it('should keep only the entries whose note matches', async () => {
      render(<Entries />);
      await screen.findAllByRole('button', { name: /edit flight/i });

      fireEvent.change(screen.getByLabelText('Search notes'), {
        target: { value: 'sit' },
      });

      expect(getEditButtons()).toHaveLength(1);
      expect(screen.getByText('sit')).toBeInTheDocument();
    });
  });

  describe('when sorting', () => {
    it('should show one flat list for longest first', async () => {
      render(<Entries />);
      await screen.findAllByRole('button', { name: /edit flight/i });

      fireEvent.change(screen.getByLabelText('Sort entries'), {
        target: { value: 'longest' },
      });

      expect(
        screen.getByRole('region', { name: 'Longest first' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('region', { name: 'March 2026' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('when no entry matches the filters', () => {
    it('should show a message and let the user clear the filters', async () => {
      render(<Entries />);
      await screen.findAllByRole('button', { name: /edit flight/i });

      fireEvent.change(screen.getByLabelText('Search notes'), {
        target: { value: 'zzz' },
      });

      expect(await screen.findByText('No flights found')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Show all flights' }));

      await waitFor(() =>
        expect(getEditButtons()).toHaveLength(ENTRIES_MOCK.length),
      );
    });
  });

  describe('when there are no entries', () => {
    it('should invite the user to log the first flight', async () => {
      mockFetchResponse(`${API_URL}/entries`, []);

      render(<Entries />);

      expect(
        await screen.findByText('No flights registered yet.'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /log your first flight/i }),
      ).toBeInTheDocument();
    });
  });

  describe('when the API fails', () => {
    it('should show an error and retry on demand', async () => {
      mockFetchResponse(`${API_URL}/entries`, { message: 'boom' }, 500);

      render(<Entries />);

      expect(
        await screen.findByText('Error loading entries'),
      ).toBeInTheDocument();

      mockFetchResponse(`${API_URL}/entries`, ENTRIES_MOCK);
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

      await waitFor(() =>
        expect(getEditButtons()).toHaveLength(ENTRIES_MOCK.length),
      );
    });
  });

  describe('when the filters are in the URL', () => {
    it('should apply them on load', async () => {
      render(<Entries />, { route: '/dashboard?type=SHARED&q=user' });

      expect(await screen.findByText('user 1')).toBeInTheDocument();
      expect(getEditButtons()).toHaveLength(1);
      expect(screen.getByLabelText('Search notes')).toHaveValue('user');
      expect(screen.getByRole('button', { name: 'Group' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    it('should write the filters to the URL and remove them when cleared', async () => {
      render(
        <>
          <Entries />
          <LocationProbe />
        </>,
        { route: '/dashboard' },
      );
      await screen.findAllByRole('button', { name: /edit flight/i });

      fireEvent.click(screen.getByRole('button', { name: '1-on-1' }));
      fireEvent.change(screen.getByLabelText('Search notes'), {
        target: { value: 'sit' },
      });
      fireEvent.change(screen.getByLabelText('Sort entries'), {
        target: { value: 'oldest' },
      });

      const probe = screen.getByTestId('location-search');
      expect(probe).toHaveTextContent('type=INDIVIDUAL');
      expect(probe).toHaveTextContent('q=sit');
      expect(probe).toHaveTextContent('sort=oldest');

      fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

      expect(probe).not.toHaveTextContent('type=');
      expect(probe).not.toHaveTextContent('q=');
      expect(probe).toHaveTextContent('sort=oldest');
    });
  });
});
