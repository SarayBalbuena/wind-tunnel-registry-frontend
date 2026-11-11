import { Entries } from '@components/Entries/Entries.tsx';
import { Toaster } from '@components/ui/toaster.tsx';
import { fireEvent } from '@testing-library/react';
import { ENTRIES_MOCK } from '@tests/mocks/entries/entriesMock.ts';
import { server } from '@tests/mocks/server.ts';
import { render, screen, waitFor } from '@tests/testing.tsx';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';

const chooseFile = (content: string, name = 'flights.csv') => {
  const input = screen.getByLabelText('CSV file to import');
  const file = new File([content], name, { type: 'text/csv' });
  // jsdom's File has no text() in some versions
  file.text = () => Promise.resolve(content);
  fireEvent.change(input, { target: { files: [file] } });
};

describe('EntriesCsvActions', () => {
  describe('when exporting', () => {
    it('should download a CSV with every entry', async () => {
      let blob: Blob | undefined;
      URL.createObjectURL = vi.fn((value: Blob | MediaSource) => {
        blob = value as Blob;
        return 'blob:test';
      });
      URL.revokeObjectURL = vi.fn();
      const click = vi
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(() => {});

      render(<Entries />);
      const button = await screen.findByRole('button', { name: /export csv/i });
      await waitFor(() => expect(button).toBeEnabled());
      fireEvent.click(button);

      expect(click).toHaveBeenCalled();
      const text = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsText(blob as Blob);
      });
      expect(text.split('\r\n')).toHaveLength(ENTRIES_MOCK.length + 1);
      expect(text).toContain('date,type,minutes,note');

      click.mockRestore();
    });
  });

  describe('when importing', () => {
    it('should preview the file and send only new, valid rows', async () => {
      let sent: unknown;
      server.use(
        http.post(`${API_URL}/entries/import`, async ({ request }) => {
          sent = await request.json();
          return HttpResponse.json([], { status: 201 });
        }),
      );

      render(
        <>
          <Entries />
          <Toaster />
        </>,
      );
      await screen.findAllByRole('button', { name: /edit flight/i });

      chooseFile(
        [
          'Día;Tiempo (min);Nota',
          '23/09/23;3;',
          '21/08;5;',
          '09/03/26;20;Session 1', // already in the mock log
        ].join('\n'),
      );

      expect(await screen.findByText('1 flight')).toBeInTheDocument();
      expect(
        screen.getByText(/already in your log, skipped/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/has no year/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /import 1 flight/i }));

      expect(await screen.findByText('Import complete')).toBeInTheDocument();
      expect(sent).toEqual({
        entries: [{ date: '2023-09-23', minutes: 3, type: 'INDIVIDUAL' }],
      });
    });

    it('should show the reason the server gave when the import fails', async () => {
      server.use(
        http.post(`${API_URL}/entries/import`, () =>
          HttpResponse.json(
            { message: ['entries.0.minutes must not be greater than 1440'] },
            { status: 400, statusText: 'Bad Request' },
          ),
        ),
      );

      render(
        <>
          <Entries />
          <Toaster />
        </>,
      );
      await screen.findAllByRole('button', { name: /edit flight/i });

      chooseFile('date,minutes\n2026-01-01,10');
      fireEvent.click(
        await screen.findByRole('button', { name: /import 1 flight/i }),
      );

      expect(await screen.findByText('Import failed')).toBeInTheDocument();
      expect(
        screen.getByText(/400 · entries\.0\.minutes must not be greater/),
      ).toBeInTheDocument();
    });

    it('should explain a file that cannot be read', async () => {
      render(<Entries />);
      await screen.findAllByRole('button', { name: /edit flight/i });

      chooseFile('nothing,useful\n1,2');

      expect(await screen.findByRole('alert')).toHaveTextContent(/header/i);
      expect(screen.getByRole('button', { name: 'Import' })).toBeDisabled();
    });
  });
});
