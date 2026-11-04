import { Entries } from '@components/Entries/Entries.tsx';
import { useDashboardUI } from '@hooks/useDashboardUI/useDashboardUI.ts';
import { fireEvent } from '@testing-library/react';
import { render, screen } from '@tests/testing.tsx';
import { describe, expect, it } from 'vitest';
import { useDashboardShortcuts } from './useDashboardShortcuts.ts';

const Harness = () => {
  useDashboardShortcuts();
  const { isEntryFormOpen, openCreateEntryModal, closeEntryFormModal } =
    useDashboardUI();

  return (
    <>
      <input aria-label="Other field" />
      <button type="button" onClick={openCreateEntryModal}>
        Open form
      </button>
      <button type="button" onClick={closeEntryFormModal}>
        Close form
      </button>
      <output data-testid="form-state">
        {isEntryFormOpen ? 'open' : 'closed'}
      </output>
      <Entries />
    </>
  );
};

const formState = () => screen.getByTestId('form-state');

describe('useDashboardShortcuts', () => {
  describe('when pressing N', () => {
    it('should open the new entry form', async () => {
      render(<Harness />);
      await screen.findByLabelText('Search notes');

      fireEvent.keyDown(document.body, { key: 'n' });

      expect(formState()).toHaveTextContent('open');
    });

    it('should do nothing while typing in a field', async () => {
      render(<Harness />);
      await screen.findByLabelText('Search notes');

      fireEvent.keyDown(screen.getByLabelText('Other field'), { key: 'n' });

      expect(formState()).toHaveTextContent('closed');
    });

    it('should do nothing with a modifier key', async () => {
      render(<Harness />);
      await screen.findByLabelText('Search notes');

      fireEvent.keyDown(document.body, { key: 'n', metaKey: true });

      expect(formState()).toHaveTextContent('closed');
    });
  });

  describe('when pressing /', () => {
    it('should focus the note search', async () => {
      render(<Harness />);
      const search = await screen.findByLabelText('Search notes');

      fireEvent.keyDown(document.body, { key: '/' });

      expect(search).toHaveFocus();
    });
  });
});
