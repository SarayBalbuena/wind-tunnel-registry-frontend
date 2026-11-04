import { EntryFormDialog } from '@components/Entries/EntryFormDialog/EntryFormDialog.tsx';
import { fireEvent } from '@testing-library/react';
import { render, screen, waitFor } from '@tests/testing.tsx';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LAST_ENTRY_TYPE_KEY } from './EntryFormDialog.helpers.ts';

const renderForm = (onSubmit = vi.fn().mockResolvedValue(undefined)) => {
  render(
    <EntryFormDialog
      open
      mode="create"
      entry={null}
      onSubmit={onSubmit}
      onOpenChange={vi.fn()}
    />,
  );
  return onSubmit;
};

const getMinutesInput = () =>
  screen.getByRole('spinbutton', { name: 'Minutes' }) as HTMLInputElement;
const getDateInput = () => screen.getByLabelText('Date') as HTMLInputElement;

describe('EntryFormDialog', () => {
  beforeEach(() => {
    // Only the clock: timers must keep working for the form and the dialog
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 2, 20));
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('when it opens to create an entry', () => {
    it('should start with today, 15 minutes and 1-on-1', async () => {
      renderForm();

      await waitFor(() => expect(getDateInput().value).toBe('2026-03-20'));
      expect(getMinutesInput().value).toBe('15');
      expect(screen.getByRole('button', { name: '1-on-1' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByRole('button', { name: 'Today' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByRole('button', { name: '15' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    it('should preselect the type used last', async () => {
      window.localStorage.setItem(LAST_ENTRY_TYPE_KEY, 'SHARED');

      renderForm();

      const group = await screen.findByRole('button', { name: /Group/ });
      await waitFor(() =>
        expect(group).toHaveAttribute('aria-pressed', 'true'),
      );
      expect(group).toHaveTextContent('last used');
    });
  });

  describe('when using the shortcuts', () => {
    it('should set the minutes with a chip', async () => {
      renderForm();
      await waitFor(() => expect(getMinutesInput().value).toBe('15'));

      fireEvent.click(screen.getByRole('button', { name: '45' }));

      await waitFor(() => expect(getMinutesInput().value).toBe('45'));
      expect(screen.getByRole('button', { name: '45' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByRole('button', { name: '15' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    });

    it('should set the date to yesterday', async () => {
      renderForm();
      await waitFor(() => expect(getDateInput().value).toBe('2026-03-20'));

      fireEvent.click(screen.getByRole('button', { name: 'Yesterday' }));

      await waitFor(() => expect(getDateInput().value).toBe('2026-03-19'));
    });

    it('should change the type with one click', async () => {
      renderForm();

      fireEvent.click(await screen.findByRole('button', { name: 'Group' }));

      expect(screen.getByRole('button', { name: 'Group' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });
  });

  describe('when saving', () => {
    it('should submit the values and remember the type', async () => {
      const onSubmit = renderForm();
      fireEvent.click(await screen.findByRole('button', { name: 'Group' }));
      fireEvent.click(screen.getByRole('button', { name: '30' }));
      await waitFor(() => expect(getMinutesInput().value).toBe('30'));

      fireEvent.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({
          type: 'SHARED',
          date: '2026-03-20',
          minutes: 30,
          note: '',
        }),
      );
      await waitFor(() =>
        expect(window.localStorage.getItem(LAST_ENTRY_TYPE_KEY)).toBe('SHARED'),
      );
    });

    it('should save with Ctrl + Enter', async () => {
      const onSubmit = renderForm();
      await waitFor(() => expect(getMinutesInput().value).toBe('15'));

      fireEvent.keyDown(getMinutesInput(), { key: 'Enter', ctrlKey: true });

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    });
  });
});
